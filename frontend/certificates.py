"""
Модуль генерации самоподписанных SSL-сертификатов.
Ответственность: создание и сохранение ключа и сертификата.
Чувствительные данные загружаются из защищённого конфигурационного файла.
"""

import json
import os
import shutil
import sys
from datetime import datetime, timedelta

from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from config import (
    CERT_CONFIG_EXAMPLE,
    CERT_CONFIG_FILE,
    DEFAULT_CERT_CONFIG,
    PRIVATE_KEY_SIZE,
    PUBLIC_EXPONENT,
    CERT_VALIDITY_DAYS,
    HASH_ALGORITHM,
)


def load_cert_config():
    """
    Загружает параметры сертификата из защищённого JSON-файла.
    Если файл отсутствует — копирует шаблон или использует значения по умолчанию.
    """
    if os.path.exists(CERT_CONFIG_FILE):
        with open(CERT_CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    # Пытаемся скопировать шаблон
    if os.path.exists(CERT_CONFIG_EXAMPLE):
        shutil.copy2(CERT_CONFIG_EXAMPLE, CERT_CONFIG_FILE)
        print(f"📋 Скопирован шаблон {CERT_CONFIG_EXAMPLE} → {CERT_CONFIG_FILE}")
        print(f"⚠️  Отредактируй {CERT_CONFIG_FILE} и добавь реальные данные!")
    else:
        print(f"⚠️  {CERT_CONFIG_FILE} не найден. Используются значения по умолчанию.")
        return DEFAULT_CERT_CONFIG

    # Если шаблон скопирован, загружаем его
    with open(CERT_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_subject(config):
    """Создаёт x509.Name из конфигурационного словаря."""
    return x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, config["COUNTRY_NAME"]),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, config["STATE_OR_PROVINCE_NAME"]),
        x509.NameAttribute(NameOID.LOCALITY_NAME, config["LOCALITY_NAME"]),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, config["ORGANIZATION_NAME"]),
        x509.NameAttribute(NameOID.COMMON_NAME, config["COMMON_NAME"]),
    ])


def _generate_private_key():
    """Генерирует приватный RSA-ключ."""
    return rsa.generate_private_key(
        public_exponent=PUBLIC_EXPONENT,
        key_size=PRIVATE_KEY_SIZE,
    )


def _create_certificate(key, subject):
    """Создаёт самоподписанный x509-сертификат."""
    now = datetime.utcnow()
    return (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(subject)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + timedelta(days=CERT_VALIDITY_DAYS))
        .add_extension(
            x509.SubjectAlternativeName([x509.DNSName(CERT_CONFIG_FILE)]),
            critical=False,
        )
        .sign(key, getattr(hashes, HASH_ALGORITHM)())
    )


def _save_key(key, filepath):
    """Сохраняет приватный ключ в PEM-формате."""
    with open(filepath, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))


def _save_certificate(cert, filepath):
    """Сохраняет сертификат в PEM-формате."""
    with open(filepath, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))


def generate_certificate(cert_file, key_file):
    """
    Главный метод генерации сертификата.
    Если файлы уже существуют — ничего не делает.
    """
    if os.path.exists(cert_file) and os.path.exists(key_file):
        print("✅ Сертификаты уже существуют.")
        return

    print("🔐 Генерируем сертификат через Python...")

    # Загружаем параметры из защищённого файла
    config = load_cert_config()

    # Генерируем ключ и сертификат
    key = _generate_private_key()
    subject = _build_subject(config)
    cert = _create_certificate(key, subject)

    # Сохраняем на диск
    _save_key(key, key_file)
    _save_certificate(cert, cert_file)

    print("✅ Сертификат создан!")

import http.server
import ssl
import os
import sys
import json

# Чувствительные данные сертификата хранятся в отдельном файле
# и не попадают в git

# Импортируем библиотеку для генерации сертификата
try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    import datetime
except ImportError:
    print("❌ Библиотека cryptography не найдена.")
    print("Выполни в терминале: pip install cryptography")
    sys.exit(1)

PORT = 8443
CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"
CERT_CONFIG_FILE = "cert_config.json"


def load_cert_config():
    """Загружает параметры сертификата из защищенного конфигурационного файла.
    Если файла нет — копирует шаблон из cert_config.example.json.
    """
    if not os.path.exists(CERT_CONFIG_FILE):
        example_file = "cert_config.example.json"
        if os.path.exists(example_file):
            import shutil
            shutil.copy2(example_file, CERT_CONFIG_FILE)
            print(f"📋 Скопирован шаблон {example_file} → {CERT_CONFIG_FILE}")
            print("⚠️  Отредактируй " + CERT_CONFIG_FILE + " и добавь реальные данные!")
        else:
            print(f"⚠️  Файл {CERT_CONFIG_FILE} не найден. Используются значения по умолчанию.")
            return {
                "COUNTRY_NAME": "Narnia",
                "STATE_OR_PROVINCE_NAME": "Middle-earth",
                "LOCALITY_NAME": "Hogsmeade",
                "ORGANIZATION_NAME": "Stark Industries",
                "COMMON_NAME": "localhost",
            }
    with open(CERT_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_certificate_python():
    """Генерирует самоподписанный сертификат силами Python."""
    if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
        print("🔐 Генерируем сертификат через Python...")

        # Генерируем приватный ключ
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

        # Загружаем параметры из защищенного файла
        config = load_cert_config()

        # Создаем информацию о владельце
        subject = issuer = x509.Name(
            [
                x509.NameAttribute(NameOID.COUNTRY_NAME, config["COUNTRY_NAME"]),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, config["STATE_OR_PROVINCE_NAME"]),
                x509.NameAttribute(NameOID.LOCALITY_NAME, config["LOCALITY_NAME"]),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, config["ORGANIZATION_NAME"]),
                x509.NameAttribute(NameOID.COMMON_NAME, config["COMMON_NAME"]),
            ]
        )

        # Создаем сам сертификат
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.datetime.utcnow())
            .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365))
            .add_extension(
                x509.SubjectAlternativeName([x509.DNSName("localhost")]),
                critical=False,
            )
            .sign(key, hashes.SHA256())
        )

        # Сохраняем ключ
        with open(KEY_FILE, "wb") as f:
            f.write(
                key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )

        # Сохраняем сертификат
        with open(CERT_FILE, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))

        print("✅ Сертификат создан!")
    else:
        print("✅ Сертификаты уже существуют.")


def run_server():
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)

    server_address = ("0.0.0.0", PORT)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

    print(f"\n🚀 HTTPS Сервер запущен на порту {PORT}!")
    print(f"📱 На телефоне открой: https://192.168.0.2:{PORT}")
    print("⏹  Для остановки нажми Ctrl+C\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен.")


if __name__ == "__main__":
    generate_certificate_python()
    run_server()

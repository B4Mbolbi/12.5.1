"""
Точка входа в серверное приложение.
Загружает зависимости, генерирует сертификаты и запускает сервер.
"""

import os
import sys

# Меняем рабочую директорию на папку со скриптом
# Это нужно, чтобы сервер раздавал файлы из правильной папки
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Проверяем зависимости
try:
    from cryptography import x509
except ImportError:
    print("❌ Библиотека cryptography не найдена.")
    print("Выполни в терминале: pip install cryptography")
    sys.exit(1)

from config import CERT_FILE, KEY_FILE
from certificates import generate_certificate
from http_server import run_server


if __name__ == "__main__":
    # 1. Генерируем SSL-сертификаты (если нет)
    generate_certificate(CERT_FILE, KEY_FILE)

    # 2. Запускаем HTTPS-сервер
    run_server(CERT_FILE, KEY_FILE)

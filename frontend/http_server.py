"""
HTTP/SSL сервер.
Ответственность: создание SSL-контекста, запуск и остановка сервера.
"""

import ssl
import http.server
import socketserver

from config import PORT, BIND_ADDRESS, CERT_FILE, KEY_FILE


class CustomHandler(http.server.SimpleHTTPRequestHandler):
    """Расширенный обработчик с поддержкой MIME-типов для ES-модулей."""

    # Явно указываем MIME-тип для JavaScript (нужен для type="module")
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map[".js"] = "application/javascript"

    def __init__(self, *args, **kwargs):
        # Устанавливаем корень сервера — текущая директория
        super().__init__(*args, directory=".", **kwargs)

    def log_message(self, format, *args):
        """Форматированный вывод логов запросов."""
        print(f"[{self.log_date_time_string()}] {format % args}")


def create_ssl_context(cert_file, key_file):
    """Создаёт SSL-контекст для сервера и загружает сертификат."""
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=cert_file, keyfile=key_file)
    return context


def run_server(cert_file=CERT_FILE, key_file=KEY_FILE):
    """
    Запускает HTTPS-сервер для раздачи статических файлов.
    Блокирующий вызов — работает до Ctrl+C.
    """
    # Создаём SSL-контекст
    ssl_context = create_ssl_context(cert_file, key_file)

    # Настраиваем сервер с кастомным обработчиком
    server_address = (BIND_ADDRESS, PORT)
    httpd = http.server.HTTPServer(server_address, CustomHandler)
    httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

    # Выводим информацию
    print(f"\n🚀 HTTPS Сервер запущен на порту {PORT}!")
    print(f"📱 На телефоне открой: https://192.168.0.2:{PORT}")
    print("⏹  Для остановки нажми Ctrl+C\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен.")
    finally:
        httpd.server_close()

"""
Конфигурация приложения — все константы и настройки в одном месте.
Чувствительные данные (параметры сертификата) хранятся в cert_config.json.
"""

# --- Сервер ---
PORT = 8443
BIND_ADDRESS = "0.0.0.0"
SERVER_DURATION = 2  # секунды для анимации flyTo

# --- Файлы ---
CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"
CERT_CONFIG_FILE = "cert_config.json"
CERT_CONFIG_EXAMPLE = "cert_config.example.json"

# --- Параметры генерации сертификата ---
PRIVATE_KEY_SIZE = 2048
PUBLIC_EXPONENT = 65537
CERT_VALIDITY_DAYS = 365
HASH_ALGORITHM = "SHA256"
COMMON_NAME = "localhost"

# --- Значения по умолчанию для сертификата (вымышленные) ---
DEFAULT_CERT_CONFIG = {
    "COUNTRY_NAME": "Narnia",
    "STATE_OR_PROVINCE_NAME": "Middle-earth",
    "LOCALITY_NAME": "Hogsmeade",
    "ORGANIZATION_NAME": "Stark Industries",
    "COMMON_NAME": COMMON_NAME,
}

# --- GPS ---
GPS_WATCH_OPTIONS = {
    "enableHighAccuracy": True,
    "timeout": 10000,
    "maximumAge": 0,
}

# --- Защита от скачков GPS (0.001 градуса ≈ 100 метров) ---
GPS_JUMP_THRESHOLD = 0.001

# --- Цвета для дельты ---
GPS_DELTA_ZERO_THRESHOLD = 0.000009

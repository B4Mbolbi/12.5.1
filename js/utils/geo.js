import { carIcon } from '../storage/iconCar/iconcar.js';

let playerMarker = null;
let prevLat = null;
let prevLng = null;

export function getLocation(map) {
    if (!navigator.geolocation) {
        alert("Ваш браузер не поддерживает геолокацию");
        return;
    }

    console.log("📍 Начинаем отслеживание позиции...");

    const watchOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // Вернули 10 секунд, чтобы реже ловить Timeout
        maximumAge: 0
    };

    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // 1. Обновляем абсолютные значения
            document.getElementById('lat-value').textContent = lat.toFixed(6);
            document.getElementById('lng-value').textContent = lng.toFixed(6);

            // 2. Считаем дельту с защитой от скачков
            let dLat = 0;
            let dLng = 0;
            let isJump = false;

            if (prevLat !== null && prevLng !== null) {
                dLat = lat - prevLat;
                dLng = lng - prevLng;

                // ЗАЩИТА: Если изменение больше 0.001 градуса (около 100 метров), это скачок GPS
                if (Math.abs(dLat) > 0.001 || Math.abs(dLng) > 0.001) {
                    isJump = true;
                    dLat = 0;
                    dLng = 0;
                    console.warn("⚠️ Скачок GPS! Дельта сброшена.");
                }
            }

            // Обновляем плашку дельты
            const latDeltaEl = document.getElementById('lat-delta');
            const lngDeltaEl = document.getElementById('lng-delta');

            if (latDeltaEl && lngDeltaEl) {
                latDeltaEl.textContent = (dLat > 0 ? '+' : '') + dLat.toFixed(6);
                lngDeltaEl.textContent = (dLng > 0 ? '+' : '') + dLng.toFixed(6);

                updateDeltaColor(latDeltaEl, dLat);
                updateDeltaColor(lngDeltaEl, dLng);
            }

            // Если это был скачок, мы не обновляем prevLat/prevLng, 
            // чтобы следующая дельта считалась от старой точки
            if (!isJump) {
                prevLat = lat;
                prevLng = lng;
            }

            // 3. Двигаем маркер
            if (!playerMarker) {
                playerMarker = L.marker([lat, lng], { icon: carIcon }).addTo(map);
                map.flyTo([lat, lng], 16, { animate: true, duration: 2 });

                playerMarker.bindPopup(`Вы здесь!<br>Точность: ${Math.round(accuracy)} метров`, {
                    closeButton: false, closeOnClick: false
                }).openPopup();

                playerMarker.on('popupopen', function (e) {
                    const popupElement = e.popup._contentNode;
                    if (popupElement) {
                        popupElement.addEventListener('pointerdown', function (event) {
                            event.stopPropagation();
                            playerMarker.closePopup();
                        });
                    }
                });
            } else {
                // Если это скачок, мы всё равно двигаем маркер (телефон реально переместился), 
                // но дельта не считается
                playerMarker.setLatLng([lat, lng]);

                if (playerMarker.isPopupOpen()) {
                    playerMarker.setPopupContent(`Вы здесь!<br>Точность: ${Math.round(accuracy)} метров`);
                }
            }

            console.log(`✅ Позиция: ${lat.toFixed(6)}, ${lng.toFixed(6)} | Дельта: ${dLat.toFixed(6)}, ${dLng.toFixed(6)}`);
        },
        (error) => {
            console.error("❌ Ошибка GPS:", error);
            if (error.code === 3) {
                console.log("Тайм-аут GPS. Пробуем еще раз...");
            }
        },
        watchOptions
    );
}

function updateDeltaColor(element, value) {
    element.classList.remove('delta-positive', 'delta-negative', 'delta-zero');

    if (Math.abs(value) < 0.000009) {
        element.classList.add('delta-zero');
        return;
    }

    if (value > 0) {
        element.classList.add('delta-positive');
    } else {
        element.classList.add('delta-negative');
    }
}
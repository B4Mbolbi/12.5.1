/**
 * Модуль отслеживания GPS-позиции.
 * Ответственность: работа с navigator.geolocation, расчёт дельт, защита от скачков.
 * Не работает напрямую с DOM или картой — делегирует эти задачи другим модулям.
 */

import { GPS_WATCH_OPTIONS, GPS_JUMP_THRESHOLD } from "../config.js";
import { updateCoordinates, updateDeltas } from "../ui/dom.js";
import {
    createMarker,
    moveMarker,
    updatePopup,
    getPlayerMarker,
} from "../ui/markers.js";

let prevLat = null;
let prevLng = null;

/**
 * Запускает отслеживание GPS-позиции.
 * @param {L.Map} map — экземпляр Leaflet-карты
 */
export function startGpsTracking(map) {
    if (!navigator.geolocation) {
        alert("Ваш браузер не поддерживает геолокацию");
        return;
    }

    console.log("📍 Начинаем отслеживание позиции...");

    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // 1. Обновляем абсолютные значения на экране
            updateCoordinates(lat, lng);

            // 2. Считаем дельту с защитой от скачков GPS
            const { dLat, dLng, isJump } = calculateDelta(lat, lng);

            // 3. Обновляем дельты на экране
            updateDeltas(dLat, dLng);

            // 4. Обновляем маркер на карте
            handleMarkerUpdate(map, lat, lng, accuracy, isJump);

            // 5. Сохраняем предыдущую позицию (если не скачок)
            if (!isJump) {
                prevLat = lat;
                prevLng = lng;
            }

            console.log(
                `✅ Позиция: ${lat.toFixed(6)}, ${lng.toFixed(6)} | ` +
                `Дельта: ${dLat.toFixed(6)}, ${dLng.toFixed(6)}`
            );
        },
        (error) => {
            console.error("❌ Ошибка GPS:", error);
            if (error.code === 3) {
                console.log("Тайм-аут GPS. Пробуем еще раз...");
            }
        },
        GPS_WATCH_OPTIONS
    );
}

/**
 * Вычисляет дельту координат с защитой от скачков GPS.
 * @param {number} lat — текущая широта
 * @param {number} lng — текущая долгота
 * @returns {{dLat: number, dLng: number, isJump: boolean}}
 */
function calculateDelta(lat, lng) {
    let dLat = 0;
    let dLng = 0;
    let isJump = false;

    if (prevLat !== null && prevLng !== null) {
        dLat = lat - prevLat;
        dLng = lng - prevLng;

        // Если изменение больше порога — это скачок GPS
        if (Math.abs(dLat) > GPS_JUMP_THRESHOLD || Math.abs(dLng) > GPS_JUMP_THRESHOLD) {
            isJump = true;
            dLat = 0;
            dLng = 0;
            console.warn("⚠️ Скачок GPS! Дельта сброшена.");
        }
    }

    return { dLat, dLng, isJump };
}

/**
 * Обрабатывает обновление маркера на карте.
 * @param {L.Map} map — экземпляр карты
 * @param {number} lat — широта
 * @param {number} lng — долгота
 * @param {number} accuracy — точность
 * @param {boolean} isJump — был ли скачок GPS
 */
function handleMarkerUpdate(map, lat, lng, accuracy, isJump) {
    const marker = getPlayerMarker();

    if (!marker) {
        // Первый маркер — создаём и центрируем карту
        createMarker(map, lat, lng, accuracy);
        map.flyTo([lat, lng], 16, { animate: true, duration: 2 });
    } else {
        // Маркер существует — перемещаем
        moveMarker([lat, lng]);

        // Обновляем popup, если он открыт
        updatePopup(accuracy);
    }
}

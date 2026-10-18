/**
 * Модуль управления маркерами на карте.
 * Ответственность: создание, перемещение и обновление маркера игрока.
 */

import { carIcon } from "../storage/iconCar/iconcar.js";
import { POPUP_CONTENT_TEMPLATE, POPUP_OPTIONS } from "../config.js";

let playerMarker = null;

/**
 * Создаёт новый маркер на карте и привязывает popup.
 * @param {L.Map} map — экземпляр Leaflet-карты
 * @param {number} lat — широта
 * @param {number} lng — долгота
 * @param {number} accuracy — точность GPS
 * @returns {L.Marker} созданный маркер
 */
export function createMarker(map, lat, lng, accuracy) {
    playerMarker = L.marker([lat, lng], { icon: carIcon }).addTo(map);
    playerMarker.bindPopup(POPUP_CONTENT_TEMPLATE(accuracy), POPUP_OPTIONS).openPopup();

    // Закрываем popup по клику на него
    playerMarker.on("popupopen", (e) => {
        const popupElement = e.popup._contentNode;
        if (popupElement) {
            popupElement.addEventListener("pointerdown", (event) => {
                event.stopPropagation();
                playerMarker.closePopup();
            });
        }
    });

    return playerMarker;
}

/**
 * Перемещает маркер на новые координаты.
 * @param {L.LatLng} latlng — новые координаты
 */
export function moveMarker(latlng) {
    if (playerMarker) {
        playerMarker.setLatLng(latlng);
    }
}

/**
 * Обновляет содержимое popup маркера.
 * @param {number} accuracy — точность GPS
 */
export function updatePopup(accuracy) {
    if (playerMarker && playerMarker.isPopupOpen()) {
        playerMarker.setPopupContent(POPUP_CONTENT_TEMPLATE(accuracy));
    }
}

/**
 * Возвращает текущий маркер (для проверки null).
 * @returns {L.Marker|null}
 */
export function getPlayerMarker() {
    return playerMarker;
}

/**
 * Сбрасывает маркер (вызывается при инициализации).
 */
export function resetMarker() {
    playerMarker = null;
}

/**
 * Модуль обновления DOM-элементов с координатами.
 * Ответственность: отображение абсолютных значений и дельт.
 */

import { SELECTORS, GPS_DELTA_ZERO_THRESHOLD } from "../config.js";

/**
 * Получает DOM-элемент по селектору (с проверкой).
 * @param {string} selector — CSS-селектор
 * @returns {HTMLElement|null}
 */
function getEl(selector) {
    return document.querySelector(selector);
}

/**
 * Обновляет абсолютные значения координат.
 * @param {number} lat — широта
 * @param {number} lng — долгота
 */
export function updateCoordinates(lat, lng) {
    const latEl = getEl(SELECTORS.latValue);
    const lngEl = getEl(SELECTORS.lngValue);

    if (latEl) latEl.textContent = lat.toFixed(6);
    if (lngEl) lngEl.textContent = lng.toFixed(6);
}

/**
 * Обновляет дельты (изменения координат) с цветовой индикацией.
 * @param {number} dLat — изменение широты
 * @param {number} dLng — изменение долготы
 */
export function updateDeltas(dLat, dLng) {
    const latDeltaEl = getEl(SELECTORS.latDelta);
    const lngDeltaEl = getEl(SELECTORS.lngDelta);

    if (latDeltaEl) {
        latDeltaEl.textContent = (dLat > 0 ? "+" : "") + dLat.toFixed(6);
        updateDeltaColor(latDeltaEl, dLat);
    }
    if (lngDeltaEl) {
        lngDeltaEl.textContent = (dLng > 0 ? "+" : "") + dLng.toFixed(6);
        updateDeltaColor(lngDeltaEl, dLng);
    }
}

/**
 * Применяет цвет к элементу дельты в зависимости от знака значения.
 * @param {HTMLElement} element — DOM-элемент
 * @param {number} value — значение дельты
 */
function updateDeltaColor(element, value) {
    element.classList.remove("delta-positive", "delta-negative", "delta-zero");

    if (Math.abs(value) < GPS_DELTA_ZERO_THRESHOLD) {
        element.classList.add("delta-zero");
        return;
    }

    element.classList.add(value > 0 ? "delta-positive" : "delta-negative");
}

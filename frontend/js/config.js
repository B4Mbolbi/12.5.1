
export const MAP_DEFAULT_VIEW = [53.0452, 158.6483];
export const MAP_DEFAULT_ZOOM = 13;
export const MAP_MAX_ZOOM = 19;
export const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// --- Иконка машины ---
export const ICON_SIZE_WIDTH = 30;
export const ICON_SIZE_HEIGHT = 30;

// --- GPS ---
export const GPS_WATCH_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

// Защита от скачков GPS (0.001 градуса ≈ 100 метров)
export const GPS_JUMP_THRESHOLD = 0.001;

// Порог «нулевой дельты» — меньше этого = стоим на месте
export const GPS_DELTA_ZERO_THRESHOLD = 0.000009;

// --- DOM-селекторы ---
export const SELECTORS = {
    latValue: "#lat-value",
    lngValue: "#lng-value",
    latDelta: "#lat-delta",
    lngDelta: "#lng-delta",
};

// --- Popup ---
export const POPUP_CONTENT_TEMPLATE = (accuracy) =>
    `Вы здесь!<br>Точность: ${Math.round(accuracy)} метров`;

export const POPUP_OPTIONS = {
    closeButton: false,
    closeOnClick: false,
};

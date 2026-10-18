

// Экспортируем функцию, которая создаёт карту и возвращает её
export function initMap() {
    const map = L.map('map', {
        zoomControl: false,        // Убираем кнопки + и -
        attributionControl: false  // Убираем надпись Leaflet внизу
    }).setView([53.0452, 158.6483], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Возвращаем карту, чтобы другие файлы могли её использовать
    return map;
}

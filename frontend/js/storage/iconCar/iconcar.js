import { carSvgHtml } from './CarIconSvg.js'; // Импортируем иконку

const iconSizeHeight = 30
const iconSizeWidth = 30

const iconAnchorX = iconSizeWidth / 2
const iconAnchorY = iconSizeHeight / 2

// Создаём иконку машины один раз и экспортируем её
export const carIcon = L.divIcon({
    className: 'car-marker-wrapper', // Класс для самой обертки Leaflet
    html: carSvgHtml, // Класс для визуального круга
    iconSize: [iconSizeWidth, iconSizeHeight],
    iconAnchor: [iconAnchorX, iconAnchorY] // Сдвигаем на половину размера (50/2), чтобы центр был ровно на координате
});
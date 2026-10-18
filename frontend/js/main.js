/**
 * Точка входа фронтенд-приложения.
 * Инициализирует карту и запускает GPS-трекинг.
 */

import { initMap } from "./storage/map/map.js";
import { startGpsTracking } from "./tracker/gps.js";

console.log("🚀 Скрипт запущен!");

// 1. Создаём карту
const myMap = initMap();

// 2. Запускаем отслеживание GPS
startGpsTracking(myMap);

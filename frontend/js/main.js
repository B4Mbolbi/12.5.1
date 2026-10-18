// 1. Импортируем с указанием "./"
import { initMap } from './storage/map/map.js';
import { getLocation} from './utils/geo.js';

console.log("Скрипт запущен!");

// 2. Создаём карту и сохраняем её в переменную
const myMap = initMap();

// 3. Передаём карту в функцию GPS
getLocation(myMap);
// fakegetLOcation(myMap)


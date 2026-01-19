/*
    ОБЯСНЕНИЕ: map.js
    
    Този файл работи с картата (OpenStreetMap чрез Leaflet).
    
    LEAFLET е JavaScript библиотека за интерактивни карти.
    - Безплатна и open-source
    - Лесна за използване
    - Работи с OpenStreetMap
    
    Основни понятия:
    - Map: Самата карта
    - Marker: Точка/икона на картата
    - Polyline: Линия между точки (за показване на път)
    - Popup: Изскачащ прозорец при клик
*/

// ========== КЛАС ЗА КАРТАТА ==========

class CampusMap {
    
    constructor(containerId) {
        /*
            ОБЯСНЕНИЕ:
            - containerId: id на HTML елемента, където ще е картата
            - this.map: обектът на Leaflet картата
            - this.markers: обект с всички маркери { id: marker }
            - this.currentPath: текущата начертана линия на пътя
        */
        this.containerId = containerId;
        this.map = null;
        this.markers = {};
        this.currentPolylines = []; // Променено на масив
        this.routingControls = [];
    }

    // ========== ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ==========
    
    /*
        Инициализира картата.
        
        Параметри:
        - centerLat: начална географска ширина (default: София)
        - centerLng: начална географска дължина
        - zoom: ниво на увеличение (1-18, по-голямо = по-близо)
    */
    init(centerLat = 42.6977, centerLng = 23.3219, zoom = 15) {
        /*
            ОБЯСНЕНИЕ:
            L.map() създава нова карта в избрания контейнер.
            setView() задава центъра и нивото на zoom.
        */
        this.map = L.map(this.containerId).setView([centerLat, centerLng], zoom);
        this.routingControl = null;
        /*
            ОБЯСНЕНИЕ:
            L.tileLayer() добавя "плочките" на картата.
            OpenStreetMap предоставя безплатни карти.
            {z}, {x}, {y} са координати на плочките.
        */
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);

        console.log("Картата е инициализирана!");
    }

    // ========== РАБОТА С МАРКЕРИ ==========

    /*
        Добавя маркер (точка) на картата.
        
        Параметри:
        - id: уникален идентификатор
        - lat, lng: координати
        - popupText: текст при клик на маркера
        - color: цвят на маркера (default: син)
    */
    addMarker(id, lat, lng, popupText, color = 'blue') {
        /*
            ОБЯСНЕНИЕ:
            L.marker() създава маркер на определени координати.
            bindPopup() добавя изскачащ текст при клик.
            addTo() добавя маркера към картата.
        */
        
        // Създаваме custom икона с цвят
        const icon = this.createIcon(color);
        
        const marker = L.marker([lat, lng], { icon: icon })
            .bindPopup(popupText)
            .addTo(this.map);

        // Запазваме маркера
        this.markers[id] = marker;
        
        console.log(`Добавен маркер: ${id} на (${lat}, ${lng})`);
        return marker;
    }

    /*
        Създава custom икона за маркер.
        Използваме различни цветове за различни типове локации.
    */
    createIcon(color) {
        // Цветове за различни типове
        const colors = {
            'blue': '#3498db',
            'green': '#27ae60',
            'red': '#e74c3c',
            'orange': '#f39c12',
            'purple': '#9b59b6'
        };

        const selectedColor = colors[color] || colors['blue'];

        /*
            ОБЯСНЕНИЕ:
            L.divIcon() позволява да създадем маркер с HTML/CSS.
            Това е по-гъвкаво от стандартните икони.
        */
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${selectedColor};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],  // Центърът на иконата
            popupAnchor: [0, -12]  // Къде се показва popup-а
        });
    }

    // Премахва маркер
    removeMarker(id) {
        if (this.markers[id]) {
            this.map.removeLayer(this.markers[id]);
            delete this.markers[id];
            console.log(`Премахнат маркер: ${id}`);
        }
    }

    // Премахва всички маркери
    clearMarkers() {
        for (let id in this.markers) {
            this.map.removeLayer(this.markers[id]);
        }
        this.markers = {};
        console.log("Всички маркери са премахнати");
    }

    // ========== РИСУВАНЕ НА ПЪТ ==========

    /*
        Рисува маршрут между точки използвайки Leaflet Routing Machine.
        Показва реални пътища и инструкции за навигация.
        
        Параметри:
        - points: масив от координати [[lat1, lng1], [lat2, lng2], ...]
        - color: цвят на линията
    */
    drawFullRoute(pathNodes, color = '#e74c3c') {
    // 1. Изчистваме всичко старо
    this.clearPath();

    if (pathNodes.length < 2) return;
    
    console.log("Drawing full route:", pathNodes[0], pathNodes[pathNodes.length -1]);

    // 2. Итерираме през двойки съседни точки
    for (let i = 0; i < pathNodes.length - 1; i++) {
        const start = pathNodes[i];
        const end = pathNodes[i + 1];
        
        // Вземаме координатите. Тук приемаме, че обектите имат .lat и .lng
        const waypoints = [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1] )
        ];
        console.log(waypoints);
        if(((start[2] === "ФМИ"&& end[2] ==="FMI-FZF Paths") || (start[2] === "FMI-FZF Paths" && end[2] ==="ФЗФ"))||
           ((start[2] === "ФЗФ"&& end[2] ==="FMI-FZF Paths") || (start[2] === "FMI-FZF Paths" && end[2] ==="ФМИ"))||
           ((start[2] === "ФМИ"&& end[2] ==="FMI-FHF Paths") || (start[2] === "FMI-FHF Paths" && end[2] ==="ФХФ"))||
           ((start[2] === "ФХФ"&& end[2] ==="FMI-FHF Paths") || (start[2] === "FMI-FHF Paths" && end[2] ==="ФМИ")))
            {
                const polyline = L.polyline(waypoints, {
                color: color,
                weight: 5,
                dashArray: '10, 10', // Пунктир за вътрешен път
                opacity: 0.9
            }).addTo(this.map);
            this.currentPolylines.push(polyline);   
            continue; 
            }
        // ПРОВЕРКА: В една и съща сграда ли сме?
        if (start[2] === end[2]) {
            // ЧЕРТАЕМ ПРАВА ЛИНИЯ (Indoor)
            const polyline = L.polyline(waypoints, {
                color: color,
                weight: 5,
                dashArray: '10, 10', // Пунктир за вътрешен път
                opacity: 0.9
            }).addTo(this.map);
            
            this.currentPolylines.push(polyline);
        } else {
            // ЧЕРТАЕМ ПЪТ ПО УЛИЦИ (Outdoor)
            const control = L.Routing.control({
                waypoints: waypoints,
                addWaypoints: false,
                draggableWaypoints: false,
                createMarker: () => null,
                lineOptions: {
                    styles: [{ color: color, weight: 6, opacity: 0.8 }]
                },
                show: false, // Скриваме панела с инструкции за всеки малък сегмент
                collapsible: true
            }).addTo(this.map);

            this.routingControls.push(control);
            
        }
    }
    this.centerOnPath(pathNodes);
}

    // Премахва текущия път
    clearPath() {
    // Изчистваме всички права линии
    this.currentPolylines.forEach(line => {
        this.map.removeLayer(line);
    });
    this.currentPolylines = [];

    // Изчистваме всички Routing контроли
    this.routingControls.forEach(control => {
        this.map.removeControl(control);
    });
    this.routingControls = [];
}

    // ========== ПОМОЩНИ МЕТОДИ ==========

    // Центрира картата на определени координати
    centerOnPath(pathNodes) {
    if (!pathNodes || pathNodes.length === 0) return;

    // Създаваме обект, който описва "рамката" на маршрута
    const points = pathNodes.map(node => [node[0], node[1]]);
    const bounds = L.latLngBounds(points);

    // fitBounds автоматично центрира и избира правилния Zoom
    this.map.fitBounds(bounds, {
        padding: [50, 50], // Оставя място от 50px до краищата на екрана
        maxZoom: 18,       // Предотвратява прекалено приближаване при кратки пътища
        animate: true,     // Плавно движение
        duration: 1.5      // Продължителност на анимацията в секунди
    });
}

    // Фокусира върху маркер
    focusMarker(id) {
        if (this.markers[id]) {
            const marker = this.markers[id];
            const latLng = marker.getLatLng();
            this.centerOn(latLng.lat, latLng.lng);
            marker.openPopup();  // Отваря popup-а
        }
    }
}

// Създаваме глобална инстанция на картата
const campusMap = new CampusMap('map');

console.log("map.js зареден успешно!");

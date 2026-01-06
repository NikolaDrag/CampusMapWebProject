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
        this.currentPath = null;
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
        Рисува линия (път) между точки на картата.
        
        Параметри:
        - points: масив от координати [[lat1, lng1], [lat2, lng2], ...]
        - color: цвят на линията
    */
    drawPath(points, color = '#e74c3c') {
    this.clearPath();

    if (points.length < 2) return;

    // Instead of a polyline, we create a Routing Control
    this.currentPath = L.Routing.control({
        waypoints: [
            L.latLng(points[0]), // Start point
            L.latLng(points[points.length - 1]) // End point
        ],
        lineOptions: {
            styles: [{ color: color, opacity: 0.8, weight: 6 }]
        },
        addWaypoints: false, // Prevents users from adding new points
        draggableWaypoints: false, // Keeps the path fixed
        createMarker: function() { return null; } // Optional: hides extra markers
    }).addTo(this.map);

    // Note: Routing is asynchronous, so fitBounds needs to happen 
    // after the route is found.
}

    // Премахва текущия път
    clearPath() {
        if (this.currentPath) {
            this.map.removeLayer(this.currentPath);
            this.currentPath = null;
            console.log("Пътят е премахнат");
        }
    }

    // ========== ПОМОЩНИ МЕТОДИ ==========

    // Центрира картата на определени координати
    centerOn(lat, lng, zoom = 16) {
        this.map.setView([lat, lng], zoom);
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

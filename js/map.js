class CampusMap {
    
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.markers = {};
        this.currentPolylines = [];
        this.routingControls = [];
    }

    init(centerLat = 42.6977, centerLng = 23.3219, zoom = 15) {
        this.map = L.map(this.containerId).setView([centerLat, centerLng], zoom);
        this.routingControl = null;
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);
    }

    addMarker(id, lat, lng, popupText, color = 'blue') {
        const icon = this.createIcon(color);
        
        const marker = L.marker([lat, lng], { icon: icon })
            .bindPopup(popupText)
            .addTo(this.map);

        this.markers[id] = marker;
        return marker;
    }

    createIcon(color) {
        const colors = {
            'blue': '#3498db',
            'green': '#27ae60',
            'red': '#e74c3c',
            'orange': '#f39c12',
            'purple': '#9b59b6'
        };

        const selectedColor = colors[color] || colors['blue'];

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
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    }

    removeMarker(id) {
        if (this.markers[id]) {
            this.map.removeLayer(this.markers[id]);
            delete this.markers[id];
        }
    }

    clearMarkers() {
        for (let id in this.markers) {
            this.map.removeLayer(this.markers[id]);
        }
        this.markers = {};
    }

    drawFullRoute(pathNodes, color = '#e74c3c') {
        //this.clearPath();

        if (pathNodes.length < 2) return;

        for (let i = 0; i < pathNodes.length - 1; i++) {
            const start = pathNodes[i];
            const end = pathNodes[i + 1];
            
            const waypoints = [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ];
            
            // check FMI entrance and Rectorate entrance as they are the main exit points of the campus
            // boolean indicator for exit point should be added in the database!!!
            if (!((start[2] == 17 && end[2] == 20) || (start[2] == 20 && end[2] == 17))) {
                const polyline = L.polyline(waypoints, {
                    color: color,
                    weight: 5,
                    dashArray: '10, 10',
                    opacity: 0.9
                }).addTo(this.map);
                this.currentPolylines.push(polyline);
                continue;
            }

            if (start[2] === end[2]) {
                const polyline = L.polyline(waypoints, {
                    color: color,
                    weight: 5,
                    dashArray: '10, 10',
                    opacity: 0.9
                }).addTo(this.map);
                
                this.currentPolylines.push(polyline);
            } else {
                const control = L.Routing.control({
                    waypoints: waypoints,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    createMarker: () => null,
                    lineOptions: {
                        styles: [{ color: color, weight: 6, opacity: 0.8 }]
                    },
                    show: false,
                    collapsible: true
                }).addTo(this.map);

                this.routingControls.push(control);
            }
        }
        this.centerOnPath(pathNodes);
    }

    clearPath() {
        this.currentPolylines.forEach(line => {
            this.map.removeLayer(line);
        });
        this.currentPolylines = [];

        this.routingControls.forEach(control => {
            this.map.removeControl(control);
        });
        this.routingControls = [];
    }

    centerOnPath(pathNodes) {
        if (!pathNodes || pathNodes.length === 0) return;

        const points = pathNodes.map(node => [node[0], node[1]]);
        const bounds = L.latLngBounds(points);

        this.map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 18,
            animate: true,
            duration: 1.5
        });
    }

    focusMarker(id) {
        if (this.markers[id]) {
            const marker = this.markers[id];
            const latLng = marker.getLatLng();
            this.centerOn(latLng.lat, latLng.lng);
            marker.openPopup();
        }
    }
}

const campusMap = new CampusMap('map');

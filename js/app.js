/*
    ОБЯСНЕНИЕ: app.js
    
    Това е ГЛАВНИЯТ файл, който свързва всичко заедно.
    - Инициализира картата
    - Зарежда примерни данни
    - Добавя event listeners (реакции на бутони и т.н.)
    - Управлява интерфейса
*/

// ========== ПРИМЕРНИ ДАННИ ЗА КАМПУСА ==========

/*
    ОБЯСНЕНИЕ:
    Това са примерни данни за тестване.
    В реален проект ще ги заредите от JSON файл или база данни.
    
    Координатите са реални (около ФМИ на СУ в София).
    Можеш да ги промениш за твоя кампус!
*/

const sampleCampusData = {
    // Центърът на кампуса (за инициализация на картата)
    center: {
        lat: 42.6933,
        lng: 23.3347,
        zoom: 17
    },
    
    // Възли (зали/сгради)
    "nodes": { 
        "FMI200": {
            "id": "FMI200",
            "name": "ФМИ - Зала 200 (Аудиториум)",
            "lat": 42.67446134148402,
            "lng": 23.330705138156453,
            "floor": 2,
            "building": "ФМИ",
            "hidden": false
        },

        "FMI325": {
            "id": "FMI325",
            "name": "ФМИ - Зала 325 (Аудиториум)",
            "lat": 42.67430456688142,
            "lng": 23.330292077993278,
            "floor": 3,
            "building": "ФМИ",
            "hidden": false
        },

        "FMI314": {
            "id": "FMI314",
            "name": "ФМИ - Зала 314 (Компютърна зала)",
            "lat": 42.674288790798414,
            "lng": 23.330398025242594,
            "floor": 3,
            "building": "ФМИ",
            "hidden": false
        },

        "FMI100": {
            "id": "FMI100",
            "name": "ФМИ - Стая 100 (Бордови Игри)",
            "lat": 42.67453529163051,
            "lng": 23.330855341851827,
            "floor": 1,
            "building": "ФМИ",
            "hidden": false
        },

        "FMI01": {
            "id": "FMI01",
            "name": "ФМИ - Зала 01 (Лекционна зала)",
            "lat": 42.67433513302949,
            "lng": 23.33073866576677,
            "floor": -1,
            "building": "ФМИ",
            "hidden": false
        },

        "FRIZER": {
            "id": "FRIZER",
            "name": "ФЗФ - Фризер (Аудиториум)",
            "lat": 42.673611401459986,
            "lng": 23.329913886506514,
            "floor": 3,
            "building": "ФЗФ",
            "hidden": false
        },

        "FZFSTOL": {
            "id": "FZFSTOL",
            "name": "ФЗФ - Столова",
            "lat": 42.67363506583987,
            "lng": 23.328792723156628,
            "floor": 1,
            "building": "ФЗФ",
            "hidden": false
        },

        "FZF326B": {
            "id": "FZF326B",
            "name": "ФЗФ - Зала 326 (Лекционна зала)",
            "lat": 42.673850016882334,
            "lng": 23.32906362626069,
            "floor": 1,
            "building": "ФЗФ",
            "hidden": false
        },

        "KULATA": {
            "id": "KULATA",
            "name": "ФХФ - КУЛАТА (Място за развлечение)",
            "lat": 42.67462484841399,
            "lng": 23.332607355597276,
            "floor": 8,
            "building": "ФХФ",
            "hidden": false
        },

        "FHF210": {
            "id": "FHF210",
            "name": "ФХФ - Зала 210 (Аудиториум)",
            "lat": 42.67436059986496,
            "lng": 23.333615866142356,
            "floor": 2,
            "building": "ФХФ",
            "hidden": false
        },

        "FHF130": {
            "id": "FHF130",
            "name": "ФХФ - Зала 130 (Аудиториум)",
            "lat": 42.67453906635889,
            "lng": 23.333465662446656,
            "floor": 1,
            "building": "ФХФ",
            "hidden": false
        },

        "FHF610": {
            "id": "FHF610",
            "name": "ФХФ - Зала 610 (Лекционна зала)",
            "lat": 42.67454596836928,
            "lng": 23.332575169086972,
            "floor": 6,
            "building": "ФХФ",
            "hidden": false
        },
         
        "REKTORAT605": {
            "id": "REKTORAT605",
            "name": "Ректорат - Зала 605 (Лекционна зала)",
            "lat": 42.69309189128681,
            "lng": 23.335447570079072,
            "floor": 6,
            "building": "Ректорат",
            "hidden": false
        },

        "MAMUT": {
            "id": "MAMUT",
            "name": "Ректорат - Скелет на мамут (Музей)",
            "lat": 42.694211644238806,
            "lng": 23.33495136147671,
            "floor": 6,
            "building": "Ректорат",
            "hidden": false
        },

        "LIB": {
            "id": "LIB",
            "name": "Ректорат - Библиотека",
            "lat": 42.693596571168605,
            "lng": 23.335761388513756,
            "floor": 1,
            "building": "Ректорат",
            "hidden": false
        },
        
        "CAFE": {
            "id": "CAFE",
            "name": "Ректорат - Столова",
            "lat": 42.6935,
            "lng": 23.3330,
            "floor": 0,
            "building": "Ректорат",
            "hidden": false
        },
        
        "FMI_VHOD": {
            "id": "FMI_VHOD",
            "name": "ФМИ - Вход",
            "lat": 42.67450347360084,
            "lng": 23.330413453347777,
            "floor": 1,
            "building": "ФМИ",
            "hidden": false
        },
        "FZF_VHOD": {
            "id": "FZF_VHOD",
            "name": "ФЗФ - Вход",
            "lat": 42.67393156529344,
            "lng": 23.329798048598324,
            "floor": 1,
            "building": "ФЗФ",
            "hidden": false
        },
        "FHF_VHOD": {
            "id": "FHF_VHOD",
            "name": "ФХФ - Вход",
            "lat": 42.6747287746268,
            "lng": 23.333360530459398,
            "floor": 1,
            "building": "ФХФ",
            "hidden": false
        },
        "REKTORAT_VHOD": {
            "id": "REKTORAT_VHOD",
            "name": "Ректорат - Вход",
            "lat": 42.693521658007015,
            "lng": 23.334634860807206,
            "floor": 1,
            "building": "Ректорат",
            "hidden": false
        },
        "FZF_FMI":
        {
            "id": "FZF_FMI",
            "name": "Пътека ФЗФ-ФМИ",
            "lat": 42.674330203001595,
            "lng": 23.329892428871545,
            "floor": 1,
            "building": "FMI-FZF Paths",
            "hidden": true
        },
        "FMI_FHF1": {
            "id": "FMI_FHF1",
            "name": "Пътека ФХФ-ФМИ",
            "lat": 42.67464966768705,
            "lng": 23.331000181169276,
            "floor": 1,
            "building": "FMI-FHF Paths",
            "hidden": true
        },
        "FMI_FHF2": {
            "id": "FMI_FHF2",
            "name": "Пътека ФХФ-ФМИ",
            "lat": 42.67424836457649,
            "lng":  23.33141190025043,
            "floor": 1,
            "building": "FMI-FHF Paths",
            "hidden": false
        },
        "FMI_FHF3": {
            "id": "FMI_FHF3",
            "name": "Пътека ФХФ-ФМИ",
            "lat": 42.67412807173594, 
            "lng": 23.331873240175387,
            "floor": 1,
            "building": "FMI-FHF Paths",
            "hidden":  false
        },
    },
    "edges": []
};


const nodeIds = Object.keys(sampleCampusData.nodes);

function getDistance(node1, node2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = node1.lat * Math.PI / 180;
    const phi2 = node2.lat * Math.PI / 180;
    const deltaPhi = (node2.lat - node1.lat) * Math.PI / 180;
    const deltaLambda = (node2.lng - node1.lng) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Returns distance in meters
}

const nodesByBuilding = Object.values(sampleCampusData.nodes).reduce((acc, node) => {
    if (!acc[node.building]) {
        acc[node.building] = [];
    }

    acc[node.building].push(node);
    return acc;
}, {});

const newEdges = [];
Object.entries(nodesByBuilding).forEach(([buildingName, rooms]) => {
    
    for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
            const nodeA = rooms[i];
            const nodeB = rooms[j];
            if(nodeA.id === "FMI_FHF1" && nodeB.id === "FMI_FHF3") continue;
            if(nodeA.id === "FMI_FHF3" && nodeB.id === "FMI_FHF1") continue;
            if(nodeA.id === "FHF130" && nodeB.id === "FHF210") continue;
            if(nodeA.id === "FHF210" && nodeB.id === "FHF130") continue;
            const dist = Math.round((getDistance(nodeA, nodeB)/1.38)/60); // ako vurvim s like 5km/h
        
            newEdges.push({
                source: nodeA.id,
                target: nodeB.id,
                distance: dist,
                
            });
        }
    }
});

const buildingNames = Object.keys(nodesByBuilding);

for (let i = 0; i < buildingNames.length; i++) {
    for (let j = i + 1; j < buildingNames.length; j++) {
        const buildingA = buildingNames[i];
        const buildingB = buildingNames[j];

        const entranceA = nodesByBuilding[buildingA].find(node => node.id.endsWith("VHOD"));
        const entranceB = nodesByBuilding[buildingB].find(node => node.id.endsWith("VHOD"));
        
        if (entranceA && entranceB) {
            if (entranceA.id === "FMI_VHOD" && entranceB.id === "FZF_VHOD") continue;
            if(entranceA.id === "FZF_VHOD" && entranceB.id === "FMI_VHOD") continue;
            if(entranceA.id === "FMI_VHOD" && entranceB.id === "FHF_VHOD") continue;
            if(entranceA.id === "FHF_VHOD" && entranceB.id === "FMI_VHOD") continue;
            if(entranceA.id === "FZF_VHOD" && entranceB.id === "FHF_VHOD") continue;
            if(entranceA.id === "FHF_VHOD" && entranceB.id === "FZF_VHOD") continue;
            
            const distMeters = getDistance(entranceA, entranceB);
            
            const travelTime = Math.round((distMeters / 1.38) / 60); 

            newEdges.push({
                source: entranceA.id,
                target: entranceB.id,
                distance: travelTime, 
                
            });
        }
    }
}
newEdges.push({
    source: "FMI_VHOD",
    target: "FZF_FMI",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_VHOD"], sampleCampusData.nodes["FZF_FMI"])/1.38/60),
});
console.log( getDistance(sampleCampusData.nodes["FMI_VHOD"], sampleCampusData.nodes["FZF_FMI"])/1.38/60, "DAAATAAAA")
newEdges.push({
    source: "FZF_VHOD",
    target: "FZF_FMI",
    distance: Math.round(getDistance(sampleCampusData.nodes["FZF_VHOD"], sampleCampusData.nodes["FZF_FMI"])/1.38/60),
});

// FMI - FHF PATHS
newEdges.push({
    source: "FMI_VHOD",
    target: "FMI_FHF1",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_VHOD"], sampleCampusData.nodes["FMI_FHF1"])/1.38/60),
});newEdges.push({
    source: "FMI_FHF1",
    target: "FMI_VHOD",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF1"], sampleCampusData.nodes["FMI_VHOD"])/1.38/60),


});newEdges.push({
    source: "FMI_FHF1",
    target: "FMI_FHF2",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF1"], sampleCampusData.nodes["FMI_FHF2"])/1.38/60),
});newEdges.push({
    source: "FMI_FHF2",
    target: "FMI_FHF1",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF2"], sampleCampusData.nodes["FMI_FHF1"])/1.38/60),

});newEdges.push({
    source: "FMI_FHF2",
    target: "FMI_FHF3",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF2"], sampleCampusData.nodes["FMI_FHF3"])/1.38/60),
});newEdges.push({
    source: "FMI_FHF3",
    target: "FMI_FHF2",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF3"], sampleCampusData.nodes["FMI_FHF2"])/1.38/60),


});newEdges.push({
    source: "FMI_FHF3",
    target: "FHF_VHOD",
    distance: Math.round(getDistance(sampleCampusData.nodes["FMI_FHF3"], sampleCampusData.nodes["FHF_VHOD"])/1.38/60),
});newEdges.push({
    source: "FHF_VHOD",
    target: "FMI_FHF3",
    distance: Math.round(getDistance(sampleCampusData.nodes["FHF_VHOD"], sampleCampusData.nodes["FMI_FHF3"])/1.38/60),
});

// Update the object
sampleCampusData.edges = newEdges;
console.log(sampleCampusData.edges)
console.log(`Generated ${sampleCampusData.edges.length} edges.`);
// ========== ИНИЦИАЛИЗАЦИЯ ==========

/*
    ОБЯСНЕНИЕ:
    DOMContentLoaded се изпълнява когато HTML-а е зареден.
    Това гарантира, че всички елементи съществуват преди да ги използваме.
*/
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== Campus Navigator стартира ===");
    
    // Стъпка 1: Инициализираме картата
    initMap();
    
    // Стъпка 2: Зареждаме примерните данни
    loadSampleData();
    
    // Стъпка 3: Попълваме dropdown менютата
    populateDropdowns();
    
    // Стъпка 4: Добавяме event listeners
    setupEventListeners();
    
    // Стъпка 5: Проверяваме автентикацията (нова стъпка!)
    checkAuthStatus();
    
    console.log("=== Инициализацията завърши ===");
});

// ========== ФУНКЦИИ ЗА ИНИЦИАЛИЗАЦИЯ ==========

function initMap() {
    // Инициализираме картата с центъра на кампуса
    const center = sampleCampusData.center;
    campusMap.init(center.lat, center.lng, center.zoom);
}

function loadSampleData() {
    // Зареждаме данните в графа
    
    // Добавяме възлите
    for (let id in sampleCampusData.nodes) {
        const node = sampleCampusData.nodes[id];
        campusGraph.addNode(id, node.name, node.lat, node.lng, node.floor, node.building, node.hidden);
        
        // Добавяме маркер на картата за всеки възел
        const popupContent = `
            <strong>${node.name}</strong><br>
            Етаж: ${node.floor}<br>
            Сграда: ${node.building}
        `;
        if(!node.hidden)
            {
            campusMap.addMarker(id, node.lat, node.lng, popupContent, 'blue');
        }
        
    }
    
    // Добавяме връзките
    for (let edge of sampleCampusData.edges) {
        campusGraph.addEdge(edge.source, edge.target, edge.distance);
    }
    
    console.log("Примерните данни са заредени");
}

function populateDropdowns() {
    /*
        ОБЯСНЕНИЕ:
        Попълваме падащите менюта с опции от графа.
    */
    const startSelect = document.getElementById('start-point');
    const endSelect = document.getElementById('end-point');
    
    // Вземаме всички възли
    const nodes = campusGraph.getAllNodes();
    
    // Добавяме опция за всеки възел
    nodes.forEach(node => {
        console.log("NODE:", node.hidden);
        if(node.hidden)
            {
                console.log("Hidden node skipped:", node.id);
                return;
                
            }
        // Създаваме нов option елемент
        const option1 = document.createElement('option');
        option1.value = node.id;
        option1.textContent = node.name;
        
        const option2 = document.createElement('option');
        option2.value = node.id;
        option2.textContent = node.name;
        
        // Добавяме към двата select-а
        startSelect.appendChild(option1);
        endSelect.appendChild(option2);
    });
    
    console.log("Dropdown менютата са попълнени");
}

function setupEventListeners() {
    
    // Бутон "Намери път"
    document.getElementById('find-path-btn').addEventListener('click', findPath);
    
    // Бутони за експорт
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    
    // Бутон за импорт
    document.getElementById('import-btn').addEventListener('click', importData);
    
    // Бутон "Добави към любими" (нов!)
    const addFavoriteBtn = document.getElementById('add-favorite-btn');
    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', addFavorite);
    }
    
    console.log("Event listeners са настроени");
}

// ========== ОСНОВНИ ФУНКЦИИ ==========

function findPath() {
    /*
        ОБЯСНЕНИЕ:
        Тази функция се извиква при клик на бутона "Намери път".
        1. Взима избраните стойности от dropdown-ите
        2. Изпълнява Dijkstra алгоритъма
        3. Показва резултата и рисува пътя на картата
    */
    
    const startId = document.getElementById('start-point').value;
    const endId = document.getElementById('end-point').value;
    
    // Проверка дали са избрани и двете точки
    if (!startId || !endId) {
        alert('Моля, избери начална и крайна точка!');
        return;
    }
    
    if (startId === endId) {
        alert('Началната и крайната точка са еднакви!');
        return;
    }
    
    console.log(`Търсене на път от ${startId} до ${endId}...`);
    
    // Изпълняваме Dijkstra
    const result = campusGraph.dijkstra(startId, endId);
    
    // Показваме резултата
    displayResult(result);
    
    // Рисуваме пътя на картата
    if (result.path.length > 0) {
        drawPathOnMap(result.path);
    }
}

function displayResult(result) {
    /*
        ОБЯСНЕНИЕ:
        Показва резултата от търсенето в #result секцията.
    */
    
    const resultText = document.getElementById('result-text');
    const resultDistance = document.getElementById('result-distance');
    
    if (result.path.length === 0) {
        resultText.textContent = result.message;
        resultDistance.textContent = '';
        return;
    }
    
    // Форматираме пътя като текст
    const pathNames = result.path.map(id => {
        const node = campusGraph.getNode(id);
        return node ? node.name : id;
    });
    
    resultText.innerHTML = `
        <strong>Маршрут:</strong><br>
        ${pathNames.join(' → ')}
    `;
    
    resultDistance.textContent = `⏱️ Време: ${result.distance} минути`;
}

function drawPathOnMap(path) {
    /*
        ОБЯСНЕНИЕ:
        Рисува линия на картата между точките в пътя.
    */
    
    // Конвертираме id-та в координати
    const points = path.map(id => {
        const node = campusGraph.getNode(id);
        return [node.lat, node.lng,node.building,];
    });

    // Рисуваме пътя
    console.log("Рисуване на път на картата:", points);
    campusMap.drawFullRoute(points, '#e74c3c');
}

// ========== ЕКСПОРТ/ИМПОРТ ФУНКЦИИ ==========

function exportJSON() {
    /*
        ОБЯСНЕНИЕ:
        Експортира данните като JSON файл.
        Създава временен линк за download.
    */
    
    const data = campusGraph.toJSON();
    const jsonString = JSON.stringify(data, null, 2);  // null, 2 = красив формат
    
    // Създаваме файл за download
    downloadFile(jsonString, 'campus_data.json', 'application/json');
    
    console.log("Данните са експортирани като JSON");
}

function exportCSV() {
    /*
        ОБЯСНЕНИЕ:
        Експортира данните като CSV файл.
        CSV = Comma Separated Values (стойности разделени със запетая)
    */
    
    // CSV за възлите
    let csv = "id,name,lat,lng,floor,building\n";  // Header ред
    
    const nodes = campusGraph.getAllNodes();
    nodes.forEach(node => {
        csv += `${node.id},"${node.name}",${node.lat},${node.lng},${node.floor},"${node.building}"\n`;
    });
    
    downloadFile(csv, 'campus_nodes.csv', 'text/csv');
    
    // CSV за връзките
    let edgesCsv = "from,to,weight\n";
    campusGraph.edges.forEach(edge => {
        edgesCsv += `${edge.from},${edge.to},${edge.weight}\n`;
    });
    
    downloadFile(edgesCsv, 'campus_edges.csv', 'text/csv');
    
    console.log("Данните са експортирани като CSV");
}

function downloadFile(content, filename, mimeType) {
    /*
        ОБЯСНЕНИЕ:
        Помощна функция за download на файл.
        Създава временен <a> елемент, кликва го и го премахва.
    */
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);  // Освобождаваме паметта
}

function importData() {
    /*
        ОБЯСНЕНИЕ:
        Импортира данни от избран файл.
        Поддържа JSON формат.
    */
    
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Моля, избери файл за импорт!');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Изчистваме текущите маркери
            campusMap.clearMarkers();
            campusMap.clearPath();
            
            // Зареждаме новите данни
            campusGraph.fromJSON(data);
            
            // Добавяме маркери за новите възли
            const nodes = campusGraph.getAllNodes();
            nodes.forEach(node => {
                const popupContent = `
                    <strong>${node.name}</strong><br>
                    Етаж: ${node.floor}<br>
                    Сграда: ${node.building}
                `;
                campusMap.addMarker(node.id, node.lat, node.lng, popupContent);
            });
            
            // Обновяваме dropdown-ите
            const startSelect = document.getElementById('start-point');
            const endSelect = document.getElementById('end-point');
            
            // Изчистваме старите опции (оставяме първата)
            startSelect.innerHTML = '<option value="">-- Избери зала --</option>';
            endSelect.innerHTML = '<option value="">-- Избери зала --</option>';
            
            // Добавяме новите
            populateDropdowns();
            
            alert('Данните са импортирани успешно!');
            
        } catch (error) {
            alert('Грешка при четене на файла: ' + error.message);
            console.error(error);
        }
    };
    
    reader.readAsText(file);
}

// ========== АВТЕНТИКАЦИЯ И ЛЮБИМИ МАРШРУТИ ==========

/*
    ОБЯСНЕНИЕ:
    Тези функции управляват:
    1. Проверка дали потребителят е логнат
    2. Показване/скриване на съответните елементи
    3. Зареждане на любими маршрути от базата
    4. Добавяне/изтриване на любими маршрути
*/

// Глобална променлива за текущия потребител
let currentUser = null;

// Текущо избран маршрут (от последното търсене)
let lastRoute = {
    from: null,
    to: null
};

function checkAuthStatus() {
    /*
        ОБЯСНЕНИЕ:
        Проверява дали потребителят е логнат чрез AJAX заявка.
        Ако е логнат - показва името му и бутон "Изход".
        Ако не е - показва линкове за вход/регистрация.
    */
    
    fetch('php/api.php?action=check_auth')
        .then(response => response.json())
        .then(data => {
            const authLinks = document.getElementById('auth-links');
            const userInfo = document.getElementById('user-info');
            const usernameSpan = document.getElementById('username');
            const logoutBtn = document.getElementById('logout-btn');
            const favoritesSection = document.getElementById('favorites-section');
            const addFavoriteBtn = document.getElementById('add-favorite-btn');
            
            if (data.logged_in) {
                // Потребителят е логнат
                currentUser = data.user;
                
                // Скриваме линковете за вход/регистрация
                if (authLinks) authLinks.style.display = 'none';
                
                // Показваме информация за потребителя
                if (userInfo) userInfo.style.display = 'flex';
                if (usernameSpan) usernameSpan.textContent = currentUser.username;
                
                // Показваме секцията с любими маршрути
                if (favoritesSection) favoritesSection.style.display = 'block';
                
                // Показваме бутона за добавяне
                if (addFavoriteBtn) addFavoriteBtn.style.display = 'block';
                
                // Зареждаме любимите маршрути
                loadFavorites();
                
                // Добавяме event listener за logout
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
                
                console.log("Потребител логнат:", currentUser.username);
            } else {
                // Потребителят НЕ е логнат
                currentUser = null;
                
                // Показваме линковете за вход/регистрация
                if (authLinks) authLinks.style.display = 'block';
                
                // Скриваме информация за потребителя
                if (userInfo) userInfo.style.display = 'none';
                
                // Скриваме секцията с любими маршрути
                if (favoritesSection) favoritesSection.style.display = 'none';
                
                // Скриваме бутона за добавяне
                if (addFavoriteBtn) addFavoriteBtn.style.display = 'none';
                
                console.log("Няма логнат потребител");
            }
        })
        .catch(error => {
            console.error("Грешка при проверка на автентикация:", error);
        });
}

function loadFavorites() {
    /*
        ОБЯСНЕНИЕ:
        Зарежда любимите маршрути на потребителя от базата данни.
        Използва GET заявка към API-то.
    */
    
    if (!currentUser) {
        console.log("Не може да се заредят любими - няма логнат потребител");
        return;
    }
    
    fetch('php/api.php?action=get_favorites')
        .then(response => response.json())
        .then(data => {
            const favoritesList = document.getElementById('favorites-list');
            
            if (!favoritesList) return;
            
            // Изчистваме списъка
            favoritesList.innerHTML = '';
            
            if (data.success && data.favorites && data.favorites.length > 0) {
                // Добавяме всеки любим маршрут
                data.favorites.forEach(fav => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="favorite-info">
                            <span class="favorite-name">${escapeHtml(fav.name)}</span>
                            <span class="favorite-route">${escapeHtml(fav.node_from)} → ${escapeHtml(fav.node_to)}</span>
                        </div>
                        <div class="favorite-actions">
                            <button class="favorite-use" onclick="useFavorite('${escapeHtml(fav.node_from)}', '${escapeHtml(fav.node_to)}')" title="Използвай маршрута">
                                🗺️
                            </button>
                            <button class="favorite-delete" onclick="deleteFavorite(${fav.id})" title="Изтрий от любими">
                                ✕
                            </button>
                        </div>
                    `;
                    favoritesList.appendChild(li);
                });
                
                console.log("Заредени любими маршрути:", data.favorites.length);
            } else {
                // Няма любими маршрути
                favoritesList.innerHTML = '<li class="no-favorites">Нямаш любими маршрути</li>';
            }
        })
        .catch(error => {
            console.error("Грешка при зареждане на любими:", error);
        });
}

function addFavorite() {
    if (!currentUser) {
        alert('Трябва да влезеш в профила си за да запазваш любими маршрути!');
        return;
    }
    
    const startId = document.getElementById('start-point').value;
    const endId = document.getElementById('end-point').value;
    
    if (!startId || !endId) {
        alert('Първо избери начална и крайна точка!');
        return;
    }
    
    if (startId === endId) {
        alert('Началната и крайната точка са еднакви!');
        return;
    }
    
    const startNode = campusGraph.getNode(startId);
    const endNode = campusGraph.getNode(endId);
    
    const defaultName = `${startNode ? startNode.name : startId} → ${endNode ? endNode.name : endId}`;
    
    const name = prompt('Въведи име за маршрута:', defaultName);
    
    if (name === null || name.trim() === '') {
        alert('Името не може да бъде празно!');
        return;
    }
    
    const formData = new FormData();
    formData.append('node_from', startId);
    formData.append('node_to', endId);
    formData.append('name', name.trim());

    fetch('php/api.php?action=add_favorite', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('HTTP Status:', response.status);
        return response.text();
    })
    .then(text => {
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Server returned invalid JSON:\n" + text);
            return;
        }

        if (data.success) {
            console.log('Маршрутът е добавен към любимите!');
            loadFavorites();
        } else {
            alert('Грешка: ' + (data.error || 'Неизвестна грешка'));
        }
    })
    .catch(error => {
        alert('Възникна грешка при запазване!');
    });
}

function deleteFavorite(favoriteId) {
    /*
        ОБЯСНЕНИЕ:
        Изтрива любим маршрут от базата данни.
        Показва потвърждение преди изтриване.
    */
    
    if (!currentUser) {
        alert('Трябва да влезеш в профила си!');
        return;
    }
    
    if (!confirm('Сигурен ли си, че искаш да изтриеш този маршрут от любимите?')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('favorite_id', favoriteId);
    
    fetch('php/api.php?action=delete_favorite', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('HTTP Status:', response.status);
        return response.text();
    })
    .then(text => {
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Server returned invalid JSON:\n" + text);
            return;
        }

        if (data.success) {
            console.log('Любим маршрут изтрит');
            loadFavorites();
        } else {
            alert('Грешка: ' + (data.error || 'Неизвестна грешка'));
        }
    })
    .catch(error => {
        alert('Възникна грешка при изтриване!');
    });
}

function useFavorite(nodeFrom, nodeTo) {
    /*
        ОБЯСНЕНИЕ:
        Използва любим маршрут - избира точките и търси пътя.
    */
    
    const startSelect = document.getElementById('start-point');
    const endSelect = document.getElementById('end-point');
    
    // Избираме точките в dropdown-ите
    startSelect.value = nodeFrom;
    endSelect.value = nodeTo;
    
    // Търсим пътя
    findPath();
}

function logout() {
    /*
        ОБЯСНЕНИЕ:
        Излизане от профила.
        Изпраща заявка към auth.php и презарежда страницата.
    */
    
    fetch('php/auth.php?action=logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = null;
                // Презареждаме страницата за да се обновят всички елементи
                window.location.reload();
            } else {
                alert('Грешка при излизане!');
            }
        })
        .catch(error => {
            console.error("Грешка при logout:", error);
            // При грешка все пак презареждаме
            window.location.reload();
        });
}

function escapeHtml(text) {
    /*
        ОБЯСНЕНИЕ:
        Помощна функция за escape на HTML специални символи.
        Предпазва от XSS атаки.
    */
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log("app.js зареден успешно!");

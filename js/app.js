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
            "building": "ФМИ"
        },

        "FMI325": {
            "id": "FMI325",
            "name": "ФМИ - Зала 325 (Аудиториум)",
            "lat": 42.67430456688142,
            "lng": 23.330292077993278,
            "floor": 3,
            "building": "ФМИ"
        },

        "FMI314": {
            "id": "FMI314",
            "name": "ФМИ - Зала 314 (Компютърна зала)",
            "lat": 42.674288790798414,
            "lng": 23.330398025242594,
            "floor": 3,
            "building": "ФМИ"
        },

        "FMI100": {
            "id": "FMI100",
            "name": "ФМИ - Стая 100 (Бордови Игри)",
            "lat": 42.67453529163051,
            "lng": 23.330855341851827,
            "floor": 1,
            "building": "ФМИ"
        },

        "FMI01": {
            "id": "FMI01",
            "name": "ФМИ - Зала 01 (Лекционна зала)",
            "lat": 42.67433513302949,
            "lng": 23.33073866576677,
            "floor": -1,
            "building": "ФМИ"
        },

        "FRIZER": {
            "id": "FRIZER",
            "name": "ФЗФ - Фризер (Аудиториум)",
            "lat": 42.673611401459986,
            "lng": 23.329913886506514,
            "floor": 3,
            "building": "Корпус А"
        },

        "FZFSTOL": {
            "id": "FZFSTOL",
            "name": "ФЗФ - Столова",
            "lat": 42.67363506583987,
            "lng": 23.328792723156628,
            "floor": 1,
            "building": "ФЗФ - Столова"
        },

        "FZF326B": {
            "id": "FZF326B",
            "name": "ФЗФ - Зала 326 (Лекционна зала)",
            "lat": 42.673850016882334,
            "lng": 23.32906362626069,
            "floor": 1,
            "building": "Корпус B"
        },

        "KULATA": {
            "id": "KULATA",
            "name": "ФХФ - КУЛАТА (Място за развлечение)",
            "lat": 42.67462484841399,
            "lng": 23.332607355597276,
            "floor": 8,
            "building": "ФХФ"
        },

        "FHF210": {
            "id": "FHF210",
            "name": "ФХФ - Зала 210 (Аудиториум)",
            "lat": 42.67436059986496,
            "lng": 23.333615866142356,
            "floor": 2,
            "building": "ФХФ"
        },

        "FHF130": {
            "id": "FHF130",
            "name": "ФХФ - Зала 130 (Аудиториум)",
            "lat": 42.67453906635889,
            "lng": 23.333465662446656,
            "floor": 1,
            "building": "ФХФ"
        },

        "FHF610": {
            "id": "FHF610",
            "name": "ФХФ - Зала 610 (Лекционна зала)",
            "lat": 42.67454596836928,
            "lng": 23.332575169086972,
            "floor": 6,
            "building": "ФХФ"
        },
         
        "REKTORAT605": {
            "id": "REKTORAT605",
            "name": "Ректорат - Зала 605 (Лекционна зала)",
            "lat": 42.69309189128681,
            "lng": 23.335447570079072,
            "floor": 6,
            "building": "Корпус А"
        },

        "MAMUT": {
            "id": "MAMUT",
            "name": "Ректорат - Скелет на мамут (Музей)",
            "lat": 42.694211644238806,
            "lng": 23.33495136147671,
            "floor": 6,
            "building": "Музей по палеонтология и исторична геология"
        },

        "LIB": {
            "id": "LIB",
            "name": "Ректорат - Библиотека",
            "lat": 42.693596571168605,
            "lng": 23.335761388513756,
            "floor": 1,
            "building": "Корпус Б"
        },
        
        "CAFE": {
            "id": "CAFE",
            "name": "Ректорат - Столова",
            "lat": 42.6935,
            "lng": 23.3330,
            "floor": 0,
            "building": "Централна"
        }
    },
    "edges": []
};


const nodeIds = Object.keys(sampleCampusData.nodes);
const newEdges = [];

for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
        const nodeA = sampleCampusData.nodes[nodeIds[i]];
        const nodeB = sampleCampusData.nodes[nodeIds[j]];

        // Calculation: Euclidean distance between coordinates
        // You can also use Haversine formula for real-world meters
        const dist = Math.sqrt(
            Math.pow(nodeA.lat - nodeB.lat, 2) + 
            Math.pow(nodeA.lng - nodeB.lng, 2)
        );

        newEdges.push({
            from: nodeIds[i],
            to: nodeIds[j],
            weight: parseFloat(dist.toFixed(6)) // Distance as the weight
        });
    }
}

// Update the object
sampleCampusData.edges = newEdges;

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
        campusGraph.addNode(id, node.name, node.lat, node.lng, node.floor, node.building);
        
        // Добавяме маркер на картата за всеки възел
        const popupContent = `
            <strong>${node.name}</strong><br>
            Етаж: ${node.floor}<br>
            Сграда: ${node.building}
        `;
        campusMap.addMarker(id, node.lat, node.lng, popupContent, 'blue');
    }
    
    // Добавяме връзките
    for (let edge of sampleCampusData.edges) {
        campusGraph.addEdge(edge.from, edge.to, edge.weight);
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
    /*
        ОБЯСНЕНИЕ:
        Event listeners "слушат" за действия на потребителя
        и изпълняват функции когато се случат.
    */
    
    // Бутон "Намери път"
    document.getElementById('find-path-btn').addEventListener('click', findPath);
    
    // Бутони за експорт
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    
    // Бутон за импорт
    document.getElementById('import-btn').addEventListener('click', importData);
    
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
        return [node.lat, node.lng];
    });
    
    // Рисуваме пътя
    campusMap.drawPath(points, '#e74c3c');
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

console.log("app.js зареден успешно!");

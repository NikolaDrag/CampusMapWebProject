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
    nodes: {
        "101": {
            name: "Зала 101 - Лекционна",
            lat: 42.6940,
            lng: 23.3340,
            floor: 1,
            building: "Корпус А"
        },
        "102": {
            name: "Зала 102 - Компютърна",
            lat: 42.6938,
            lng: 23.3355,
            floor: 1,
            building: "Корпус А"
        },
        "201": {
            name: "Зала 201 - Семинарна",
            lat: 42.6930,
            lng: 23.3345,
            floor: 2,
            building: "Корпус А"
        },
        "LIB": {
            name: "Библиотека",
            lat: 42.6925,
            lng: 23.3360,
            floor: 1,
            building: "Корпус Б"
        },
        "CAFE": {
            name: "Кафене/Стол",
            lat: 42.6935,
            lng: 23.3330,
            floor: 0,
            building: "Централно"
        }
    },
    
    // Връзки (пътища между зали с разстояние в минути)
    edges: [
        { from: "101", to: "102", weight: 3 },   // 101 <-> 102: 3 минути
        { from: "101", to: "201", weight: 2 },   // 101 <-> 201: 2 минути (стълби)
        { from: "101", to: "CAFE", weight: 4 },  // 101 <-> Кафене: 4 минути
        { from: "102", to: "LIB", weight: 5 },   // 102 <-> Библиотека: 5 минути
        { from: "201", to: "LIB", weight: 4 },   // 201 <-> Библиотека: 4 минути
        { from: "LIB", to: "CAFE", weight: 6 },  // Библиотека <-> Кафене: 6 минути
        { from: "102", to: "201", weight: 3 }    // 102 <-> 201: 3 минути
    ]
};

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

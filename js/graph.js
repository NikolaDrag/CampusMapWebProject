/*
    ОБЯСНЕНИЕ: graph.js
    
    Този файл съдържа логиката за графа.
    
    КАКВО Е ГРАФ?
    - Граф е структура от ВЪЗЛИ (nodes) и ВРЪЗКИ (edges)
    - Възел = зала/стая в кампуса
    - Връзка = път между две зали с разстояние (в минути)
    
    ПРИМЕР:
    
        Зала 101 ----5мин---- Зала 102
           |                     |
         3мин                  4мин
           |                     |
        Зала 103 ----2мин---- Зала 104
    
    В код това се записва като:
    {
        "101": { "102": 5, "103": 3 },
        "102": { "101": 5, "104": 4 },
        "103": { "101": 3, "104": 2 },
        "104": { "102": 4, "103": 2 }
    }
*/

// ========== КЛАС ЗА ГРАФА ==========

class CampusGraph {
    
    // КОНСТРУКТОР: Създава празен граф
    constructor() {
        /*
            ОБЯСНЕНИЕ:
            - this.nodes = обект с информация за всеки възел (зала)
            - this.edges = списък на всички връзки
            - this.adjacencyList = "съседски списък" - за всеки възел,
              кои други възли са свързани с него и на какво разстояние
        */
        this.nodes = {};        // { "101": { name: "Зала 101", ... }, ... }
        this.edges = [];        // [{ from: "101", to: "102", weight: 5 }, ...]
        this.adjacencyList = {}; // { "101": { "102": 5, "103": 3 }, ... }
    }

    // ========== МЕТОДИ ЗА ДОБАВЯНЕ ==========

    /*
        ДОБАВЯНЕ НА ВЪЗЕЛ (зала)
        
        Параметри:
        - id: уникален идентификатор (например "101")
        - name: име на залата (например "Зала 101 - Лекционна")
        - lat: географска ширина (за картата)
        - lng: географска дължина (за картата)
        - floor: етаж (по желание)
        - building: сграда (по желание)
    */
    addNode(id, name, lat, lng, floor = 1, building = "Главна",hidden=false) {
        // Записваме информацията за възела
        this.nodes[id] = {
            id: id,
            name: name,
            lat: lat,
            lng: lng,
            floor: floor,
            building: building,
            hidden: hidden
        };
        
        // Създаваме празен списък за съседите
        if (!this.adjacencyList[id]) {
            this.adjacencyList[id] = {};
        }
        
        console.log(`Добавен възел: ${name}`);
    }

    /*
        ДОБАВЯНЕ НА ВРЪЗКА (път между две зали)
        
        Параметри:
        - from: начален възел (id)
        - to: краен възел (id)
        - weight: тежест/разстояние в минути
        - bidirectional: дали пътят е двупосочен (default: true)
    */
    addEdge(from, to, weight, bidirectional = true) {
        // Проверка дали възлите съществуват
        
        console.log(this.nodes);
        console.log(from, to);
        if (!this.nodes[from] || !this.nodes[to]) {
            console.error(`Грешка: Възел ${from} или ${to} не съществува!`);
            return;
        }

        // Добавяме връзката
        this.edges.push({ from, to, weight });
        this.adjacencyList[from][to] = weight;

        // Ако е двупосочен, добавяме и обратната връзка
        if (bidirectional) {
            this.adjacencyList[to][from] = weight;
        }

        console.log(`Добавена връзка: ${from} <-> ${to} (${weight} мин)`);
    }

    // ========== АЛГОРИТЪМ НА DIJKSTRA ==========

    /*
        ОБЯСНЕНИЕ НА DIJKSTRA:
        
        Dijkstra намира НАЙ-КРАТКИЯ път от една точка до всички останали.
        
        Как работи (опростено):
        1. Започваме от началната точка с разстояние 0
        2. За всички останали точки - разстоянието е "безкрайност"
        3. Посещаваме точката с най-малко разстояние
        4. За всеки съсед проверяваме: "По-кратко ли е през мен?"
        5. Ако да - обновяваме разстоянието
        6. Повтаряме докато посетим всички точки
    */
    dijkstra(startId, endId) {
        // СТЪПКА 1: Инициализация
        const distances = {};    // Разстояния от start до всеки възел
        const previous = {};     // Предишен възел в пътя (за реконструкция)
        const visited = {};      // Кои възли сме посетили
        const queue = [];        // Опашка с възли за обработка

        // Задаваме начални стойности
        for (let nodeId in this.nodes) {
            distances[nodeId] = Infinity;  // Безкрайност
            previous[nodeId] = null;
        }
        distances[startId] = 0;  // Разстоянието до себе си е 0

        // Добавяме началния възел в опашката
        queue.push({ id: startId, distance: 0 });

        // СТЪПКА 2: Основен цикъл
        while (queue.length > 0) {
            // Сортираме опашката и вземаме възела с най-малко разстояние
            queue.sort((a, b) => a.distance - b.distance);
            const current = queue.shift();  // Взима първия елемент

            // Ако вече сме посетили този възел - пропускаме
            if (visited[current.id]) continue;
            visited[current.id] = true;

            // Ако сме стигнали до целта - спираме
            if (current.id === endId) break;

            // СТЪПКА 3: Проверяваме всички съседи
            const neighbors = this.adjacencyList[current.id];
            for (let neighborId in neighbors) {
                if (visited[neighborId]) continue;

                // Изчисляваме новото разстояние
                const newDistance = distances[current.id] + neighbors[neighborId];

                // Ако новото разстояние е по-кратко - обновяваме
                if (newDistance < distances[neighborId]) {
                    distances[neighborId] = newDistance;
                    previous[neighborId] = current.id;
                    queue.push({ id: neighborId, distance: newDistance });
                }
            }
        }

        // СТЪПКА 4: Реконструиране на пътя
        const path = [];
        let currentNode = endId;

        while (currentNode !== null) {
            path.unshift(currentNode);  // Добавяме в началото
            currentNode = previous[currentNode];
        }

        // Проверка дали има път
        if (path[0] !== startId) {
            return {
                path: [],
                distance: Infinity,
                message: "Няма път между тези точки!"
            };
        }

        return {
            path: path,
            distance: distances[endId],
            message: `Най-кратък път: ${distances[endId]} минути`
        };
    }

    // ========== ПОМОЩНИ МЕТОДИ ==========

    // Връща списък с всички възли (за dropdown менюто)
    getAllNodes() {
        return Object.values(this.nodes);
    }

    // Връща информация за възел по id
    getNode(id) {
        return this.nodes[id] || null;
    }

    // Експорт на данните като JSON
    toJSON() {
        return {
            nodes: this.nodes,
            edges: this.edges
        };
    }

    // Импорт на данни от JSON
    fromJSON(data) {
        // Изчистваме текущите данни
        this.nodes = {};
        this.edges = [];
        this.adjacencyList = {};

        // Добавяме възлите
        for (let id in data.nodes) {
            const node = data.nodes[id];
            this.addNode(id, node.name, node.lat, node.lng, node.floor, node.building);
        }

        // Добавяме връзките
        for (let edge of data.edges) {
            this.addEdge(edge.source, edge.target, edge.distance, false);
        }

        console.log("Данните са импортирани успешно!");
    }
}

// Създаваме глобална инстанция на графа
const campusGraph = new CampusGraph();

console.log("graph.js заредин успешно!");

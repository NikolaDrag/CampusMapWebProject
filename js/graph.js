class CampusGraph {
    
    constructor() {
        this.nodes = {};
        this.edges = [];
        this.adjacencyList = {};
    }

    addNode(id, name, lat, lng, floor = 1, building = "Главна", hidden = false) {
        this.nodes[id] = {
            id: id,
            name: name,
            lat: lat,
            lng: lng,
            floor: floor,
            building: building,
            hidden: hidden
        };
        
        if (!this.adjacencyList[id]) {
            this.adjacencyList[id] = {};
        }
    }

    addEdge(from, to, weight, bidirectional = true) {
        if (!this.nodes[from] || !this.nodes[to]) {
            console.error(`Грешка: Възел ${from} или ${to} не съществува!`);
            return;
        }

        this.edges.push({ from, to, weight });
        this.adjacencyList[from][to] = weight;

        if (bidirectional) {
            this.adjacencyList[to][from] = weight;
        }
    }

    dijkstra(startId, endId) {
        const distances = {};
        const previous = {};
        const visited = {};
        const queue = [];

        for (let nodeId in this.nodes) {
            distances[nodeId] = Infinity;
            previous[nodeId] = null;
        }
        distances[startId] = 0;

        queue.push({ id: startId, distance: 0 });

        while (queue.length > 0) {
            queue.sort((a, b) => a.distance - b.distance);
            const current = queue.shift();

            if (visited[current.id]) continue;
            visited[current.id] = true;

            if (current.id === endId) break;

            const neighbors = this.adjacencyList[current.id];
            for (let neighborId in neighbors) {
                if (visited[neighborId]) continue;

                const newDistance = distances[current.id] + neighbors[neighborId];

                if (newDistance < distances[neighborId]) {
                    distances[neighborId] = newDistance;
                    previous[neighborId] = current.id;
                    queue.push({ id: neighborId, distance: newDistance });
                }
            }
        }

        const path = [];
        let currentNode = endId;

        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = previous[currentNode];
        }

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

    getAllNodes() {
        return Object.values(this.nodes);
    }

    getNode(id) {
        return this.nodes[id] || null;
    }

    toJSON() {
        return {
            nodes: this.nodes,
            edges: this.edges
        };
    }

    fromJSON(data) {
        this.nodes = {};
        this.edges = [];
        this.adjacencyList = {};

        for (let id in data.nodes) {
            const node = data.nodes[id];
            this.addNode(id, node.name, node.lat, node.lng, node.floor, node.building);
        }

        for (let edge of data.edges) {
            this.addEdge(edge.source, edge.target, edge.distance, false);
        }
    }
}

const campusGraph = new CampusGraph();

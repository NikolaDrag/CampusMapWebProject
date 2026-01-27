class CampusGraph {

    constructor() {
        this.nodes = {};
        this.edges = [];
        this.adjacencyList = {};
    }

    addNode(id, name, lat, lng, building_name = null, building_part = null, floor = 1, hidden = false,
        is_connection = false, connection_from = null, connection_to = null) {
        this.nodes[id] = {
            id: id,
            name: name,
            lat: lat,
            lng: lng,
            floor: floor,
            building_name: building_name,
            building_part: building_part,
            hidden: hidden,
            is_connection: is_connection,
            connection_from: connection_from,
            connection_to: connection_to
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

    // speed - speed in km/h
    dijkstra(startId, endId, speed = 4, typeOfTransport = "walk") {
        const distances = {};
        const previous = {};
        const visited = {};
        const queue = [];


        if (typeOfTransport=="walk") {        

            for (let i = 25; i <= 27; i++) {
                delete this.nodes[i]; 
                //this.edges = this.edges.filter(e => e.from !== i && e.to !== i);
            }
        }
           
        //maybe copy nodes wihtout 25-27 and use it instead of modifying original list

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

        // from meters to minutes based on speed
        console.log(distances[endId] / 1000);
        distances[endId] = (distances[endId] * 60) / (1000 * speed);


    //  switch (typeOfTransport) {
    //     case "bus": distances[endId]+= 20;  break;     
    //     case "tram": distances[endId]+= 25;   break;        
    //     default:
    //         break;
    //  }
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

// intentionallly outside the class
function loadGraphEdges() {
    nodes = campusGraph.nodes;

    // can be implemented faster but for the current number of building thats enough
    for (let id_a in nodes) {
        let node_a = nodes[id_a];
        for (let id_b in nodes) {
            let node_b = nodes[id_b];

            if (id_a === id_b ||
                (node_a.building_name !== node_b.building_name && !node_a.is_connection)) {
                continue;
            }

            if (node_a.is_connection) {
                if (node_a.connection_to === node_b.id) {
                    campusGraph.addEdge(node_a.id, node_b.id, getDistance(node_a, node_b));
                } else if (node_a.connection_from === node_b.id) {
                    campusGraph.addEdge(node_a.id, node_b.id, getDistance(node_a, node_b));
                }
            }

            if (node_a.building_name === node_b.building_name) {
                campusGraph.addEdge(node_a.id, node_b.id, getDistance(node_a, node_b));
            }
        }
    }


    // no idea how to fix this
    // some better way of specifying "special" edges should be implement in the database
    // it's all good if Milen Petrov не разбере🍆
    try {
        campusGraph.addEdge(17, 20, getDistance(nodes[17], nodes[20]));

        //public transport nodes

        //buses
        campusGraph.addEdge(17, 25, getDistance(nodes[17], nodes[25])); //fmi - 94
        campusGraph.addEdge(18, 25, getDistance(nodes[18], nodes[25])); //fzf - 94
        campusGraph.addEdge(19, 25, getDistance(nodes[19], nodes[25])); //fhf - 94

        campusGraph.addEdge(20, 26, getDistance(nodes[20], nodes[26])); //su - 94

        //tram
        campusGraph.addEdge(17, 25, getDistance(nodes[17], nodes[27])); //fmi - 10
        campusGraph.addEdge(18, 25, getDistance(nodes[18], nodes[27])); //fzf - 10
        campusGraph.addEdge(19, 25, getDistance(nodes[19], nodes[27])); //fhf - 10

        campusGraph.addEdge(20, 28, getDistance(nodes[20], nodes[28])); //su - 10




    } catch (error) { }
}

// returns distance in meters
function getDistance(node1, node2) {
    const R = 6371e3;
    const phi1 = node1.lat * Math.PI / 180;
    const phi2 = node2.lat * Math.PI / 180;
    const deltaPhi = (node2.lat - node1.lat) * Math.PI / 180;
    const deltaLambda = (node2.lng - node1.lng) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

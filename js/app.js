const sampleCampusData = {
    center: {
        lat: 42.6933,
        lng: 23.3347,
        zoom: 17
    }
};



let currentUser = null;
let lastRoute = { from: null, to: null };

window.addEventListener("pageshow", () => {
    const select = document.getElementById("transport");
    if (select) {
        select.value = "walk"; // value of the default option
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    initMap();
    await loadCampusData();
    populateDropdowns();
    setupEventListeners();
    checkAuthStatus();
    checkDestinationFromURL();
});

function checkDestinationFromURL() {
    const params = new URLSearchParams(window.location.search);
    const destinationId = params.get('destination');
    
    if (destinationId) {
        const endSelect = document.getElementById('end-point');
        if (endSelect) {
            endSelect.value = destinationId;
            
            // Highlight the destination marker on the map
            const node = campusGraph.getNode(destinationId);
            if (node) {
                campusMap.map.setView([node.lat, node.lng], 18);
                
                // Show a notification to the user
                const resultText = document.getElementById('result-text');
                if (resultText) {
                    resultText.innerHTML = `<strong>Дестинация:</strong> ${node.name}<br>Изберете начална точка и натиснете "Намери път"`;
                }
            }
        }
    }
}

function initMap() {
    const center = sampleCampusData.center;
    campusMap.init(center.lat, center.lng, center.zoom);
}

async function loadCampusData() {
    try {
        const response = await fetch('php/api.php?action=get_nodes_with_building');
        const result = await response.json();

        if (!result.success) {
            console.error('Failed to load nodes');
            return;
        }



        const nodes = result.data;

        for (let node of nodes) {
            campusGraph.addNode(
                node.id,
                node.name,
                node.lat,
                node.lng,
                node.building_name,
                node.building_part,
                node.floor,
                node.hidden,
                node.connection,
                node.connection_from,
                node.connection_to
            );

        }

        //make entrances visible
        for (let i = 17; i < 21; i++) {
            campusGraph.getNode(i).hidden=false;            
        }

        campusGraph.getAllNodes().forEach(node => {
                        if (!node.hidden) {
                     const popupContent = `
                    <strong>${node.name}</strong><br>
                    Етаж: ${node.floor}<br>
                    Сграда: ${node.building_name}<br>
                    <a href="events.html?node_id=${node.id}&node_name=${encodeURIComponent(node.name)}"
                        style="font-weight: bold; text-decoration: none; font-size: 16px; color: #1a73e8;">
                        Виж събитията
                    </a>
                `;
                campusMap.addMarker(node.id, node.lat, node.lng, popupContent, 'blue');
            }
        });

        loadGraphEdges();

    } catch (err) {
        console.error('Error fetching nodes:', err);
    }
}

function populateDropdowns() {
    const startSelect = document.getElementById('start-point');
    const endSelect = document.getElementById('end-point');

    const nodes = campusGraph.getAllNodes();

    const nodesCopy = nodes.filter((_, index) => {
    // Remove indices 17–20 and 25–28 (inclusive)
    return !((index >= 16 && index <= 19) || (index >= 24 && index <= 27));
    });

    nodesCopy.forEach(node => {
        if (node.hidden) return;

        const option1 = document.createElement('option');
        option1.value = node.id;
        option1.textContent = node.name;

        const option2 = document.createElement('option');
        option2.value = node.id;
        option2.textContent = node.name;

        startSelect.appendChild(option1);
        endSelect.appendChild(option2);
    });
}

function setupEventListeners() {
    document.getElementById('find-path-btn').addEventListener('click', findPath);
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    document.getElementById('import-btn').addEventListener('click', importData);

    const addFavoriteBtn = document.getElementById('add-favorite-btn');
    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', addFavorite);
    }
}

async function getNodes(typeOfTransport) {
    let response;

    switch (typeOfTransport) {
        case "bus":
            response = await fetch('php/api.php?action=get_bus_stops');
            break;
        case "tram":
            response = await fetch('php/api.php?action=get_tram_stops');
            break;
        default:
            return []; // unknown type
    }

    const json = await response.json();

    if (!json.success || !Array.isArray(json.data)) {
        console.error("Invalid data from server", json);
        return [];
    }

    // Convert server data to Leaflet LatLng objects
    const nodes = json.data.map(item => L.latLng(
        parseFloat(item.lat),
        parseFloat(item.lng)
    ));

    return nodes;
}

function isInSameCampus(sNode, eNode){

    return !( 
        
          ( !["FMI", "FZF", "FHF"].includes(sNode.building_name) && 
             ["FMI", "FZF", "FHF"].includes(eNode.building_name)     )
        
            ||

          (  ["FMI", "FZF", "FHF"].includes(sNode.building_name) && 
            !["FMI", "FZF", "FHF"].includes(eNode.building_name)      )        
    ) 
}


function showResultLink(url, text = "Виж разписание на спирките") {
    const pEl = document.getElementById('result-link');      // контейнер <p>
    const aEl = document.getElementById('result-link-a');    // самия линк <a>
    
    aEl.href = url;      // задава URL на линка
    aEl.textContent = text;  // текст на линка
    pEl.hidden = false;      // показва линка
}



function findPath() {
    const startId = document.getElementById('start-point').value;
    const endId = document.getElementById('end-point').value;
    const typeOfTransport = document.getElementById('transport').value;
    let result = [], result2 = [];
    let sNode = campusGraph.getNode(startId); //string to int?
    let eNode = campusGraph.getNode(endId);


    if (!startId || !endId) {
        alert('Моля, избери начална и крайна точка!');
        return;
    }

    if (startId === endId) {
        alert('Началната и крайната точка са еднакви!');
        return;
    }



    if (typeOfTransport != "walk" && isInSameCampus(sNode,eNode)) {
        
        result = campusGraph.dijkstra(startId, endId, 4, "walk"); 
        document.getElementById('transport').value = 'walk';
        alert('Няма как да ползваш превозно средство в един и същи кампус!');

    }
    else{

        switch (typeOfTransport) {
    
            case "bus":
                          result = campusGraph.dijkstra(startId, "25", 4, typeOfTransport);
                          result2 = campusGraph.dijkstra("26", endId, 4, typeOfTransport);
                          result.distance+=15;
                          showResultLink("https://moovitapp.com/tripplan/sofia_%D1%81%D0%BE%D1%84%D0%B8%D1%8F-3501/lines/94/712644/3049866/bg?ref=2&poiType=line&sid=11082717&customerId=4908&af_sub8=%2Findex%2Fbg%2F%25D0%25B3%25D1%2580%25D0%25B0%25D0%25B4%25D1%2581%25D0%25BA%25D0%25B8_%25D1%2582%25D1%2580%25D0%25B0%25D0%25BD%25D1%2581%25D0%25BF%25D0%25BE%25D1%2580%25D1%2582-line-94-Sofia_%25D0%25A1%25D0%25BE%25D1%2584%25D0%25B8%25D1%258F-3501-857201-712644-0&af_sub9=Upcoming%20arrivals")
                          break;
    
            case "tram":  
                          result = campusGraph.dijkstra(startId, "27", 4, typeOfTransport); 
                          result2 = campusGraph.dijkstra("28", endId, 4, typeOfTransport);
                          result.distance+=15;
                          showResultLink("https://moovitapp.com/index/bg/%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B8_%D1%82%D1%80%D0%B0%D0%BD%D1%81%D0%BF%D0%BE%D1%80%D1%82-line-10-Sofia_%D0%A1%D0%BE%D1%84%D0%B8%D1%8F-3501-856936-715153-0")
                          break;

    
            case "walk": 
                          result = campusGraph.dijkstra(startId, endId, 4, typeOfTransport);
                          document.getElementById('result-link').hidden = true;
                          break;
    
            case "car": 
                         result = campusGraph.dijkstra(startId, endId, 30, typeOfTransport); 
                         document.getElementById('result-link').hidden = true;
                         break;
    
            default:  break;
        }
    }

   

  

    // campusMap.clearPath();
    // if (result && result.path && result.path.length > 0) {
    //     drawPathOnMap(result.path);
    // }

    // if (typeOfTransport !== "walk") {
    //     drawPathOnMap_transport(typeOfTransport); // if async
    //      // check result2 safely
    //     if (result2 && result2.path && result2.path.length > 0) {
    //         drawPathOnMap(result2.path);
    //     }
    // }

   
 
   
    const totalDistance = result.distance + (result2?.distance || 0);
    let res = {
                path: result.path.concat(result2?.path || []),
                distance: result.distance, //time
                message: `Най-кратък път: ${result.distance} минути`
            };


    if (res && res.path && res.path.length > 0) {
        drawPathOnMap(res.path.map(Number));
    }     
    displayResult(res);

    
}

function displayResult(result) {
    const resultText = document.getElementById('result-text');
    const resultDistance = document.getElementById('result-distance');

    if (result.path.length === 0) {
        resultText.textContent = result.message;
        resultDistance.textContent = '';
        return;
    }

    const pathNames = result.path.map(id => {
        const node = campusGraph.getNode(id);
        return node ? node.name : id;
    });

    resultText.innerHTML = `
        <strong>Маршрут:</strong><br>
        ${pathNames.join(' → ')}
    `;

    resultDistance.textContent = `⏱️ Време: ${Math.round(result.distance)} минути`;
}

function drawPathOnMap(path) {
    const points = path.map(id => {
        const node = campusGraph.getNode(id);
        // TODO: add boolean indicator to nodes whether they are exit points, and pass it here
        return [node.lat, node.lng, node.id];
    });

    campusMap.drawFullRoute(points, '#e74c3c');
}

async function drawPathOnMap_transport(typeOfTransport) {
    try {
        const nodes = await getNodes(typeOfTransport);

        if (nodes.length === 0) {
            console.warn("No nodes to draw for", typeOfTransport);
            return;
        }

        // Pass the array directly to your map drawing function
        campusMap.drawFullRoute(nodes, '#e6a519');

    } catch (err) {
        console.error("Error drawing path on map:", err);
    }
}


function exportJSON() {
    const data = campusGraph.toJSON();
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, 'campus_data.json', 'application/json');
}

function exportCSV() {
    let csv = "id,name,lat,lng,floor,building\n";

    const nodes = campusGraph.getAllNodes();
    nodes.forEach(node => {
        csv += `${node.id},"${node.name}",${node.lat},${node.lng},${node.floor},"${node.building}"\n`;
    });

    downloadFile(csv, 'campus_nodes.csv', 'text/csv');

    let edgesCsv = "from,to,weight\n";
    campusGraph.edges.forEach(edge => {
        edgesCsv += `${edge.from},${edge.to},${edge.weight}\n`;
    });

    downloadFile(edgesCsv, 'campus_edges.csv', 'text/csv');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Моля, избери файл за импорт!');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            campusMap.clearMarkers();
            campusMap.clearPath();
            campusGraph.fromJSON(data);

            const nodes = campusGraph.getAllNodes();
            nodes.forEach(node => {
                const popupContent = `
                    <strong>${node.name}</strong><br>
                    Етаж: ${node.floor}<br>
                    Сграда: ${node.building}
                `;
                campusMap.addMarker(node.id, node.lat, node.lng, popupContent);
            });

            const startSelect = document.getElementById('start-point');
            const endSelect = document.getElementById('end-point');

            startSelect.innerHTML = '<option value="">-- Избери зала --</option>';
            endSelect.innerHTML = '<option value="">-- Избери зала --</option>';

            populateDropdowns();

            alert('Данните са импортирани успешно!');

        } catch (error) {
            alert('Грешка при четене на файла: ' + error.message);
            console.error(error);
        }
    };

    reader.readAsText(file);
}

function checkAuthStatus() {
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
                currentUser = data.user;

                if (authLinks) authLinks.style.display = 'none';
                if (userInfo) userInfo.style.display = 'flex';
                if (usernameSpan) usernameSpan.textContent = currentUser.username;
                if (favoritesSection) favoritesSection.style.display = 'block';
                if (addFavoriteBtn) addFavoriteBtn.style.display = 'block';

                loadFavorites();

                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            } else {
                currentUser = null;

                if (authLinks) authLinks.style.display = 'block';
                if (userInfo) userInfo.style.display = 'none';
                if (favoritesSection) favoritesSection.style.display = 'none';
                if (addFavoriteBtn) addFavoriteBtn.style.display = 'none';
            }
        })
        .catch(error => {
            console.error("Грешка при проверка на автентикация:", error);
        });
}

function loadFavorites() {
    if (!currentUser) return;

    fetch('php/api.php?action=get_favorites')
        .then(response => response.json())
        .then(data => {
            const favoritesList = document.getElementById('favorites-list');

            if (!favoritesList) return;

            favoritesList.innerHTML = '';

            if (data.success && data.favorites && data.favorites.length > 0) {
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
            } else {
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
        .then(response => response.text())
        .then(text => {
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Server returned invalid JSON:\n" + text);
                return;
            }

            if (data.success) {
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
        .then(response => response.text())
        .then(text => {
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Server returned invalid JSON:\n" + text);
                return;
            }

            if (data.success) {
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
    const startSelect = document.getElementById('start-point');
    const endSelect = document.getElementById('end-point');

    startSelect.value = nodeFrom;
    endSelect.value = nodeTo;

    findPath();
}

function logout() {
    fetch('php/auth.php?action=logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = null;
                window.location.reload();
            } else {
                alert('Грешка при излизане!');
            }
        })
        .catch(error => {
            console.error("Грешка при logout:", error);
            window.location.reload();
        });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

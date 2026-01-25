<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        
        case 'check_auth':
            require_once 'auth.php';
            
            if (isLoggedIn()) {
                echo json_encode([
                    'logged_in' => true,
                    'user' => getCurrentUser()
                ]);
            } else {
                echo json_encode([
                    'logged_in' => false,
                    'user' => null
                ]);
            }
            break;
        
        case 'get_nodes':
            $nodes = dbSelect("SELECT * FROM nodes ORDER BY name");
            echo json_encode(['success' => true, 'data' => $nodes]);
            break;

        case 'get_nodes_with_building':
            $nodes = dbSelect("SELECT nodes.*, buildings.name as building_name, buildings.building_part as building_part
                                FROM nodes JOIN buildings 
                                ON nodes.building_id = buildings.id ORDER BY nodes.name");
            echo json_encode(['success' => true, 'data' => $nodes]);
            break;
            
        case 'get_node':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            $node = dbSelectOne("SELECT * FROM nodes WHERE id = ?", [$id]);
            if ($node) {
                echo json_encode(['success' => true, 'data' => $node]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Залата не е намерена']);
            }
            break;
            
        case 'add_node':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            $lat = isset($_POST['lat']) ? floatval($_POST['lat']) : 0;
            $lng = isset($_POST['lng']) ? floatval($_POST['lng']) : 0;
            $floor = isset($_POST['floor']) ? intval($_POST['floor']) : 1;
            $building = isset($_POST['building']) ? trim($_POST['building']) : '';
            
            if (empty($name) || $lat == 0 || $lng == 0) {
                throw new Exception('Моля попълнете всички задължителни полета');
            }
            
            $sql = "INSERT INTO nodes (name, lat, lng, floor, building) VALUES (?, ?, ?, ?, ?)";
            $id = dbInsert($sql, [$name, $lat, $lng, $floor, $building]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Залата е добавена']);
            break;
            
        case 'update_node':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            $lat = isset($_POST['lat']) ? floatval($_POST['lat']) : 0;
            $lng = isset($_POST['lng']) ? floatval($_POST['lng']) : 0;
            $floor = isset($_POST['floor']) ? intval($_POST['floor']) : 1;
            $building = isset($_POST['building']) ? trim($_POST['building']) : '';
            
            if ($id <= 0 || empty($name)) {
                throw new Exception('Невалидни данни');
            }
            
            $sql = "UPDATE nodes SET name = ?, lat = ?, lng = ?, floor = ?, building = ? WHERE id = ?";
            $affected = dbUpdate($sql, [$name, $lat, $lng, $floor, $building, $id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Залата е обновена']);
            break;
            
        case 'delete_node':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
            
            if ($id <= 0) {
                throw new Exception('Невалидно ID');
            }
            
            dbDelete("DELETE FROM edges WHERE node_from = ? OR node_to = ?", [$id, $id]);
            
            $sql = "DELETE FROM nodes WHERE id = ?";
            $affected = dbDelete($sql, [$id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Залата е изтрита']);
            break;
        
        case 'get_events':
            $nodeId = $_GET['node_id'] ?? null;

            if ($nodeId) {
                $events = dbSelect(
                    "SELECT * FROM events WHERE node_id = ? ORDER BY start_time",
                    [$nodeId]
                );
            } else {
                $events = dbSelect("SELECT * FROM events ORDER BY start_time");
            }

            echo json_encode(['success' => true, 'data' => $events]);
            break;

        case 'add_event':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }

            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            $node_id = isset($_POST['node_id']) ? intval($_POST['node_id']) : 0;
            $start_time = isset($_POST['start_time']) ? trim($_POST['start_time']) : '';
            $end_time = isset($_POST['end_time']) ? trim($_POST['end_time']) : '';

            if (empty($name) || $node_id == 0 || empty($start_time) || empty($end_time)) {
                throw new Exception('Моля попълнете всички задължителни полета');
            }

            $sql = "INSERT INTO events (name, node_id, start_time, end_time)
                    VALUES (?, ?, ?, ?)";

            $id = dbInsert($sql, [$name, $node_id, $start_time, $end_time]);

            echo json_encode([
                'success' => true,
                'id' => $id,
                'message' => 'Събитието е добавено'
            ]);
            break;

        case 'get_event_interests':
            $eventId = $_GET['event_id'] ?? null;

            if ($eventId) {
                require_once 'auth.php';
                $currentUserId = $_SESSION['user_id'] ?? null;
                
                $events = dbSelect(
                    "SELECT event_interests.*, users.username, event_interests.user_id 
                    FROM event_interests JOIN users 
                    ON event_interests.user_id = users.id WHERE event_id = ?",
                    [$eventId]
                );
                
                foreach ($events as &$event) {
                    $event['is_current_user'] = ($currentUserId && $event['user_id'] == $currentUserId);
                }
                unset($event);
                
                echo json_encode(['success' => true, 'data' => $events]);
            } else {
                throw new Exception('Не е избрано събитие');
            }
            break;

        case 'add_event_interest':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }

            require_once 'auth.php';
            
            if (!isLoggedIn()) {
                throw new Exception('Трябва да сте влезли в системата');
            }

            $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
            $user_id = $_SESSION['user_id'];
            
            if ($event_id == 0) {
                throw new Exception('Не е зададено коректно събитие');
            }

            $existing = dbSelectOne(
                "SELECT id FROM event_interests WHERE event_id = ? AND user_id = ?",
                [$event_id, $user_id]
            );
            
            if ($existing) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Вече сте заинтересован'
                ]);
                break;
            }

            $sql = "INSERT INTO event_interests (event_id, user_id)
                    VALUES (?, ?)";

            $id = dbInsert($sql, [$event_id, $user_id]);

            echo json_encode([
                'success' => true,
                'id' => $id,
                'message' => 'Вече сте заинтересован'
            ]);
            break;

        case 'delete_event_interest':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
            $user_id = $_SESSION['user_id'];
            if ($event_id == 0) {
                throw new Exception('Не е задаено коректно събитие');
            }

            $sql = "DELETE FROM event_interests WHERE event_id = ? AND user_id = ?";

            $affected = dbDelete($sql, [$event_id, $user_id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Интересът е изтрита']);
            break;

        case 'get_nodes_with_building':
            $nodes = dbSelect("SELECT nodes.*, buildings.name as building_name, buildings.building_part as building_part
                                FROM nodes JOIN buildings 
                                ON nodes.building_id = buildings.id ORDER BY nodes.name");
            echo json_encode(['success' => true, 'data' => $nodes]);
            break;
        case 'get_edges':
            $edges = dbSelect("
                SELECT e.*, 
                       n1.name as from_name, 
                       n2.name as to_name 
                FROM edges e
                JOIN nodes n1 ON e.node_from = n1.id
                JOIN nodes n2 ON e.node_to = n2.id
                ORDER BY e.id
            ");
            echo json_encode(['success' => true, 'data' => $edges]);
            break;
            
        case 'add_edge':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $node_from = isset($_POST['node_from']) ? intval($_POST['node_from']) : 0;
            $node_to = isset($_POST['node_to']) ? intval($_POST['node_to']) : 0;
            $weight = isset($_POST['weight']) ? intval($_POST['weight']) : 1;
            
            if ($node_from <= 0 || $node_to <= 0 || $node_from == $node_to) {
                throw new Exception('Невалидни данни за връзка');
            }
            
            $sql = "INSERT INTO edges (node_from, node_to, weight) VALUES (?, ?, ?)";
            $id = dbInsert($sql, [$node_from, $node_to, $weight]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Връзката е добавена']);
            break;
            
        case 'delete_edge':
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
            
            if ($id <= 0) {
                throw new Exception('Невалидно ID');
            }
            
            $sql = "DELETE FROM edges WHERE id = ?";
            $affected = dbDelete($sql, [$id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Връзката е изтрита']);
            break;
        
        case 'export':
            $nodes = dbSelect("SELECT * FROM nodes");
            $edges = dbSelect("SELECT * FROM edges");
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'nodes' => $nodes,
                    'edges' => $edges
                ]
            ]);
            break;
        
        case 'get_favorites':
            require_once 'auth.php';
            
            if (!isLoggedIn()) {
                throw new Exception('Трябва да сте влезли в системата');
            }
            
            $user_id = $_SESSION['user_id'];
            
            $favorites = dbSelect("
                SELECT f.id, f.name, 
                       f.node_from, f.node_to,
                       f.created_at
                FROM favorites f
                WHERE f.user_id = ?
                ORDER BY f.created_at DESC
            ", [$user_id]);
            
            echo json_encode(['success' => true, 'favorites' => $favorites]);
            break;
            
        case 'add_favorite':
            require_once 'auth.php';
            
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            if (!isLoggedIn()) {
                throw new Exception('Трябва да сте влезли в системата');
            }
            
            $user_id = $_SESSION['user_id'];
            $node_from = isset($_POST['node_from']) ? trim($_POST['node_from']) : '';
            $node_to = isset($_POST['node_to']) ? trim($_POST['node_to']) : '';
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            
            if (empty($node_from) || empty($node_to)) {
                throw new Exception('Невалидни данни за маршрут');
            }
            
            $existing = dbSelectOne(
                "SELECT id FROM favorites WHERE user_id = ? AND node_from = ? AND node_to = ?",
                [$user_id, $node_from, $node_to]
            );
            
            if ($existing) {
                throw new Exception('Този маршрут вече е в любими');
            }
            
            $sql = "INSERT INTO favorites (user_id, node_from, node_to, name) VALUES (?, ?, ?, ?)";
            $id = dbInsert($sql, [$user_id, $node_from, $node_to, $name]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Маршрутът е добавен в любими']);
            break;
            
        case 'delete_favorite':
            require_once 'auth.php';
            
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            if (!isLoggedIn()) {
                throw new Exception('Трябва да сте влезли в системата');
            }
            
            $user_id = $_SESSION['user_id'];
            $id = isset($_POST['favorite_id']) ? intval($_POST['favorite_id']) : 0;
            
            if ($id <= 0) {
                throw new Exception('Невалидно ID');
            }
            
            $sql = "DELETE FROM favorites WHERE id = ? AND user_id = ?";
            $affected = dbDelete($sql, [$id, $user_id]);
            
            if ($affected > 0) {
                echo json_encode(['success' => true, 'message' => 'Маршрутът е премахнат от любими']);
            } else {
                throw new Exception('Маршрутът не е намерен или нямате права да го изтриете');
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Непозната команда']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

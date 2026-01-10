<?php
/**
 * api.php - REST API за работа със зали и връзки
 * 
 * Този файл обработва AJAX заявки от JavaScript.
 * Поддържа GET, POST, PUT, DELETE методи.
 */

// Стартираме сесията (важно за проверка на автентикация)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';

// Задаваме JSON header
header('Content-Type: application/json; charset=utf-8');

// Вземаме HTTP метода и действието
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Обработваме заявката според метода и действието
try {
    switch ($action) {
        
        // ==================== ЗАЛИ (NODES) ====================
        
        case 'get_nodes':
            // SELECT - Вземане на всички зали
            $nodes = dbSelect("SELECT * FROM nodes ORDER BY name");
            echo json_encode(['success' => true, 'data' => $nodes]);
            break;
            
        case 'get_node':
            // SELECT - Вземане на една зала по ID
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            $node = dbSelectOne("SELECT * FROM nodes WHERE id = ?", [$id]);
            if ($node) {
                echo json_encode(['success' => true, 'data' => $node]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Залата не е намерена']);
            }
            break;
            
        case 'add_node':
            // INSERT - Добавяне на нова зала
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            // Вземаме данните от POST
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            $lat = isset($_POST['lat']) ? floatval($_POST['lat']) : 0;
            $lng = isset($_POST['lng']) ? floatval($_POST['lng']) : 0;
            $floor = isset($_POST['floor']) ? intval($_POST['floor']) : 1;
            $building = isset($_POST['building']) ? trim($_POST['building']) : '';
            
            // Валидация
            if (empty($name) || $lat == 0 || $lng == 0) {
                throw new Exception('Моля попълнете всички задължителни полета');
            }
            
            // INSERT заявка
            $sql = "INSERT INTO nodes (name, lat, lng, floor, building) VALUES (?, ?, ?, ?, ?)";
            $id = dbInsert($sql, [$name, $lat, $lng, $floor, $building]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Залата е добавена']);
            break;
            
        case 'update_node':
            // UPDATE - Редактиране на зала
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
            
            // UPDATE заявка
            $sql = "UPDATE nodes SET name = ?, lat = ?, lng = ?, floor = ?, building = ? WHERE id = ?";
            $affected = dbUpdate($sql, [$name, $lat, $lng, $floor, $building, $id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Залата е обновена']);
            break;
            
        case 'delete_node':
            // DELETE - Изтриване на зала
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
            
            if ($id <= 0) {
                throw new Exception('Невалидно ID');
            }
            
            // Първо изтриваме свързаните връзки
            dbDelete("DELETE FROM edges WHERE node_from = ? OR node_to = ?", [$id, $id]);
            
            // После изтриваме залата
            $sql = "DELETE FROM nodes WHERE id = ?";
            $affected = dbDelete($sql, [$id]);
            
            echo json_encode(['success' => true, 'affected' => $affected, 'message' => 'Залата е изтрита']);
            break;
            
        // ==================== ВРЪЗКИ (EDGES) ====================
        
        case 'get_edges':
            // SELECT - Вземане на всички връзки
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
            // INSERT - Добавяне на връзка
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            $node_from = isset($_POST['node_from']) ? intval($_POST['node_from']) : 0;
            $node_to = isset($_POST['node_to']) ? intval($_POST['node_to']) : 0;
            $weight = isset($_POST['weight']) ? intval($_POST['weight']) : 1;
            
            if ($node_from <= 0 || $node_to <= 0 || $node_from == $node_to) {
                throw new Exception('Невалидни данни за връзка');
            }
            
            // INSERT заявка
            $sql = "INSERT INTO edges (node_from, node_to, weight) VALUES (?, ?, ?)";
            $id = dbInsert($sql, [$node_from, $node_to, $weight]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Връзката е добавена']);
            break;
            
        case 'delete_edge':
            // DELETE - Изтриване на връзка
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
            
        // ==================== ЕКСПОРТ ====================
        
        case 'export':
            // Експорт на всички данни като JSON
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
            
        // ==================== ЛЮБИМИ МАРШРУТИ (FAVORITES) ====================
        
        case 'get_favorites':
            // SELECT - Вземане на любими маршрути за текущия потребител
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
            // INSERT - Добавяне на любим маршрут
            require_once 'auth.php';
            
            if ($method !== 'POST') {
                throw new Exception('Невалиден метод');
            }
            
            if (!isLoggedIn()) {
                throw new Exception('Трябва да сте влезли в системата');
            }
            
            $user_id = $_SESSION['user_id'];
            // Използваме string стойности за node_from/node_to (JavaScript IDs)
            $node_from = isset($_POST['node_from']) ? trim($_POST['node_from']) : '';
            $node_to = isset($_POST['node_to']) ? trim($_POST['node_to']) : '';
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            
            if (empty($node_from) || empty($node_to)) {
                throw new Exception('Невалидни данни за маршрут');
            }
            
            // Проверка дали вече съществува
            $existing = dbSelectOne(
                "SELECT id FROM favorites WHERE user_id = ? AND node_from = ? AND node_to = ?",
                [$user_id, $node_from, $node_to]
            );
            
            if ($existing) {
                throw new Exception('Този маршрут вече е в любими');
            }
            
            // INSERT заявка
            $sql = "INSERT INTO favorites (user_id, node_from, node_to, name) VALUES (?, ?, ?, ?)";
            $id = dbInsert($sql, [$user_id, $node_from, $node_to, $name]);
            
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Маршрутът е добавен в любими']);
            break;
            
        case 'delete_favorite':
            // DELETE - Изтриване на любим маршрут
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
            
            // DELETE само ако принадлежи на текущия потребител
            $sql = "DELETE FROM favorites WHERE id = ? AND user_id = ?";
            $affected = dbDelete($sql, [$id, $user_id]);
            
            if ($affected > 0) {
                echo json_encode(['success' => true, 'message' => 'Маршрутът е премахнат от любими']);
            } else {
                throw new Exception('Маршрутът не е намерен или нямате права да го изтриете');
            }
            break;
            
        // ==================== ПРОВЕРКА НА АВТЕНТИКАЦИЯ ====================
        
        case 'check_auth':
            // Проверка дали потребителят е логнат
            require_once 'auth.php';
            
            if (isLoggedIn()) {
                $user = getCurrentUser();
                echo json_encode([
                    'logged_in' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email']
                    ]
                ]);
            } else {
                echo json_encode(['logged_in' => false]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Непозната команда']);
            break;
    }
    
} catch (Exception $e) {
    // При грешка връщаме JSON с грешката
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

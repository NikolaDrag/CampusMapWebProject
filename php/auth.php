<?php
/**
 * auth.php - Функции за автентикация (регистрация и вход)
 */

// Стартираме сесията (важно! Без това $_SESSION няма да работи)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';

/**
 * Регистрация на нов потребител
 * 
 * @param string $username Потребителско име
 * @param string $email Email адрес
 * @param string $password Парола
 * @return array Резултат от регистрацията
 */
function registerUser($username, $email, $password) {
    // Валидация
    if (empty($username) || empty($email) || empty($password)) {
        return ['success' => false, 'error' => 'Всички полета са задължителни'];
    }
    
    if (strlen($username) < 3) {
        return ['success' => false, 'error' => 'Потребителското име трябва да е поне 3 символа'];
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Невалиден email адрес'];
    }
    
    if (strlen($password) < 6) {
        return ['success' => false, 'error' => 'Паролата трябва да е поне 6 символа'];
    }
    
    // Проверка дали потребителят вече съществува
    $existing = dbSelectOne(
        "SELECT id FROM users WHERE username = ? OR email = ?", 
        [$username, $email]
    );
    
    if ($existing) {
        return ['success' => false, 'error' => 'Потребителското име или email вече съществува'];
    }
    
    // Хеширане на паролата (сигурен начин за съхранение)
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // INSERT в базата данни
    $sql = "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
    $userId = dbInsert($sql, [$username, $email, $passwordHash]);
    
    return ['success' => true, 'user_id' => $userId, 'message' => 'Регистрацията е успешна'];
}

/**
 * Вход на потребител
 * 
 * @param string $username Потребителско име или email
 * @param string $password Парола
 * @return array Резултат от входа
 */
function loginUser($username, $password) {
    // Валидация
    if (empty($username) || empty($password)) {
        return ['success' => false, 'error' => 'Въведете потребителско име и парола'];
    }
    
    // Търсене на потребителя
    $user = dbSelectOne(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [$username, $username]
    );
    
    if (!$user) {
        return ['success' => false, 'error' => 'Грешно потребителско име или парола'];
    }
    
    // Проверка на паролата
    if (!password_verify($password, $user['password_hash'])) {
        return ['success' => false, 'error' => 'Грешно потребителско име или парола'];
    }
    
    // Записване в сесията
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['logged_in'] = true;
    
    // Обновяване на последен вход
    dbUpdate("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);
    
    return [
        'success' => true, 
        'message' => 'Успешен вход',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ]
    ];
}

/**
 * Изход на потребител
 */
function logoutUser() {
    $_SESSION = [];
    session_destroy();
    return ['success' => true, 'message' => 'Успешен изход'];
}

/**
 * Проверка дали потребителят е влязъл
 * 
 * @return bool
 */
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Връща текущия потребител
 * 
 * @return array|null
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username']
    ];
}

// Обработка на заявки ако файлът е извикан директно
if (basename($_SERVER['PHP_SELF']) === 'auth.php') {
    header('Content-Type: application/json; charset=utf-8');
    
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    switch ($action) {
        case 'register':
            $username = isset($_POST['username']) ? trim($_POST['username']) : '';
            $email = isset($_POST['email']) ? trim($_POST['email']) : '';
            $password = isset($_POST['password']) ? $_POST['password'] : '';
            echo json_encode(registerUser($username, $email, $password));
            break;
            
        case 'login':
            $username = isset($_POST['username']) ? trim($_POST['username']) : '';
            $password = isset($_POST['password']) ? $_POST['password'] : '';
            echo json_encode(loginUser($username, $password));
            break;
            
        case 'logout':
            echo json_encode(logoutUser());
            break;
            
        case 'check':
            echo json_encode([
                'logged_in' => isLoggedIn(),
                'user' => getCurrentUser()
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Непознато действие']);
    }
}
?>

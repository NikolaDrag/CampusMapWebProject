<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';

function registerUser($username, $email, $password) {
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
    
    $existing = dbSelectOne(
        "SELECT id FROM users WHERE username = ? OR email = ?", 
        [$username, $email]
    );
    
    if ($existing) {
        return ['success' => false, 'error' => 'Потребителското име или email вече съществува'];
    }
    
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
    $userId = dbInsert($sql, [$username, $email, $passwordHash]);
    
    return ['success' => true, 'user_id' => $userId, 'message' => 'Регистрацията е успешна'];
}

function loginUser($username, $password) {
    if (empty($username) || empty($password)) {
        return ['success' => false, 'error' => 'Въведете потребителско име и парола'];
    }
    
    $user = dbSelectOne(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [$username, $username]
    );
    
    if (!$user) {
        return ['success' => false, 'error' => 'Грешно потребителско име или парола'];
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        return ['success' => false, 'error' => 'Грешно потребителско име или парола'];
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['logged_in'] = true;
    
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

function logoutUser() {
    $_SESSION = [];
    session_destroy();
    return ['success' => true, 'message' => 'Успешен изход'];
}

function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username']
    ];
}

if (basename($_SERVER['PHP_SELF']) === 'auth.php') {
    header('Content-Type: application/json; charset=utf-8');
    
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    switch ($action) {
        case 'register':
            $username = isset($_POST['username']) ? trim($_POST['username']) : '';
            $email = isset($_POST['email']) ? trim($_POST['email']) : '';
            $password = isset($_POST['password']) ? $_POST['password'] : '';
            
            $result = registerUser($username, $email, $password);
            echo json_encode($result);
            break;
            
        case 'login':
            $username = isset($_POST['username']) ? trim($_POST['username']) : '';
            $password = isset($_POST['password']) ? $_POST['password'] : '';
            
            $result = loginUser($username, $password);
            echo json_encode($result);
            break;
            
        case 'logout':
            $result = logoutUser();
            echo json_encode($result);
            break;
            
        case 'check':
            if (isLoggedIn()) {
                echo json_encode(['logged_in' => true, 'user' => getCurrentUser()]);
            } else {
                echo json_encode(['logged_in' => false]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Непозната команда']);
            break;
    }
}
?>

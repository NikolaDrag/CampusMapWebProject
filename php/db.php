<?php
/**
 * db.php - Връзка с базата данни
 * 
 * Използва PDO (PHP Data Objects) за безопасна работа с MySQL.
 * PDO предпазва от SQL injection атаки.
 */

require_once 'config.php';

/**
 * Създава връзка към базата данни
 * 
 * @return PDO обект за работа с базата
 */
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            // DSN (Data Source Name) - низ за връзка
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            
            // Опции за PDO
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,  // Хвърля exceptions при грешки
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,  // Връща асоциативни масиви
                PDO::ATTR_EMULATE_PREPARES => false,  // Истински prepared statements
            ];
            
            // Създаване на връзката
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            // При грешка - спираме изпълнението
            die("Грешка при връзка с базата данни: " . $e->getMessage());
        }
    }
    
    return $pdo;
}

/**
 * Изпълнява SELECT заявка и връща резултатите
 * 
 * @param string $sql SQL заявка с placeholders
 * @param array $params Параметри за заявката
 * @return array Резултати като масив
 */
function dbSelect($sql, $params = []) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Изпълнява SELECT и връща един ред
 * 
 * @param string $sql SQL заявка
 * @param array $params Параметри
 * @return array|false Един ред или false
 */
function dbSelectOne($sql, $params = []) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch();
}

/**
 * Изпълнява INSERT заявка
 * 
 * @param string $sql SQL заявка
 * @param array $params Параметри
 * @return int ID на вмъкнатия ред
 */
function dbInsert($sql, $params = []) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $pdo->lastInsertId();
}

/**
 * Изпълнява UPDATE заявка
 * 
 * @param string $sql SQL заявка
 * @param array $params Параметри
 * @return int Брой променени редове
 */
function dbUpdate($sql, $params = []) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

/**
 * Изпълнява DELETE заявка
 * 
 * @param string $sql SQL заявка
 * @param array $params Параметри
 * @return int Брой изтрити редове
 */
function dbDelete($sql, $params = []) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}
?>

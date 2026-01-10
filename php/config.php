<?php
/**
 * config.php - Конфигурационен файл на приложението
 * 
 * Тук се задават всички настройки, които може да се променят
 * при инсталация на друг сървър.
 */

// Версия на конфигурацията
define('CONFIG_VERSION', '1.0');

// Настройки на базата данни
define('DB_HOST', 'localhost');      // Адрес на MySQL сървъра
define('DB_NAME', 'campus_navigator'); // Име на базата данни
define('DB_USER', 'root');            // Потребител (сменете при production)
define('DB_PASS', '');                // Парола (празна за XAMPP по подразбиране)
define('DB_CHARSET', 'utf8mb4');      // Кодировка

// Настройки на сайта
define('SITE_URL', 'http://localhost/ProjectWeb'); // URL на сайта
define('SITE_NAME', 'Campus Navigator');
define('SITE_ROOT', dirname(__DIR__)); // Път до главната папка

// Настройки за сесии
define('SESSION_LIFETIME', 3600); // 1 час

// Режим на работа (true = показва грешки)
define('DEBUG_MODE', true);

// Настройки за грешки
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Стартиране на сесия
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>

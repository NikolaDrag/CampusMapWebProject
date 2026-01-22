<?php
define('CONFIG_VERSION', '1.0');

define('DB_HOST', 'localhost:3307');
define('DB_NAME', 'campus_navigator');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

define('SITE_URL', 'http://localhost/ProjectWeb');
define('SITE_NAME', 'Campus Navigator');
define('SITE_ROOT', dirname(__DIR__));

define('SESSION_LIFETIME', 3600);

define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>

-- =====================================================
-- database.sql - SQL скрипт за създаване на базата данни
-- Campus Navigator - Навигация в университетски кампус
-- XAMPP / MySQL (без Docker)
-- =====================================================

-- Създаване на базата данни (ако не съществува)
CREATE DATABASE IF NOT EXISTS campus_navigator 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Избиране на базата данни
USE campus_navigator;

-- =====================================================
-- DROP таблици (ако съществуват) - в правилен ред заради FK
-- =====================================================
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS edges;
DROP TABLE IF EXISTS nodes;
DROP TABLE IF EXISTS users;

-- =====================================================
-- CREATE TABLE: users - Потребители на системата
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- CREATE TABLE: nodes - Зали/Локации в кампуса
-- =====================================================
CREATE TABLE nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    floor INT DEFAULT 1,
    building VARCHAR(100) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_building (building),
    INDEX idx_coords (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- CREATE TABLE: edges - Връзки между зали (пътища)
-- =====================================================
CREATE TABLE edges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_from INT NOT NULL,
    node_to INT NOT NULL,
    weight INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (node_from) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (node_to) REFERENCES nodes(id) ON DELETE CASCADE,
    
    INDEX idx_from (node_from),
    INDEX idx_to (node_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- CREATE TABLE: favorites - Любими маршрути на потребителите
-- ЗАБЕЛЕЖКА: node_from и node_to са VARCHAR защото в JavaScript
-- използваме string IDs (като "FMI200"), не числови от базата
-- =====================================================
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    node_from VARCHAR(50) NOT NULL,
    node_to VARCHAR(50) NOT NULL,
    name VARCHAR(100) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    UNIQUE KEY unique_favorite (user_id, node_from, node_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- INSERT INTO users: Примерни потребители
-- Парола за всички: password (хеширана с password_hash)
-- =====================================================
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@campus.bg', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('user', 'user@campus.bg', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- =====================================================
-- INSERT INTO nodes: Зали/локации от app.js (реални координати от кампуса)
-- =====================================================
INSERT INTO nodes (id, name, lat, lng, floor, building) VALUES
(1, 'ФМИ - Зала 200 (Аудиториум)', 42.67446134, 23.33070514, 2, 'ФМИ'),
(2, 'ФМИ - Зала 325 (Аудиториум)', 42.67430457, 23.33029208, 3, 'ФМИ'),
(3, 'ФМИ - Зала 314 (Компютърна зала)', 42.67428879, 23.33039803, 3, 'ФМИ'),
(4, 'ФМИ - Стая 100 (Бордови Игри)', 42.67453529, 23.33085534, 1, 'ФМИ'),
(5, 'ФМИ - Зала 01 (Лекционна зала)', 42.67433513, 23.33073867, -1, 'ФМИ'),
(6, 'ФЗФ - Фризер (Аудиториум)', 42.67361140, 23.32991389, 3, 'Корпус А'),
(7, 'ФЗФ - Столова', 42.67363507, 23.32879272, 1, 'ФЗФ - Столова'),
(8, 'ФЗФ - Зала 326 (Лекционна зала)', 42.67385002, 23.32906363, 1, 'Корпус B'),
(9, 'ФХФ - КУЛАТА (Място за развлечение)', 42.67462485, 23.33260736, 8, 'ФХФ'),
(10, 'ФХФ - Зала 210 (Аудиториум)', 42.67436060, 23.33361587, 2, 'ФХФ'),
(11, 'ФХФ - Зала 130 (Аудиториум)', 42.67453907, 23.33346566, 1, 'ФХФ'),
(12, 'ФХФ - Зала 610 (Лекционна зала)', 42.67454597, 23.33257517, 6, 'ФХФ'),
(13, 'Ректорат - Зала 605 (Лекционна зала)', 42.69309189, 23.33544757, 6, 'Корпус А'),
(14, 'Ректорат - Скелет на мамут (Музей)', 42.69421164, 23.33495136, 6, 'Музей по палеонтология и исторична геология'),
(15, 'Ректорат - Библиотека', 42.69359657, 23.33576139, 1, 'Корпус Б'),
(16, 'Ректорат - Столова', 42.6935000, 23.3330000, 0, 'Централна');

-- =====================================================
-- INSERT INTO edges: Връзки между залите (генерирани автоматично)
-- Тежестта (weight) е изчислена като Евклидово разстояние
-- =====================================================
INSERT INTO edges (node_from, node_to, weight) VALUES
-- Връзки между зали (примерни - в app.js се генерират автоматично всички комбинации)
(1, 2, 3), (2, 1, 3),
(1, 3, 2), (3, 1, 2),
(1, 4, 2), (4, 1, 2),
(1, 5, 3), (5, 1, 3),
(2, 3, 1), (3, 2, 1),
(2, 4, 3), (4, 2, 3),
(3, 4, 2), (4, 3, 2),
(4, 5, 2), (5, 4, 2),
(6, 7, 5), (7, 6, 5),
(6, 8, 2), (8, 6, 2),
(7, 8, 3), (8, 7, 3),
(9, 10, 4), (10, 9, 4),
(9, 11, 3), (11, 9, 3),
(9, 12, 2), (12, 9, 2),
(10, 11, 2), (11, 10, 2),
(10, 12, 4), (12, 10, 4),
(11, 12, 3), (12, 11, 3),
(13, 14, 3), (14, 13, 3),
(13, 15, 2), (15, 13, 2),
(14, 15, 3), (15, 14, 3),
(15, 16, 4), (16, 15, 4);

-- =====================================================
-- INSERT INTO favorites: Примерни любими маршрути
-- ЗАБЕЛЕЖКА: Използваме string IDs които съответстват на JavaScript
-- За демонстрация, тук използваме реални зали от базата
-- =====================================================
-- Забележка: В момента app.js използва различни IDs ("FMI200", "FMI325"),
-- а базата използва числови IDs (1, 2, 3...). За да работи правилно,
-- или трябва да синхронизираме IDs или да използваме само JavaScript данни.
-- За този проект използваме JavaScript данните като основен източник.

-- =====================================================
-- ПРИМЕРНИ SELECT ЗАЯВКИ (за тестване)
-- =====================================================

-- Вземане на всички потребители:
-- SELECT id, username, email, created_at FROM users;

-- Вземане на всички зали:
-- SELECT * FROM nodes ORDER BY building, name;

-- Вземане на всички връзки с имена на залите:
-- SELECT e.id, n1.name as from_name, n2.name as to_name, e.weight
-- FROM edges e
-- JOIN nodes n1 ON e.node_from = n1.id
-- JOIN nodes n2 ON e.node_to = n2.id;

-- Вземане на любими маршрути за потребител (user_id = 1):
-- SELECT f.id, f.name as route_name, 
--        n1.name as from_name, n2.name as to_name,
--        f.created_at
-- FROM favorites f
-- JOIN nodes n1 ON f.node_from = n1.id
-- JOIN nodes n2 ON f.node_to = n2.id
-- WHERE f.user_id = 1;

-- =====================================================
-- КРАЙ НА СКРИПТА
-- =====================================================

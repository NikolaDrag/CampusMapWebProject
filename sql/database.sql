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

-- Drop tables in correct order (child tables first, then parent tables)
DROP TABLE IF EXISTS event_interests;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS edges;
DROP TABLE IF EXISTS nodes;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS public_transport;


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


CREATE TABLE buildings (
    id varchar(255) PRIMARY KEY,
    name varchar(32) NOT NULL,
    building_part varchar(8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(11, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    floor INT DEFAULT 1,
    building_id VARCHAR(100) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hidden BOOLEAN DEFAULT False,
    connection BOOLEAN DEFAULT true,
    connection_from INT NULL,
    connection_to INT NULL,

    FOREIGN KEY (connection_from) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_to) REFERENCES nodes(id) ON DELETE CASCADE,

    CONSTRAINT chk_connection_fields
        CHECK (
            connection = FALSE
            OR ((connection_from IS NOT NULL OR connection_to IS NOT NULL) AND connection_from <> connection_to)
        ),

    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,

    INDEX idx_building (building_id),
    INDEX idx_coords (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


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

CREATE TABLE public_transport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_name VARCHAR(10),
    stop_name VARCHAR(255),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    vehicle_type VARCHAR(20)
);

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

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL,
    description varchar(512),
    node_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,

    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_user (event_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@campus.bg', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('user', 'user@campus.bg', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO buildings (id, name, building_part) VALUES
("RECTORATE A", "RECTORATE", "A"),
("RECTORATE B", "RECTORATE", "B"),
("FMI", "FMI", NULL),
("FZF A", "FZF", "A"),
("FZF B", "FZF", "B"),
("FHF A", "FHF", "A"),
("FHF B", "FHF", "B"),
("FMI-FHF-PATH", "FMI-FHF-PATH", NULL),
("FMI-FZF-PATH", "FMI-FZF-PATH", NULL),
("BUS-STOP", "BUS-STOP", NULL),
("TRAM-STOP", "TRAM-STOP", NULL);

INSERT INTO nodes (id, name, lat, lng, floor, building_id, hidden, connection, connection_from, connection_to) VALUES
(1, 'ФМИ - Зала 200 (Аудиториум)', 42.67446134, 23.33070514, 2, 'FMI', 0, 0, NULL, NULL),
(2, 'ФМИ - Зала 325 (Аудиториум)', 42.67430457, 23.33029208, 3, 'FMI', 0, 0, NULL, NULL),
(3, 'ФМИ - Зала 314 (Компютърна зала)', 42.67428879, 23.33039803, 3, 'FMI', 0, 0, NULL, NULL),
(4, 'ФМИ - Стая 100 (Бордови Игри)', 42.67453529, 23.33085534, 1, 'FMI', 0, 0, NULL, NULL),
(5, 'ФМИ - Зала 01 (Лекционна зала)', 42.67433513, 23.33073867, -1, 'FMI', 0, 0, NULL, NULL),
(6, 'ФЗФ - Зала 207 (Фризер)', 42.67361140, 23.32991389, 3, 'FZF A', 0, 0, NULL, NULL),
(7, 'ФЗФ - Столова', 42.67363507, 23.32879272, 1, 'FZF B', 0, 0, NULL, NULL),
(8, 'ФЗФ - Зала 326 (Лекционна зала)', 42.67385002, 23.32906363, 1, 'FZF B', 0, 0, NULL, NULL),
(9, 'ФХФ - КУЛАТА (Място за развлечение)', 42.67462485, 23.33260736, 8, 'FHF B', 0, 0, NULL, NULL),
(10, 'ФХФ - Зала 210 (Аудиториум)', 42.67436060, 23.33361587, 2, 'FHF A', 0, 0, NULL, NULL),
(11, 'ФХФ - Зала 130 (Аудиториум)', 42.67453907, 23.33346566, 1, 'FHF A', 0, 0, NULL, NULL),
(12, 'ФХФ - Зала 610 (Лекционна зала)', 42.67454597, 23.33257517, 6, 'FHF B', 0, 0, NULL, NULL),
(13, 'Ректорат - Зала 605 (Лекционна зала)', 42.69309189, 23.33544757, 6, 'RECTORATE A', 0, 0, NULL, NULL),
(14, 'Ректорат - Палеонтоложки музей (Скелет на мамут)', 42.69421164, 23.33495136, 6, 'RECTORATE A', 0, 0, NULL, NULL),
(15, 'Ректорат - Библиотека', 42.69359657, 23.33576139, 1, 'RECTORATE A', 0, 0, NULL, NULL),
(16, 'Ректорат - Столова', 42.6935000, 23.3330000, 0, 'RECTORATE B', 0, 0, NULL, NULL),
(17, 'ФМИ - Вход', 42.67450347360084, 23.330413453347777, 1, 'FMI', 1, 0, NULL, NULL),
(18, 'ФЗФ - Вход', 42.67393156529344, 23.329798048598324, 1, 'FZF A', 1, 0, NULL, NULL),
(19, 'ФХФ - Вход', 42.6747287746268, 23.333360530459398, 1, 'FHF B', 1, 0, NULL, NULL),
(20, 'Ректорат - Вход', 42.693521658007015, 23.334634860807206, 1, 'RECTORATE B', 1, 1, 16, NULL),
(21, 'Пътека ФЗФ-ФМИ', 42.674330203001595, 23.329892428871545, 1, 'FMI-FZF-PATH', 1, 1, 17, 18),
(22, 'Пътека ФХФ-ФМИ-1', 42.67464966768705, 23.331000181169276, 1, 'FMI-FHF-PATH', 1, 1, 17, NULL),
(23, 'Пътека ФХФ-ФМИ-2', 42.67424836457649, 23.33141190025043, 1, 'FMI-FHF-PATH', 1, 0, NULL, NULL),
(24, 'Пътека ФХФ-ФМИ-3', 42.67412807173594, 23.331873240175387, 1, 'FMI-FHF-PATH', 1, 1, 19, NULL),
(25, 'Спирка на автобус №94 - Семинарията', 42.67667662955669, 23.333929292833403, 0, 'BUS-STOP', 0, 0, NULL, NULL), 
(26, 'Спирка на автобус №94 - СУ Ректорат', 42.69222344380924, 23.33514565195622, 0, 'BUS-STOP', 0, 0, NULL, NULL), 
(27, 'Спирка на трамвай №10 - Семинарията', 42.676088990208896, 23.33345185963804, 0, 'TRAM-STOP', 0, 0, NULL, NULL), 
(28, 'Спирка на трамвай №10 - Бул. В. Левски', 42.68794673082644, 23.32916474933916, 0, 'TRAM-STOP', 0, 0, NULL, NULL); 

INSERT INTO events (name, description, node_id, start_time, end_time) VALUES
("Безплатен обяд за студенти и преподаватели", "Храна на корем за всички гладни студенти!", 16, '2026-02-01 11:30:00', '2026-02-01 14:30:00'),
("Гост лекция на Илон Мъск", "Какво видях на острова на Епстийн и още интересни истории от живота ми.", 13, '2026-01-30 18:30:00', '2026-01-30 20:30:00'),
("\"Как да бъдем суперсвежи преподаватели\" - лектор: професор Милен Петров", "Една невероятна лекция от любимия на всички преподавател", 1, '2026-01-28 18:30:00', '2026-01-28 20:30:00'),
("\"PHP е бъдещето!\" - лектор: професор Милен Петров", "Една невероятна лекция за PHP от любимия на всички преподавател", 13, '2026-01-29 18:30:00', '2026-01-29 20:30:00');

INSERT INTO event_interests (event_id, user_id) VALUES
(4, 1),
(4, 2),
(3, 1);


-- Автобус 94 (примерни спирки)
INSERT INTO public_transport (line_name, stop_name, lat, lng, vehicle_type) VALUES
('94', 'Семинарията', 42.697506, 23.322160, 'Bus'),
('94', 'Хотел Хемус',  42.6791272032593, 23.32213327234565, 'Bus'),
('94', 'Хотел Хилтън',  42.683963487457625, 23.321051001460223, 'Bus'),
('94', 'Ул. 6-ти септември',  42.68649913333566, 23.324197017915886, 'Bus'),
('94', 'Кино Одеон',  42.688514998427706, 23.32959584883216, 'Bus'),
('94', 'Ул. Ген. Гурко',  42.69063635984072, 23.33210639651473, 'Bus'),
('94', 'СУ Св. Климент Охридски', 42.69227661932533, 23.33527140311102, 'Bus');

-- Трамвай 10 (примерни спирки)
INSERT INTO public_transport (line_name, stop_name, lat, lng, vehicle_type) VALUES
('10', 'Семинарията', 42.67601213732948, 23.333246647903394, 'Tram'),
('10', 'Ул. Вишнева',  42.67854895347737, 23.33437889795501, 'Tram'),
('10', 'Пл. Журналист',  42.681561906049325, 23.331889808068443, 'Tram'),
('10', 'УАСГ',  42.68572616539562, 23.330795466805807, 'Tram'),
('10', 'Бул. Васил Левски',  42.688027, 23.329034, 'Tram');



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

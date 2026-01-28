# Campus Navigator - Навигация в университетски кампус

## Екип

| Име | Факултетен номер |
|-----|------------------|
| Никола Драгнев | 1MI0800237 |
| Георги Николов | 4MI0800188 |
| Михаил Цветков | 7MI0800207 |
| Жулиета Янева | 5MI0800245 |

**Контакти:**  
- nikola.dr125@gmail.com  
- kofa123123@abv.bg
- mihail.tsvetkov.04@gmail.com
- zhulieta.yaneva4@gmail.com
---

## Описание на проекта

Campus Navigator е уеб приложение за навигация в университетски кампус с интерактивна карта и алгоритъм за намиране на най-кратък път между учебни зали.

**Функционалности:**
- Интерактивна карта на кампуса (Leaflet.js)
- Търсене на най-кратък път между зали (Dijkstra алгоритъм)
- Избор на транспорт (пеша, кола, автобус №94, трамвай №10)
- Система за потребители (регистрация/вход)
- Запазване на любими маршрути
- Събития на локации (добавяне, преглед, заинтересованост)
- Експорт/импорт на данни (JSON/CSV)

**Технологии:** HTML5, CSS3, JavaScript, PHP, MySQL, Leaflet.js

---

## Примерни данни

### Тестови акаунти:
- Потребител: `admin` / Парола: `password`
- Потребител: `user` / Парола: `password`

---

## Структура на проекта

```
CampusMapWebProject/
│   .gitignore              - Git ignore файл
│   .htaccess               - Apache конфигурация
│   DocumentaciqWord.docx        - пълна документация
│   events.html             - страница за събития на локации
│   index.html              - главна страница с карта
│   login.php               - страница за вход
│   README.md               - този файл
│   register.php            - страница за регистрация
│
├───css/
│       auth.css            - стилове за вход/регистрация
│       events_style.css    - стилове за събития
│       style.css           - основни стилове
│
├───data/
│       campus.json         - примерни данни
│
├───js/
│       app.js              - главна логика, транспорт, любими
│       events.js           - логика за събития
│       graph.js            - граф структура и Dijkstra
│       map.js              - Leaflet карта и routing
│
├───php/
│       api.php             - REST API endpoints
│       auth.php            - автентикация (login/register/logout)
│       db.php              - PDO функции за база данни
│
└───sql/
        database.sql        - SQL скрипт за създаване на БД
```

---

## Инструкции за пускане

### Вариант А: Стандартно (в htdocs)

1. **Стартирайте XAMPP:** Apache + MySQL
2. **Създайте база данни:**
   - Отворете `http://localhost/phpmyadmin`
   - Създайте база: `campus_navigator` (utf8mb4_unicode_ci)
   - Импортирайте: `sql/database.sql`
3. **Копирайте проекта:** В `C:\xampp\htdocs\ProjectWeb`
4. **Отворете:** `http://localhost/ProjectWeb/`

---

### Вариант Б: Проектът е на Desktop (с ФН номера)

Ако папката е на Desktop (напр. `1MI0800237_4MI0800188_7MI0800207_5MI0800245`):

1. **Стартирайте XAMPP:** Apache + MySQL

2. **Импортирайте базата данни:**
   - Отворете `http://localhost/phpmyadmin`
   - Кликнете "Import" → изберете `sql/database.sql` → "Go"

3. **Конфигурирайте Apache:**
   - Отворете файл: `C:\xampp\apache\conf\httpd.conf`
   - Добавете накрая (заменете `ИмеНаПотребител` с вашето):
   ```apache
   Alias /campus "C:/Users/ИмеНаПотребител/Desktop/1MI0800237_4MI0800188_7MI0800207_5MI0800245"
   <Directory "C:/Users/ИмеНаПотребител/Desktop/1MI0800237_4MI0800188_7MI0800207_5MI0800245">
       AllowOverride All
       Require all granted
   </Directory>
   ```

4. **Рестартирайте Apache** от XAMPP Control Panel (Stop → Start)

5. **Отворете:** `http://localhost/campus/`

**Забележка:** В пътя използвайте `/` (forward slash), не `\`

---

**Пълна документация:** Вижте [DocumentaciqWord.docx](DocumentaciqWord.docx)

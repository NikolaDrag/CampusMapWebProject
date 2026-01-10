<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход - Campus Navigator</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <h1>Campus Navigator</h1>
            <h2>Вход в системата</h2>
            
            <!-- Съобщение за грешка/успех -->
            <div id="message" class="message hidden"></div>
            
            <!-- Форма за вход -->
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Потребителско име или Email:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Парола:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="btn-primary">Вход</button>
            </form>
            
            <p class="auth-link">
                Нямате акаунт? <a href="register.php">Регистрирайте се</a>
            </p>
            
            <p class="auth-link">
                <a href="index.html">Към картата (без вход)</a>
            </p>
        </div>
    </div>
    
    <script>
        // Обработка на формата за вход
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            // Изпращане на данните към PHP
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            fetch('php/auth.php?action=login', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                messageDiv.classList.remove('hidden', 'success', 'error');
                
                if (data.success) {
                    messageDiv.classList.add('success');
                    messageDiv.textContent = 'Успешен вход! Пренасочване...';
                    
                    // Пренасочване към главната страница
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    messageDiv.classList.add('error');
                    messageDiv.textContent = data.error;
                }
            })
            .catch(error => {
                messageDiv.classList.remove('hidden');
                messageDiv.classList.add('error');
                messageDiv.textContent = 'Грешка при връзка със сървъра';
            });
        });
    </script>
</body>
</html>

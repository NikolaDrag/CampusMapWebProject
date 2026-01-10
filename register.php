<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Регистрация - Campus Navigator</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <h1>Campus Navigator</h1>
            <h2>Регистрация</h2>
            
            <!-- Съобщение за грешка/успех -->
            <div id="message" class="message hidden"></div>
            
            <!-- Форма за регистрация -->
            <form id="register-form">
                <div class="form-group">
                    <label for="username">Потребителско име:</label>
                    <input type="text" id="username" name="username" 
                           minlength="3" required 
                           placeholder="Минимум 3 символа">
                </div>
                
                <div class="form-group">
                    <label for="email">Email адрес:</label>
                    <input type="email" id="email" name="email" required
                           placeholder="example@email.com">
                </div>
                
                <div class="form-group">
                    <label for="password">Парола:</label>
                    <input type="password" id="password" name="password" 
                           minlength="6" required
                           placeholder="Минимум 6 символа">
                </div>
                
                <div class="form-group">
                    <label for="password2">Повторете паролата:</label>
                    <input type="password" id="password2" name="password2" required>
                </div>
                
                <button type="submit" class="btn-primary">Регистрация</button>
            </form>
            
            <p class="auth-link">
                Вече имате акаунт? <a href="login.php">Влезте</a>
            </p>
        </div>
    </div>
    
    <script>
        // Обработка на формата за регистрация
        document.getElementById('register-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password2 = document.getElementById('password2').value;
            const messageDiv = document.getElementById('message');
            
            // Проверка дали паролите съвпадат
            if (password !== password2) {
                messageDiv.classList.remove('hidden', 'success');
                messageDiv.classList.add('error');
                messageDiv.textContent = 'Паролите не съвпадат';
                return;
            }
            
            // Изпращане на данните към PHP
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            
            fetch('php/auth.php?action=register', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                messageDiv.classList.remove('hidden', 'success', 'error');
                
                if (data.success) {
                    messageDiv.classList.add('success');
                    messageDiv.textContent = 'Регистрацията е успешна! Пренасочване към вход...';
                    
                    // Пренасочване към страницата за вход
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 2000);
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

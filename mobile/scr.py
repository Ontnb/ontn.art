import os
# Путь к папке с фотографиями
photo_dir = os.path.join(os.getcwd(), '../2')
# Путь к выходному HTML-файлу
output_file = os.path.join(os.getcwd(), 'output.html')
# Допустимые расширения файлов
allowed_extensions = ['.webp', '.webm', '.jpg', '.mp4']
# Чтение файлов в папке
try:
    files = os.listdir(photo_dir)
except Exception as e:
    print(f'Ошибка чтения папки: {e}')
    exit()
# Фильтрация файлов по допустимым расширениям
image_files = [file for file in files if any(file.endswith(ext) for ext in allowed_extensions)]
# Генерация HTML-кода
html_content = '''
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>ontn.art</title>
    <link rel="stylesheet" href="2.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>
    <!-- Кнопки навигации -->
    <a href="index.html" class="home-link">Home</a>
    <button class="contacts-link" id="open-contacts">Contacts</button>
    <main class="portfolio-container">
       <div class="portfolio-scroll-wrapper">
        <div class="portfolio-scroll">
'''
# Добавляем пути к файлам в HTML
for index, file in enumerate(image_files):
    file_extension = os.path.splitext(file)[1].lower()  # Получаем расширение файла
    if file_extension in ['.webp', '.jpg']:
        html_content += f'''
            <div class="portfolio-item">
                <img src="../2/{file}" alt="Photo {index + 1}">
                <p class="photo-caption"><!-- Подпись --></p>
            </div>
        '''
    elif file_extension == '.webm':
        html_content += f'''
            <div class="portfolio-item">
                <video controls>
                    <source src="../2/{file}" type="video/webm">
                    Ваш браузер не поддерживает видео.
                </video>
                <p class="photo-caption"><!-- Подпись --></p>
            </div>
        '''
    elif file_extension == '.mp4':
        html_content += f'''
            <div class="portfolio-item">
                <video controls>
                    <source src="../2/{file}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                <p class="photo-caption"><!-- Подпись --></p>
            </div>
        '''
# Завершаем HTML-код
html_content += '''
        </div>
       </div>
    </main>
    <!-- Модальное окно контактов -->
    <div id="contacts-modal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="contact-info">
                <p>Tg: @onton_b</p>
                <p>Ig: @ontn_b</p>
                <p>Email: ontn_b@bk.ru</p>
            </div>
        </div>
    </div>
    <script src="2.js"></script>
</body>
</html>
'''
# Запись HTML-кода в файл
try:
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(html_content)
    print(f'HTML-файл успешно создан: {output_file}')
except Exception as e:
    print(f'Ошибка записи файла: {e}')

// Подключаем модули для работы с файловой системой и путями
const fs = require('fs');
const path = require('path');

// Путь к папке с фотографиями
const photoDir = path.join(__dirname, '../disk/3');
// Путь к выходному HTML-файлу
const outputFile = path.join(__dirname, '../disk/25-02-25.html');

// Чтение файлов в папке
fs.readdir(photoDir, (err, files) => {
    if (err) {
        console.error('Ошибка чтения папки:', err);
        return;
    }

    // Фильтрация только .jpg файлов
    const imageFiles = files.filter(file => file.endsWith('.jpg'));

    // Генерация HTML-кода
    let htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit: cover">
    <title>ontn.art</title>
    <link rel="stylesheet" href="disk.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"></script>
</head>
<body>
    <div class="nav-container">
        <button class="download-all-link" id="download-all">Download ZIP</button>
        <a href="../index.html" class="home-link">Home</a>
        <button class="contacts-link" id="open-contacts">Contacts</button>
    </div>
    <main class="portfolio-container">
        <div class="portfolio-grid">
    `;

    // Добавляем пути к фотографиям в HTML
    imageFiles.forEach((file, index) => {
        htmlContent += `
            <div class="portfolio-item">
                <img src="../disk/3/${file}" alt="Photo ${index + 1}" data-index="${index}">
                <p class="photo-caption"></p>
            </div>
        `;
    });

    // Завершаем HTML-код
    htmlContent += `
        </div>
    </main>
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
    <div id="fullscreen-overlay" class="fullscreen-overlay">
        <button id="download-full" class="download-full-button"><i class="fas fa-download"></i></button>
        <button id="close-button" class="close-full-button">&times;</button>
        <div id="prev-button" class="nav-button nav-button-area">&lt;</div>
        <img id="fullscreen-image" src="" alt="Full Size Image">
        <div id="next-button" class="nav-button nav-button-area">&gt;</div>
    </div>
    <script src="disk.js"></script>
</body>
</html>
    `;

    // Запись HTML-кода в файл
    fs.writeFile(outputFile, htmlContent, (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
        } else {
            console.log('HTML-файл успешно создан:', outputFile);
        }
    });
});
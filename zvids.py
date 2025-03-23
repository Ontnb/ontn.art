#!/usr/bin/env python3
"""
Скрипт для создания нового HTML файла vids.html на основании видео из папки vids и соответствующих превью из vids/prvw.

Для каждого видеофайла поддерживаются форматы .mp4 и .webm. Для превью поддерживаются форматы .jpg и .webp.
Имя файла превью должно соответствовать имени видео (без расширения) с одной из указанных расширений.

Требования: скрипт использует только стандартную библиотеку os.
"""

import os

# Параметры каталогов и файлов
VIDEO_DIR = 'vids'
PRVW_DIR = os.path.join(VIDEO_DIR, 'prvw')
OUTPUT_HTML = 'vids.html'

# Допустимые расширения для видео и превью
VIDEO_EXTS = ('.mp4', '.webm')
PRVW_EXTS = ('.jpg', '.webp')


def get_video_files():
    """
    Получает список видеофайлов в папке VIDEO_DIR, исключая подкаталог prvw.
    Поддерживаются файлы с расширениями, указанными в VIDEO_EXTS.
    """
    video_files = []
    if not os.path.exists(VIDEO_DIR):
        print(f"Папка {VIDEO_DIR} не существует.")
        return video_files

    for item in os.listdir(VIDEO_DIR):
        path = os.path.join(VIDEO_DIR, item)
        if os.path.isfile(path) and item.lower().endswith(VIDEO_EXTS):
            video_files.append(item)
    return sorted(video_files)


def corresponding_preview_exists(video_filename):
    """
    Проверяет, существует ли соответствующее превью для видеофайла.
    Имя превью должно быть такое же, как имя видео (без расширения) с расширением из PRVW_EXTS.
    Возвращает кортеж (True/False, preview_filename), где preview_filename - найденное имя файла.
    """
    base, _ = os.path.splitext(video_filename)
    for ext in PRVW_EXTS:
        preview_name = base + ext
        preview_path = os.path.join(PRVW_DIR, preview_name)
        if os.path.exists(preview_path):
            return True, preview_name
    # Если превью не найдено, возвращаем False, а имя файла по умолчанию с первым расширением
    return False, base + PRVW_EXTS[0]


def generate_portfolio_item(video_file, preview_file):
    """
    Генерирует HTML-блок для одного видео и его превью.
    """
    block = f'''                <div class="portfolio-item">
                    <div class="video-container">
                        <video class="portfolio-video" preload="none" data-src="{VIDEO_DIR}/{video_file}" poster="{VIDEO_DIR}/prvw/{preview_file}">
                            Ваш браузер не поддерживает тег video.
                        </video>
                        <div class="video-controls">
                            <div class="progress-bar-container">
                                <div class="progress-bar"></div>
                            </div>
                            <div class="controls">
                                <button class="control-button play-pause-button"><i class="fas fa-play"></i></button>
                                <span class="time-display">0:00 / 0:00</span>
                                <div class="volume-controls">
                                    <button class="control-button volume-button"><i class="fas fa-volume-up"></i></button>
                                    <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
                                </div>
                                <button class="control-button fullscreen-button"><i class="fas fa-expand"></i></button>
                            </div>
                        </div>
                    </div>
                    <p class="photo-caption"><!-- Подпись --></p>
                </div>
'''
    return block


def create_html(portfolio_items_html):
    """
    Формирует полный HTML-код страницы, вставляя сгенерированные блоки видео в нужный контейнер.
    """
    html_content = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit: cover">
    <title>ontn.art</title>
    <link rel="stylesheet" href="vids.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
          crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>

    <!-- Кнопки навигации -->
    <a href="index.html" class="home-link">Home</a>
    <button class="contacts-link" id="open-contacts">Contacts</button>

    <main class="portfolio-container">
        <div class="portfolio-scroll-wrapper">
            <div class="portfolio-scroll">
{portfolio_items_html}
            </div>
        </div>
        <div class="scrollbar-container">
            <div class="scrollbar">
                <div class="scrollbar-thumb"></div>
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

    <script src="vids.js"></script>
</body>
</html>
'''
    return html_content


def main():
    video_files = get_video_files()
    if not video_files:
        print('Нет видеофайлов для обработки.')
        return

    portfolio_items = []
    for video_file in video_files:
        preview_exists, preview_file = corresponding_preview_exists(video_file)
        if not preview_exists:
            print(f'Превью для видео {video_file} не найдено. Пропускаем.')
            continue
        item_html = generate_portfolio_item(video_file, preview_file)
        portfolio_items.append(item_html)
        print(f'Добавлено видео: {video_file}')

    all_items_html = '\n'.join(portfolio_items)
    full_html = create_html(all_items_html)

    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f'HTML-файл "{OUTPUT_HTML}" успешно создан с {len(portfolio_items)} элементами.')


if __name__ == '__main__':
    main()

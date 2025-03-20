import os

# Определение путей с учетом расположения скрипта в каталоге mobile
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, '..', 'Vids')
PRVW_DIR = os.path.join(VIDEO_DIR, 'prvw')
OUTPUT_HTML = 'vids.html'  # Файл будет создан в каталоге mobile

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
    Имя превью должно быть таким же, как имя видео (без расширения) с расширением из PRVW_EXTS.
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
    Генерирует HTML-блок для одного видео и его превью с учетом нового шаблона.
    Обратите внимание, что ссылки на видео и превью формируются так, чтобы из каталога mobile
    они указывали на ../Vids/ и ../Vids/prvw/.
    """
    block = f'''          <div class="portfolio-item">
            <div class="video-container">
              <video class="portfolio-video" preload="none" data-src="../Vids/{video_file}" poster="../Vids/prvw/{preview_file}">
                Ваш браузер не поддерживает тег video.
              </video>
              <div class="video-controls">
                <div class="progress-bar-container">
                  <div class="progress-bar"></div>
                </div>
                <div class="controls">
                  <span class="time-display">0:00 / 0:00</span>
                  <button class="control-button fullscreen-button"><i class="fas fa-expand"></i></button>
                </div>
              </div>
              <button class="control-button play-pause-button center-button">
                <i class="fas fa-play"></i>
              </button>
            </div>
            <p class="photo-caption"><!-- Подпись (если нужна) --></p>
          </div>
'''
    return block


def create_html(portfolio_items_html):
    """
    Формирует полный HTML-код страницы согласно новому шаблону.
    Встречаются изменения: подключается Vids.css и Vids.js,
    основное содержимое обернуто в блок .portfolio-list внутри .portfolio-container.
    """
    html_content = f'''<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit: cover" />
    <title>ontn.art</title>
    <link rel="stylesheet" href="Vids.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
          crossorigin="anonymous" referrerpolicy="no-referrer" />
  </head>
  <body>
    <a href="index.html" class="home-link">Home</a>
    <button class="contacts-link" id="open-contacts">Contacts</button>

    <main class="portfolio-container">
      <div class="portfolio-list">
{portfolio_items_html}
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

    <script src="Vids.js"></script>
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

    output_path = os.path.join(BASE_DIR, OUTPUT_HTML)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f'HTML-файл "{OUTPUT_HTML}" успешно создан с {len(portfolio_items)} элементами в каталоге {BASE_DIR}.')


if __name__ == '__main__':
    main()

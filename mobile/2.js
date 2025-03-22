// Функция настройки видео-плеера
function setupVideoPlayer() {
  const video = document.querySelector('.portfolio-video');
  const playPauseButton = document.querySelector('.play-pause-button');
  const progressBar = document.querySelector('.progress-bar');

  if (!video || !playPauseButton || !progressBar) return;

  // Обработчик loadedmetadata для корректировки размера видео
  video.addEventListener("loadedmetadata", () => {
    // Некоторая задержка поможет браузеру «успеть» правильно отобразить размеры
    setTimeout(() => {
      // Пример корректировки: задаём ширину 100% для видео, а высоту auto
      video.style.width = "100%";
      video.style.height = "auto";
      // Можно также инициировать событие resize для принудительного пересчёта стилей
      window.dispatchEvent(new Event("resize"));
    }, 300); // 300 мс задержки, можно подстроить под нужды
  });

  // Обработчик нажатия на кнопку play/pause
  playPauseButton.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(err => console.error("Ошибка воспроизведения:", err));
      playPauseButton.innerHTML = ''; // Обновляем иконку на паузу
    } else {
      video.pause();
      playPauseButton.innerHTML = ''; // Обновляем иконку на воспроизведение
    }
  });

  // Обновление прогресс-бара
  video.addEventListener("timeupdate", () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progress}%`;
  });

  // Перемотка видео при клике на прогресс-бар
  const progressBarContainer = document.querySelector('.progress-bar-container');
  progressBarContainer.addEventListener("click", (event) => {
    const rect = progressBarContainer.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    video.currentTime = clickPosition * video.duration;
  });

  // Предотвращаем переход в полноэкранный режим (особенно на iPhone)
  video.addEventListener('webkitbeginfullscreen', (event) => {
    event.preventDefault();
    if (video.webkitExitFullscreen) {
      video.webkitExitFullscreen();
    }
  });

  // Дополнительно можно предотвратить запуск полноэкранного режима при клике по самому видео
  video.addEventListener("click", (event) => {
    event.preventDefault();
    if (video.paused) {
      video.play().catch(err => console.error("Ошибка воспроизведения:", err));
      playPauseButton.innerHTML = '';
    } else {
      video.pause();
      playPauseButton.innerHTML = '';
    }
  });
}

// Инициализируем видео-плеер добавленной функцией
setupVideoPlayer();

document.addEventListener("DOMContentLoaded", () => {
  // Элементы для управления модальным окном
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Открытие модального окна
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  // Закрытие модального окна
  closeButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });

  // Функция настройки видео-плеера
  function setupVideoPlayer() {
    const video = document.querySelector('.portfolio-video');
    const playPauseButton = document.querySelector('.play-pause-button');
    const progressBar = document.querySelector('.progress-bar');

    if (!video || !playPauseButton || !progressBar) return;

    // Обработчик нажатия на кнопку play/pause
    playPauseButton.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(err => console.error("Ошибка воспроизведения:", err));
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
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
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
      }
    });
  }

  // Инициализируем видео-плеер добавленной функцией
  setupVideoPlayer();

  // Lazy Loading с Intersection Observer
  const lazyLoad = (target) => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');

          if (img.tagName === 'IMG') {
            img.setAttribute('src', src);
            img.classList.add('fade-in');
          } else if (img.tagName === 'VIDEO') {
            img.setAttribute('src', src);
            img.setAttribute('poster', img.getAttribute('data-poster'));
            img.classList.add('fade-in');
          }

          observer.disconnect();
        }
      });
    });

    io.observe(target);
  };

  // Применяем Lazy Loading ко всем изображениям и видео
  const images = document.querySelectorAll('img[data-src]');
  const videos = document.querySelectorAll('video[data-src]');

  images.forEach(img => lazyLoad(img));
  videos.forEach(video => lazyLoad(video));
});
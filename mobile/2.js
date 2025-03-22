document.addEventListener("DOMContentLoaded", () => {
  // --- Работа с модальным окном контактов ---
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

  // --- Функция воспроизведения видео с Lazy Load ---

  // Функция для загрузки видео из data-src
  const loadVideo = (video) => {
    if (!video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      video.load();
    }
  };

  // Инициализация IntersectionObserver для ленивой загрузки видео
  const videos = document.querySelectorAll('video[data-src]');
  const observerOptions = {
    root: null,
    threshold: 0.25
  };

  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  videos.forEach(video => {
    videoObserver.observe(video);

    // Запрет перехода в полноэкранный режим на iPhone
    // Если iOS попытается перейти в полноэкранный режим, вызывается метод webkitExitFullscreen
    video.addEventListener('webkitbeginfullscreen', () => {
      if (typeof video.webkitExitFullscreen === 'function') {
        video.webkitExitFullscreen();
      }
    });

    // Получаем родительский контейнер с элементами управления видео
    const videoContainer = video.closest('.video-container');
    if (videoContainer) {
      // Поиск кнопки воспроизведения/паузы
      const playPauseButton = videoContainer.querySelector('.play-pause-button');
      if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
          // При клике, если видео ещё не загружено, загружаем его
          loadVideo(video);
          if (video.paused) {
            video.play();
            playPauseButton.innerHTML = '';
          } else {
            video.pause();
            playPauseButton.innerHTML = '';
          }
        });
      }
      
      // Возможность переключения воспроизведения при клике на само видео
      video.addEventListener('click', () => {
        // Загружаем видео если нужно
        loadVideo(video);
        if (video.paused) {
          video.play();
          if (playPauseButton) {
            playPauseButton.innerHTML = '';
          }
        } else {
          video.pause();
          if (playPauseButton) {
            playPauseButton.innerHTML = '';
          }
        }
      });

      // Обновление полосы прогресса
      const progressBar = videoContainer.querySelector('.progress-bar');
      video.addEventListener('timeupdate', () => {
        if (video.duration) {
          const progress = (video.currentTime / video.duration) * 100;
          if (progressBar) progressBar.style.width = progress + '%';
        }
      });
      
      // Возможность перемотки видео, если кликнуть на область прогресс-бара
      const progressBarContainer = videoContainer.querySelector('.progress-bar-container');
      if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
          const rect = progressBarContainer.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newTime = (clickX / rect.width) * video.duration;
          video.currentTime = newTime;
        });
      }
    }
  });
});

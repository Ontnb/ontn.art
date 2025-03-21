document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM полностью загружен");

  // Находим все видео на странице
  const videos = document.querySelectorAll(".portfolio-video");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Функция для проверки, является ли устройство iOS
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  // Функция для перехода в полноэкранный режим
  function enterFullscreen(video) {
    if (isIOS()) {
      // Для iOS используем webkitEnterFullscreen
      if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } else {
      // Для других платформ используем стандартный метод
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    }
  }

  // Функция останавливает все видео, кроме того, которое передано в currentVideo
  function pauseAllExcept(currentVideo) {
    videos.forEach((video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
        // Сброс кнопки play/pause
        const container = video.parentElement;
        const btn = container.querySelector(".play-pause-button");
        btn.innerHTML = '<i class="fas fa-play"></i>';
        // Показываем элементы управления для остановленного видео
        const controls = container.querySelector(".video-controls");
        controls.classList.remove("hidden");
        btn.classList.remove("hidden");
      }
    });
  }

  videos.forEach((video) => {
    const videoContainer = video.parentElement;
    const playPauseButton = videoContainer.querySelector(".play-pause-button");
    const timeDisplay = videoContainer.querySelector(".time-display");
    const progressBar = videoContainer.querySelector(".progress-bar");
    const progressBarContainer = videoContainer.querySelector(
      ".progress-bar-container"
    );
    const videoControls = videoContainer.querySelector(".video-controls");
    const fullscreenButton = videoContainer.querySelector(".fullscreen-button");

    let hideControlsTimer; // Таймер для скрытия элементов управления

    // Функция для скрытия элементов управления, только если видео воспроизводится
    function hideControls() {
      if (!video.paused) {
        videoControls.classList.add("hidden");
        playPauseButton.classList.add("hidden");
      }
      clearTimeout(hideControlsTimer);
    }

    // Функция для показа элементов управления
    function showControls() {
      videoControls.classList.remove("hidden");
      playPauseButton.classList.remove("hidden");
      clearTimeout(hideControlsTimer);
      if (!video.paused) {
        hideControlsTimer = setTimeout(() => {
          if (!video.paused) hideControls();
        }, 4000);
      }
    }

    // Обработка клика/тапа по кнопке play/pause
    playPauseButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) {
        // Если видео еще не загружено, подставляем src из data-src
        if (!video.getAttribute("src")) {
          video.setAttribute("src", video.getAttribute("data-src"));
        }
        // Останавливаем все остальные видео
        pauseAllExcept(video);
        video.play();
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        // Если видео воспроизводится, запускаем автоскрытие через 4 секунды
        if (!video.paused) {
          clearTimeout(hideControlsTimer);
          hideControlsTimer = setTimeout(() => {
            if (!video.paused) hideControls();
          }, 4000);
        }
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        // При паузе элементы управления остаются видимыми
        showControls();
      }
    });

    playPauseButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (video.paused) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", video.getAttribute("data-src"));
        }
        pauseAllExcept(video);
        video.play();
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        if (!video.paused) {
          clearTimeout(hideControlsTimer);
          hideControlsTimer = setTimeout(() => {
            if (!video.paused) hideControls();
          }, 4000);
        }
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        showControls();
      }
    });

    // Обработка клика/тапа по контейнеру видео (исключая кнопки)
    function containerTapHandler(e) {
      if (e.target.closest(".control-button")) return;
      // Если видео не воспроизводится, ничего не делаем
      if (video.paused) return;

      if (videoControls.classList.contains("hidden")) {
        showControls();
      } else {
        // Если элементы управления уже видны и видео воспроизводится, сбрасываем таймер
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(() => {
          if (!video.paused) hideControls();
        }, 4000);
      }
    }
    videoContainer.addEventListener("click", containerTapHandler);
    videoContainer.addEventListener("touchend", (e) => {
      e.preventDefault();
      containerTapHandler(e);
    });

    // Обработка перемотки видео при клике по прогресс-бару
    progressBarContainer.addEventListener("click", (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * video.duration;
      video.currentTime = newTime;
    });
    progressBarContainer.addEventListener("touchend", (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      const newTime = (clickX / rect.width) * video.duration;
      video.currentTime = newTime;
    });

    // Обновление таймера и прогресс-бара
    video.addEventListener("timeupdate", () => {
      const currentTime = formatTime(video.currentTime);
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `${currentTime} / ${duration}`;
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${progress}%`;
    });

    // Обработка клика/тапа по кнопке полноэкранного режима
    fullscreenButton.addEventListener("click", (e) => {
      e.stopPropagation();
      enterFullscreen(video);
    });

    fullscreenButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      enterFullscreen(video);
    });

    // При окончании видео восстанавливаем стандартное состояние и показываем элементы управления постоянно
    video.addEventListener("ended", () => {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
      clearTimeout(hideControlsTimer);
      videoControls.classList.remove("hidden");
      playPauseButton.classList.remove("hidden");
    });
  });

  // Форматирование времени в mm:ss
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  // Модальное окно для контактов
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });
  closeButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });
});
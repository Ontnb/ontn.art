document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM полностью загружен");

  // Lazy Loading видео с использованием Intersection Observer
  const lazyLoadVideo = (video) => {
    if (video.dataset.src && !video.src) {
      video.src = video.dataset.src;
      video.load();
    }
  };

  const videoObserverOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.25
  };

  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        lazyLoadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, videoObserverOptions);

  // Наблюдаем за каждым видео
  document.querySelectorAll(".portfolio-video").forEach(video => {
    videoObserver.observe(video);
  });

  const videos = document.querySelectorAll(".portfolio-video");

  // Функция для форматирования времени
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Функция для обновления продолжительности видео после загрузки
  function updateVideoDuration(video) {
    const timeDisplay = video.closest('.video-container').querySelector('.time-display');
    video.addEventListener('loadedmetadata', () => {
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `0:00 / ${duration}`;
    });
  }

  videos.forEach(video => {
    updateVideoDuration(video); // Обновляем продолжительность видео

    const videoContainer = video.closest('.video-container');
    const playPauseButton = videoContainer.querySelector('.play-pause-button');
    const progressBar = videoContainer.querySelector('.progress-bar');
    const progressBarContainer = videoContainer.querySelector('.progress-bar-container');
    const timeDisplay = videoContainer.querySelector('.time-display');
    const fullscreenButton = videoContainer.querySelector('.fullscreen-button');

    let hideControlsTimer; // Таймер для скрытия элементов управления

    // Функция для скрытия элементов управления, только если видео воспроизводится
    function hideControls() {
      if (!video.paused) {
        videoContainer.querySelector('.video-controls').classList.add('hidden');
        playPauseButton.classList.add('hidden');
      }
      clearTimeout(hideControlsTimer);
    }

    // Функция для показа элементов управления
    function showControls() {
      videoContainer.querySelector('.video-controls').classList.remove('hidden');
      playPauseButton.classList.remove('hidden');
      clearTimeout(hideControlsTimer);
      if (!video.paused) {
        hideControlsTimer = setTimeout(() => {
          if (!video.paused) hideControls();
        }, 4000);
      }
    }

    // Обработка клика/тапа по кнопке play/pause
    playPauseButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        showControls();
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        showControls();
      }
    });

    // Обработка клика/тапа по контейнеру видео (исключая кнопки)
    videoContainer.addEventListener('click', (e) => {
      if (e.target.closest('.control-button')) return;
      if (video.paused) return;

      if (videoContainer.querySelector('.video-controls').classList.contains('hidden')) {
        showControls();
      } else {
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(() => {
          if (!video.paused) hideControls();
        }, 4000);
      }
    });

    // Обновление прогресс-бара и таймера
    video.addEventListener('timeupdate', () => {
      const currentTime = formatTime(video.currentTime);
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `${currentTime} / ${duration}`;
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${progress}%`;
    });

    // Перемотка при клике по прогресс-бару
    progressBarContainer.addEventListener('click', (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * video.duration;
      video.currentTime = newTime;
    });

    // Полноэкранный режим
    fullscreenButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    });
  });
});

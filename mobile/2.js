document.addEventListener("DOMContentLoaded", () => {
  // Элементы для управления скроллом и модальным окном
  const scrollContainer = document.querySelector(".portfolio-scroll");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Сохраняем и восстанавливаем позицию прокрутки при перезагрузке страницы
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
  });
  const savedScrollPosition = localStorage.getItem("scrollPosition");
  if (savedScrollPosition) {
    scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
    localStorage.removeItem("scrollPosition");
  }

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

  // Ленивая загрузка видео с использованием Intersection Observer
  const lazyLoadVideo = (video) => {
    if (video.dataset.src && !video.src) {
      video.src = video.dataset.src;
      
      // Важно для iOS: принудительно загружаем метаданные
      video.addEventListener('loadedmetadata', function onLoaded() {
        // Обновим размеры видео после загрузки метаданных
        updateVideoSizing(video);
        
        // Убираем обработчик после первого срабатывания
        video.removeEventListener('loadedmetadata', onLoaded);
      });
      
      video.load();
    }
  };

  // Функция для принудительного обновления размеров видео
  function updateVideoSizing(video) {
    // Принудительно переопределяем размеры, чтобы iOS обновил отображение
    if (video.videoWidth && video.videoHeight) {
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      // Применяем соотношение сторон к видео через CSS
      video.style.aspectRatio = `${aspectRatio}`;
      
      // Для iOS Safari иногда нужен еще один триггер для перерисовки
      setTimeout(() => {
        video.style.maxWidth = '100%';
      }, 100);
    }
  }

  // Немедленно загружаем все видео при первой загрузке страницы
  // Это решает проблему с iOS, где ленивая загрузка может работать некорректно
  document.querySelectorAll(".portfolio-video").forEach((video) => {
    lazyLoadVideo(video);
  });

  // Также сохраняем Intersection Observer для прокрутки
  const videoObserverOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.25,
  };

  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        lazyLoadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, videoObserverOptions);

  // Наблюдаем за каждым видео
  document.querySelectorAll(".portfolio-video").forEach((video) => {
    videoObserver.observe(video);
  });

  const videos = document.querySelectorAll(".portfolio-video");

  // Функция для форматирования времени
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  // Функция для обновления продолжительности видео после загрузки
  function updateVideoDuration(video) {
    const timeDisplay = video.closest('.video-container').querySelector('.time-display');
    
    // Обработка события loadedmetadata
    video.addEventListener('loadedmetadata', () => {
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `0:00 / ${duration}`;
      
      // Вызываем функцию для правильного отображения размеров
      updateVideoSizing(video);
    });
    
    // Если видео уже загружено, сразу обновляем продолжительность
    if (video.readyState >= 1) {
      const duration = formatTime(video.duration);
      timeDisplay.textContent = `0:00 / ${duration}`;
      updateVideoSizing(video);
    }
  }

  // Остановка всех видео, кроме текущего
  function stopOtherVideos(currentVideo) {
    videos.forEach((video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
        const playPauseButton = video.closest('.video-container').querySelector('.play-pause-button');
        if (playPauseButton) {
          playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        }
      }
    });
  }

  videos.forEach((video) => {
    updateVideoDuration(video); // Обновляем продолжительность видео

    const videoContainer = video.closest('.video-container');
    const playPauseButton = videoContainer.querySelector('.play-pause-button');
    const progressBar = videoContainer.querySelector('.progress-bar');
    const progressBarContainer = videoContainer.querySelector('.progress-bar-container');
    const timeDisplay = videoContainer.querySelector('.time-display');
    const videoControls = videoContainer.querySelector('.video-controls');

    let hideControlsTimer; // Таймер для скрытия элементов управления

    // Функция для скрытия элементов управления, только если видео воспроизводится
    function hideControls() {
      if (!video.paused) {
        videoControls.classList.add('hidden');
        playPauseButton.classList.add('hidden');
      }
      clearTimeout(hideControlsTimer);
    }

    // Функция для показа элементов управления
    function showControls() {
      videoControls.classList.remove('hidden');
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
        stopOtherVideos(video); // Останавливаем другие видео
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

      if (video.paused) {
        stopOtherVideos(video); // Останавливаем другие видео
        video.play();
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        showControls();
      } else {
        video.pause();
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        showControls();
      }
    });

    // Остановка других видео при воспроизведении текущего
    video.addEventListener('play', () => {
      stopOtherVideos(video);
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
      e.stopPropagation();
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * video.duration;
      video.currentTime = newTime;

      if (video.paused) {
        video.pause();
      } else {
        video.play();
      }
    });
    
    // Обработчик ошибок для видео
    video.addEventListener('error', function(e) {
      console.error('Ошибка загрузки видео:', e);
      // Можно добавить повторную попытку загрузки
      if (video.dataset.src && !video.src) {
        setTimeout(() => {
          lazyLoadVideo(video);
        }, 1000);
      }
    });
  });

  // Для iOS: обработка события ориентации экрана для обновления размеров
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      videos.forEach(updateVideoSizing);
    }, 300);
  });
});

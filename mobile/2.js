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

    if (!video || !playPauseButton) return;

    // Обработчик нажатия на кнопку play/pause
    playPauseButton.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(err => console.error("Ошибка воспроизведения:", err));
        playPauseButton.innerHTML = '';
      } else {
        video.pause();
        playPauseButton.innerHTML = '';
      }
    });

    // Предотвращаем переход в полноэкранный режим (особенно на iPhone)
    video.addEventListener('webkitbeginfullscreen', (event) => {
      // Выход из полноэкранного режима сразу после его начала
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
});

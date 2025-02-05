// Javascript (добавлена реализация lazy loading)
document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".portfolio-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");
  const scrollbarContainer = document.querySelector(".scrollbar-container");
  const images = document.querySelectorAll('.portfolio-item img'); // Получаем все изображения

  let isDraggingScrollbar = false; // Контролируем состояние ползунка
  let isDraggingContainer = false; // Контролируем состояние области прокрутки
  let startX, scrollLeft, lastPosition, velocity = 0, animationFrameId;

  // Функция для загрузки изображения
  const lazyLoad = (image) => {
    image.onload = () => {
      image.classList.add('loaded');
    };
    image.src = image.dataset.src; // Заменяем src
  };

  // Обновление положения ползунка
  function updateScrollbarThumb() {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPercentage = scrollContainer.scrollLeft / maxScroll || 0;
    const thumbPosition =
      scrollPercentage * (scrollbar.offsetWidth - scrollbarThumb.offsetWidth);
    scrollbarThumb.style.left = `${thumbPosition}px`;
  }

  // Анимация инерции
  function animateScroll() {
    if (Math.abs(velocity) > 0.1) {
      scrollContainer.scrollLeft += velocity;
      velocity *= 0.95; // Затухание скорости
      updateScrollbarThumb();
      animationFrameId = requestAnimationFrame(animateScroll);
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  }

  // Перетаскивание ползунка
  scrollbarThumb.addEventListener("mousedown", (e) => {
    isDraggingScrollbar = true;
    startX = e.pageX - scrollbarThumb.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    cancelAnimationFrame(animationFrameId); // Остановим инерцию

    const onMouseMove = (evt) => {
      const x = evt.pageX - scrollbar.offsetLeft;
      const thumbPosition = x - startX;
      const maxThumbPosition =
        scrollbar.offsetWidth - scrollbarThumb.offsetWidth;
      const newThumbPosition = Math.max(
        0,
        Math.min(maxThumbPosition, thumbPosition)
      );

      scrollbarThumb.style.left = `${newThumbPosition}px`;

      const scrollPercentage =
        newThumbPosition / (scrollbar.offsetWidth - scrollbarThumb.offsetWidth);
      const maxScroll =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      scrollContainer.scrollLeft = maxScroll * scrollPercentage;
    };

    const onMouseUp = () => {
      isDraggingScrollbar = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // Перетаскивание фотографий (drag-to-scroll)
  scrollContainer.addEventListener("mousedown", (e) => {
    isDraggingContainer = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    cancelAnimationFrame(animationFrameId); // Остановим инерцию
  });

  scrollContainer.addEventListener("mousemove", (e) => {
    if (!isDraggingContainer) return;
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5; // Скорость прокрутки мышью
    scrollContainer.scrollLeft = scrollLeft - walk;
    updateScrollbarThumb();
  });

  scrollContainer.addEventListener("mouseup", () => {
    if (isDraggingContainer) {
      isDraggingContainer = false;
      animateScroll(); // Запускаем инерцию
    }
  });

  scrollContainer.addEventListener("mouseleave", () => {
    if (isDraggingContainer) {
      isDraggingContainer = false;
      animateScroll();
    }
  });

  // Прокрутка колесом мыши
  scrollContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    const delta = evt.deltaY || evt.deltaX; // Горизонтальная прокрутка
    velocity = delta * 0.2; // Скорость инерции
    cancelAnimationFrame(animationFrameId); // Остановим предыдущую инерцию
    animateScroll();
  });

  // При изменении размера окна
  window.addEventListener("resize", updateScrollbarThumb);

  // Инициализация lazy loading
    images.forEach(image => {
        image.dataset.src = image.src; // Сохраняем исходный src в data-src
        image.src = ""; // Очищаем src, чтобы предотвратить загрузку до инициализации lazy loading
        lazyLoad(image);
    });

  updateScrollbarThumb();
});

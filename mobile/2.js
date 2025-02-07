document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".portfolio-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");
  const scrollbarContainer = document.querySelector(".scrollbar-container");

  let autoScrollInterval; // Переменная для хранения интервала авто-скролла
  let scrollStep = 1; // Направление скролла (1 — вправо, -1 — влево)

  // Функция для плавного автоматического горизонтального скроллинга
  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      // Проверяем, достигнут ли конец или начало контейнера
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        scrollStep = -1; // Меняем направление на влево
      } else if (scrollContainer.scrollLeft <= 0) {
        scrollStep = 1; // Меняем направление на вправо
      }

      // Сдвигаем прокрутку в текущем направлении
      scrollContainer.scrollLeft += scrollStep;
    }, 20); // Чем больше значение, тем медленнее будет прокручиваться
  }

  // Функция для остановки авто-скролла
  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Запуск авто-скролла при загрузке страницы
  startAutoScroll();

  // Остановка авто-скролла на клик или тап (мышь/тач-скрин)
  scrollContainer.addEventListener("click", stopAutoScroll);
  scrollContainer.addEventListener("touchstart", stopAutoScroll);

  // Обновление положения ползунка
  function updateScrollbarThumb() {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPercentage = scrollContainer.scrollLeft / maxScroll || 0;
    const thumbPosition =
      scrollPercentage * (scrollbar.offsetWidth - scrollbarThumb.offsetWidth);
    scrollbarThumb.style.left = `${thumbPosition}px`;
  }

  // Добавляем событие scroll для обновления положения ползунка
  scrollContainer.addEventListener("scroll", updateScrollbarThumb);

  // Добавляем сохранение и восстановление положения прокрутки
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
  });

  const savedScrollPosition = localStorage.getItem("scrollPosition");
  if (savedScrollPosition) {
    scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
    localStorage.removeItem("scrollPosition");
  }
});

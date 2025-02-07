document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".portfolio-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");

  // Функция для обновления положения ползунка
  function updateScrollbarThumb() {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPercentage = scrollContainer.scrollLeft / maxScroll;
    const thumbPosition =
      scrollPercentage * (scrollbar.offsetWidth - scrollbarThumb.offsetWidth);
    scrollbarThumb.style.left = `${thumbPosition}px`;
  }

  // Добавляем событие scroll для обновления положения ползунка
  scrollContainer.addEventListener("scroll", updateScrollbarThumb);

  // Сохраняем и восстанавливаем позицию прокрутки при перезагрузке страницы
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
  });
  const savedScrollPosition = localStorage.getItem("scrollPosition");
  if (savedScrollPosition) {
    scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
    localStorage.removeItem("scrollPosition");
  }
});

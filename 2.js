document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".portfolio-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

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

  // Унифицированный обработчик для событий колесика мыши
  function handleMouseWheel(e) {
    e = e || window.event; // для поддержки старых браузеров
    // Определяем значение дельты. wheelDelta используется для событий mousewheel, а deltaY для wheel
    const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY || -e.detail;

    // Предотвращаем стандартное поведение
    e.preventDefault();

    // Инвертируем значение, если используется wheelDelta (обычно положительное значение прокручивает вверх)
    // Применяем смещение к scrollLeft. Если значение окажется некорректным на конкретном устройстве, можно добавить условие.
    scrollContainer.scrollLeft -= delta;

    // Обновляем положение ползунка после прокрутки
    updateScrollbarThumb();
  }

  // Добавляем основное событие "wheel" с опцией passive: false
  scrollContainer.addEventListener("wheel", handleMouseWheel, { passive: false });
  // Добавляем альтернативные обработчики для совместимости с различными браузерами
  scrollContainer.addEventListener("mousewheel", handleMouseWheel, { passive: false });
  scrollContainer.addEventListener("DOMMouseScroll", handleMouseWheel, { passive: false });

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
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".gallery-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Коэффициент для регулировки скорости скроллинга
  const scrollSpeedMultiplier = 7;

  // Переменная для "целевого" значения scrollLeft
  let targetScrollLeft = scrollContainer.scrollLeft;
  // Идентификатор для requestAnimationFrame, чтобы сбрасывать предыдущую анимацию
  let animationFrameId = null;

  // Функция для обновления размера и положения ползунка скроллбара
  function updateScrollbarThumb() {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;
    // Расчет ширины ползунка пропорционально видимой области
    const thumbWidth =
      (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
    scrollbarThumb.style.width = thumbWidth + "px";
    const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
    const thumbLeft = scrollPercentage * maxThumbLeft;
    scrollbarThumb.style.left = thumbLeft + "px";
  }

  // Функция плавной анимации скролла
  function animateScroll() {
    const diff = targetScrollLeft - scrollContainer.scrollLeft;
    if (Math.abs(diff) < 2) { // Если разница меньше 2 пикселей, завершаем анимацию
      scrollContainer.scrollLeft = targetScrollLeft;
      updateScrollbarThumb();
      animationFrameId = null;
      return;
    }
    // Более быстрое приближение
    scrollContainer.scrollLeft += diff * 0.01;
    updateScrollbarThumb();
    animationFrameId = requestAnimationFrame(animateScroll);
  }

  // Обработчик для горизонтальной прокрутки колесом мыши (тачпад/мышь)
  scrollContainer.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      let delta = event.deltaY;
      if (event.deltaMode === 1) {
        delta *= 15;
      } else if (event.deltaMode === 2) {
        delta *= scrollContainer.clientHeight;
      }

      // Обновляем целевое значение, сохраняя направление:
      // свайп вниз (delta положительный) → прокрутка вперёд,
      // свайп вверх (delta отрицательный) → прокрутка назад
      targetScrollLeft = Math.max(
        0,
        Math.min(maxScroll, targetScrollLeft + delta * scrollSpeedMultiplier)
      );

      // Если уже есть запущенная анимация – отменяем её, чтобы не накапливались кадры
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    },
    { passive: false }
  );

  // Реализация перетаскивания (drag) кастомного ползунка
  let isDragging = false;
  let startX;
  let startScrollLeft;

  scrollbarThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startScrollLeft = scrollContainer.scrollLeft;
    scrollbarThumb.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const thumbWidth = scrollbarThumb.offsetWidth;
    const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
    const scrollRatio =
      (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;
    targetScrollLeft = startScrollLeft + dx * scrollRatio;
    targetScrollLeft = Math.max(
      0,
      Math.min(scrollContainer.scrollWidth - scrollContainer.clientWidth, targetScrollLeft)
    );
    scrollContainer.scrollLeft = targetScrollLeft;
    updateScrollbarThumb();
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      scrollbarThumb.style.cursor = "grab";
      document.body.style.userSelect = "auto";
    }
  });

  // Сохранение позиции прокрутки галереи при перезагрузке страницы
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
  });

  // Восстановление позиции прокрутки и обновление скроллбара
  const savedScrollPosition = localStorage.getItem("scrollPosition");
  if (savedScrollPosition) {
    scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
    targetScrollLeft = scrollContainer.scrollLeft;
    localStorage.removeItem("scrollPosition");
  }

  // Ожидание полной загрузки DOM и изображений
  window.addEventListener("load", () => {
    // Обновление скроллбара после полной загрузки страницы
    updateScrollbarThumb();
  });

  // Открытие модального окна контактов
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  // Закрытие модального окна контактов при клике на крестик
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

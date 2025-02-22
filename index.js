document.addEventListener("DOMContentLoaded", () => {
    const scrollContainer = document.querySelector(".gallery-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Функция для обновления размера и положения ползунка скроллбара
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;
        // Ширина ползунка рассчитывается пропорционально видимой области
        const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
        scrollbarThumb.style.width = thumbWidth + "px";
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const thumbLeft = scrollPercentage * maxThumbLeft;
        scrollbarThumb.style.left = thumbLeft + "px";
    }

    // Обновление ползунка при прокрутке галереи (при прямом изменении scrollLeft)
    scrollContainer.addEventListener("scroll", updateScrollbarThumb);

    // Убираем инерционность: обновляем scrollLeft мгновенно при прокрутке колесиком мыши
    scrollContainer.addEventListener("wheel", (event) => {
        event.preventDefault();
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Вычисляем новое значение scrollLeft
        let newScrollLeft = scrollContainer.scrollLeft + event.deltaY;
        // Ограничиваем значение в пределах допустимого
        newScrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));
        scrollContainer.scrollLeft = newScrollLeft;
        updateScrollbarThumb();
    }, { passive: false });

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
        // Рассчитываем соотношение перемещения
        const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;
        scrollContainer.scrollLeft = startScrollLeft + dx * scrollRatio;
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
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
        localStorage.removeItem("scrollPosition");
    }

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

    // Первоначальное обновление положения скроллбара при загрузке страницы
    updateScrollbarThumb();
});

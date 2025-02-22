document.addEventListener("DOMContentLoaded", () => {
    const scrollContainer = document.querySelector(".gallery-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Переменные для плавной анимации прокрутки
    let targetScrollLeft = scrollContainer.scrollLeft;
    let isAnimating = false;

    // Функция для обновления размера и положения ползунка скроллбара
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        // Если максимальное прокручивание равно нулю,
        // чтобы избежать деления на ноль
        const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;

        // Рассчитываем ширину ползунка пропорционально видимой области
        const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
        scrollbarThumb.style.width = thumbWidth + "px";

        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const thumbLeft = scrollPercentage * maxThumbLeft;
        scrollbarThumb.style.left = thumbLeft + "px";
    }

    // Анимация плавной прокрутки
    function animateScroll() {
        const currentScrollLeft = scrollContainer.scrollLeft;
        const diff = targetScrollLeft - currentScrollLeft;

        // Если разница настолько мала, что дальнейшая анимация не требуется
        if (Math.abs(diff) < 0.5) {
            scrollContainer.scrollLeft = targetScrollLeft;
            updateScrollbarThumb();
            isAnimating = false;
            return;
        }

        // Коэффициент сглаживания (чем меньше, тем медленнее приближение)
        scrollContainer.scrollLeft = currentScrollLeft + diff * 0.1;
        updateScrollbarThumb();
        requestAnimationFrame(animateScroll);
    }

    // Обновление ползунка при прокрутке галереи (при прямом изменении scrollLeft)
    scrollContainer.addEventListener("scroll", updateScrollbarThumb);

    // Перенаправляем вертикальное колесико мыши в горизонтальное перемещение с плавной анимацией
    scrollContainer.addEventListener("wheel", (event) => {
        event.preventDefault();
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Обновляем целевое значение прокрутки с учетом текущего смещения
        targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + event.deltaY));
        // Если анимация не запущена, запускаем её
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animateScroll);
        }
    }, { passive: false });

    // Реализация перетаскивания (drag) кастомного ползунка
    let isDragging = false;
    let startX;
    let startScrollLeft;

    // При нажатии на ползунок запускаем отслеживание мыши
    scrollbarThumb.addEventListener("mousedown", (e) => {
        isDragging = true;
        // Фиксируем стартовую координату по оси X
        startX = e.clientX;
        // Запоминаем текущую позицию горизонтальной прокрутки
        startScrollLeft = scrollContainer.scrollLeft;
        // Обновляем вид курсора для лучшей UX
        scrollbarThumb.style.cursor = "grabbing";
        // Отключаем выделение текста для более гладкого перетаскивания
        document.body.style.userSelect = "none";
    });

    // При движении мыши, если нажата кнопка, пересчитываем позицию прокрутки
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        // Рассчитываем соотношение перемещения:
        // отношение полной прокрутки галереи (scrollWidth - clientWidth)
        // к максимально возможному перемещению ползунка
        const thumbWidth = scrollbarThumb.offsetWidth;
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;
        scrollContainer.scrollLeft = startScrollLeft + dx * scrollRatio;
        updateScrollbarThumb();
    });

    // Завершаем перетаскивание при отпускании кнопки мыши
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            scrollbarThumb.style.cursor = "grab";
            document.body.style.userSelect = "auto";
            // Обновляем целевое значение после перетаскивания, чтобы не было резких скачков
            targetScrollLeft = scrollContainer.scrollLeft;
        }
    });

    // Сохранение позиции прокрутки галереи при перезагрузке страницы
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
    });
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
        targetScrollLeft = scrollContainer.scrollLeft;
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

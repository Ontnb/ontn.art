document.addEventListener("DOMContentLoaded", () => {
    // Получаем необходимые DOM-элементы:
    const scrollContainer = document.querySelector(".gallery-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Целевая позиция горизонтальной прокрутки для анимации
    let targetScrollLeft = scrollContainer.scrollLeft;
    let isAnimating = false;

    // Коэффициент сглаживания для анимации прокрутки (чем больше значение, тем быстрее анимация)
    const SMOOTHING = 0.15; // Подбирайте это значение экспериментально

    // Функция для обновления размеров и позиции кастомного ползунка скроллбара
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Если maxScroll равен 0, то scrollPercentage будет 0 (без деления на ноль)
        const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;

        // Вычисляем ширину бегунка пропорционально видимой области галереи
        const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
        scrollbarThumb.style.width = thumbWidth + "px";

        // Вычисляем максимальное смещение бегунка по горизонтали
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const thumbLeft = scrollPercentage * maxThumbLeft;
        scrollbarThumb.style.left = thumbLeft + "px";
    }

    // Функция для плавной анимации прокрутки
    function animateScroll() {
        const currentScrollLeft = scrollContainer.scrollLeft;
        const diff = targetScrollLeft - currentScrollLeft;

        // Если разница становится очень маленькой – завершаем анимацию
        if (Math.abs(diff) < 0.5) {
            scrollContainer.scrollLeft = targetScrollLeft;
            updateScrollbarThumb();
            isAnimating = false;
            return;
        }

        // Плавное приближение: увеличиваем текущую позицию на часть разницы
        scrollContainer.scrollLeft = currentScrollLeft + diff * SMOOTHING;
        updateScrollbarThumb();
        requestAnimationFrame(animateScroll);
    }

    // Обновляем положение и размер бегунка всякий раз, когда меняется scrollLeft
    scrollContainer.addEventListener("scroll", updateScrollbarThumb);

    // Обработка события прокрутки колёсиком мыши
    scrollContainer.addEventListener("wheel", (event) => {
        // Отменяем стандартное вертикальное поведение
        event.preventDefault();

        let scrollDelta = event.deltaY; // Базовое значение прокрутки

        // Нормализуем значение deltaY в зависимости от режима прокрутки (пиксели, строки или страницы)
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            scrollDelta *= 20; // Подобранный коэффициент для строкового режима
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            scrollDelta *= scrollContainer.clientWidth; // Если страница – используем ширину контейнера
        }

        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Обновляем целевую позицию, ограничивая её диапазоном [0, maxScroll]
        targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + scrollDelta));

        // Если анимация не запущена, запускаем её
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animateScroll);
        }
    }, { passive: false });

    // Реализация перетаскивания кастомного ползунка
    let isDragging = false;
    let startX;
    let startScrollLeft;

    // При нажатии на ползунок начинаем drag
    scrollbarThumb.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX; // Запоминаем курсор в момент начала перетаскивания
        startScrollLeft = scrollContainer.scrollLeft; // Записываем текущую позицию прокрутки
        scrollbarThumb.style.cursor = "grabbing"; // Изменяем курсор для лучшей UX
        document.body.style.userSelect = "none"; // Отключаем выделение текста
    });

    // При движении мыши рассчитываем смещение и обновляем позицию прокрутки
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;

        // Вычисляем коэффициент пропорциональности между перемещением бегунка и прокруткой содержимого
        const thumbWidth = scrollbarThumb.offsetWidth;
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;

        // Обновляем позицию прокрутки на основании смещения курсора
        scrollContainer.scrollLeft = startScrollLeft + dx * scrollRatio;
        updateScrollbarThumb();

        // Обновляем targetScrollLeft, чтобы избежать скачков после завершения перетаскивания
        targetScrollLeft = scrollContainer.scrollLeft;
    });

    // Завершаем операцию drag при отпускании кнопки мыши
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            scrollbarThumb.style.cursor = "grab";
            document.body.style.userSelect = "auto";
            // Обновляем targetScrollLeft, чтобы синхронизировать с текущей позицией скролла
            targetScrollLeft = scrollContainer.scrollLeft;
        }
    });

    // Сохраняем позицию прокрутки галереи перед перезагрузкой страницы
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
    });
    // При загрузке проверяем, сохранялась ли позиция прокрутки
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
        targetScrollLeft = scrollContainer.scrollLeft;
        localStorage.removeItem("scrollPosition");
    }

    // Открытие модального окна контактов по клику на кнопку
    openContactsButton.addEventListener("click", () => {
        contactsModal.style.display = "flex";
    });

    // Закрытие модального окна при клике на крестик
    closeButton.addEventListener("click", () => {
        contactsModal.style.display = "none";
    });

    // Закрытие модального окна при клике вне его области
    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
        }
    });

    // Инициализируем положение ползунка при загрузке страницы
    updateScrollbarThumb();
});

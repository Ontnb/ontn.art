document.addEventListener("DOMContentLoaded", () => {
    // Основные DOM-элементы
    const scrollContainer = document.querySelector(".gallery-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Целевая позиция прокрутки для анимации
    let targetScrollLeft = scrollContainer.scrollLeft;
    let isAnimating = false;
    let animationFrameId = null; // ID для текущего requestAnimationFrame

    // Коэффициент сглаживания (подберите под конкретное устройство)
    const SMOOTHING = 0.15;

    // Таймер для сброса inertia при прокрутке колесом мыши
    let wheelTimeout;

    // Функция обновления размеров и положения бегунка скроллбара
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Предотвращаем деление на ноль
        const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;
        // Ширина бегунка пропорциональна видимой области
        const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
        scrollbarThumb.style.width = thumbWidth + "px";

        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const thumbLeft = scrollPercentage * maxThumbLeft;
        scrollbarThumb.style.left = thumbLeft + "px";
    }

    // Анимация плавного скроллинга
    function animateScroll() {
        const currentScrollLeft = scrollContainer.scrollLeft;
        const diff = targetScrollLeft - currentScrollLeft;

        // Если разница стала очень малой – прекращаем анимацию
        if (Math.abs(diff) < 0.5) {
            scrollContainer.scrollLeft = targetScrollLeft;
            updateScrollbarThumb();
            isAnimating = false;
            animationFrameId = null;
            return;
        }

        // Плавное приближение: прибавляем часть разницы
        scrollContainer.scrollLeft = currentScrollLeft + diff * SMOOTHING;
        updateScrollbarThumb();
        animationFrameId = requestAnimationFrame(animateScroll);
    }

    // Обновляем положение бегунка при любом изменении scrollLeft
    scrollContainer.addEventListener("scroll", updateScrollbarThumb);
    // Обработка прокрутки колесом мыши с нормализацией и сбросом inertia
    scrollContainer.addEventListener(
        "wheel",
        (event) => {
            event.preventDefault(); // Отменяем вертикальный скроллинг

            // Сбрасываем предыдущий таймер, если он ещё активен
            clearTimeout(wheelTimeout);

            let scrollDelta = event.deltaY; // Начальное значение прокрутки

            // Нормализация в зависимости от режима прокрутки
            if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
                scrollDelta *= 20;
            } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
                scrollDelta *= scrollContainer.clientWidth;
            }

            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            // Обновляем целевую позицию с учетом границ
            targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + scrollDelta));

            // Если анимация ещё не запущена — запускаем её
            if (!isAnimating) {
                isAnimating = true;
                animationFrameId = requestAnimationFrame(animateScroll);
            }

            /* 
               Устанавливаем таймер, который через 60 мс (можно экспериментировать с этим значением)
               сбросит targetScrollLeft на текущую позицию, если дополнительных wheel-событий не будет.
               Это помогает остановить "залипание" инерции.
            */
            wheelTimeout = setTimeout(() => {
                targetScrollLeft = scrollContainer.scrollLeft;
            }, 60);
        },
        { passive: false }
    );

    // Реализация перетаскивания (drag) ползунка скроллбара
    let isDragging = false;
    let startX;
    let startScrollLeft;

    // При нажатии на бегунок – запускаем drag
    scrollbarThumb.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = scrollContainer.scrollLeft;
        scrollbarThumb.style.cursor = "grabbing";
        document.body.style.userSelect = "none";

        // Если идёт анимация скроллинга, отменяем её для немедленного отклика
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            isAnimating = false;
        }
    });

    // При перемещении мыши – изменяем scroll в соответствии с движением курсора
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;

        // Расчёт пропорциональности перемещения:
        const thumbWidth = scrollbarThumb.offsetWidth;
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;

        // Сразу обновляем позицию содержимого без дополнительной анимации
        scrollContainer.scrollLeft = startScrollLeft + dx * scrollRatio;
        updateScrollbarThumb();

        // Синхронизируем targetScrollLeft с установленной позицией
        targetScrollLeft = scrollContainer.scrollLeft;
    });

    // Завершаем процесс drag при отпускании кнопки мыши
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            scrollbarThumb.style.cursor = "grab";
            document.body.style.userSelect = "auto";
            targetScrollLeft = scrollContainer.scrollLeft;
        }
    });

    // Сохранение позиции прокрутки перед перезагрузкой страницы
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

    // Закрытие модального окна при клике вне его области
    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
        }
    });

    // Первоначальное обновление положения бегунка при загрузке страницы
    updateScrollbarThumb();
});

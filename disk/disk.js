document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = document.querySelectorAll(".portfolio-item img");
    const fullscreenOverlay = document.getElementById("fullscreen-overlay");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const closeButton = document.getElementById("close-button");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const modalCloseButton = document.querySelector(".close-button");
    const downloadAllButton = document.getElementById("download-all");
    
    let scale = 1;               // Текущий масштаб изображения
    let currentIndex = 0;        // Индекс текущей картинки
    let touchStartX = 0;         // Начальная координата X для свайпа
    let touchDeltaX = 0;         // Разница позиции по X при свайпе
    
    // Переменные для pinch-to-zoom
    let initialPinchDistance = 0;
    let initialScale = 1;
    let isPinching = false;
    
    // Функция для сброса зума (при смене картинки)
    function resetZoom() {
        scale = 1;
        fullscreenImage.style.transform = `scale(${scale})`;
        fullscreenImage.classList.remove("zoomed");
    }
    
    // Функции для переключения картинок (анимация fade-out добавлена для плавности)
    function showImage(index) {
        // Зацикливаем навигацию по кругу
        if (index < 0) {
            currentIndex = portfolioItems.length - 1;
        } else if (index >= portfolioItems.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        // Плавная смена изображения
        fullscreenImage.classList.add("fade-out");
        setTimeout(() => {
            fullscreenImage.src = portfolioItems[currentIndex].src;
            fullscreenImage.classList.remove("fade-out");
            resetZoom();
        }, 300);
    }
    
    function showNextImage() {
        showImage(currentIndex + 1);
    }
    
    function showPrevImage() {
        showImage(currentIndex - 1);
    }
    
    // Функция для показа полноэкранного режима
    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;
        resetZoom();
        fullscreenOverlay.classList.add("open");
        fullscreenOverlay.style.display = "flex";
        
        // Добавляем обработчики для клавиатуры и касаний
        document.addEventListener('keydown', handleKeyboardNavigation);
        fullscreenOverlay.addEventListener("touchstart", handleTouchStart, {passive: false});
        fullscreenOverlay.addEventListener("touchmove", handleTouchMove, {passive: false});
        fullscreenOverlay.addEventListener("touchend", handleTouchEnd, {passive: false});
    }
    
    function hideFullscreen() {
        fullscreenOverlay.classList.remove("open");
        setTimeout(() => {
            fullscreenOverlay.style.display = "none";
        }, 300);
        
        // Убираем обработчики, когда полноэкранное окно закрыто
        document.removeEventListener('keydown', handleKeyboardNavigation);
        fullscreenOverlay.removeEventListener("touchstart", handleTouchStart);
        fullscreenOverlay.removeEventListener("touchmove", handleTouchMove);
        fullscreenOverlay.removeEventListener("touchend", handleTouchEnd);
    }
    
    // Обработка клавиатуры: Escape, стрелки влево и вправо
    function handleKeyboardNavigation(event) {
        switch (event.key) {
            case 'Escape':
                hideFullscreen();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            default:
                break;
        }
    }
    
    // Подключаем обработчик клика для каждой миниатюры
    portfolioItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            showFullscreen(index);
        });
    });
    
    closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        hideFullscreen();
    });
    
    fullscreenOverlay.addEventListener("click", (event) => {
        // Если клик вне изображения – закрываем полноэкранный режим
        if (event.target === fullscreenOverlay) {
            hideFullscreen();
        }
    });
    
    // ========================= Download All functionality =========================
    downloadAllButton.addEventListener("click", async () => {
        const zip = new JSZip();
        downloadAllButton.textContent = "Downloading...";
        downloadAllButton.disabled = true;
        try {
            for (let i = 0; i < portfolioItems.length; i++) {
                const img = portfolioItems[i];
                const url = img.src;
                let filename = img.alt || `image_${i + 1}`;
                const fileExtension = url.substring(url.lastIndexOf('.'));
                filename += fileExtension;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${url}`);
                }
                const blob = await response.blob();
                zip.file(filename, blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(zipBlob);
            a.download = 'images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } catch (error) {
            console.error("Error downloading images:", error);
            alert("An error occurred while downloading the images. Please try again.");
        } finally {
            downloadAllButton.textContent = "Download All";
            downloadAllButton.disabled = false;
        }
    });
    // ========================= End of Download All functionality =========================
    
    // ========================= Touch Events (Свайп и Pinch-to-Zoom) =========================
    
    function getDistance(touch1, touch2) {
        const dx = touch2.pageX - touch1.pageX;
        const dy = touch2.pageY - touch1.pageY;
        return Math.hypot(dx, dy);
    }
    
    function handleTouchStart(event) {
        if (event.touches.length === 1) {
            // Один палец – для свайпа
            touchStartX = event.touches[0].pageX;
        } else if (event.touches.length === 2) {
            // Два пальца – начинаем pinch-to-zoom
            isPinching = true;
            initialPinchDistance = getDistance(event.touches[0], event.touches[1]);
            initialScale = scale;
        }
    }
    
    function handleTouchMove(event) {
        if (isPinching && event.touches.length === 2) {
            // Pinch-to-Zoom
            event.preventDefault(); // Отключаем стандартный зум браузера
            const currentDistance = getDistance(event.touches[0], event.touches[1]);
            let newScale = initialScale * (currentDistance / initialPinchDistance);
            // ограничиваем масштаб: минимально 1 (без зума) и максимально – 3, например
            newScale = Math.max(1, Math.min(newScale, 3));
            scale = newScale;
            fullscreenImage.style.transform = `scale(${scale})`;
        } else if (!isPinching && event.touches.length === 1) {
            // Если не pinch, то обрабатываем свайп (можно использовать для горизонтального перемещения)
            // Отмена дефолтного поведения может быть полезна для предотвращения скроллинга
            event.preventDefault();
            const touchCurrentX = event.touches[0].pageX;
            touchDeltaX = touchCurrentX - touchStartX;
        }
    }
    
    function handleTouchEnd(event) {
        if (isPinching) {
            // Если заканчивается pinch, сбрасываем флаг
            if (event.touches.length < 2) {
                isPinching = false;
            }
        } else {
            // Если свайп завершился, проверяем дистанцию перемещения по оси X
            // Если перемещение существенно (например, >50px) – считаем это свайпом
            if (Math.abs(touchDeltaX) > 50) {
                if (touchDeltaX < 0) {
                    // Свайп влево – следующая картинка
                    showNextImage();
                } else {
                    // Свайп вправо – предыдущая картинка
                    showPrevImage();
                }
            }
            // Сбрасываем величину смещения
            touchDeltaX = 0;
        }
    }
    // ========================= End of Touch Events =========================
});

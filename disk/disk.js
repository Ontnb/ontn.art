document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = document.querySelectorAll(".portfolio-item img");
    const fullscreenOverlay = document.getElementById("fullscreen-overlay");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const closeButton = document.getElementById("close-button");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const modalCloseButton = document.querySelector(".close-button");
    const downloadAllButton = document.getElementById("download-all");
    let scale = 1; // Начальный масштаб
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let currentIndex = 0; // Текущий индекс фото
    let touchStartX = 0; // Начальная позиция касания по X

    // Показываем выбранное фото в полноэкранном режиме
    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;
        scale = 1; // Сброс масштаба
        fullscreenImage.style.transform = `scale(${scale})`;
        fullscreenImage.classList.remove("zoomed");
        startX = 0;
        startY = 0;
        fullscreenOverlay.classList.add("open");
        fullscreenOverlay.style.display = "flex";
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    function hideFullscreen() {
        fullscreenOverlay.classList.remove("open");
        setTimeout(() => {
            fullscreenOverlay.style.display = "none";
        }, 300);
        document.removeEventListener('keydown', handleKeyboardNavigation);
    }

    // Обработчик клавиатуры. Оставляем только кнопку Esc для выхода.
    function handleKeyboardNavigation(event) {
        if (event.key === 'Escape') {
            hideFullscreen();
        }
    }

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
        if (event.target === fullscreenOverlay) {
            hideFullscreen();
        }
    });

    // Обработчики для свайпа
    fullscreenImage.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    fullscreenImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const touchEndX = e.touches[0].clientX;
            const deltaX = touchEndX - touchStartX;

            // Если свайп влево или вправо
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Свайп вправо - предыдущее фото
                    showPreviousImage();
                } else {
                    // Свайп влево - следующее фото
                    showNextImage();
                }
                touchStartX = touchEndX;
            }
        }
    });

    fullscreenImage.addEventListener('touchend', (e) => {
        // Сброс начальной позиции касания
        touchStartX = 0;
    });

    function showPreviousImage() {
        if (currentIndex > 0) {
            currentIndex--;
            fullscreenImage.src = portfolioItems[currentIndex].src;
        }
    }

    function showNextImage() {
        if (currentIndex < portfolioItems.length - 1) {
            currentIndex++;
            fullscreenImage.src = portfolioItems[currentIndex].src;
        }
    }

    // ========================= Zoom functionality =========================

    fullscreenImage.addEventListener('wheel', (e) => {
        e.preventDefault();  // Отключаем стандартную прокрутку
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        scale = Math.max(1, Math.min(3, scale + delta));
        fullscreenImage.style.transform = `scale(${scale})`;

        if (scale > 1) {
            fullscreenImage.classList.add("zoomed");
        } else {
            fullscreenImage.classList.remove("zoomed");
            startX = 0;
            startY = 0;
            fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
        }
    });

    fullscreenImage.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            fullscreenImage.style.cursor = 'grabbing';
        }
    });

    fullscreenImage.addEventListener('mouseup', () => {
        isDragging = false;
        fullscreenImage.style.cursor = 'grab';
    });

    fullscreenImage.addEventListener('mouseleave', () => {
        isDragging = false;
        fullscreenImage.style.cursor = 'grab';
    });

    fullscreenImage.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX;
        const y = e.clientY;
        const dx = x - startX;
        const dy = y - startY;
        startX = x;
        startY = y;
        // Извлекаем текущий translate
        const transform = fullscreenImage.style.transform;
        const translateValues = transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        if (translateValues) {
            currentTranslateX = parseInt(translateValues[1]);
            currentTranslateY = parseInt(translateValues[2]);
        }
        const newTranslateX = currentTranslateX + dx;
        const newTranslateY = currentTranslateY + dy;
        fullscreenImage.style.transform = `scale(${scale}) translate(${newTranslateX}px, ${newTranslateY}px)`;
    });

    fullscreenImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) { // Multi-touch для зума
            let x1 = e.touches[0].clientX;
            let y1 = e.touches[0].clientY;
            let x2 = e.touches[1].clientX;
            let y2 = e.touches[1].clientY;
            let initialDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            let initialScale = scale;
            fullscreenImage.addEventListener('touchmove', handlePinchZoom);
            fullscreenImage.addEventListener('touchend', handlePinchZoomEnd);

            function handlePinchZoom(e) {
                if (e.touches.length !== 2) return;
                let x1 = e.touches[0].clientX;
                let y1 = e.touches[0].clientY;
                let x2 = e.touches[1].clientX;
                let y2 = e.touches[1].clientY;
                let currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                scale = initialScale + (currentDistance - initialDistance) * 0.01;
                scale = Math.max(1, Math.min(3, scale));
                fullscreenImage.style.transform = `scale(${scale})`;
            }

            function handlePinchZoomEnd() {
                fullscreenImage.removeEventListener('touchmove', handlePinchZoom);
                fullscreenImage.removeEventListener('touchend', handlePinchZoomEnd);
            }
        } else {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    });

    fullscreenImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && scale > 1 && isDragging) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            const dx = x - startX;
            const dy = y - startY;
            startX = x;
            startY = y;
            const transform = fullscreenImage.style.transform;
            const translateValues = transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
            let currentTranslateX = 0;
            let currentTranslateY = 0;
            if (translateValues) {
                currentTranslateX = parseInt(translateValues[1]);
                currentTranslateY = parseInt(translateValues[2]);
            }
            const newTranslateX = currentTranslateX + dx;
            const newTranslateY = currentTranslateY + dy;
            fullscreenImage.style.transform = `scale(${scale}) translate(${newTranslateX}px, ${newTranslateY}px)`;
        }
    });

    fullscreenImage.addEventListener('touchend', (e) => {
        isDragging = false;
    });

    // ========================= End of Zoom functionality =========================

    // Модальное окно контактов
    openContactsButton.addEventListener("click", () => {
        contactsModal.style.display = "flex";
    });

    modalCloseButton.addEventListener("click", () => {
        contactsModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
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
});

document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = document.querySelectorAll(".portfolio-item img");
    const fullscreenOverlay = document.getElementById("fullscreen-overlay");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const closeButton = document.getElementById("close-button");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const modalCloseButton = document.querySelector(".close-button");
    const downloadAllButton = document.getElementById("download-all");
    let currentIndex = 0;
    let isZoomed = false;

    // Показываем выбранное фото в полноэкранном режиме
    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;
        fullscreenOverlay.classList.add("open");
        fullscreenOverlay.style.display = "flex";
        document.addEventListener('keydown', handleKeyboardNavigation);
        initHammer(); // Инициализируем Hammer.js для жестов
    }

    function hideFullscreen() {
        fullscreenOverlay.classList.remove("open");
        setTimeout(() => {
            fullscreenOverlay.style.display = "none";
        }, 300);
        document.removeEventListener('keydown', handleKeyboardNavigation);
    }

    function handleKeyboardNavigation(event) {
        if (event.key === 'Escape') {
            hideFullscreen();
        } else if (event.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (event.key === 'ArrowRight') {
            showNextImage();
        }
    }

    function showPreviousImage() {
        currentIndex = (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
        fullscreenImage.src = portfolioItems[currentIndex].src;
        resetImageTransform(); // Сброс трансформации при смене изображения
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % portfolioItems.length;
        fullscreenImage.src = portfolioItems[currentIndex].src;
        resetImageTransform(); // Сброс трансформации при смене изображения
    }

    function resetImageTransform() {
        fullscreenImage.style.transform = "scale(1) translate(0, 0)";
        isZoomed = false;
    }

    // Инициализация Hammer.js для обработки жестов
    function initHammer() {
        const hammer = new Hammer(fullscreenImage);

        // Обработка свайпа
        hammer.on('swipeleft', () => {
            if (!isZoomed) showNextImage();
        });

        hammer.on('swiperight', () => {
            if (!isZoomed) showPreviousImage();
        });

        // Обработка пинча (зума)
        let initialScale = 1;
        let posX = 0;
        let posY = 0;

        hammer.get('pinch').set({ enable: true });

        hammer.on('pinchstart', (e) => {
            initialScale = parseFloat(fullscreenImage.style.transform.replace(/[^0-9.,]/g, '')) || 1;
        });

        hammer.on('pinchmove', (e) => {
            const newScale = initialScale * e.scale;
            fullscreenImage.style.transform = `scale(${newScale}) translate(${posX}px, ${posY}px)`;
            isZoomed = newScale > 1;
        });

        hammer.on('pinchend', () => {
            if (parseFloat(fullscreenImage.style.transform.replace(/[^0-9.,]/g, '')) < 1) {
                resetImageTransform();
            }
        });

        // Обработка перемещения изображения после зума
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        hammer.on('panstart', () => {
            if (isZoomed) {
                const transform = fullscreenImage.style.transform.match(/translate\(([^,]+), ([^)]+)\)/);
                posX = transform ? parseFloat(transform[1]) : 0;
                posY = transform ? parseFloat(transform[2]) : 0;
            }
        });

        hammer.on('panmove', (e) => {
            if (isZoomed) {
                const newPosX = posX + e.deltaX;
                const newPosY = posY + e.deltaY;
                fullscreenImage.style.transform = `scale(${initialScale}) translate(${newPosX}px, ${newPosY}px)`;
            }
        });
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

    prevButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showPreviousImage();
    });

    nextButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showNextImage();
    });

    // Download All functionality
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
});

document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = document.querySelectorAll(".portfolio-item img");
    const fullscreenOverlay = document.getElementById("fullscreen-overlay");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const closeButton = document.getElementById("close-button");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const modalCloseButton = document.querySelector(".close-button");
    const downloadAllButton = document.getElementById("download-all");
    let currentIndex = 0;
    let touchstartX = 0;
    let touchendX = 0;
    let scale = 1; // Начальный масштаб
    let startX = 0;
    let startY = 0;
    let isDragging = false;
// Где-то в начале скрипта объявляем флаг для pinch-gesture
let isPinching = false;

fullscreenImage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) { // Multi-touch → pinch zoom
        isPinching = true;

        // Отключаем swipe-навигацию
        touchstartX = null;
        touchendX = null;

        // Расчет начального расстояния между пальцами
        const x1 = e.touches[0].clientX;
        const y1 = e.touches[0].clientY;
        const x2 = e.touches[1].clientX;
        const y2 = e.touches[1].clientY;
        const initialDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const initialScale = scale;

        function handlePinchZoom(e) {
            if (e.touches.length !== 2) return;

            const x1 = e.touches[0].clientX;
            const y1 = e.touches[0].clientY;
            const x2 = e.touches[1].clientX;
            const y2 = e.touches[1].clientY;
            const currentDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            
            // Изменяем масштаб пропорционально изменению расстояния
            scale = initialScale + (currentDistance - initialDistance) * 0.01;
            scale = Math.max(1, Math.min(3, scale));

            fullscreenImage.style.transform = `scale(${scale})`;
            if (scale > 1) {
                fullscreenImage.classList.add("zoomed");
            } else {
                fullscreenImage.classList.remove("zoomed");
            }
        }

        function handlePinchZoomEnd(e) {
            // После завершения pinch-gesture сбрасываем флаг
            isPinching = false;
            fullscreenImage.removeEventListener('touchmove', handlePinchZoom);
            fullscreenImage.removeEventListener('touchend', handlePinchZoomEnd);
        }

        fullscreenImage.addEventListener('touchmove', handlePinchZoom);
        fullscreenImage.addEventListener('touchend', handlePinchZoomEnd);
    } else {
        // Один палец – возможен свайп или перетаскивание при зуме
        isPinching = false;
        touchstartX = e.changedTouches[0].screenX;

        if (scale > 1) {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }
});

fullscreenImage.addEventListener('touchend', (e) => {
    isDragging = false;
    // Если выполнялся pinch-gesture, не обрабатываем свайп навигацию
    if (isPinching) return;

    // Если изображение в исходном масштабе и касание завершилось одним пальцем, обрабатываем свайп
    if (scale === 1 && e.changedTouches.length === 1) {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    }
});


    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;
        scale = 1; // Сброс масштаба при открытии нового изображения
        fullscreenImage.style.transform = `scale(${scale})`; // Применяем сброшенный масштаб
        fullscreenImage.classList.remove("zoomed"); // Убираем класс zoomed
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

    function navigate(direction) {
        fullscreenImage.classList.add('fade-out');

        setTimeout(() => {
            currentIndex += direction;
            if (currentIndex < 0) {
                currentIndex = portfolioItems.length - 1;
            } else if (currentIndex >= portfolioItems.length) {
                currentIndex = 0;
            }
            fullscreenImage.src = portfolioItems[currentIndex].src;
            scale = 1; // Сбрасываем масштаб при переходе к следующему изображению
            fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`; //  Сбрасываем translate
            fullscreenImage.classList.remove("zoomed");
            startX = 0;
            startY = 0;
            fullscreenImage.classList.remove('fade-out');
        }, 300);
    }

    function handleKeyboardNavigation(event) {
        if (event.key === 'ArrowLeft') {
            navigate(-1);
        } else if (event.key === 'ArrowRight') {
            navigate(1);
        } else if (event.key === 'Escape') {
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

    prevButton.addEventListener("click", (event) => {
        event.stopPropagation();
        navigate(-1);
    });

    nextButton.addEventListener("click", (event) => {
        event.stopPropagation();
        navigate(1);
    });

    // Swipe functionality
    fullscreenImage.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX
    })

    fullscreenImage.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX
        handleSwipe()
    })

    function handleSwipe() {
        if (touchendX < touchstartX) navigate(1);
        if (touchendX > touchstartX) navigate(-1);
    }

    // ========================= Zoom functionality & Swipe Navigation =========================

fullscreenImage.addEventListener('touchend', (e) => {
    isDragging = false;
    // Если изображение имеет масштаб 1 и касание завершилось одним пальцем,
    // то выполняем навигацию свайпом
    if (scale === 1 && e.changedTouches.length === 1) {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    }
});

    // ========================= End of Zoom functionality =========================

    // Открытие модального окна
    openContactsButton.addEventListener("click", () => {
        contactsModal.style.display = "flex";
    });

    // Закрытие модального окна
    modalCloseButton.addEventListener("click", () => {
        contactsModal.style.display = "none";
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
        }
    });

    // =========================  Download All functionality  =========================
    downloadAllButton.addEventListener("click", async () => {
        // Create a new JSZip instance
        const zip = new JSZip();

        // Show a loading message to the user
        downloadAllButton.textContent = "Downloading...";
        downloadAllButton.disabled = true;

        try {
            // Loop through all images and add them to the zip file
            for (let i = 0; i < portfolioItems.length; i++) {
                const img = portfolioItems[i];
                const url = img.src;
                let filename = img.alt || `image_${i + 1}`; // Имя файла без расширения по умолчанию

                // Extract the file extension from the URL
                const fileExtension = url.substring(url.lastIndexOf('.'));

                // Add the extension to the filename
                filename += fileExtension;


                // Fetch the image as a blob
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${url}`);
                }

                const blob = await response.blob();

                // Add the blob to the zip file
                zip.file(filename, blob);
            }

            // Generate the zip file as a blob
            const zipBlob = await zip.generateAsync({ type: "blob" });

            // Create a download link
            const a = document.createElement('a');
            a.href = URL.createObjectURL(zipBlob);
            a.download = 'images.zip';

            // Trigger the download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);

        } catch (error) {
            console.error("Error downloading images:", error);
            alert("An error occurred while downloading the images. Please try again.");
        } finally {
            // Reset the button text and enable it
            downloadAllButton.textContent = "Download All";
            downloadAllButton.disabled = false;
        }
    });
    // =========================  End of Download All functionality  =========================
});

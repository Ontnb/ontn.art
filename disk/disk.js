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

    // ========================= Zoom functionality =========================

    fullscreenImage.addEventListener('wheel', (e) => {
        e.preventDefault();  // Prevent default scrolling

        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed; // Обратное управление

        scale = Math.max(1, Math.min(3, scale + delta)); // Устанавливаем ограничения масштаба
        fullscreenImage.style.transform = `scale(${scale})`;

        if (scale > 1) {
            fullscreenImage.classList.add("zoomed");
        } else {
            fullscreenImage.classList.remove("zoomed");
            startX = 0;
            startY = 0;
            fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`; //  Сбрасываем translate
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

        const dx = (x - startX);
        const dy = (y - startY);

        startX = x;
        startY = y;

        // Получаем текущее значение translate
        const transform = fullscreenImage.style.transform;
        const translateValues = transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);

        let currentTranslateX = 0;
        let currentTranslateY = 0;

        if (translateValues) {
            currentTranslateX = parseInt(translateValues[1]);
            currentTranslateY = parseInt(translateValues[2]);
        }

        //  Вычисляем новое значение translate
        const newTranslateX = currentTranslateX + dx;
        const newTranslateY = currentTranslateY + dy;

        fullscreenImage.style.transform = `scale(${scale}) translate(${newTranslateX}px, ${newTranslateY}px)`;
    });

    fullscreenImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) { // Multi-touch
            // Disable swipe navigation
            touchstartX = null;
            touchendX = null;

            // Calculate initial distance between the fingers
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
            touchstartX = e.changedTouches[0].screenX;

            if (scale > 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }
    });


    fullscreenImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && scale > 1 && isDragging) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            const dx = (x - startX);
            const dy = (y - startY);

            startX = x;
            startY = y;

            // Получаем текущее значение translate
            const transform = fullscreenImage.style.transform;
            const translateValues = transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);

            let currentTranslateX = 0;
            let currentTranslateY = 0;

            if (translateValues) {
                currentTranslateX = parseInt(translateValues[1]);
                currentTranslateY = parseInt(translateValues[2]);
            }

            // Вычисляем новое значение translate
            const newTranslateX = currentTranslateX + dx;
            const newTranslateY = currentTranslateY + dy;

            fullscreenImage.style.transform = `scale(${scale}) translate(${newTranslateX}px, ${newTranslateY}px)`;
        }
    });

    fullscreenImage.addEventListener('touchend', (e) => {
        isDragging = false;

        if (e.touches.length === 0) { // No fingers on the screen
            // Restore swipe navigation
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
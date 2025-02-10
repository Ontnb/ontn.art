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

    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;

        //  Задержка перед добавлением класса 'open'
        setTimeout(() => {
            fullscreenOverlay.classList.add("open");
        }, 10); // Небольшая задержка, чтобы transition работал

        fullscreenOverlay.style.display = "flex"; // Display flex чтобы overlay растянулся на весь экран
        document.addEventListener('keydown', handleKeyboardNavigation);

        // Предотвращаем масштабирование жестами
        fullscreenImage.addEventListener('gesturestart', preventGesture);
        fullscreenImage.addEventListener('gesturechange', preventGesture);

    }

    function hideFullscreen() {
        fullscreenOverlay.classList.remove("open");
        // Delay hiding the overlay until the transition completes
        setTimeout(() => {
            fullscreenOverlay.style.display = "none";
        }, 300); // match CSS transition duration

        document.removeEventListener('keydown', handleKeyboardNavigation);

        // Удаляем обработчики событий gesture
        fullscreenImage.removeEventListener('gesturestart', preventGesture);
        fullscreenImage.removeEventListener('gesturechange', preventGesture);
    }


    function navigate(direction) {
        //Add fade-out class
        fullscreenImage.classList.add('fade-out');

        setTimeout(() => {
            currentIndex += direction;
            if (currentIndex < 0) {
                currentIndex = portfolioItems.length - 1;
            } else if (currentIndex >= portfolioItems.length) {
                currentIndex = 0;
            }
            fullscreenImage.src = portfolioItems[currentIndex].src;
            fullscreenImage.classList.remove('fade-out'); // Remove fade-out class to fade in
        }, 300); //  Должно соответствовать transition времени в CSS
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

    function preventGesture(event) {
        event.preventDefault();
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

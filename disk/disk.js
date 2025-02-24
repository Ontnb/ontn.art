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
    let scale = 1;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let currentIndex = 0;
    let touchStartX = 0;

    function showFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = portfolioItems[index].src;
        scale = 1;
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
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % portfolioItems.length;
        fullscreenImage.src = portfolioItems[currentIndex].src;
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

    // Touch events for mobile devices
    fullscreenImage.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) {
            touchStartX = event.touches[0].clientX;
        } else if (event.touches.length === 2) {
            // Handle pinch zoom
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            startX = (touch1.clientX + touch2.clientX) / 2;
            startY = (touch1.clientY + touch2.clientY) / 2;
            fullscreenImage.dataset.distance = distance;
        }
    });

    fullscreenImage.addEventListener("touchmove", (event) => {
        if (event.touches.length === 1) {
            const touchEndX = event.touches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    showPreviousImage();
                } else {
                    showNextImage();
                }
                touchStartX = touchEndX;
            }
        } else if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            const scaleFactor = distance / fullscreenImage.dataset.distance;
            scale *= scaleFactor;
            fullscreenImage.style.transform = `scale(${scale})`;
            fullscreenImage.dataset.distance = distance;
        }
    });

    fullscreenImage.addEventListener("touchend", (event) => {
        if (event.touches.length === 0) {
            fullscreenImage.dataset.distance = null;
        }
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

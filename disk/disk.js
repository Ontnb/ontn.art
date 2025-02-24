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
  let touchStartX = 0;
  let touchEndX = 0;
  let scale = 1;
  
  // Глобальные переменные для drag при зуме:
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  
  // Флаги для pinch-to-zoom:
  let isPinching = false;
  let initialPinchDistance = 0;
  let initialScale = 1;

  // Функция открытия полноэкранного изображения
  function showFullscreen(index) {
    currentIndex = index;
    fullscreenImage.src = portfolioItems[index].src;
    scale = 1;
    // Обнуляем смещение при открытии нового изображения
    currentTranslateX = 0;
    currentTranslateY = 0;
    fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
    fullscreenImage.classList.remove("zoomed");
    startX = 0;
    startY = 0;
    fullscreenOverlay.classList.add("open");
    fullscreenOverlay.style.display = "flex";
    document.addEventListener("keydown", handleKeyboardNavigation);
  }

  // Функция закрытия полноэкранного изображения
  function hideFullscreen() {
    fullscreenOverlay.classList.remove("open");
    setTimeout(() => {
      fullscreenOverlay.style.display = "none";
    }, 300);
    document.removeEventListener("keydown", handleKeyboardNavigation);
  }

  // Перелистывание изображений с анимацией
  function navigate(direction) {
    fullscreenImage.classList.add("fade-out");
    setTimeout(() => {
      currentIndex += direction;
      if (currentIndex < 0) {
        currentIndex = portfolioItems.length - 1;
      } else if (currentIndex >= portfolioItems.length) {
        currentIndex = 0;
      }
      fullscreenImage.src = portfolioItems[currentIndex].src;
      scale = 1;
      // Сбрасываем смещение при переходе на новое изображение
      currentTranslateX = 0;
      currentTranslateY = 0;
      fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
      fullscreenImage.classList.remove("zoomed");
      startX = 0;
      startY = 0;
      fullscreenImage.classList.remove("fade-out");
    }, 300);
  }

  // Обработка навигации с клавиатуры (стрелки и Esc)
  function handleKeyboardNavigation(event) {
    if (event.key === "ArrowLeft") {
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      navigate(1);
    } else if (event.key === "Escape") {
      hideFullscreen();
    }
  }

  // Навешиваем обработчик клика на превью изображений
  portfolioItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      showFullscreen(index);
    });
  });

  // Обработчики для кнопок закрытия и навигации
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

  // ===================== Обработка касаний на мобильных устройствах =====================
  fullscreenImage.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && !isPinching) {
      // Один палец – начинаем свайп или drag, если изображение зумировано
      touchStartX = e.touches[0].screenX;
      if (scale > 1) {
        isDragging = true;
        // Запоминаем начальную позицию для расчёта delta
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    } else if (e.touches.length === 2) {
      // Начало pinch-to-zoom
      isPinching = true;
      // Сброс данных для свайпа
      touchStartX = null;
      touchEndX = null;
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      initialPinchDistance = Math.hypot(x2 - x1, y2 - y1);
      initialScale = scale;
    }
  });

  fullscreenImage.addEventListener("touchmove", (e) => {
    if (isPinching && e.touches.length === 2) {
      // Обработка pinch-to-zoom
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const currentDistance = Math.hypot(x2 - x1, y2 - y1);
      let newScale = initialScale + (currentDistance - initialPinchDistance) * 0.01;
      scale = Math.max(1, Math.min(3, newScale));
      // При зуме сбрасываем смещение, если требуется
      fullscreenImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
      if (scale > 1) {
        fullscreenImage.classList.add("zoomed");
      } else {
        fullscreenImage.classList.remove("zoomed");
      }
    } else if (isDragging && e.touches.length === 1 && scale > 1) {
      // Обработка перемещения (drag) увеличенного изображения
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startX;
      const dy = y - startY;
      startX = x;
      startY = y;
      currentTranslateX += dx;
      currentTranslateY += dy;
      fullscreenImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }
  });

  fullscreenImage.addEventListener("touchend", (e) => {
    if (isPinching && e.touches.length < 2) {
      isPinching = false;
    }
    if (!isPinching && e.changedTouches.length === 1) {
      if (scale === 1 && touchStartX !== null) {
        // Если изображение не увеличено – обрабатываем свайп
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }
      isDragging = false;
    }
  });

  function handleSwipe() {
    if (touchStartX === null || touchEndX === null) return;
    if (touchEndX < touchStartX - 50) {
      navigate(1);
    } else if (touchEndX > touchStartX + 50) {
      navigate(-1);
    }
  }

  // ===================== Обработка зума для ПК (колесо мыши) =====================
  fullscreenImage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    scale = Math.max(1, Math.min(3, scale + delta));
    // Сбрасываем смещение при изменении масштаба (можно убрать, если требуется сохранить позицию)
    currentTranslateX = 0;
    currentTranslateY = 0;
    fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
    if (scale > 1) {
      fullscreenImage.classList.add("zoomed");
    } else {
      fullscreenImage.classList.remove("zoomed");
    }
  });

  // ===================== Drag мышью для ПК =====================
  fullscreenImage.addEventListener("mousedown", (e) => {
    if (scale > 1) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      fullscreenImage.style.cursor = "grabbing";
    }
  });

  fullscreenImage.addEventListener("mouseup", () => {
    isDragging = false;
    fullscreenImage.style.cursor = "grab";
  });

  fullscreenImage.addEventListener("mouseleave", () => {
    isDragging = false;
    fullscreenImage.style.cursor = "grab";
  });

  fullscreenImage.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const x = e.clientX;
    const y = e.clientY;
    const dx = x - startX;
    const dy = y - startY;
    startX = x;
    startY = y;
    currentTranslateX += dx;
    currentTranslateY += dy;
    fullscreenImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
  });

  // ===================== Работа с модальным окном контактов =====================
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

  // ===================== Функционал "Download All" =====================
  downloadAllButton.addEventListener("click", async () => {
    const zip = new JSZip();
    downloadAllButton.textContent = "Downloading...";
    downloadAllButton.disabled = true;
    try {
      for (let i = 0; i < portfolioItems.length; i++) {
        const img = portfolioItems[i];
        const url = img.src;
        let filename = img.alt || `image_${i + 1}`;
        const fileExtension = url.substring(url.lastIndexOf("."));
        filename += fileExtension;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${url}`);
        }
        const blob = await response.blob();
        zip.file(filename, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "images.zip";
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

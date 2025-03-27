document.addEventListener("DOMContentLoaded", () => {
    // Lazy Loading видео с использованием Intersection Observer
    const lazyLoadVideo = (video) => {
        if (video.dataset.src && !video.src) {
            video.src = video.dataset.src;
        }
    };

    const videoObserverOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.25
    };

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lazyLoadVideo(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, videoObserverOptions);

    // Наблюдаем за каждым видео
    document.querySelectorAll(".portfolio-video").forEach(video => {
        videoObserver.observe(video);
    });

    const scrollContainer = document.querySelector(".portfolio-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");
    const videos = document.querySelectorAll(".portfolio-video");

    // Коэффициент для регулировки скорости скроллинга
    const scrollSpeedMultiplier = 7;

    // Переменная для "целевого" значения scrollLeft
    let targetScrollLeft = scrollContainer.scrollLeft;
    // Флаг для анимации плавного скролла
    let isAnimating = false;

    // Храним ссылку на последнее активное видео,
    // даже если оно поставлено на паузу
    let currentlyPlayingVideo = null;

    // Функция для остановки всех видео, кроме текущего
    function pauseAllVideos(currentVideo) {
        videos.forEach(video => {
            if (video !== currentVideo) {
                video.pause();
                const playButton = video.closest('.video-container').querySelector('.play-pause-button');
                if (playButton) {
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        });
    }

    // Функция для форматирования времени
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Функция для обновления продолжительности видео после загрузки
    function updateVideoDuration(video) {
        const timeDisplay = video.closest('.video-container').querySelector('.time-display');
        video.addEventListener('loadedmetadata', () => {
            const duration = formatTime(video.duration);
            timeDisplay.textContent = `0:00 / ${duration}`;
        });
        // Принудительная загрузка метаданных, если видео ещё не загружено
        if (!video.readyState) {
            video.load();
        }
    }

    videos.forEach(video => {
        updateVideoDuration(video); // Обновляем продолжительность видео

        const videoContainer = video.closest('.video-container');
        const playPauseButton = videoContainer.querySelector('.play-pause-button');
        const progressBar = videoContainer.querySelector('.progress-bar');
        const progressBarContainer = videoContainer.querySelector('.progress-bar-container');
        const timeDisplay = videoContainer.querySelector('.time-display');
        const volumeButton = videoContainer.querySelector('.volume-button');
        const volumeSlider = videoContainer.querySelector('.volume-slider');
        const fullscreenButton = videoContainer.querySelector('.fullscreen-button');

        let isFullscreen = false;
        let controlTimeout;

        // Функция для установки видимости контролов в fullscreen режиме
        function showControls() {
            videoContainer.querySelector('.video-controls').style.opacity = '1';
        }

        function hideControls() {
            videoContainer.querySelector('.video-controls').style.opacity = '0';
        }

        // При попытке воспроизведения, если видео ещё не загружено, можно проверить и присвоить src
        playPauseButton.addEventListener("click", () => {
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
            }
            // Если включено другое видео - останавливаем его
            if (currentlyPlayingVideo !== video && currentlyPlayingVideo !== null) {
                pauseVideo(currentlyPlayingVideo);
            }
            if (video.paused) {
                video.play();
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
                currentlyPlayingVideo = video;
            } else {
                video.pause();
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        // Обновление прогресс-бара и буферной полосы
        video.addEventListener("timeupdate", () => {
            const percentage = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percentage}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

            // Обновление полосы буферизации
            const bufferBar = videoContainer.querySelector('.buffer-bar');
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const bufferPercent = (bufferedEnd / video.duration) * 100;
                bufferBar.style.width = `${bufferPercent}%`;
            } else {
                bufferBar.style.width = "0%";
            }
        });

        // Перемотка при клике по прогресс-бару
        progressBarContainer.addEventListener("click", (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

        // Управление звуком
        volumeButton.addEventListener("click", () => {
            if (video.muted) {
                video.muted = false;
                volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                video.muted = true;
                volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });

        volumeSlider.addEventListener("input", () => {
            video.volume = volumeSlider.value;
            if (video.volume === 0) {
                volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });

        // Полноэкранный режим
        fullscreenButton.addEventListener("click", () => {
            if (!isFullscreen) {
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.mozRequestFullScreen) { // Firefox
                    videoContainer.mozRequestFullScreen();
                } else if (videoContainer.webkitRequestFullscreen) { // Chrome, Safari и Opera
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) { // IE/Edge
                    videoContainer.msRequestFullscreen();
                }
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { // Firefox
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { // Chrome, Safari и Opera
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { // IE/Edge
                    document.msExitFullscreen();
                }
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            }
            // Переключаем статус полноэкранного режима
            isFullscreen = !isFullscreen;
        });

        // Обработка изменения fullscreen через событие
        document.addEventListener('fullscreenchange', () => {
            // Если мы в режиме fullscreen, привязываем событие движения мыши для показа контролов
            if (document.fullscreenElement === videoContainer) {
                isFullscreen = true;
                // Сразу показываем контролы
                showControls();
            } else {
                isFullscreen = false;
                // Очищаем таймаут, если он был установлен, чтобы не было позднего скрытия
                if (controlTimeout) {
                    clearTimeout(controlTimeout);
                }
                // Сбрасываем inline стиль, позволяя сработать правилу :hover
                videoContainer.querySelector('.video-controls').style.opacity = '';
            }
        });

        // Обработка движения мыши в fullscreen режиме для показа/скрытия контролов
        videoContainer.addEventListener('mousemove', () => {
            // Если мы в полноэкранном режиме, показываем контролы и запускаем таймер на их скрытие
            if (document.fullscreenElement === videoContainer) {
                showControls();
                if (controlTimeout) {
                    clearTimeout(controlTimeout);
                }
                controlTimeout = setTimeout(() => {
                    hideControls();
                }, 1000);
            }
        });

        // Пауза/воспроизведение при клике на само видео
        video.addEventListener('click', () => {
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
            }
            if (currentlyPlayingVideo !== video && currentlyPlayingVideo !== null) {
                pauseVideo(currentlyPlayingVideo);
            }
            if (video.paused) {
                video.play();
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
                currentlyPlayingVideo = video;
            } else {
                video.pause();
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    });

    // Обработка нажатия пробела для воспроизведения/паузы текущего видео
    document.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;
        if (event.code === "Space" && (activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA")) {
            event.preventDefault();
            if (currentlyPlayingVideo) {
                if (currentlyPlayingVideo.paused) {
                    currentlyPlayingVideo.play();
                    const playButton = currentlyPlayingVideo.closest('.video-container').querySelector('.play-pause-button');
                    if (playButton) {
                        playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    }
                } else {
                    currentlyPlayingVideo.pause();
                    const playButton = currentlyPlayingVideo.closest('.video-container').querySelector('.play-pause-button');
                    if (playButton) {
                        playButton.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }
            }
        }
    });

    function pauseVideo(video) {
        video.pause();
        const playButton = video.closest('.video-container').querySelector('.play-pause-button');
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Обработка прокрутки для скроллбара портфолио
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;
        const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
        scrollbarThumb.style.width = thumbWidth + "px";
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const thumbLeft = scrollPercentage * maxThumbLeft;
        scrollbarThumb.style.left = thumbLeft + "px";
    }

    function animateScroll() {
        const diff = targetScrollLeft - scrollContainer.scrollLeft;
        if (Math.abs(diff) < 2) { // если разница меньше 2 пикселей, завершить анимацию
            scrollContainer.scrollLeft = targetScrollLeft;
            isAnimating = false;
            updateScrollbarThumb();
            return;
        }
        let step = diff * 0.01; // увеличен множитель для более быстрой анимации
        // Минимальный шаг в 1 пиксель, чтобы избежать застревания при малых значениях
        if (Math.abs(step) < 1) {
            step = step < 0 ? -1 : 1;
        }
        scrollContainer.scrollLeft += step;
        updateScrollbarThumb();
        requestAnimationFrame(animateScroll);
    }

    scrollContainer.addEventListener("wheel", (event) => {
        event.preventDefault();
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        let delta = event.deltaY;
        if (event.deltaMode === 1) {
            delta *= 15;
        } else if (event.deltaMode === 2) {
            delta *= scrollContainer.clientHeight;
        }
        targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + delta * scrollSpeedMultiplier));
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animateScroll);
        }
    }, { passive: false });

    // Реализация перетаскивания для скроллбара
    let isDragging = false;
    let startX;
    let startScrollLeft;

    scrollbarThumb.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = scrollContainer.scrollLeft;
        scrollbarThumb.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const thumbWidth = scrollbarThumb.offsetWidth;
        const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
        const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;
        targetScrollLeft = startScrollLeft + dx * scrollRatio;
        targetScrollLeft = Math.max(0, Math.min(scrollContainer.scrollWidth - scrollContainer.clientWidth, targetScrollLeft));
        scrollContainer.scrollLeft = targetScrollLeft;
        updateScrollbarThumb();
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            scrollbarThumb.style.cursor = "grab";
            document.body.style.userSelect = "auto";
        }
    });

    // Сохранение позиции прокрутки перед обновлением страницы
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
    });

    // Восстановление позиции прокрутки
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
        targetScrollLeft = scrollContainer.scrollLeft;
        localStorage.removeItem("scrollPosition");
    }

    // Обновление скроллбара после загрузки
    window.addEventListener("load", () => {
        updateScrollbarThumb();
    });

    // Открытие модального окна контактов
    openContactsButton.addEventListener("click", () => {
        contactsModal.style.display = "flex";
    });

    // Закрытие модального окна контактов по нажатию на крест
    closeButton.addEventListener("click", () => {
        contactsModal.style.display = "none";
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
        }
    });
});

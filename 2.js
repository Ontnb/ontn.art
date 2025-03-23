document.addEventListener("DOMContentLoaded", () => {
    // Общие элементы
    const scrollContainer = document.querySelector(".portfolio-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Коэффициент для регулировки скорости скроллинга
    const scrollSpeedMultiplier = 7;
    let targetScrollLeft = scrollContainer.scrollLeft;
    let isAnimating = false;

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
        if (Math.abs(diff) < 0.5) {
            scrollContainer.scrollLeft = targetScrollLeft;
            isAnimating = false;
            updateScrollbarThumb();
            return;
        }
        const step = diff * 0.01;
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

    window.addEventListener("load", () => {
        updateScrollbarThumb();
    });

    openContactsButton.addEventListener("click", () => {
        contactsModal.style.display = "flex";
    });

    closeButton.addEventListener("click", () => {
        contactsModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === contactsModal) {
            contactsModal.style.display = "none";
        }
    });

    const videos = document.querySelectorAll(".portfolio-video");
    let currentlyPlayingVideo = null;

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

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function updateVideoDuration(video) {
        const timeDisplay = video.closest('.video-container').querySelector('.time-display');
        video.addEventListener('loadedmetadata', () => {
            const duration = formatTime(video.duration);
            timeDisplay.textContent = `0:00 / ${duration}`;
        });
        if (!video.readyState) {
            video.load();
        }
    }

    // Реализуем lazy loading с помощью Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5
    };

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const video = entry.target;
            const playButton = video.closest('.video-container').querySelector('.play-pause-button');
            if (entry.isIntersecting) {
                if (!video.src && video.dataset.src) {
                    video.src = video.dataset.src;
                }
                if (playButton) {
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                }
            } else {
                video.pause();
                if (playButton) {
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        });
    }, observerOptions);

    videos.forEach(video => {
        updateVideoDuration(video);
        videoObserver.observe(video);

        const videoContainer = video.closest('.video-container');
        const playPauseButton = videoContainer.querySelector('.play-pause-button');
        const progressBar = videoContainer.querySelector('.progress-bar');
        const progressBarContainer = videoContainer.querySelector('.progress-bar-container');
        const timeDisplay = videoContainer.querySelector('.time-display');
        const volumeButton = videoContainer.querySelector('.volume-button');
        const volumeSlider = videoContainer.querySelector('.volume-slider');
        const fullscreenButton = videoContainer.querySelector('.fullscreen-button');
        let isFullscreen = false;

        playPauseButton.addEventListener("click", () => {
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

        video.addEventListener("timeupdate", () => {
            const percentage = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percentage}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        });

        progressBarContainer.addEventListener("click", (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

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

        fullscreenButton.addEventListener("click", () => {
            if (!isFullscreen) {
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.mozRequestFullScreen) {
                    videoContainer.mozRequestFullScreen();
                } else if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                }
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            }
            isFullscreen = !isFullscreen;
        });

        videoContainer.addEventListener('fullscreenchange', () => {
            isFullscreen = !!document.fullscreenElement;
            fullscreenButton.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        });

        // Убираем автоматическое воспроизведение первого видео
        if (video === videos[0]) {
            pauseAllVideos(video);
            const playButton = video.closest('.video-container').querySelector('.play-pause-button');
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        }

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
});

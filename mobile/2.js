function updateHeights() {
    const items = document.querySelectorAll('.portfolio-item');
    items.forEach(item => {
        item.style.height = `${window.innerHeight * 0.85}px`;
    });
}

window.addEventListener('resize', updateHeights);
window.addEventListener('load', updateHeights);

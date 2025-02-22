// Ждём, когда DOM полностью загрузится
document.addEventListener("DOMContentLoaded", function() {
  // Получаем элементы галереи и кастомного скроллбара
  const gallery = document.querySelector('.gallery-scroll');
  const scrollbarContainer = document.querySelector('.scrollbar-container');
  const scrollbarThumb = document.querySelector('.scrollbar-thumb');

  /* 
    Функция обновления положения ползунка кастомного скроллбара.
    Рассчитывает, на сколько пикселей нужно сдвинуть ползунок исходя 
    из текущего состояния прокрутки галереи.
  */
  function updateThumb() {
    // Общая доступная ширина для прокрутки (разница между полной и видимой шириной)
    const scrollableWidth = gallery.scrollWidth - gallery.clientWidth;
    // Текущая позиция горизонтальной прокрутки галереи
    const scrollLeft = gallery.scrollLeft;
    // Ширина контейнера скроллбара (пиксели)
    const containerWidth = scrollbarContainer.clientWidth;
    // Получаем текущую ширину ползунка
    const thumbWidth = scrollbarThumb.clientWidth;
    
    // Рассчитываем новую позицию ползунка:
    // Если галерея прокручена на 50% (scrollLeft/scrollableWidth), то ползунок тоже должен быть сдвинут на 50% от максимально возможного перемещения.
    const thumbLeft = (scrollLeft / scrollableWidth) * (containerWidth - thumbWidth);
    
    // Применяем вычисленное значение слева ползунка
    scrollbarThumb.style.left = `${thumbLeft}px`;
  }
  
  // При прокрутке галереи обновляем позицию ползунка
  gallery.addEventListener('scroll', updateThumb);

  /* 
    Обработчик события wheel для реализации горизонтальной прокрутки при
    вращении колеса мыши. Здесь происходит предотвращение стандартного вертикального скролла
    и увеличение scrollLeft для горизонтального сдвига.
  */
  gallery.addEventListener('wheel', function(e) {
    // Предотвращаем стандартное поведение (вертикальную прокрутку)
    e.preventDefault();
    // Прибавляем разницу deltaY к scrollLeft,
    // таким образом колесо мыши будет прокручивать галерею по горизонтали.
    gallery.scrollLeft += e.deltaY;
  }, { passive: false }); // { passive: false } позволяет использовать e.preventDefault()

  /* 
    Добавляем возможность перетаскивать ползунок кастомного скроллбара мышью.
    При перетаскивании будем пересчитывать положение галереи.
  */
  let isDragging = false;   // Флаг, показывающий, что сейчас идет перетаскивание
  let startX;               // Начальная координата X при нажатии на ползунок
  let startScrollLeft;      // Начальное значение scrollLeft галереи при начале перетаскивания

  // При нажатии на ползунок начинается процесс перетаскивания
  scrollbarThumb.addEventListener('mousedown', function(e) {
    isDragging = true;
    // Запоминаем начальную позицию курсора
    startX = e.pageX;
    // Запоминаем текущее значение scrollLeft, чтобы потом добавить к нему смещение
    startScrollLeft = gallery.scrollLeft;
    // Можно добавить визуальный эффект (например, изменить стиль курсора)
    scrollbarThumb.classList.add('active');
    // Отключаем выделение текста, чтобы не мешало перетаскиванию
    document.body.style.userSelect = 'none';
  });

  // Останавливаем перетаскивание при отпускании кнопки мыши
  document.addEventListener('mouseup', function() {
    isDragging = false;
    scrollbarThumb.classList.remove('active');
    // Возвращаем возможность выделения текста
    document.body.style.userSelect = '';
  });

  // При движении мыши обновляем положение галереи, если идёт перетаскивание ползунка
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return; // Если не перетаскиваем - выходим

    // Рассчитываем смещение курсора по горизонтали
    const dx = e.pageX - startX;
    
    // Вычисляем общую доступную ширину для прокрутки галереи
    const scrollableWidth = gallery.scrollWidth - gallery.clientWidth;
    // Ширина контейнера скроллбара
    const containerWidth = scrollbarContainer.clientWidth;
    // Ширина ползунка
    const thumbWidth = scrollbarThumb.clientWidth;
    // Вычисляем сколько пикселей прокрутки галереи соответствует одному пикселю перемещения ползунка.
    const scrollRatio = scrollableWidth / (containerWidth - thumbWidth);
    
    // Обновляем положение галереи, добавляя к начальному значению смещение, пропорциональное перемещению ползунка.
    gallery.scrollLeft = startScrollLeft + dx * scrollRatio;
  });

  // При изменении размеров окна полезно обновлять положение ползунка
  window.addEventListener('resize', updateThumb);
  
  // Первоначальный вызов, чтобы правильно позиционировать ползунок при загрузке страницы
  updateThumb();
});

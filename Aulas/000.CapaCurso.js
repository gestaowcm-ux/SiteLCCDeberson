// 000.CapaCurso.js - Controller logic for Apresentação Pessoal (CV) & Capa do Curso (8 slides)
function init() {
  const slidesWrapper = document.getElementById('slides-wrapper');
  let currentSlide = 0;
  const totalSlides = 9;

  // Dynamic Iframe Generation for Previews
  if (!window.location.search.includes("preview=true")) {
    for (let i = 0; i < totalSlides; i++) {
      const wrapper = document.getElementById(`preview-wrapper-${i}`);
      if (wrapper) {
        const iframe = document.createElement("iframe");
        iframe.src = `000.CapaCurso.html?preview=true#slide-${i + 1}`;
        iframe.className = "slide-preview-iframe";
        iframe.setAttribute("scrolling", "no");
        wrapper.appendChild(iframe);
      }
    }
  }

  // Check if loaded inside preview iframe
  if (window.location.search.includes("preview=true")) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const indicators = document.getElementById("slide-nav-indicators");
    if (indicators) indicators.remove();

    const hash = window.location.hash;
    if (slidesWrapper) {
      slidesWrapper.style.transition = 'none';
      const targetNum = hash ? parseInt(hash.replace('#slide-', ''), 10) : 1;
      if (!isNaN(targetNum) && targetNum > 0) {
        slidesWrapper.style.transform = `translateY(-${(targetNum - 1) * 100}vh)`;
        const slideEl = document.getElementById(`slide-${targetNum}`);
        if (slideEl) slideEl.classList.add("active-slide");
      }
    }
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const startSlide = parseInt(urlParams.get('slide'), 10);
  if (!isNaN(startSlide) && startSlide >= 0 && startSlide < totalSlides) {
    currentSlide = startSlide;
  }

  const dots = document.querySelectorAll('.slide-indicator-dot');

  function updateDots(index) {
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function updateSlidePosition() {
    if (slidesWrapper) {
      slidesWrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
    }

    for (let i = 1; i <= totalSlides; i++) {
      const el = document.getElementById(`slide-${i}`);
      if (el) {
        if (i - 1 === currentSlide) {
          el.classList.add('active-slide');
        } else {
          el.classList.remove('active-slide');
        }
      }
    }

    updateDots(currentSlide);
    notifyParent();
  }

  function navigate(dir) {
    if (dir === 'next' && currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlidePosition();
    } else if (dir === 'prev' && currentSlide > 0) {
      currentSlide--;
      updateSlidePosition();
    }
  }

  function notifyParent() {
    const activeSlideEl = document.getElementById(`slide-${currentSlide + 1}`);
    const notesEl = activeSlideEl ? activeSlideEl.querySelector('.speaker-notes') : null;
    const speakerNote = notesEl ? notesEl.innerHTML : '';

    window.parent.postMessage({
      type: 'SLIDE_CHANGED',
      slideIndex: currentSlide,
      notes: speakerNote,
      totalSlides: totalSlides
    }, '*');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      if (!isNaN(idx) && idx !== currentSlide) {
        currentSlide = idx;
        updateSlidePosition();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      navigate('next');
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      navigate('prev');
    }
  });

  let wheelCooldown = false;
  document.addEventListener('wheel', (e) => {
    if (wheelCooldown) return;
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 350);

    if (e.deltaY > 0) {
      navigate('next');
    } else if (e.deltaY < 0) {
      navigate('prev');
    }
  }, { passive: true });

  let startY = 0;
  document.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    const diffY = startY - endY;
    if (Math.abs(diffY) > 40) {
      if (diffY > 0) navigate('next');
      else navigate('prev');
    }
  }, { passive: true });

  window.addEventListener('message', (event) => {
    const { type, slideIndex } = event.data;
    if (type === 'GOTO_SLIDE') {
      if (slideIndex >= 0 && slideIndex < totalSlides) {
        currentSlide = slideIndex;
        updateSlidePosition();
      }
    }
  });

  updateSlidePosition();
}

document.addEventListener('DOMContentLoaded', init);

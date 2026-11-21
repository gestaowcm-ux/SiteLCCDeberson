// ============================================================================
// js/lcc-slide-engine.js — Motor Compartilhado de Navegação, Sync & Quiz
// Integração total com index.html, app.js e presenter.html
// ============================================================================

export function initSlideEngine(options = {}) {
  const {
    lessonFile = '',
    maxSteps = [],
    onSlideEnter = null,
    onStepChange = null
  } = options;

  const wrapper = document.getElementById('slides-wrapper');
  const slides = Array.from(document.querySelectorAll('.slide-section'));
  const dots = Array.from(document.querySelectorAll('.slide-indicator-dot'));
  const totalSlides = slides.length;

  if (wrapper) {
    wrapper.style.height = `${totalSlides * 100}vh`;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === 'true';

  if (isPreview) {
    document.body.classList.add('is-preview');
  }

  let currentSlide = 0;
  let isAnimating = false;
  const slideSteps = new Array(totalSlides).fill(0);

  function syncWithParentShell() {
    if (isPreview) return;
    const activeSection = slides[currentSlide];
    const notesEl = activeSection ? activeSection.querySelector('.speaker-notes') : null;
    const notesHtml = notesEl ? notesEl.innerHTML : '';

    window.parent.postMessage(
      {
        type: 'SLIDE_CHANGED',
        slideIndex: currentSlide,
        notes: notesHtml,
        totalSlides
      },
      '*'
    );
  }

  function setSlideStep(slideIdx, stepIdx) {
    const limit = maxSteps[slideIdx] || 0;
    const clamped = Math.max(0, Math.min(limit, stepIdx));
    slideSteps[slideIdx] = clamped;

    const section = slides[slideIdx];
    if (section) {
      const items = section.querySelectorAll('[data-step-item]');
      items.forEach((el) => {
        const req = parseInt(el.getAttribute('data-step-item'), 10);
        if (!isNaN(req)) {
          el.classList.toggle('step-hidden', req > clamped);
          el.classList.toggle('step-active', req <= clamped);
        }
      });

      const labelEl = section.querySelector('[data-step-label]');
      if (labelEl && limit > 0) {
        labelEl.textContent = `Etapa ${clamped + 1}/${limit + 1}`;
      }

      const miniDotsEl = section.querySelector('[data-step-dots]');
      if (miniDotsEl && limit > 0) {
        miniDotsEl.innerHTML = '';
        for (let i = 0; i <= limit; i++) {
          const d = document.createElement('span');
          d.className = `step-dot-mini ${i === clamped ? 'active' : ''}`;
          d.title = `Etapa ${i + 1}`;
          d.addEventListener('click', (e) => {
            e.stopPropagation();
            setSlideStep(slideIdx, i);
          });
          miniDotsEl.appendChild(d);
        }
      }
    }

    if (typeof onStepChange === 'function') {
      onStepChange(slideIdx, clamped);
    }
  }

  function goToSlide(index, navOpts = {}) {
    if (index < 0 || index >= totalSlides) return;
    if (isAnimating && !navOpts.instant && !navOpts.force) return;

    isAnimating = true;
    currentSlide = index;

    if (typeof navOpts.step === 'number') {
      setSlideStep(currentSlide, navOpts.step);
    } else {
      setSlideStep(currentSlide, slideSteps[currentSlide] || 0);
    }

    if (wrapper) {
      if (navOpts.instant) {
        wrapper.style.transition = 'none';
        wrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
        void window.getComputedStyle(wrapper).transform;
        wrapper.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      } else {
        wrapper.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
        wrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
      }
    }

    const container = document.querySelector('.slides-container');
    if (container && container.scrollTop !== 0) container.scrollTop = 0;
    if (window.scrollY !== 0) window.scrollTo(0, 0);

    slides.forEach((sec, idx) => {
      const active = idx === currentSlide;
      sec.classList.toggle('active', active);
      sec.classList.toggle('active-slide', active);
    });

    const isDark =
      slides[currentSlide] &&
      (slides[currentSlide].classList.contains('slide-dark') ||
        slides[currentSlide].classList.contains('cover-slide'));
    document.body.classList.toggle('on-dark-slide', Boolean(isDark));

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    if (typeof onSlideEnter === 'function') {
      onSlideEnter(currentSlide, slides[currentSlide]);
    }

    syncWithParentShell();

    if (navOpts.instant) {
      isAnimating = false;
    } else {
      setTimeout(() => {
        isAnimating = false;
      }, 660);
    }
  }

  function nextStepOrSlide(forceSlideJump = false) {
    if (isAnimating) return;
    const limit = maxSteps[currentSlide] || 0;
    const curStep = slideSteps[currentSlide] || 0;

    if (!forceSlideJump && curStep < limit) {
      setSlideStep(currentSlide, curStep + 1);
      return;
    }
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1, { step: 0 });
    }
  }

  function prevStepOrSlide(forceSlideJump = false) {
    if (isAnimating) return;
    const curStep = slideSteps[currentSlide] || 0;

    if (!forceSlideJump && curStep > 0) {
      setSlideStep(currentSlide, curStep - 1);
      return;
    }
    if (currentSlide > 0) {
      const prevIdx = currentSlide - 1;
      goToSlide(prevIdx, { step: maxSteps[prevIdx] || 0 });
    }
  }

  // Blur automático em botões para não capturar Espaço/Setas
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) setTimeout(() => btn.blur(), 0);
  });

  // Botões "Avançar etapa" inline
  document.querySelectorAll('[data-step-next]').forEach((btn) => {
    btn.addEventListener('click', () => nextStepOrSlide(false));
  });

  // Botão "Iniciar" da capa
  document.querySelectorAll('[data-start-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => goToSlide(1, { step: 0 }));
  });

  // Dots laterais direitos + miniaturas ao vivo
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => goToSlide(idx, { step: 0 }));

    if (!isPreview && lessonFile) {
      const previewWrap = document.getElementById(`preview-wrapper-${idx}`);
      if (previewWrap) {
        let loaded = false;
        dot.addEventListener('mouseenter', () => {
          if (loaded) return;
          loaded = true;
          const miniFrame = document.createElement('iframe');
          miniFrame.src = `./${lessonFile}?preview=true#slide-${idx + 1}`;
          miniFrame.className = 'slide-preview-iframe';
          miniFrame.setAttribute('scrolling', 'no');
          miniFrame.setAttribute('tabindex', '-1');
          miniFrame.setAttribute('aria-hidden', 'true');
          previewWrap.appendChild(miniFrame);
        });
      }
    }
  });

  if (!isPreview) {
    document.addEventListener('keydown', (e) => {
      const tag = e.target ? e.target.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) {
        return;
      }

      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        nextStepOrSlide(e.shiftKey);
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prevStepOrSlide(e.shiftKey);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0, { step: 0 });
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1, { step: 0 });
      }
    });

    let wheelLock = false;
    window.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) < 28 || wheelLock) return;
        wheelLock = true;
        if (e.deltaY > 0) nextStepOrSlide(true);
        else prevStepOrSlide(true);
        setTimeout(() => {
          wheelLock = false;
        }, 420);
      },
      { passive: true }
    );

    let touchStartY = null;
    window.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches && e.touches.length === 1) touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );
    window.addEventListener(
      'touchend',
      (e) => {
        if (touchStartY === null || !e.changedTouches?.length) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        touchStartY = null;
        if (Math.abs(dy) > 45) {
          if (dy > 0) nextStepOrSlide(true);
          else prevStepOrSlide(true);
        }
      },
      { passive: true }
    );

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;
      if ((data.type === 'GOTO_SLIDE' || data.type === 'NAVIGATE_TO_SLIDE') && typeof data.slideIndex === 'number') {
        goToSlide(data.slideIndex, { step: 0, force: true });
      } else if (data.type === 'NEXT_SLIDE') {
        nextStepOrSlide(false);
      } else if (data.type === 'PREV_SLIDE') {
        prevStepOrSlide(false);
      }
    });
  }

  // Inicialização por query (?slide=N) ou hash (#slide-N)
  let startSlideIdx = 0;
  const slideQuery = parseInt(urlParams.get('slide'), 10);
  if (!isNaN(slideQuery) && slideQuery >= 0 && slideQuery < totalSlides) {
    startSlideIdx = slideQuery;
  } else if (window.location.hash && window.location.hash.startsWith('#slide-')) {
    const parsed = parseInt(window.location.hash.replace('#slide-', ''), 10);
    if (!isNaN(parsed)) {
      if (isPreview && parsed >= 1 && parsed <= totalSlides) startSlideIdx = parsed - 1;
      else if (parsed >= 0 && parsed < totalSlides) startSlideIdx = parsed;
    }
  }

  const stepQuery = parseInt(urlParams.get('step'), 10);
  goToSlide(startSlideIdx, {
    instant: true,
    step: !isNaN(stepQuery) ? stepQuery : 0
  });

  return {
    goToSlide,
    setSlideStep,
    nextStepOrSlide,
    prevStepOrSlide,
    getCurrentSlide: () => currentSlide
  };
}

// ============================================================================
// Controlador Oficial de Quiz Multi-Cenários (SLIDES_DESIGN.md Seção 7)
// ============================================================================
const MODULE_SEQUENCE = [
  { file: '001.PorQueUtilizarLCC.html', label: 'Módulo 1' },
  { file: '002.EstruturarAnalise.html', label: 'Módulo 2' },
  { file: '003.CustosConsiderar.html', label: 'Módulo 3' },
  { file: '004.ConfiabilidadeCustos.html', label: 'Módulo 4' },
  { file: '005.ComparacaoEconomica.html', label: 'Módulo 5' },
  { file: '006.AvaliarIncertezas.html', label: 'Módulo 6' },
  { file: '007.AplicacaoPratica.html', label: 'Módulo 7' },
  { file: '008.IncorporarGestao.html', label: 'Módulo 8' }
];

export function initQuiz(questions) {
  let activeIdx = 0;
  const solved = new Array(questions.length).fill(false);
  const selected = new Array(questions.length).fill(null);

  const tabsWrap = document.getElementById('quiz-tabs-nav');
  const tagEl = document.getElementById('quiz-prompt-tag');
  const promptEl = document.getElementById('quiz-prompt-text');
  const gridEl = document.getElementById('quiz-options-grid');
  const feedbackEl = document.getElementById('quiz-feedback-banner');
  const progressEl = document.getElementById('quiz-progress-label');
  const btnNext = document.getElementById('btn-quiz-next');
  const btnReset = document.getElementById('btn-quiz-reset');

  if (!gridEl || !tabsWrap) return;

  const currentFile = window.location.pathname.split('/').pop();
  const currentModIdx = MODULE_SEQUENCE.findIndex((m) => m.file === currentFile);
  const nextMod = currentModIdx >= 0 && currentModIdx + 1 < MODULE_SEQUENCE.length
    ? MODULE_SEQUENCE[currentModIdx + 1]
    : null;

  let btnNextModule = document.getElementById('btn-quiz-next-module');
  if (!btnNextModule && nextMod && btnNext && btnNext.parentElement) {
    btnNextModule = document.createElement('button');
    btnNextModule.type = 'button';
    btnNextModule.id = 'btn-quiz-next-module';
    btnNextModule.className = 'tab-pill quiz-next-module-btn';
    btnNextModule.textContent = `Iniciar ${nextMod.label} →`;
    btnNextModule.title = `Avançar para o ${nextMod.label}`;
    btnNextModule.addEventListener('click', () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'NEXT_MODULE' }, '*');
      } else {
        window.location.href = `./${nextMod.file}`;
      }
    });
    btnNext.parentElement.appendChild(btnNextModule);
  }

  function render(idx) {
    activeIdx = idx;
    const q = questions[idx];
    if (!q) return;

    const solvedCount = solved.filter(Boolean).length;
    if (progressEl) {
      progressEl.textContent = `Progresso: ${solvedCount}/${questions.length} cenários acertados`;
    }

    tabsWrap.innerHTML = '';
    questions.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `quiz-tab-btn ${i === idx ? 'active' : ''} ${solved[i] ? 'done-right' : ''}`;
      btn.innerHTML = `<span class="tab-status-dot"></span>${item.tab}`;
      btn.addEventListener('click', () => render(i));
      tabsWrap.appendChild(btn);
    });

    if (tagEl) tagEl.textContent = q.tag || 'DESAFIO TÉCNICO';
    if (promptEl) promptEl.textContent = q.prompt;

    gridEl.innerHTML = '';
    q.options.forEach((opt, optIdx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'quiz-option-card';

      if (solved[idx]) {
        if (opt.correct) card.classList.add('is-correct');
        else card.classList.add('is-dimmed');
      } else if (selected[idx] === optIdx && !opt.correct) {
        card.classList.add('is-wrong');
      }

      card.innerHTML = `<span class="option-letter">${opt.letter}</span><span class="option-text">${opt.text}</span>`;
      card.addEventListener('click', () => {
        selected[idx] = optIdx;
        if (opt.correct) solved[idx] = true;
        render(idx);
      });
      gridEl.appendChild(card);
    });

    if (feedbackEl) {
      if (solved[idx]) {
        const rightOpt = q.options.find((o) => o.correct);
        feedbackEl.className = 'quiz-feedback-banner visible right';
        feedbackEl.textContent = `✅ ${rightOpt ? rightOpt.feedback : ''}`;
      } else if (selected[idx] !== null) {
        const chosen = q.options[selected[idx]];
        feedbackEl.className = 'quiz-feedback-banner visible wrong';
        feedbackEl.textContent = `❌ ${chosen ? chosen.feedback : ''}`;
      } else {
        feedbackEl.className = 'quiz-feedback-banner';
        feedbackEl.textContent = '';
      }
    }

    if (btnNext) {
      btnNext.textContent = idx < questions.length - 1 ? 'Próximo Cenário →' : 'Voltar ao Cenário 1 ↺';
    }
    if (btnNextModule) {
      btnNextModule.classList.toggle('is-ready', solvedCount === questions.length);
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => render((activeIdx + 1) % questions.length));
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      solved.fill(false);
      selected.fill(null);
      render(0);
    });
  }

  render(0);
}

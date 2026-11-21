/**
 * site-lcc-engine.js — Motor adaptado para página única contínua (SiteLCC.html)
 * Mantém todas as interações, etapas (step-dots / Avançar) e quizzes dos módulos
 * sem travar o scroll ou usar formato de slides.
 */

export function initSlideEngine(options = {}, scopeSelector) {
  const { maxSteps = [], onStepChange, onSlideStepChange } = options;
  const root = scopeSelector ? document.querySelector(scopeSelector) : document;
  const slideSteps = {};

  function getSection(slideIdx) {
    if (!root) return null;
    return root.querySelector(`#slide-${slideIdx + 1}`);
  }

  function setSlideStep(slideIdx, stepIdx) {
    const limit = maxSteps[slideIdx] || 0;
    const clamped = Math.max(0, Math.min(limit, stepIdx));
    slideSteps[slideIdx] = clamped;

    const section = getSection(slideIdx);
    if (section) {
      section.querySelectorAll('[data-step-item]').forEach((el) => {
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
    if (typeof onSlideStepChange === 'function') {
      onSlideStepChange(slideIdx, clamped);
    }
  }

  if (root) {
    root.querySelectorAll('[data-step-next]').forEach((btn) => {
      const section = btn.closest('.slide-section');
      if (!section || !section.id) return;
      const num = parseInt(section.id.replace('slide-', ''), 10);
      if (isNaN(num)) return;
      const slideIdx = num - 1;
      btn.addEventListener('click', () => {
        const limit = maxSteps[slideIdx] || 0;
        if (limit <= 0) return;
        const cur = slideSteps[slideIdx] || 0;
        const next = cur < limit ? cur + 1 : 0;
        setSlideStep(slideIdx, next);
      });
    });
  }

  Object.keys(maxSteps).forEach((slideIdxStr) => {
    const slideIdx = parseInt(slideIdxStr, 10);
    if (!isNaN(slideIdx) && (maxSteps[slideIdx] || 0) > 0) {
      setSlideStep(slideIdx, 0);
    }
  });

  return {
    goToSlide: () => {},
    setSlideStep,
    nextStepOrSlide: () => {},
    prevStepOrSlide: () => {},
    getCurrentSlide: () => 0
  };
}

export function initQuiz(questions, scopeSelector) {
  const root = scopeSelector ? document.querySelector(scopeSelector) : document;
  if (!root) return;

  let activeIdx = 0;
  const solved = new Array(questions.length).fill(false);
  const selected = new Array(questions.length).fill(null);

  const tabsWrap = root.querySelector('#quiz-tabs-nav, [data-quiz-role="tabs"]');
  const tagEl = root.querySelector('#quiz-prompt-tag, [data-quiz-role="tag"]');
  const promptEl = root.querySelector('#quiz-prompt-text, [data-quiz-role="prompt"]');
  const gridEl = root.querySelector('#quiz-options-grid, [data-quiz-role="grid"]');
  const feedbackEl = root.querySelector('#quiz-feedback-banner, [data-quiz-role="feedback"]');
  const progressEl = root.querySelector('#quiz-progress-label, [data-quiz-role="progress"]');
  const btnNext = root.querySelector('#btn-quiz-next, [data-quiz-role="next"]');
  const btnReset = root.querySelector('#btn-quiz-reset, [data-quiz-role="reset"]');

  if (!gridEl || !tabsWrap) return;

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

/**
 * AntesDepois.js — Ferramenta Interativa de Análise de Falhas (Antes & Depois)
 * Curso RCA — Análise de Causa Raiz e Confiabilidade
 */

(function() {
  'use strict';

  // Banco de Dados de Estudos de Caso
  const STUDY_CASES = [
    {
      id: 'case_01_rolamento',
      title: 'Caso 01: Rolamento com Falha por Fadiga e Pitting',
      shortTitle: '01. Rolamento (Pitting & Fadiga)',
      description: 'Arraste o divisor para correlacionar a evolução do micropitting e descascamento superficial com a pista íntegra.',
      imgBefore: '../assets/img/comparador/antes_rolamento.png',
      imgAfter: '../assets/img/comparador/depois_rolamento.png',
      labelBefore: 'FALHA (ANTES)',
      labelAfter: 'NOMINAL (DEPOIS)'
    }
  ];

  // Estado da Aplicação
  const state = {
    caseIndex: 0,
    mode: 'split', // 'split' | 'fade' | 'side' | 'diff'
    position: 50,
    orientation: 'horizontal', // 'horizontal' | 'vertical'
    inverted: false,
    filter: 'none', // 'none' | 'grayscale' | 'contrast' | 'edges'
    zoom: 1,
    panX: 0,
    panY: 0,
    isDraggingSlider: false,
    isPanning: false,
    panModeActive: false,
    panStart: { x: 0, y: 0 }
  };

  // Elementos DOM
  const dom = {
    frame: document.getElementById('comparison-frame'),
    stage: document.getElementById('stage'),
    panZoomTarget: document.getElementById('pan-zoom-target'),
    layerBefore: document.getElementById('layer-before'),
    layerAfter: document.getElementById('layer-after'),
    imgBefore: document.getElementById('img-before'),
    imgAfter: document.getElementById('img-after'),
    splitDivider: document.getElementById('split-divider'),
    splitHandle: document.getElementById('split-handle'),
    handleArrowLeft: document.getElementById('handle-arrow-left'),
    handleArrowRight: document.getElementById('handle-arrow-right'),
    labelBeforeTag: document.getElementById('label-before-tag'),
    labelAfterTag: document.getElementById('label-after-tag'),
    caseSelect: document.getElementById('case-select'),
    caseTitleText: document.getElementById('case-title-text'),
    caseDescText: document.getElementById('case-desc-text'),
    positionRange: document.getElementById('position-range'),
    percentageDisplay: document.getElementById('percentage-display'),
    trackLeftLabel: document.getElementById('track-left-label'),
    trackRightLabel: document.getElementById('track-right-label'),
    btnOrientation: document.getElementById('btn-orientation'),
    orientationLabel: document.getElementById('orientation-label'),
    btnInvert: document.getElementById('btn-invert'),
    btnFilter: document.getElementById('btn-filter'),
    filterLabel: document.getElementById('filter-label'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnZoomReset: document.getElementById('btn-zoom-reset'),
    btnPanToggle: document.getElementById('btn-pan-toggle'),
    btnShortcuts: document.getElementById('btn-shortcuts'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    modeTabs: document.querySelectorAll('.mode-tab')
  };

  // Inicialização
  function init() {
    buildCaseSelector();
    loadCase(0);
    bindEvents();
    updateView();
  }

  // Monta o seletor de Casos
  function buildCaseSelector() {
    dom.caseSelect.innerHTML = '';
    STUDY_CASES.forEach((c, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = c.shortTitle;
      dom.caseSelect.appendChild(opt);
    });
  }

  // Carrega os dados de um Estudo de Caso
  function loadCase(idx) {
    if (idx < 0 || idx >= STUDY_CASES.length) return;
    state.caseIndex = idx;
    const c = STUDY_CASES[idx];

    dom.caseTitleText.textContent = c.title;
    dom.caseDescText.textContent = c.description;

    applyImages();
    resetZoomAndPan();
  }

  // Aplica imagens de acordo com o estado (normal ou invertido)
  function applyImages() {
    const c = STUDY_CASES[state.caseIndex];
    const beforeSrc = state.inverted ? c.imgAfter : c.imgBefore;
    const afterSrc = state.inverted ? c.imgBefore : c.imgAfter;
    const beforeLabel = state.inverted ? c.labelAfter : c.labelBefore;
    const afterLabel = state.inverted ? c.labelBefore : c.labelAfter;

    dom.imgBefore.src = beforeSrc;
    dom.imgAfter.src = afterSrc;
    dom.labelBeforeTag.textContent = beforeLabel;
    dom.labelAfterTag.textContent = afterLabel;

    dom.trackLeftLabel.textContent = '0% ' + (state.inverted ? 'FALHA' : 'NOMINAL');
    dom.trackRightLabel.textContent = '100% ' + (state.inverted ? 'NOMINAL' : 'FALHA');
  }

  // Atualiza todo o layout e estilo do modo atual
  function updateView() {
    const pos = Math.min(100, Math.max(0, state.position));

    // Atualiza range e display
    dom.positionRange.value = pos;
    dom.percentageDisplay.textContent = Math.round(pos) + '%';

    // Limpa propriedades inline do layerAfter
    dom.layerAfter.style.clipPath = '';
    dom.layerAfter.style.opacity = '';
    dom.layerAfter.style.mixBlendMode = '';

    // Remove classes anteriores de modo
    dom.frame.classList.remove('mode-split-view', 'mode-fade-view', 'mode-side-view', 'mode-diff-view');
    dom.frame.classList.toggle('orient-horizontal', state.orientation === 'horizontal');
    dom.frame.classList.toggle('orient-vertical', state.orientation === 'vertical');

    if (state.orientation === 'horizontal') {
      dom.orientationLabel.textContent = 'Horizontal';
      dom.handleArrowLeft.textContent = '‹';
      dom.handleArrowRight.textContent = '›';
      dom.splitDivider.style.top = '0';
      dom.splitDivider.style.bottom = '0';
      dom.splitDivider.style.height = '';
      dom.splitDivider.style.left = pos + '%';
    } else {
      dom.orientationLabel.textContent = 'Vertical';
      dom.handleArrowLeft.textContent = '▲';
      dom.handleArrowRight.textContent = '▼';
      dom.splitDivider.style.left = '0';
      dom.splitDivider.style.right = '0';
      dom.splitDivider.style.width = '';
      dom.splitDivider.style.top = pos + '%';
    }

    // Renderiza de acordo com o modo
    switch (state.mode) {
      case 'split':
        dom.frame.classList.add('mode-split-view');
        dom.splitDivider.style.display = 'block';
        dom.labelBeforeTag.style.display = '';
        dom.labelAfterTag.style.display = '';

        if (state.orientation === 'horizontal') {
          // Revela layerAfter à esquerda usando clip-path sem deformar
          dom.layerAfter.style.clipPath = 'inset(0 calc(' + (100 - pos) + '%) 0 0)';
        } else {
          // Revela layerAfter no topo usando clip-path
          dom.layerAfter.style.clipPath = 'inset(0 0 calc(' + (100 - pos) + '%) 0)';
        }
        break;

      case 'fade':
        dom.frame.classList.add('mode-fade-view');
        dom.splitDivider.style.display = 'none';
        dom.labelBeforeTag.style.display = '';
        dom.labelAfterTag.style.display = '';
        dom.layerAfter.style.opacity = (pos / 100).toFixed(3);
        break;

      case 'side':
        dom.frame.classList.add('mode-side-view');
        dom.splitDivider.style.display = 'none';
        dom.labelBeforeTag.style.display = '';
        dom.labelAfterTag.style.display = '';
        break;

      case 'diff':
        dom.frame.classList.add('mode-diff-view');
        dom.splitDivider.style.display = 'none';
        dom.labelBeforeTag.style.display = 'none';
        dom.labelAfterTag.style.display = 'none';
        dom.layerAfter.style.mixBlendMode = 'difference';
        dom.layerAfter.style.opacity = (pos / 100).toFixed(3);
        break;
    }

    // Atualiza tabs
    dom.modeTabs.forEach(tab => {
      const isActive = tab.dataset.mode === state.mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Atualiza filtros
    dom.frame.classList.remove('filter-grayscale', 'filter-contrast', 'filter-edges');
    if (state.filter === 'grayscale') dom.frame.classList.add('filter-grayscale');
    if (state.filter === 'contrast') dom.frame.classList.add('filter-contrast');
    if (state.filter === 'edges') dom.frame.classList.add('filter-edges');

    // Label do filtro
    const filterNames = {
      none: 'Cor Real',
      grayscale: 'P & B',
      contrast: 'Contraste',
      edges: 'Realce Borda'
    };
    dom.filterLabel.textContent = filterNames[state.filter] || 'Cor Real';
    dom.btnFilter.classList.toggle('active', state.filter !== 'none');
    dom.btnInvert.classList.toggle('active', state.inverted);

    updateTransform();
  }

  // Atualiza o Pan & Zoom
  function updateTransform() {
    dom.panZoomTarget.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';
    dom.btnZoomReset.textContent = Math.round(state.zoom * 100) + '%';
    dom.stage.style.cursor = state.panModeActive ? 'grab' : 'default';
  }

  function resetZoomAndPan() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    updateTransform();
  }

  // Calcula a posição pelo ponteiro
  function setPositionFromPointer(clientX, clientY) {
    const bounds = dom.frame.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    let next = 50;
    if (state.orientation === 'horizontal') {
      next = ((clientX - bounds.left) / bounds.width) * 100;
    } else {
      next = ((clientY - bounds.top) / bounds.height) * 100;
    }

    state.position = Math.min(100, Math.max(0, next));
    updateView();
  }

  // Vinculação de Eventos
  function bindEvents() {
    // Seletor de caso
    dom.caseSelect.addEventListener('change', (e) => {
      loadCase(parseInt(e.target.value, 10));
    });

    // Abas de Modo
    dom.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.mode = tab.dataset.mode;
        updateView();
      });
    });

    // Slider range inferior
    dom.positionRange.addEventListener('input', (e) => {
      state.position = parseFloat(e.target.value);
      updateView();
    });

    // Alternar Orientação
    dom.btnOrientation.addEventListener('click', () => {
      state.orientation = state.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      updateView();
    });

    // Inverter Imagens
    dom.btnInvert.addEventListener('click', () => {
      state.inverted = !state.inverted;
      applyImages();
      updateView();
    });

    // Alternar Filtros
    dom.btnFilter.addEventListener('click', () => {
      const filters = ['none', 'grayscale', 'contrast', 'edges'];
      const nextIdx = (filters.indexOf(state.filter) + 1) % filters.length;
      state.filter = filters[nextIdx];
      updateView();
    });

    // Controles de Zoom
    dom.btnZoomIn.addEventListener('click', () => {
      state.zoom = Math.min(4, state.zoom + 0.25);
      updateTransform();
    });

    dom.btnZoomOut.addEventListener('click', () => {
      state.zoom = Math.max(1, state.zoom - 0.25);
      if (state.zoom === 1) { state.panX = 0; state.panY = 0; }
      updateTransform();
    });

    dom.btnZoomReset.addEventListener('click', resetZoomAndPan);

    // Modo Pan (Mão)
    dom.btnPanToggle.addEventListener('click', () => {
      state.panModeActive = !state.panModeActive;
      dom.btnPanToggle.classList.toggle('active', state.panModeActive);
      updateTransform();
    });

    // Modal de Atalhos
    dom.btnShortcuts.addEventListener('click', () => dom.shortcutsModal.classList.add('open'));
    dom.btnCloseModal.addEventListener('click', () => dom.shortcutsModal.classList.remove('open'));
    dom.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === dom.shortcutsModal) dom.shortcutsModal.classList.remove('open');
    });

    // Eventos de Pointer para o Frame (Split Slider & Pan)
    dom.frame.addEventListener('pointerdown', (e) => {
      if (state.panModeActive || (e.buttons === 4 || e.shiftKey)) {
        // Inicia Pan
        state.isPanning = true;
        state.panStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
        dom.frame.setPointerCapture(e.pointerId);
        dom.stage.style.cursor = 'grabbing';
      } else if (state.mode === 'split') {
        // Inicia Arraste do Slider
        state.isDraggingSlider = true;
        dom.frame.classList.add('is-dragging');
        dom.frame.setPointerCapture(e.pointerId);
        setPositionFromPointer(e.clientX, e.clientY);
      }
    });

    dom.frame.addEventListener('pointermove', (e) => {
      if (state.isPanning) {
        state.panX = e.clientX - state.panStart.x;
        state.panY = e.clientY - state.panStart.y;
        updateTransform();
      } else if (state.isDraggingSlider && state.mode === 'split') {
        setPositionFromPointer(e.clientX, e.clientY);
      }
    });

    const stopDragging = (e) => {
      if (dom.frame.hasPointerCapture(e.pointerId)) {
        dom.frame.releasePointerCapture(e.pointerId);
      }
      state.isDraggingSlider = false;
      state.isPanning = false;
      dom.frame.classList.remove('is-dragging');
      dom.stage.style.cursor = state.panModeActive ? 'grab' : 'default';
    };

    dom.frame.addEventListener('pointerup', stopDragging);
    dom.frame.addEventListener('pointercancel', stopDragging);

    // Zoom via Roda do Mouse (Wheel)
    dom.stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      state.zoom = Math.min(4, Math.max(1, state.zoom + delta));
      if (state.zoom === 1) { state.panX = 0; state.panY = 0; }
      updateTransform();
    }, { passive: false });

    // Atalhos de Teclado
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key) {
        case '1':
          state.mode = 'split'; updateView(); break;
        case '2':
          state.mode = 'fade'; updateView(); break;
        case '3':
          state.mode = 'side'; updateView(); break;
        case '4':
          state.mode = 'diff'; updateView(); break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          state.position = Math.max(0, state.position - 5);
          updateView();
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          state.position = Math.min(100, state.position + 5);
          updateView();
          break;
        case 'Home':
          state.position = 0; updateView(); break;
        case 'End':
          state.position = 100; updateView(); break;
        case 'h':
        case 'H':
          state.orientation = 'horizontal'; updateView(); break;
        case 'v':
        case 'V':
          state.orientation = 'vertical'; updateView(); break;
        case 'i':
        case 'I':
          dom.btnInvert.click(); break;
        case 'f':
        case 'F':
          dom.btnFilter.click(); break;
        case '+':
        case '=':
          dom.btnZoomIn.click(); break;
        case '-':
        case '_':
          dom.btnZoomOut.click(); break;
        case '0':
        case 'r':
        case 'R':
          resetZoomAndPan(); break;
        case ' ':
          e.preventDefault();
          dom.btnPanToggle.click();
          break;
        case '?':
          dom.shortcutsModal.classList.toggle('open');
          break;
        case 'Escape':
          dom.shortcutsModal.classList.remove('open');
          resetZoomAndPan();
          break;
      }
    });
  }

  // Inicia aplicação
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
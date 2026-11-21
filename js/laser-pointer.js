// laser-pointer.js - Modo Apresentação Interativo para Professores/Mentores
(function () {
  let isPresentationActive = false;
  let activeTool = sessionStorage.getItem('LCC_LASER_TOOL') || 'cursor'; // cursor, laser, spotlight, highlighter
  let activeColor = sessionStorage.getItem('LCC_LASER_COLOR') || 'red'; // red, green, blue, yellow
  let toolbarHideTimeout = null;
  let isDrawing = false;
  let isToolbarHovered = false;

  // Mapa de cores hexadecimais correspondentes às classes do CSS
  const COLOR_MAP = {
    red: '#dc2626',
    green: '#059669',
    blue: '#2563eb',
    yellow: '#d97706'
  };

  // Referências de elementos criados dinamicamente
  let overlayContainer = null;
  let laserDot = null;
  let spotlightMask = null;
  let highlighterCanvas = null;
  let canvasCtx = null;
  let toolbar = null;
  let textBoxes = [];
  let selectedTextBox = null;

  // Inicializar escutas de eventos do teclado
  document.addEventListener('keydown', (e) => {
    // Atalho Alt + F11 ou F11 padrão do navegador
    if (e.key === 'F11' || (e.altKey && e.key === 'F11')) {
      e.preventDefault();
      togglePresentationMode();
      return;
    }

    // Não interceptar atalhos se o foco estiver dentro de um campo de digitação
    const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
    if (isTyping) {
      return;
    }

    // Atalho T para ativar/desativar a ferramenta de Texto
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.altKey && !e.metaKey && isPresentationActive) {
      e.preventDefault();
      selectTool(activeTool === 'text' ? 'cursor' : 'text');
      return;
    }

    // Tecla Esc para voltar ao ponteiro padrão ou desmarcar caixa de texto ativa
    if (e.key === 'Escape' && isPresentationActive) {
      if (selectedTextBox) {
        deselectAllTextBoxes();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (activeTool !== 'cursor') {
        // Se houver qualquer ferramenta ativa (laser, holofote, caneta, texto), volta para o cursor padrão
        selectTool('cursor');
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // Função auxiliar para verificar estado de tela cheia por múltiplos métodos (compatível com Zoom do navegador e múltiplos monitores)
  function checkIsFullscreen() {
    // 1. API HTML5 padrão (modo de tela cheia acionado por script)
    if (document.fullscreenElement) {
      return true;
    }

    // 2. Método de Proporção de Janela (Altamente robusto para qualquer nível de zoom)
    if (window.outerWidth && window.outerHeight && window.innerWidth && window.innerHeight) {
      const widthRatio = window.outerWidth / window.innerWidth;
      const heightRatio = window.outerHeight / window.innerHeight;
      const ratioDiff = Math.abs(widthRatio - heightRatio);
      
      if (ratioDiff < 0.08) {
        return true;
      }
    }

    // 3. Verificação por dimensões externas da janela em relação ao monitor atual
    if (window.screen) {
      const isOuterMatch = Math.abs(window.outerWidth - window.screen.width) <= 20 && 
                           Math.abs(window.outerHeight - window.screen.height) <= 20;
      if (isOuterMatch) return true;
      
      const isInnerMatch = Math.abs(window.innerWidth - window.screen.width) <= 20 && 
                           Math.abs(window.innerHeight - window.screen.height) <= 20;
      if (isInnerMatch) return true;
    }

    return false;
  }

  // Monitorar saída e entrada de tela cheia por redimensionamentos ou API nativa
  function handleScreenChange() {
    const isFullscreen = checkIsFullscreen();
    console.log(`[LaserPointer] handleScreenChange: isFullscreen=${isFullscreen}, active=${isPresentationActive}`);
    
    if (!isPresentationActive) {
      enterPresentationLayout();
    } else {
      resizeCanvas();
    }

    if (toolbar) {
      const exitBtn = toolbar.querySelector('.btn-exit');
      if (exitBtn) {
        exitBtn.setAttribute('data-tooltip', isFullscreen ? 'Sair da Tela Cheia (F11)' : 'Alternar Tela Cheia (F11)');
      }
    }
  }

  document.addEventListener('fullscreenchange', handleScreenChange);
  window.addEventListener('resize', handleScreenChange);

  // Escuta mensagens vindas da casca SPA (parent)
  window.addEventListener('message', (event) => {
    const { type } = event.data;
    if (type === 'ENTER_PRESENTATION' || type === 'INIT_LASER_POINTER') {
      if (!isPresentationActive) {
        enterPresentationLayout();
      }
    }
  });

  // Alternar o modo de apresentação / tela cheia
  function togglePresentationMode() {
    const isFullscreen = checkIsFullscreen();

    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Erro ao tentar entrar em tela cheia nativa:", err);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }

  // Ativar o Layout de Apresentação e Ponteiro Laser em qualquer momento
  function enterPresentationLayout() {
    isPresentationActive = true;
    
    document.body.classList.add('presentation-active');

    // Criar o Container Geral se não existir
    overlayContainer = document.querySelector('.presentation-overlay-container');
    if (!overlayContainer) {
      overlayContainer = document.createElement('div');
      overlayContainer.className = 'presentation-overlay-container';
      document.body.appendChild(overlayContainer);
    }
    overlayContainer.innerHTML = ''; // Limpar conteúdos anteriores

    // 1. Criar Máscara do Holofote
    spotlightMask = document.createElement('div');
    spotlightMask.className = 'presentation-spotlight-mask';
    overlayContainer.appendChild(spotlightMask);

    // 2. Criar Canvas da Caneta Marca-Texto
    highlighterCanvas = document.createElement('canvas');
    highlighterCanvas.className = 'presentation-highlighter-canvas';
    overlayContainer.appendChild(highlighterCanvas);
    canvasCtx = highlighterCanvas.getContext('2d');
    resizeCanvas();

    // 3. Criar Ponteiro Laser
    laserDot = document.createElement('div');
    laserDot.className = 'presentation-laser-dot';
    updateLaserColor();
    overlayContainer.appendChild(laserDot);

    // 4. Criar Barra de Ferramentas no topo (no cabeçalho viewport do pai ou local)
    createToolbar();

    // Adicionar eventos de interação
    setupInteractions();
    resetToolbarTimeout();

    // Aplicar a ferramenta e cor salvas no estado
    selectTool(activeTool);
    selectColor(activeColor);
  }

  // Desativar Layout de Apresentação (caso necessário)
  function exitPresentationLayout() {
    isPresentationActive = false;
    document.body.classList.remove('presentation-active');
    document.body.classList.remove('presentation-cursor-hidden');

    textBoxes.forEach((box) => {
      box.remove();
    });
    textBoxes = [];
    selectedTextBox = null;

    if (overlayContainer) {
      overlayContainer.remove();
      overlayContainer = null;
    }

    if (toolbar) {
      toolbar.remove();
      toolbar = null;
    }

    if (toolbarHideTimeout) {
      clearTimeout(toolbarHideTimeout);
      toolbarHideTimeout = null;
    }

    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('touchmove', handlePointerMove);
  }

  // Configurar redimensionamento do Canvas
  function resizeCanvas() {
    if (!highlighterCanvas) return;
    
    // Salvar o desenho atual antes de redimensionar
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = highlighterCanvas.width;
    tempCanvas.height = highlighterCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (highlighterCanvas.width > 0 && highlighterCanvas.height > 0) {
      tempCtx.drawImage(highlighterCanvas, 0, 0);
    }

    highlighterCanvas.width = window.innerWidth;
    highlighterCanvas.height = window.innerHeight;

    // Restaurar o desenho no novo tamanho
    if (canvasCtx) {
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';
      canvasCtx.lineWidth = 4;
      canvasCtx.strokeStyle = COLOR_MAP[activeColor];
      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        canvasCtx.drawImage(tempCanvas, 0, 0);
      }
    }
  }

  // Criar e Renderizar a Barra de Ferramentas Flutuante
  function createToolbar() {
    // Buscar cabeçalho da viewport no documento pai (se iframe) ou no documento local
    let headerContainer = null;
    try {
      if (window.parent && window.parent.document) {
        headerContainer = window.parent.document.querySelector('.viewport-header');
      }
    } catch (e) {}

    if (!headerContainer) {
      headerContainer = document.querySelector('.viewport-header');
    }

    const doc = headerContainer ? headerContainer.ownerDocument : document;

    toolbar = doc.createElement('div');
    toolbar.className = 'presentation-toolbar';

    const isFs = checkIsFullscreen();
    const fsTooltip = isFs ? 'Sair da Tela Cheia (F11)' : 'Alternar Tela Cheia (F11)';

    toolbar.innerHTML = `
      <!-- Botão Cursor -->
      <button class="presentation-btn ${activeTool === 'cursor' ? 'active' : ''}" data-tool="cursor" data-tooltip="Cursor Padrão (Esc)">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          <path d="M13 13l6 6"/>
        </svg>
      </button>

      <!-- Botão Laser -->
      <button class="presentation-btn ${activeTool === 'laser' ? 'active' : ''}" data-tool="laser" data-tooltip="Ponteiro Laser">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      </button>

      <!-- Botão Holofote -->
      <button class="presentation-btn ${activeTool === 'spotlight' ? 'active' : ''}" data-tool="spotlight" data-tooltip="Holofote (Spotlight)">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      </button>

      <!-- Botão Caneta -->
      <button class="presentation-btn ${activeTool === 'highlighter' ? 'active' : ''}" data-tool="highlighter" data-tooltip="Caneta Marca-Texto">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      <!-- Botão Texto / Digitar na Tela -->
      <button class="presentation-btn ${activeTool === 'text' ? 'active' : ''}" data-tool="text" data-tooltip="Digitar Texto (T)">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      </button>

      <div class="presentation-divider"></div>

      <!-- Seletor de Cores -->
      <div class="presentation-color-picker">
        <div class="presentation-color-swatch ${activeColor === 'red' ? 'active' : ''}" data-color="red" data-tooltip="Vermelho"></div>
        <div class="presentation-color-swatch ${activeColor === 'green' ? 'active' : ''}" data-color="green" data-tooltip="Verde"></div>
        <div class="presentation-color-swatch ${activeColor === 'blue' ? 'active' : ''}" data-color="blue" data-tooltip="Azul"></div>
        <div class="presentation-color-swatch ${activeColor === 'yellow' ? 'active' : ''}" data-color="yellow" data-tooltip="Amarelo"></div>
      </div>

      <div class="presentation-divider"></div>

      <!-- Limpar Desenhos e Textos -->
      <button class="presentation-btn btn-clear" data-tooltip="Limpar Anotações">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>

      <!-- Alternar Tela Cheia -->
      <button class="presentation-btn btn-exit" data-tooltip="${fsTooltip}">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14h6v6m10-10h-6V4m0 6l6-6M10 14l-6 6"/>
        </svg>
      </button>
    `;

    if (headerContainer) {
      const existing = headerContainer.querySelector('.presentation-toolbar');
      if (existing) existing.remove();
      headerContainer.appendChild(toolbar);
    } else if (overlayContainer) {
      overlayContainer.appendChild(toolbar);
    }

    // Eventos dos botões da barra de ferramentas
    toolbar.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = btn.getAttribute('data-tool');
        selectTool(tool);
      });
    });

    toolbar.querySelectorAll('[data-color]').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        selectColor(color);
      });
    });

    const btnClear = toolbar.querySelector('.btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        clearDrawings();
      });
    }

    const btnExit = toolbar.querySelector('.btn-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        togglePresentationMode();
      });
    }

    // Manter barra visível
    toolbar.addEventListener('mouseenter', () => {
      isToolbarHovered = true;
      showToolbar();
    });

    toolbar.addEventListener('mouseleave', () => {
      isToolbarHovered = false;
      resetToolbarTimeout();
    });
  }

  // Atualizar a cor do ponteiro laser no CSS
  function updateLaserColor() {
    if (laserDot) {
      laserDot.style.setProperty('--laser-color', COLOR_MAP[activeColor]);
    }
  }

  // Alternar Ferramentas de Apresentação
  function selectTool(tool) {
    activeTool = tool;
    try {
      sessionStorage.setItem('LCC_LASER_TOOL', tool);
    } catch (e) {}

    if (toolbar) {
      toolbar.querySelectorAll('[data-tool]').forEach((btn) => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tool') === tool) {
          btn.classList.add('active');
        }
      });
    }

    // Ocultar ponteiro padrão em ferramentas que precisam
    if (tool === 'laser' || tool === 'spotlight') {
      document.body.classList.add('presentation-cursor-hidden');
    } else {
      document.body.classList.remove('presentation-cursor-hidden');
    }

    // Configurar estados dos elementos
    if (tool === 'laser') {
      if (laserDot) laserDot.style.opacity = '1';
      if (spotlightMask) spotlightMask.classList.remove('active');
      if (highlighterCanvas) {
        highlighterCanvas.classList.remove('active');
        highlighterCanvas.classList.remove('text-mode');
      }
    } else if (tool === 'spotlight') {
      if (laserDot) laserDot.style.opacity = '0';
      if (spotlightMask) spotlightMask.classList.add('active');
      if (highlighterCanvas) {
        highlighterCanvas.classList.remove('active');
        highlighterCanvas.classList.remove('text-mode');
      }
    } else if (tool === 'highlighter') {
      if (laserDot) laserDot.style.opacity = '0';
      if (spotlightMask) spotlightMask.classList.remove('active');
      if (highlighterCanvas) {
        highlighterCanvas.classList.add('active');
        highlighterCanvas.classList.remove('text-mode');
      }
    } else if (tool === 'text') {
      if (laserDot) laserDot.style.opacity = '0';
      if (spotlightMask) spotlightMask.classList.remove('active');
      if (highlighterCanvas) {
        highlighterCanvas.classList.add('active');
        highlighterCanvas.classList.add('text-mode');
      }
    } else {
      // Modo cursor padrão
      if (laserDot) laserDot.style.opacity = '0';
      if (spotlightMask) spotlightMask.classList.remove('active');
      if (highlighterCanvas) {
        highlighterCanvas.classList.remove('active');
        highlighterCanvas.classList.remove('text-mode');
      }
    }
  }

  // Selecionar Cor de Destaque
  function selectColor(color) {
    activeColor = color;
    try {
      sessionStorage.setItem('LCC_LASER_COLOR', color);
    } catch (e) {}

    if (toolbar) {
      toolbar.querySelectorAll('[data-color]').forEach((swatch) => {
        swatch.classList.remove('active');
        if (swatch.getAttribute('data-color') === color) {
          swatch.classList.add('active');
        }
      });
    }

    updateLaserColor();

    if (canvasCtx) {
      canvasCtx.strokeStyle = COLOR_MAP[color];
    }

    if (selectedTextBox) {
      selectedTextBox.style.setProperty('--box-color', COLOR_MAP[color]);
      selectedTextBox.dataset.color = color;
    }
  }

  // Desmarcar todas as caixas de texto ativas e limpar as vazias
  function deselectAllTextBoxes() {
    textBoxes = textBoxes.filter((box) => {
      const textEl = box.querySelector('.presentation-textbox-text');
      const text = (textEl ? textEl.innerText || textEl.textContent : '').trim();
      if (!text && box !== selectedTextBox) {
        box.remove();
        return false;
      }
      return true;
    });

    if (selectedTextBox) {
      const textEl = selectedTextBox.querySelector('.presentation-textbox-text');
      const text = (textEl ? textEl.innerText || textEl.textContent : '').trim();
      if (!text) {
        selectedTextBox.remove();
        textBoxes = textBoxes.filter((b) => b !== selectedTextBox);
      } else {
        selectedTextBox.classList.remove('selected');
      }
      selectedTextBox = null;
    }
  }

  // Selecionar uma caixa de texto específica
  function selectTextBox(box) {
    if (selectedTextBox && selectedTextBox !== box) {
      const textEl = selectedTextBox.querySelector('.presentation-textbox-text');
      const text = (textEl ? textEl.innerText || textEl.textContent : '').trim();
      if (!text) {
        selectedTextBox.remove();
        textBoxes = textBoxes.filter((b) => b !== selectedTextBox);
      } else {
        selectedTextBox.classList.remove('selected');
      }
    }

    selectedTextBox = box;
    box.classList.add('selected');

    if (COLOR_MAP[activeColor]) {
      box.style.setProperty('--box-color', COLOR_MAP[activeColor]);
      box.dataset.color = activeColor;
    }
  }

  // Criar caixa de texto flutuante, arrastável e giratória
  function createTextBox(x, y) {
    if (!overlayContainer) return;

    deselectAllTextBoxes();

    const box = document.createElement('div');
    box.className = 'presentation-textbox selected';
    box.style.setProperty('--box-color', COLOR_MAP[activeColor]);
    box.dataset.color = activeColor;
    box.dataset.angle = '0';

    // Posição inicial compacta centralizada no clique
    const initialLeft = Math.max(10, Math.min(window.innerWidth - 120, x - 20));
    const initialTop = Math.max(50, Math.min(window.innerHeight - 60, y - 15));
    box.style.left = `${initialLeft}px`;
    box.style.top = `${initialTop}px`;
    box.style.transform = 'rotate(0deg)';

    box.innerHTML = `
      <!-- Handle de Rotação Superior -->
      <div class="presentation-textbox-rotate-wrapper">
        <div class="presentation-textbox-rotate-handle" title="Girar caixa (Arraste para girar / Shift para travar em 15°)">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
        </div>
        <div class="presentation-textbox-rotate-stem"></div>
      </div>

      <!-- Barra de Controle Superior (Arrastar + Ângulo + Tamanho da Fonte + Excluir) -->
      <div class="presentation-textbox-header">
        <div class="presentation-textbox-drag-grip" title="Arrastar / Reposicionar">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/>
            <circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>
            <circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>
          </svg>
          <span class="presentation-textbox-angle-badge">0°</span>
          <span class="presentation-textbox-size-badge">20px</span>
        </div>
        <button class="presentation-textbox-delete-btn" title="Excluir Caixa de Texto" type="button">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Área de Digitação / Conteúdo (contenteditable seguro contra corte) -->
      <div class="presentation-textbox-content-wrapper">
        <div class="presentation-textbox-text" contenteditable="true" placeholder="Digite uma anotação..." spellcheck="false"></div>
      </div>

      <!-- Handle de Redimensionamento Inferior Direito -->
      <div class="presentation-textbox-resize-handle" title="Redimensionar caixa (Ajusta o tamanho do texto automaticamente)"></div>
    `;

    overlayContainer.appendChild(box);
    textBoxes.push(box);
    selectedTextBox = box;

    const textEl = box.querySelector('.presentation-textbox-text');
    const rotateHandle = box.querySelector('.presentation-textbox-rotate-handle');
    const resizeHandle = box.querySelector('.presentation-textbox-resize-handle');
    const header = box.querySelector('.presentation-textbox-header');
    const deleteBtn = box.querySelector('.presentation-textbox-delete-btn');
    const angleBadge = box.querySelector('.presentation-textbox-angle-badge');
    const sizeBadge = box.querySelector('.presentation-textbox-size-badge');

    let isManuallyResized = false;

    // Evitar que teclas de digitação interfiram na navegação dos slides
    textEl.addEventListener('keydown', (e) => {
      e.stopPropagation();

      if (e.key === 'Escape') {
        e.preventDefault();
        textEl.blur();
        deselectAllTextBoxes();
      }
    });

    textEl.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });

    textEl.addEventListener('focus', () => {
      selectTextBox(box);
    });

    // Clique na caixa de texto seleciona-a
    box.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      selectTextBox(box);
    });

    box.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      selectTextBox(box);
    }, { passive: true });

    // Botão de excluir
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      box.remove();
      textBoxes = textBoxes.filter((b) => b !== box);
      if (selectedTextBox === box) {
        selectedTextBox = null;
      }
    });

    // Rotação Interativa da Caixa de Texto
    rotateHandle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      selectTextBox(box);

      try {
        rotateHandle.setPointerCapture(e.pointerId);
      } catch (err) {}

      const rect = box.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      box.classList.add('is-rotating');
      document.body.classList.add('presentation-rotating-active');

      const onRotateMove = (moveEvt) => {
        const dx = moveEvt.clientX - centerX;
        const dy = moveEvt.clientY - centerY;

        // Ângulo do ponteiro em relação ao centro (em graus)
        let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        if (moveEvt.shiftKey) {
          degrees = Math.round(degrees / 15) * 15;
        } else {
          degrees = Math.round(degrees);
        }

        let normDeg = ((degrees % 360) + 360) % 360;
        if (normDeg > 180) normDeg -= 360;

        box.dataset.angle = normDeg;
        box.style.transform = `rotate(${normDeg}deg)`;
        if (angleBadge) {
          angleBadge.textContent = `${normDeg}°`;
        }
      };

      const onRotateUp = (upEvt) => {
        rotateHandle.removeEventListener('pointermove', onRotateMove);
        rotateHandle.removeEventListener('pointerup', onRotateUp);
        rotateHandle.removeEventListener('pointercancel', onRotateUp);

        try {
          rotateHandle.releasePointerCapture(upEvt.pointerId);
        } catch (err) {}

        box.classList.remove('is-rotating');
        document.body.classList.remove('presentation-rotating-active');
      };

      rotateHandle.addEventListener('pointermove', onRotateMove);
      rotateHandle.addEventListener('pointerup', onRotateUp);
      rotateHandle.addEventListener('pointercancel', onRotateUp);
    });

    // Redimensionamento Interativo com Escalonamento Automático de Fonte
    resizeHandle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      selectTextBox(box);

      try {
        resizeHandle.setPointerCapture(e.pointerId);
      } catch (err) {}

      const startPointerX = e.clientX;
      const startPointerY = e.clientY;
      const startWidth = box.offsetWidth;
      const startHeight = box.offsetHeight;
      const startFontSize = parseFloat(window.getComputedStyle(textEl).fontSize) || 20;

      const angleDeg = parseFloat(box.dataset.angle) || 0;
      const angleRad = (angleDeg * Math.PI) / 180;

      box.classList.add('is-resizing');
      document.body.classList.add('presentation-resizing-active');
      isManuallyResized = true;
      box.dataset.manuallyResized = 'true';

      const onResizeMove = (moveEvt) => {
        const deltaX = moveEvt.clientX - startPointerX;
        const deltaY = moveEvt.clientY - startPointerY;

        // Projetar o deslocamento do cursor no sistema de coordenadas rotacionado da caixa
        const localDeltaX = deltaX * Math.cos(-angleRad) - deltaY * Math.sin(-angleRad);
        const localDeltaY = deltaX * Math.sin(-angleRad) + deltaY * Math.cos(-angleRad);

        const newWidth = Math.max(45, Math.min(window.innerWidth * 0.95, startWidth + localDeltaX));
        const newHeight = Math.max(26, Math.min(window.innerHeight * 0.95, startHeight + localDeltaY));

        // Proporção de escala da fonte combinando largura e altura suavemente
        const scaleRatio = Math.max(0.3, Math.min(6.0, (newWidth / startWidth) * 0.7 + (newHeight / startHeight) * 0.3));
        const newFontSize = Math.max(10, Math.min(120, Math.round(startFontSize * scaleRatio)));

        box.style.width = `${newWidth}px`;
        box.style.height = `${newHeight}px`;

        textEl.style.fontSize = `${newFontSize}px`;
        textEl.style.lineHeight = '1.15';
        box.dataset.fontSize = newFontSize;

        if (sizeBadge) {
          sizeBadge.textContent = `${newFontSize}px`;
        }
      };

      const onResizeUp = (upEvt) => {
        resizeHandle.removeEventListener('pointermove', onResizeMove);
        resizeHandle.removeEventListener('pointerup', onResizeUp);
        resizeHandle.removeEventListener('pointercancel', onResizeUp);

        try {
          resizeHandle.releasePointerCapture(upEvt.pointerId);
        } catch (err) {}

        box.classList.remove('is-resizing');
        document.body.classList.remove('presentation-resizing-active');
      };

      resizeHandle.addEventListener('pointermove', onResizeMove);
      resizeHandle.addEventListener('pointerup', onResizeUp);
      resizeHandle.addEventListener('pointercancel', onResizeUp);
    });

    // Reposicionamento (Arrasto) da Caixa de Texto
    const startDragging = (e) => {
      if (e.target.closest('.presentation-textbox-delete-btn') || e.target.closest('.presentation-textbox-rotate-handle') || e.target.closest('.presentation-textbox-resize-handle') || e.target.closest('.presentation-textbox-text')) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      selectTextBox(box);

      const startPointerX = e.clientX;
      const startPointerY = e.clientY;
      const startLeft = parseFloat(box.style.left) || box.offsetLeft;
      const startTop = parseFloat(box.style.top) || box.offsetTop;

      box.classList.add('is-dragging');

      try {
        header.setPointerCapture(e.pointerId);
      } catch (err) {}

      const onDragMove = (moveEvt) => {
        const deltaX = moveEvt.clientX - startPointerX;
        const deltaY = moveEvt.clientY - startPointerY;

        let nextLeft = startLeft + deltaX;
        let nextTop = startTop + deltaY;

        // Limites da viewport
        nextLeft = Math.max(-100, Math.min(window.innerWidth - 80, nextLeft));
        nextTop = Math.max(10, Math.min(window.innerHeight - 60, nextTop));

        box.style.left = `${nextLeft}px`;
        box.style.top = `${nextTop}px`;
      };

      const onDragUp = (upEvt) => {
        header.removeEventListener('pointermove', onDragMove);
        header.removeEventListener('pointerup', onDragUp);
        header.removeEventListener('pointercancel', onDragUp);

        try {
          header.releasePointerCapture(upEvt.pointerId);
        } catch (err) {}

        box.classList.remove('is-dragging');
      };

      header.addEventListener('pointermove', onDragMove);
      header.addEventListener('pointerup', onDragUp);
      header.addEventListener('pointercancel', onDragUp);
    };

    header.addEventListener('pointerdown', startDragging);
    box.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.presentation-textbox-text') || e.target.closest('.presentation-textbox-rotate-handle') || e.target.closest('.presentation-textbox-resize-handle') || e.target.closest('.presentation-textbox-delete-btn')) {
        return;
      }
      startDragging(e);
    });

    // Foco imediato na digitação
    requestAnimationFrame(() => {
      textEl.focus();
    });
  }

  // Limpar todos os desenhos e textos do canvas
  function clearDrawings() {
    textBoxes.forEach((box) => {
      box.remove();
    });
    textBoxes = [];
    selectedTextBox = null;

    if (canvasCtx && highlighterCanvas) {
      canvasCtx.clearRect(0, 0, highlighterCanvas.width, highlighterCanvas.height);
    }
  }

  // Configurar escutas de movimento do mouse/toque na tela
  function setupInteractions() {
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });

    // Desmarcar caixas ao clicar fora
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.presentation-textbox') && !e.target.closest('.presentation-toolbar')) {
        if (selectedTextBox && activeTool !== 'text') {
          deselectAllTextBoxes();
        }
      }
    });

    document.addEventListener('mouseleave', () => {
      if (laserDot && activeTool === 'laser') {
        laserDot.style.opacity = '0';
      }
    });

    document.addEventListener('mouseenter', () => {
      if (laserDot && activeTool === 'laser') {
        laserDot.style.opacity = '1';
      }
    });

    if (highlighterCanvas) {
      // Interação de Clique / Desenho / Texto no Canvas
      highlighterCanvas.addEventListener('mousedown', (e) => {
        if (activeTool === 'text') {
          if (e.target.closest('.presentation-textbox')) return;
          createTextBox(e.clientX, e.clientY);
          return;
        }

        if (activeTool === 'highlighter') {
          startDrawing(e);
        }
      });

      highlighterCanvas.addEventListener('mousemove', draw);
      highlighterCanvas.addEventListener('mouseup', stopDrawing);
      highlighterCanvas.addEventListener('mouseleave', stopDrawing);

      // Suporte a Telas de Toque (Touchscreen) para Desenho e Texto
      highlighterCanvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (activeTool === 'text') {
          if (e.target.closest('.presentation-textbox')) return;
          createTextBox(touch.clientX, touch.clientY);
          return;
        }
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        highlighterCanvas.dispatchEvent(mouseEvent);
      });

      highlighterCanvas.addEventListener('touchmove', (e) => {
        if (activeTool !== 'highlighter') return;
        e.preventDefault(); // Impedir rolagem da tela ao desenhar no touch
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        highlighterCanvas.dispatchEvent(mouseEvent);
      }, { passive: false });

      highlighterCanvas.addEventListener('touchend', () => {
        const mouseEvent = new MouseEvent('mouseup', {});
        highlighterCanvas.dispatchEvent(mouseEvent);
      });
    }
  }

  // Tratar Movimentos do Cursor
  function handlePointerMove(e) {
    if (!isPresentationActive) return;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // 1. Atualizar Laser
    if (laserDot && activeTool === 'laser') {
      laserDot.style.opacity = '1';
      laserDot.style.left = `${clientX}px`;
      laserDot.style.top = `${clientY}px`;
    }

    // 2. Atualizar Holofote
    if (spotlightMask && activeTool === 'spotlight') {
      spotlightMask.style.setProperty('--spotlight-x', `${clientX}px`);
      spotlightMask.style.setProperty('--spotlight-y', `${clientY}px`);
    }

    // Reexibir a barra de ferramentas ao mover o mouse
    showToolbar();
    resetToolbarTimeout();
  }

  // Iniciar Traço da Caneta
  function startDrawing(e) {
    if (activeTool !== 'highlighter' || !canvasCtx) return;
    isDrawing = true;
    canvasCtx.beginPath();
    canvasCtx.moveTo(e.clientX, e.clientY);
  }

  // Desenhar Traço
  function draw(e) {
    if (!isDrawing || activeTool !== 'highlighter' || !canvasCtx) return;
    canvasCtx.lineTo(e.clientX, e.clientY);
    canvasCtx.stroke();
  }

  // Finalizar Traço
  function stopDrawing() {
    isDrawing = false;
  }

  // Exibir a Barra de Ferramentas
  function showToolbar() {
    if (toolbar) {
      toolbar.classList.remove('hidden');
    }
  }

  // Manter a Barra de Ferramentas sempre visível no topo
  function resetToolbarTimeout() {
    if (toolbarHideTimeout) {
      clearTimeout(toolbarHideTimeout);
    }
    if (toolbar) {
      toolbar.classList.remove('hidden');
    }
  }

  // Inicialização Automática ao Carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enterPresentationLayout);
  } else {
    enterPresentationLayout();
  }
})();

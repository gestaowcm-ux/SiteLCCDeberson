/**
 * brainstorming.js - Lógica do Quadro de Brainstorming Colaborativo
 * Implementa Canvas Infinito (Pan/Zoom), Manipulação de Post-its/Formas,
 * Conectores SVG Dinâmicos, Cursores Remotos e Sincronização P2P via PeerJS.
 * Protegido contra falhas de CDN para permitir uso offline local.
 */

(function () {
  // --- PALETA DE CORES PREDETERMINADA ---
  const PASTEL_PALETTE = {
    yellow: { bg: '#fef08a', text: '#451a03' },
    blue: { bg: '#bfdbfe', text: '#1e3a8a' },
    green: { bg: '#bbf7d0', text: '#064e3b' },
    pink: { bg: '#fbcfe8', text: '#831843' },
    purple: { bg: '#ddd6fe', text: '#4c1d95' },
    orange: { bg: '#fed7aa', text: '#7c2d12' },
    white: { bg: '#ffffff', text: '#000000' },
    black: { bg: '#000000', text: '#ffffff' }
  };

  // --- ESTADO DO APLICATIVO ---
  let state = {
    elements: {},      // id -> { id, type, x, y, width, height, text, color, textColor }
    connections: [],   // array de { id, fromId, fromAnchor, toId, toAnchor }
    isHost: false,
    roomId: null,
    myPeerId: null,
    myName: 'Convidado',
    myColor: getRandomPastelColor(),
    activeTool: 'select', // select, pan, postit, rectangle, circle, connect
    zoom: 1.0,
    panX: 0,
    panY: 0,
    selectedElementId: null,
    activeConnectionSource: null, // { elementId, anchor }
    tempLine: null,               // Para desenho em tempo real de conexão
    isPanning: false,
    isDragging: false,
    isResizing: false,
    dragStart: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
    elementDragOffset: { x: 0, y: 0 },
    resizeStartDims: { w: 0, h: 0 },
    resizeAnchor: 'bottom-right'
  };

  // --- REFERÊNCIAS DOM ---
  const container = document.getElementById('canvas-container');
  const board = document.getElementById('canvas-board');
  const svg = document.getElementById('canvas-svg');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sharePanelBtn = document.getElementById('share-panel-btn');
  const shareSidebar = document.getElementById('share-sidebar-panel');
  const shareCloseBtn = document.getElementById('share-close-btn');
  const shareRoomUrl = document.getElementById('share-room-url');
  const shareCopyLinkBtn = document.getElementById('share-copy-link-btn');
  const qrCanvas = document.getElementById('share-qr-canvas');
  const connStatusBadge = document.getElementById('connection-status-badge');
  const activePeersBadge = document.getElementById('active-peers-badge');
  const usernameModal = document.getElementById('username-modal');
  const usernameInput = document.getElementById('username-input');
  const usernameSubmitBtn = document.getElementById('username-submit-btn');
  
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const zoomText = document.getElementById('zoom-percentage-text');
  
  const colorPickerPanel = document.getElementById('color-picker-panel');
  
  // Controles de IP local
  const localIpInput = document.getElementById('local-ip-input');
  const applyIpBtn = document.getElementById('apply-ip-btn');

  // --- REDE E CONEXÕES P2P ---
  let peer = null;
  let hostConnection = null;      // Se participante, conexão com o Host
  let clientConnections = {};     // Se host, conexões ativas indexadas por peerId
  let lastCursorSentTime = 0;

  // Tamanho do board virtual (100.000 x 100.000 pixels)
  const BOARD_SIZE = 100000;
  // --- INICIALIZAÇÃO ---
  function init() {
    setupTheme();
    setupToolbar();
    setupCanvasEvents();
    setupZoomEvents();
    setupShareSidebar();
    setupColorPicker();

    // Determinar se somos Host ou Participante com base na URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');

    if (roomParam) {
      // Participante: Mostrar Modal para Nome
      state.isHost = false;
      state.roomId = roomParam;
      usernameModal.classList.add('active');
      usernameInput.focus();
    } else {
      // Host: Inicializar sala diretamente
      state.isHost = true;
      initHostPeer();
    }

    // Configurar centralização inicial do canvas
    resetZoom();

    // Atalhos do Teclado
    window.addEventListener('keydown', handleKeyDown);

    // Ajustar SVG ao tamanho da tela
    adjustSvgSize();
    window.addEventListener('resize', adjustSvgSize);
  }

  // --- CONFIGURAÇÃO DE TEMAS ---
  function setupTheme() {
    const savedTheme = localStorage.getItem('whiteboard-theme') || 'dark';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      setTheme(currentTheme);
    });
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      document.querySelector('.theme-icon-light').style.display = 'none';
      document.querySelector('.theme-icon-dark').style.display = 'block';
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      document.querySelector('.theme-icon-light').style.display = 'block';
      document.querySelector('.theme-icon-dark').style.display = 'none';
    }
    localStorage.setItem('whiteboard-theme', theme);
  }

  function setupToolbar() {
    // Ferramentas de Seleção e Navegação (Select, Pan, Connect)
    const navigationTools = ['tool-select', 'tool-pan', 'tool-connect'];
    
    navigationTools.forEach(toolId => {
      const btn = document.getElementById(toolId);
      if (btn) {
        btn.addEventListener('click', () => {
          // Desativar ferramenta anterior
          document.querySelectorAll('.whiteboard-toolbar .icon-btn').forEach(b => b.classList.remove('active'));
          // Ativar nova ferramenta
          btn.classList.add('active');
          state.activeTool = toolId.replace('tool-', '');
          
          // Ajustar classes de cursor do viewport
          container.className = '';
          if (state.activeTool === 'pan') {
            container.classList.add('tool-pan');
          } else if (state.activeTool === 'connect') {
            container.classList.add('tool-connect');
          }

          // Fechar painéis secundários
          colorPickerPanel.style.display = 'none';

          // Cancelar conexão temporária em andamento se mudar de ferramenta
          if (state.activeTool !== 'connect') {
            cancelTempConnection();
          }
        });
      }
    });

    // Ferramentas de Inserção Imediata (Post-it, Retângulo, Círculo, Linha)
    const creationTools = ['tool-postit', 'tool-rectangle', 'tool-circle', 'tool-line'];
    creationTools.forEach(toolId => {
      const btn = document.getElementById(toolId);
      if (btn) {
        btn.addEventListener('click', () => {
          // Calcular o centro atual do viewport em coordenadas do board
          const screenCenterX = window.innerWidth / 2;
          const screenCenterY = window.innerHeight / 2;
          const boardCenterX = (screenCenterX - state.panX) / state.zoom;
          const boardCenterY = (screenCenterY - state.panY) / state.zoom;

          const type = toolId.replace('tool-', '');
          createElementOnBoard(type, boardCenterX, boardCenterY);

          // Retorna automaticamente para a ferramenta de seleção para facilitar manipulação
          document.getElementById('tool-select').click();
        });
      }
    });

    // Botão Limpar Tudo
    document.getElementById('tool-clear').addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja limpar o quadro inteiro? Esta ação não pode ser desfeita.')) {
        clearBoard();
      }
    });
  }

  // --- MANIPULAÇÃO DO KEYDOWN (ATALHOS) ---
  function handleKeyDown(e) {
    // Não acionar atalhos se estiver digitando em uma caixa de texto
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.getAttribute('contenteditable') === 'true') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'v':
        document.getElementById('tool-select').click();
        break;
      case 'h':
        document.getElementById('tool-pan').click();
        break;
      case 'p':
        document.getElementById('tool-postit').click();
        break;
      case 'r':
        document.getElementById('tool-rectangle').click();
        break;
      case 'o':
        document.getElementById('tool-circle').click();
        break;
      case 'l':
        document.getElementById('tool-line').click();
        break;
      case 'c':
        document.getElementById('tool-connect').click();
        break;
      case 'delete':
      case 'backspace':
        if (state.selectedElementId) {
          deleteElement(state.selectedElementId);
        }
        break;
    }
  }

  // --- CONFIGURAÇÃO DE EVENTOS DE ZOOM E CONTROLES ---
  function setupZoomEvents() {
    zoomInBtn.addEventListener('click', () => adjustZoom(1.2));
    zoomOutBtn.addEventListener('click', () => adjustZoom(1 / 1.2));
    zoomResetBtn.addEventListener('click', resetZoom);
  }

  function adjustZoom(factor, centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) {
    const oldZoom = state.zoom;
    let newZoom = oldZoom * factor;
    
    // Limites de zoom
    newZoom = Math.max(0.15, Math.min(4.0, newZoom));
    
    // Calcular novas coordenadas de pan para dar zoom centralizado no cursor
    const boardX = (centerX - state.panX) / oldZoom;
    const boardY = (centerY - state.panY) / oldZoom;
    
    state.zoom = newZoom;
    state.panX = centerX - boardX * newZoom;
    state.panY = centerY - boardY * newZoom;
    
    updateTransform();
  }

  function resetZoom() {
    state.zoom = 1.0;
    // Centraliza o ponto (50000, 50000) no meio do viewport
    state.panX = (window.innerWidth / 2) - (BOARD_SIZE / 2);
    state.panY = (window.innerHeight / 2) - (BOARD_SIZE / 2);
    updateTransform();
  }

  function updateTransform() {
    board.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    zoomText.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  // --- REDIMENSIONAR SVG OVERLAY ---
  function adjustSvgSize() {
    // O SVG ocupa toda a extensão virtual do board
    svg.setAttribute('width', BOARD_SIZE);
    svg.setAttribute('height', BOARD_SIZE);
    svg.style.width = `${BOARD_SIZE}px`;
    svg.style.height = `${BOARD_SIZE}px`;
  }

  // --- EVENTOS DO CANVAS (MOUSE/TOUCH) ---
  function setupCanvasEvents() {
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Suporte para pinch zoom / wheel
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Prevenir clique fora para deselecionar
    container.addEventListener('click', (e) => {
      if (e.target === container || e.target === board || e.target === svg) {
        deselectAll();
      }
    });

    // Lógica para enviar o Nome do Participante
    usernameSubmitBtn.addEventListener('click', () => {
      const name = usernameInput.value.trim();
      if (name) {
        state.myName = name;
        usernameModal.classList.remove('active');
        initParticipantPeer();
      }
    });

    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        usernameSubmitBtn.click();
      }
    });
  }

  function handleWheel(e) {
    e.preventDefault();
    
    // Zoom via Scroll Wheel
    const factor = e.deltaY < 0 ? 1.1 : (1 / 1.1);
    adjustZoom(factor, e.clientX, e.clientY);
  }

  function handleMouseDown(e) {
    const isMiddleButton = e.button === 1;
    const isSpacePressed = e.shiftKey || e.code === 'Space'; // Segurar space para pan
    
    // 1. Iniciar Pan (Mão)
    if (state.activeTool === 'pan' || isMiddleButton || e.target === container || e.target === board || e.target === svg) {
      if (state.activeTool === 'pan' || isMiddleButton || e.button === 0) {
        state.isPanning = true;
        container.classList.add('tool-pan');
        state.panStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
        return;
      }
    }

    // 2. Criação de novos Elementos por clique no canvas
    if (e.button === 0 && (state.activeTool === 'postit' || state.activeTool === 'rectangle' || state.activeTool === 'circle' || state.activeTool === 'line')) {
      const rect = board.getBoundingClientRect();
      const boardX = (e.clientX - rect.left) / state.zoom;
      const boardY = (e.clientY - rect.top) / state.zoom;

      createElementOnBoard(state.activeTool, boardX, boardY);
      
      // Voltar para ferramenta Seleção após adicionar
      document.getElementById('tool-select').click();
    }
  }

  function handleMouseMove(e) {
    const rect = board.getBoundingClientRect();
    const boardX = (e.clientX - rect.left) / state.zoom;
    const boardY = (e.clientY - rect.top) / state.zoom;

    // 1. Movimento de Pan
    if (state.isPanning) {
      state.panX = e.clientX - state.panStart.x;
      state.panY = e.clientY - state.panStart.y;
      updateTransform();
      return;
    }

    // 2. Movimento de Drag de Elemento
    if (state.isDragging && state.selectedElementId) {
      const el = state.elements[state.selectedElementId];
      if (el) {
        el.x = Math.round(boardX - state.elementDragOffset.x);
        el.y = Math.round(boardY - state.elementDragOffset.y);
        
        // Limites do board virtual
        el.x = Math.max(0, Math.min(BOARD_SIZE - el.width, el.x));
        el.y = Math.max(0, Math.min(BOARD_SIZE - el.height, el.y));

        updateElementDOM(el);
        drawConnections();
        broadcastAction({ type: 'update-element', element: el });
      }
      return;
    }

    // 3. Movimento de Redimensionamento (Resize)
    if (state.isResizing && state.selectedElementId) {
      const el = state.elements[state.selectedElementId];
      if (el) {
        const deltaX = boardX - state.dragStart.x;
        const deltaY = boardY - state.dragStart.y;
        
        el.width = Math.max(80, Math.round(state.resizeStartDims.w + deltaX));
        el.height = Math.max(50, Math.round(state.resizeStartDims.h + deltaY));

        updateElementDOM(el);
        drawConnections();
        broadcastAction({ type: 'update-element', element: el });
      }
      return;
    }

    // 4. Desenho de linha de Conector Temporário
    if (state.activeConnectionSource && state.activeTool === 'connect') {
      updateTempLine(boardX, boardY);
      return;
    }

    // 5. Enviar posição do cursor do mouse (P2P)
    sendCursorPosition(boardX, boardY);
  }

  function handleMouseUp(e) {
    if (state.isPanning) {
      state.isPanning = false;
      if (state.activeTool !== 'pan') {
        container.classList.remove('tool-pan');
      }
    }
    
    if (state.isDragging) {
      state.isDragging = false;
      if (state.isHost) {
        saveLocalState();
      }
    }

    if (state.isResizing) {
      state.isResizing = false;
      if (state.isHost) {
        saveLocalState();
      }
    }

    // Se soltar fora de um handle de conexão, cancelar conector temporário
    if (state.activeConnectionSource && !e.target.classList.contains('connection-handle')) {
      cancelTempConnection();
    }
  }

  // --- ENVIO COORDENADAS CURSOR ---
  function sendCursorPosition(x, y) {
    const now = Date.now();
    if (now - lastCursorSentTime < 80) return; // Limitar envio a cada 80ms
    lastCursorSentTime = now;

    if (state.isHost) {
      // Host retransmite posições para todos os clientes
      broadcastAction({
        type: 'update-cursor',
        peerId: 'host',
        cursor: { x, y, name: state.myName, color: state.myColor }
      });
    } else if (hostConnection && hostConnection.open) {
      // Cliente envia para o host
      hostConnection.send({
        type: 'update-cursor',
        cursor: { x, y, name: state.myName, color: state.myColor }
      });
    }
  }

  // --- CRIAÇÃO DE ELEMENTOS NO WHITEBOARD ---
  function createElementOnBoard(type, x, y, options = {}) {
    const id = options.id || 'el-' + Math.random().toString(36).substr(2, 9);
    const colorKey = options.colorKey || 'yellow';
    
    // Configurar dimensões padrão específicas
    let width = options.width || 160;
    let height = options.height || 120;
    if (type === 'arrow' && !options.width) {
      width = 220;
      height = 70;
    } else if (type === 'line' && !options.width) {
      width = 180;
      height = 50;
    }
    
    const element = {
      id,
      type,
      x: Math.round(x - (width / 2)), // centralizar
      y: Math.round(y - (height / 2)),
      width,
      height,
      text: options.text || '',
      color: PASTEL_PALETTE[colorKey].bg,
      textColor: PASTEL_PALETTE[colorKey].text,
      colorKey: colorKey
    };

    state.elements[id] = element;
    
    renderElementDOM(element);
    
    if (state.isHost) {
      saveLocalState();
    }
    
    broadcastAction({ type: 'update-element', element });
    selectElement(id);
  }

  // --- CÁLCULO DINÂMICO DE TAMANHO DE FONTE ---
  function calculateFontSize(el) {
    if (el.type === 'line' || el.type === 'arrow') {
      return Math.max(12, Math.min(24, Math.round(el.width * 0.08)));
    }
    const baseSize = Math.min(el.width, el.height);
    return Math.max(11, Math.round(baseSize * 0.12));
  }

  function renderElementDOM(el) {
    // Remover se já existir
    const existing = document.getElementById(el.id);
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = el.id;
    div.className = `board-element element-${el.type}`;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.width = `${el.width}px`;
    div.style.height = `${el.height}px`;
    div.style.fontSize = `${calculateFontSize(el)}px`;
    
    // Tratamento de background específico para Linha Standalone
    if (el.type === 'line') {
      div.style.backgroundColor = 'transparent';
      div.style.borderColor = 'transparent';
      div.style.boxShadow = 'none';

      const svgNamespace = 'http://www.w3.org/2000/svg';
      const lineSvg = document.createElementNS(svgNamespace, 'svg');
      lineSvg.setAttribute('class', 'element-line-svg');
      lineSvg.setAttribute('viewBox', '0 0 100 100');
      lineSvg.setAttribute('preserveAspectRatio', 'none');
      lineSvg.style.position = 'absolute';
      lineSvg.style.top = '0';
      lineSvg.style.left = '0';
      lineSvg.style.width = '100%';
      lineSvg.style.height = '100%';
      lineSvg.style.pointerEvents = 'none';
      lineSvg.style.zIndex = '-1';
      
      const linePath = document.createElementNS(svgNamespace, 'line');
      linePath.setAttribute('x1', '0');
      linePath.setAttribute('y1', '50');
      linePath.setAttribute('x2', '100');
      linePath.setAttribute('y2', '50');
      linePath.setAttribute('stroke', el.textColor);
      linePath.setAttribute('stroke-width', '2.5');
      linePath.setAttribute('stroke-linecap', 'round');
      
      lineSvg.appendChild(linePath);
      div.appendChild(lineSvg);
    } else if (el.type === 'arrow') {
      div.style.backgroundColor = 'transparent';
      div.style.borderColor = 'transparent';
      div.style.boxShadow = 'none';

      // Criar SVG interno para desenhar a seta
      const svgNamespace = 'http://www.w3.org/2000/svg';
      const arrowSvg = document.createElementNS(svgNamespace, 'svg');
      arrowSvg.setAttribute('class', 'element-arrow-svg');
      arrowSvg.setAttribute('viewBox', '0 0 100 100');
      arrowSvg.setAttribute('preserveAspectRatio', 'none');
      arrowSvg.style.position = 'absolute';
      arrowSvg.style.top = '0';
      arrowSvg.style.left = '0';
      arrowSvg.style.width = '100%';
      arrowSvg.style.height = '100%';
      arrowSvg.style.pointerEvents = 'none';
      arrowSvg.style.zIndex = '-1';
      
      // Linha
      const arrowPath = document.createElementNS(svgNamespace, 'path');
      arrowPath.setAttribute('d', 'M 5 50 L 92 50');
      arrowPath.setAttribute('fill', 'none');
      arrowPath.setAttribute('stroke', el.textColor);
      arrowPath.setAttribute('stroke-width', '2.5');
      arrowPath.setAttribute('stroke-linecap', 'round');
      
      // Cabeça da seta triangular
      const arrowhead = document.createElementNS(svgNamespace, 'polygon');
      arrowhead.setAttribute('points', '88,43 97,50 88,57');
      arrowhead.setAttribute('fill', el.textColor);
      
      arrowSvg.appendChild(arrowPath);
      arrowSvg.appendChild(arrowhead);
      div.appendChild(arrowSvg);
    } else {
      div.style.backgroundColor = el.color;
      div.style.color = el.textColor;
      div.style.borderColor = el.textColor; // Para formas geométricas que usam currentColor
    }

    // Área do Texto
    const textDiv = document.createElement('div');
    textDiv.className = 'element-text';
    textDiv.contentEditable = 'false';
    textDiv.textContent = el.text;
    div.appendChild(textDiv);

    // Alça de Redimensionamento (Resize)
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    div.appendChild(resizeHandle);

    // Alças de Ancoragem para Conexões
    const anchors = ['top', 'right', 'bottom', 'left'];
    anchors.forEach(anch => {
      const handle = document.createElement('div');
      handle.className = `connection-handle handle-${anch}`;
      handle.dataset.anchor = anch;
      handle.dataset.elementId = el.id;
      div.appendChild(handle);
    });

    // Barra de Menu Flutuante Superior de Ações
    const actionsPanel = document.createElement('div');
    actionsPanel.className = 'element-actions';
    
    // Ação: Mudar Cor
    const colorBtn = document.createElement('button');
    colorBtn.className = 'action-mini-btn';
    colorBtn.title = 'Mudar Cor';
    colorBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"/></svg>`;
    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showColorPicker(el.id, div);
    });
    actionsPanel.appendChild(colorBtn);

    // Ação: Excluir Elemento
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-mini-btn';
    deleteBtn.title = 'Excluir Elemento (Del)';
    deleteBtn.style.color = 'var(--color-danger)';
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteElement(el.id);
    });
    actionsPanel.appendChild(deleteBtn);

    div.appendChild(actionsPanel);

    // --- EVENTOS DO ELEMENTO ---
    
    // Drag e Seleção
    div.addEventListener('mousedown', (e) => {
      if (state.activeTool !== 'select') return;
      if (e.target.classList.contains('resize-handle') || 
          e.target.classList.contains('connection-handle') || 
          e.target.closest('.element-actions')) {
        return;
      }
      
      e.stopPropagation();
      selectElement(el.id);
      
      state.isDragging = true;
      const rect = board.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / state.zoom;
      const clickY = (e.clientY - rect.top) / state.zoom;
      state.elementDragOffset = { x: clickX - el.x, y: clickY - el.y };
    });

    // Duplo clique para editar texto
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (state.activeTool !== 'select') return;
      
      textDiv.contentEditable = 'true';
      textDiv.focus();
      
      // Selecionar todo o texto
      const range = document.createRange();
      range.selectNodeContents(textDiv);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });

    // Conclusão da Edição de Texto
    textDiv.addEventListener('blur', () => {
      textDiv.contentEditable = 'false';
      const newText = textDiv.textContent.trim();
      
      el.text = newText;
      textDiv.textContent = newText;
      
      if (state.isHost) {
        saveLocalState();
      }
      broadcastAction({ type: 'update-element', element: el });
    });

    textDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        textDiv.blur();
      }
    });

    // Iniciar Redimensionamento (Resize Handle)
    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      state.isResizing = true;
      const rect = board.getBoundingClientRect();
      state.dragStart = {
        x: (e.clientX - rect.left) / state.zoom,
        y: (e.clientY - rect.top) / state.zoom
      };
      state.resizeStartDims = { w: el.width, h: el.height };
    });

    // Conectores (Connection Handles)
    div.querySelectorAll('.connection-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        if (state.activeTool !== 'connect') return;
        e.stopPropagation();
        e.preventDefault();

        const rect = board.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / state.zoom;
        const startY = (e.clientY - rect.top) / state.zoom;

        state.activeConnectionSource = {
          elementId: el.id,
          anchor: handle.dataset.anchor,
          startX,
          startY
        };

        // Criar linha temporária SVG
        createTempLine(startX, startY);
      });

      handle.addEventListener('mouseup', (e) => {
        if (!state.activeConnectionSource || state.activeTool !== 'connect') return;
        e.stopPropagation();

        const src = state.activeConnectionSource;
        const targetId = handle.dataset.elementId;
        const targetAnchor = handle.dataset.anchor;

        // Validar conexão (evitar conectar consigo mesmo)
        if (src.elementId !== targetId) {
          const conn = {
            id: 'conn-' + Math.random().toString(36).substr(2, 9),
            fromId: src.elementId,
            fromAnchor: src.anchor,
            toId: targetId,
            toAnchor: targetAnchor
          };

          state.connections.push(conn);
          if (state.isHost) saveLocalState();
          
          broadcastAction({ type: 'add-connection', connection: conn });
          drawConnections();
        }

        cancelTempConnection();
      });
    });

    board.appendChild(div);
  }

  function updateElementDOM(el) {
    const div = document.getElementById(el.id);
    if (!div) return;

    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.width = `${el.width}px`;
    div.style.height = `${el.height}px`;
    div.style.fontSize = `${calculateFontSize(el)}px`;
    
    if (el.type === 'line') {
      div.style.backgroundColor = 'transparent';
      div.style.borderColor = 'transparent';
      div.style.boxShadow = 'none';
      
      const linePath = div.querySelector('.element-line-svg line');
      if (linePath) {
        linePath.setAttribute('stroke', el.textColor);
      }
    } else if (el.type === 'arrow') {
      div.style.backgroundColor = 'transparent';
      div.style.borderColor = 'transparent';
      div.style.boxShadow = 'none';
      
      const pathEl = div.querySelector('.element-arrow-svg path');
      if (pathEl) {
        pathEl.setAttribute('fill', el.color);
        pathEl.setAttribute('stroke', el.textColor);
      }
    } else {
      div.style.backgroundColor = el.color;
      div.style.color = el.textColor;
      div.style.borderColor = el.textColor;
    }

    const textDiv = div.querySelector('.element-text');
    if (textDiv && textDiv.contentEditable !== 'true') {
      textDiv.textContent = el.text;
    }
  }

  // --- SELEÇÃO DE ELEMENTOS ---
  function selectElement(id) {
    deselectAll();
    state.selectedElementId = id;
    const elDiv = document.getElementById(id);
    if (elDiv) {
      elDiv.classList.add('selected');
    }
  }

  // --- PALETA DE CORES (PICKER) ---
  function setupColorPicker() {
    colorPickerPanel.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const elementId = colorPickerPanel.dataset.targetElementId;
        
        if (elementId && state.elements[elementId]) {
          const el = state.elements[elementId];
          const colorKey = dot.dataset.color.toLowerCase();
          const paletteColor = PASTEL_PALETTE[colorKey] || { bg: dot.dataset.color, text: dot.dataset.text };
          
          el.color = paletteColor.bg;
          el.textColor = paletteColor.text;
          el.colorKey = colorKey;

          updateElementDOM(el);
          
          if (state.isHost) {
            saveLocalState();
          }

          broadcastAction({ type: 'update-element', element: el });
          colorPickerPanel.style.display = 'none';
        }
      });
    });
  }

  function showColorPicker(elementId, elementDiv) {
    colorPickerPanel.dataset.targetElementId = elementId;
    colorPickerPanel.style.display = 'flex';
    
    // Posicionar paleta acima das ações do elemento
    const rect = elementDiv.getBoundingClientRect();
    const viewportRect = container.getBoundingClientRect();
    
    colorPickerPanel.style.left = `${rect.left + rect.width/2 - colorPickerPanel.offsetWidth/2 - viewportRect.left}px`;
    colorPickerPanel.style.top = `${rect.top - 85 - viewportRect.top}px`;
  }

  function deselectAll() {
    if (state.selectedElementId) {
      const elDiv = document.getElementById(state.selectedElementId);
      if (elDiv) {
        elDiv.classList.remove('selected');
      }
    }
    state.selectedElementId = null;
    colorPickerPanel.style.display = 'none';
  }

  // --- EXCLUSÃO DE ELEMENTOS ---
  function deleteElement(id) {
    if (state.elements[id]) {
      delete state.elements[id];
      const div = document.getElementById(id);
      if (div) div.remove();

      // Deletar conexões vinculadas a este elemento
      state.connections = state.connections.filter(c => {
        if (c.fromId === id || c.toId === id) {
          return false;
        }
        return true;
      });

      if (state.selectedElementId === id) {
        state.selectedElementId = null;
      }

      if (state.isHost) {
        saveLocalState();
      }

      broadcastAction({ type: 'delete-element', id });
      drawConnections();
    }
  }

  // --- LINHA TEMPORÁRIA SVG (CONNECTORS) ---
  function createTempLine(x, y) {
    state.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    state.tempLine.setAttribute('x1', x);
    state.tempLine.setAttribute('y1', y);
    state.tempLine.setAttribute('x2', x);
    state.tempLine.setAttribute('y2', y);
    state.tempLine.setAttribute('stroke', '#3b82f6');
    state.tempLine.setAttribute('stroke-width', '2');
    state.tempLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(state.tempLine);
  }

  function updateTempLine(x, y) {
    if (state.tempLine) {
      state.tempLine.setAttribute('x2', x);
      state.tempLine.setAttribute('y2', y);
    }
  }

  function cancelTempConnection() {
    state.activeConnectionSource = null;
    if (state.tempLine) {
      state.tempLine.remove();
      state.tempLine = null;
    }
  }

  // --- DESENHO DE CONEXÕES / SETAS CURVAS ---
  function drawConnections() {
    // Remover todas as conexões antigas do SVG
    svg.querySelectorAll('.connection-group').forEach(group => group.remove());

    state.connections.forEach(conn => {
      const fromEl = state.elements[conn.fromId];
      const toEl = state.elements[conn.toId];

      if (!fromEl || !toEl) return;

      const p1 = getAnchorCoords(fromEl, conn.fromAnchor);
      const p2 = getAnchorCoords(toEl, conn.toAnchor);

      // Desenhar curva Bezier Cúbica estilizada (Miro/FigJam style)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = calculateBezierPath(p1, conn.fromAnchor, p2, conn.toAnchor);
      
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.className.baseVal = 'connection-group';
      group.dataset.connectionId = conn.id;

      path.setAttribute('d', d);
      path.setAttribute('class', 'connection-line');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.style.pointerEvents = 'stroke';

      // Clique duplo no conector para apagar
      path.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (confirm('Deseja excluir esta conexão?')) {
          deleteConnection(conn.id);
        }
      });

      group.appendChild(path);
      svg.appendChild(group);
    });
  }

  function deleteConnection(id) {
    state.connections = state.connections.filter(c => c.id !== id);
    if (state.isHost) saveLocalState();
    
    broadcastAction({ type: 'delete-connection', id });
    drawConnections();
  }

  // --- COORDENADAS DAS ÂNCORAS ---
  function getAnchorCoords(el, anchor) {
    const w = el.width;
    const h = el.height;
    
    switch (anchor) {
      case 'top':    return { x: el.x + w / 2, y: el.y };
      case 'right':  return { x: el.x + w,     y: el.y + h / 2 };
      case 'bottom': return { x: el.x + w / 2, y: el.y + h };
      case 'left':   return { x: el.x,         y: el.y + h / 2 };
    }
  }

  function calculateBezierPath(p1, a1, p2, a2) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const strength = Math.max(50, Math.min(150, (dx + dy) / 3));

    let cp1x = p1.x;
    let cp1y = p1.y;
    let cp2x = p2.x;
    let cp2y = p2.y;

    // Ajustar pontos de controle com base na direção do Anchor 1
    switch (a1) {
      case 'right':  cp1x += strength; break;
      case 'left':   cp1x -= strength; break;
      case 'bottom': cp1y += strength; break;
      case 'top':    cp1y -= strength; break;
    }

    // Ajustar pontos de controle com base na direção do Anchor 2
    switch (a2) {
      case 'right':  cp2x += strength; break;
      case 'left':   cp2x -= strength; break;
      case 'bottom': cp2y += strength; break;
      case 'top':    cp2y -= strength; break;
    }

    return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // --- LIMPAR QUADRO ---
  function clearBoard() {
    state.elements = {};
    state.connections = [];
    deselectAll();

    // Limpar DOM
    document.querySelectorAll('.board-element').forEach(el => el.remove());
    svg.querySelectorAll('.connection-group').forEach(group => group.remove());

    if (state.isHost) {
      saveLocalState();
    }

    broadcastAction({ type: 'clear' });
  }

  // --- PERSISTÊNCIA LOCAL (HOST ONLY) ---
  function saveLocalState() {
    if (!state.isHost) return;
    const boardState = {
      elements: state.elements,
      connections: state.connections
    };
    localStorage.setItem(`board-state-${state.roomId}`, JSON.stringify(boardState));
  }

  function loadLocalState(roomId) {
    const raw = localStorage.getItem(`board-state-${roomId}`);
    if (raw) {
      try {
        const loaded = JSON.parse(raw);
        state.elements = loaded.elements || {};
        state.connections = loaded.connections || [];

        // Renderizar no DOM
        Object.values(state.elements).forEach(el => renderElementDOM(el));
        drawConnections();
      } catch (e) {
        console.error('Erro ao ler estado do localStorage', e);
      }
    } else {
      // Se não houver dados salvos na sala, criar quadro de demonstração explicativo
      createDemoBoard();
    }
  }

  // --- QUADRO DE DEMONSTRAÇÃO COM DICAS ---
  function createDemoBoard() {
    const cx = BOARD_SIZE / 2;
    const cy = BOARD_SIZE / 2;

    // Criar Elemento 1 (Post-it)
    const id1 = 'demo-postit';
    createElementOnBoard('postit', cx - 180, cy - 80, {
      id: id1,
      colorKey: 'yellow',
      width: 180,
      height: 120,
      text: 'Bem-vindo! Dê duplo clique aqui para editar este texto.'
    });

    // Criar Elemento 2 (Círculo)
    const id2 = 'demo-circle';
    createElementOnBoard('circle', cx + 180, cy - 80, {
      id: id2,
      colorKey: 'blue',
      width: 150,
      height: 150,
      text: 'Use o scroll do mouse para dar Zoom'
    });

    // Criar Elemento 3 (Retângulo)
    const id3 = 'demo-rect';
    createElementOnBoard('rectangle', cx, cy + 130, {
      id: id3,
      colorKey: 'green',
      width: 240,
      height: 100,
      text: 'Pressione a barra de Espaço e arraste o mouse para navegar pelo canvas infinito.'
    });

    // Conectar Post-it com o Círculo
    const conn1 = {
      id: 'demo-conn-1',
      fromId: id1,
      fromAnchor: 'right',
      toId: id2,
      toAnchor: 'left'
    };
    state.connections.push(conn1);

    // Conectar Círculo com o Retângulo
    const conn2 = {
      id: 'demo-conn-2',
      fromId: id2,
      fromAnchor: 'bottom',
      toId: id3,
      toAnchor: 'top'
    };
    state.connections.push(conn2);

    drawConnections();
    
    if (state.isHost) {
      saveLocalState();
    }
  }

  // --- COMPARTILHAMENTO E SIDEBAR ---
  function setupShareSidebar() {
    sharePanelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      shareSidebar.classList.toggle('active');
    });

    shareCloseBtn.addEventListener('click', () => {
      shareSidebar.classList.remove('active');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!shareSidebar.contains(e.target) && e.target !== sharePanelBtn) {
        shareSidebar.classList.remove('active');
      }
    });

    // Copiar link da sala
    shareCopyLinkBtn.addEventListener('click', () => {
      const urlText = shareRoomUrl.textContent;
      navigator.clipboard.writeText(urlText).then(() => {
        const originalText = shareCopyLinkBtn.textContent;
        shareCopyLinkBtn.textContent = 'Link Copiado!';
        shareCopyLinkBtn.style.backgroundColor = 'var(--color-primary)';
        setTimeout(() => {
          shareCopyLinkBtn.textContent = originalText;
          shareCopyLinkBtn.style.backgroundColor = 'var(--color-success)';
        }, 1500);
      });
    });

    // Aplicar IP personalizado (Configuração de Rede Local)
    applyIpBtn.addEventListener('click', () => {
      const customIp = localIpInput.value.trim();
      if (customIp && state.roomId) {
        // Recalcular URL
        const localUrl = `http://${customIp}:5173/brainstorming.html?room=${state.roomId}`;
        generateQRCode(localUrl);
      } else {
        alert('Por favor insira um endereço IP de rede local válido.');
      }
    });
  }

  function generateQRCode(url) {
    shareRoomUrl.textContent = url;
    
    // Limpar canvas anterior
    qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    
    if (typeof QRious === 'undefined') {
      console.warn('QRious library is not loaded. Cannot generate QR Code.');
      const ctx = qrCanvas.getContext('2d');
      ctx.fillStyle = '#4b5563';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code indisponível', qrCanvas.width / 2, qrCanvas.height / 2 - 10);
      ctx.fillText('(Sem internet para carregar CDN)', qrCanvas.width / 2, qrCanvas.height / 2 + 10);
      return;
    }

    // Criar QR Code
    new QRious({
      element: qrCanvas,
      value: url,
      size: 200,
      background: '#ffffff',
      foreground: '#000000',
      level: 'H'
    });
  }

  // --- REDE P2P COM PEERJS: LOGICA DO HOST ---
  function initHostPeer() {
    connStatusBadge.textContent = 'Criando Sala...';
    connStatusBadge.style.background = '#d97706';

    // Se o PeerJS não estiver definido no escopo (CDN offline), ir imediatamente para o modo local
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library is not loaded. Falling back to local mode immediately.');
      triggerOfflineFallback();
      return;
    }

    const roomHex = Math.random().toString(36).substr(2, 6).toUpperCase();
    const customId = `MENTORIA-BOARD-${roomHex}`;

    let peerOpened = false;

    // Timeout de 3 segundos para o servidor PeerJS (evita travar se estiver offline)
    const peerTimeout = setTimeout(() => {
      if (!peerOpened) {
        console.warn('PeerJS connection timed out. Falling back to local mode.');
        triggerOfflineFallback();
      }
    }, 3000);

    try {
      peer = new Peer(customId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', (id) => {
        peerOpened = true;
        clearTimeout(peerTimeout);
        state.myPeerId = id;
        state.roomId = id;
        
        // Montar URL para compartilhar
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('room', id);
        
        generateQRCode(currentUrl.toString());
        
        connStatusBadge.textContent = 'Host';
        connStatusBadge.style.background = 'var(--color-success)';
        connStatusBadge.style.color = 'white';

        localIpInput.value = '192.168.1.100'; // IP sugerido genérico

        // Carregar estado salvo do Host
        loadLocalState(id);

        // Ouvir conexões de entrada
        peer.on('connection', (conn) => {
          setupHostConnection(conn);
        });
      });

      peer.on('error', (err) => {
        console.warn('PeerJS Host Error:', err);
        if (!peerOpened) {
          clearTimeout(peerTimeout);
          triggerOfflineFallback();
        }
      });
    } catch (e) {
      console.error('Falha ao instanciar PeerJS:', e);
      clearTimeout(peerTimeout);
      triggerOfflineFallback();
    }
  }

  function triggerOfflineFallback() {
    connStatusBadge.textContent = 'Modo Local (Individual)';
    connStatusBadge.style.background = '#4b5563'; // cinza
    connStatusBadge.style.color = 'white';
    
    // Gerar QR code local de fallback
    generateQRCode(window.location.href);
    
    // Carregar estado offline local
    state.roomId = 'local-board';
    loadLocalState(state.roomId);
  }

  function setupHostConnection(conn) {
    conn.on('open', () => {
      // Registrar conexão do cliente
      clientConnections[conn.peer] = conn;
      updateActivePeersBadge();

      // Enviar estado inicial para o novo participante
      conn.send({
        type: 'init',
        elements: state.elements,
        connections: state.connections,
        hostName: state.myName
      });
    });

    conn.on('data', (data) => {
      handleNetworkMessage(conn.peer, data);
    });

    conn.on('close', () => {
      delete clientConnections[conn.peer];
      removeRemoteCursor(conn.peer);
      updateActivePeersBadge();
    });

    conn.on('error', () => {
      delete clientConnections[conn.peer];
      removeRemoteCursor(conn.peer);
      updateActivePeersBadge();
    });
  }

  // --- REDE P2P COM PEERJS: LOGICA DO PARTICIPANTE ---
  function initParticipantPeer() {
    connStatusBadge.textContent = 'Conectando ao Host...';
    connStatusBadge.style.background = '#d97706';

    if (typeof Peer === 'undefined') {
      connStatusBadge.textContent = 'Erro: PeerJS indisponível';
      connStatusBadge.style.background = 'var(--color-danger)';
      alert('Não foi possível conectar: a biblioteca PeerJS não foi carregada pelo navegador.');
      return;
    }

    try {
      // Participantes usam ID randômico fornecido pela rede
      peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', (id) => {
        state.myPeerId = id;

        // Tentar conectar ao ID do Host
        hostConnection = peer.connect(state.roomId, { reliable: true });

        hostConnection.on('open', () => {
          connStatusBadge.textContent = 'Participante';
          connStatusBadge.style.background = '#2563eb'; // azul
          connStatusBadge.style.color = 'white';

          // Compartilhar QR code do próprio link
          generateQRCode(window.location.href);
        });

        hostConnection.on('data', (data) => {
          handleNetworkMessage('host', data);
        });

        hostConnection.on('close', () => {
          connStatusBadge.textContent = 'Host Desconectado';
          connStatusBadge.style.background = 'var(--color-danger)';
        });

        hostConnection.on('error', (err) => {
          console.error('PeerJS Connection Error:', err);
          connStatusBadge.textContent = 'Falha ao conectar';
          connStatusBadge.style.background = 'var(--color-danger)';
        });
      });

      peer.on('error', (err) => {
        console.error('PeerJS Participant Error:', err);
        connStatusBadge.textContent = 'Erro no Peer';
        connStatusBadge.style.background = 'var(--color-danger)';
      });
    } catch (e) {
      console.error('Erro de inicialização do Participante:', e);
      connStatusBadge.textContent = 'Erro de inicialização';
      connStatusBadge.style.background = 'var(--color-danger)';
    }
  }

  // --- TRATAMENTO DE MENSAGENS DE REDE ---
  function handleNetworkMessage(senderPeerId, data) {
    switch (data.type) {
      
      case 'init':
        // Receber estado completo inicial
        state.elements = data.elements || {};
        state.connections = data.connections || [];
        
        // Renderizar todos no DOM
        Object.values(state.elements).forEach(el => renderElementDOM(el));
        drawConnections();
        break;

      case 'update-element':
        // Atualizar ou criar elemento
        state.elements[data.element.id] = data.element;
        renderElementDOM(data.element);
        drawConnections();
        
        // Se host, replicar para todos os outros clientes
        if (state.isHost) {
          replicateAction(senderPeerId, data);
          saveLocalState();
        }
        break;

      case 'delete-element':
        // Remover elemento
        if (state.elements[data.id]) {
          delete state.elements[data.id];
          const div = document.getElementById(data.id);
          if (div) div.remove();
        }
        state.connections = state.connections.filter(c => c.fromId !== data.id && c.toId !== data.id);
        drawConnections();

        if (state.isHost) {
          replicateAction(senderPeerId, data);
          saveLocalState();
        }
        break;

      case 'add-connection':
        // Adicionar conector
        state.connections.push(data.connection);
        drawConnections();

        if (state.isHost) {
          replicateAction(senderPeerId, data);
          saveLocalState();
        }
        break;

      case 'delete-connection':
        // Remover conector
        state.connections = state.connections.filter(c => c.id !== data.id);
        drawConnections();

        if (state.isHost) {
          replicateAction(senderPeerId, data);
          saveLocalState();
        }
        break;

      case 'clear':
        // Limpar tudo
        state.elements = {};
        state.connections = [];
        deselectAll();
        document.querySelectorAll('.board-element').forEach(el => el.remove());
        svg.querySelectorAll('.connection-group').forEach(group => group.remove());

        if (state.isHost) {
          replicateAction(senderPeerId, data);
          saveLocalState();
        }
        break;

      case 'update-cursor':
        // Sincronizar cursor remotos
        updateRemoteCursor(senderPeerId === 'host' ? data.peerId : senderPeerId, data.cursor);
        
        // Se host, replicar para todos
        if (state.isHost) {
          replicateAction(senderPeerId, {
            type: 'update-cursor',
            peerId: senderPeerId,
            cursor: data.cursor
          });
        }
        break;
    }
  }

  // --- RETRANSMITIR AÇÃO DO CLIENTE PARA TODOS (HOST ONLY) ---
  function replicateAction(originPeerId, action) {
    Object.keys(clientConnections).forEach(clientPeerId => {
      // Não retransmitir de volta para a mesma origem
      if (clientPeerId !== originPeerId) {
        clientConnections[clientPeerId].send(action);
      }
    });
  }

  // --- BROADCAST AÇÃO LOCAL PARA A REDE ---
  function broadcastAction(action) {
    if (state.isHost) {
      // Host envia para todos os clientes conectados
      Object.values(clientConnections).forEach(conn => {
        if (conn.open) conn.send(action);
      });
    } else {
      // Cliente envia para o host
      if (hostConnection && hostConnection.open) {
        hostConnection.send(action);
      }
    }
  }

  // --- ATUALIZAR CONTADOR DE USUÁRIOS ---
  function updateActivePeersBadge() {
    const count = Object.keys(clientConnections).length + 1; // +1 inclui o host
    activePeersBadge.textContent = `${count} Online`;
    activePeersBadge.style.display = 'block';
  }

  // --- GERENCIAR CURSORES REMOTOS ---
  function updateRemoteCursor(peerId, cursorData) {
    if (!cursorData || peerId === state.myPeerId) return;

    let cursorDiv = document.getElementById(`cursor-${peerId}`);
    if (!cursorDiv) {
      cursorDiv = document.createElement('div');
      cursorDiv.id = `cursor-${peerId}`;
      cursorDiv.className = 'remote-cursor';
      
      // Desenhar Seta SVG do cursor com a cor
      cursorDiv.innerHTML = `
        <svg class="cursor-pointer-arrow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 3V17.5L9.2 12.8L14.5 21L17.5 19L12.5 11L18.5 11L4.5 3Z" style="fill: ${cursorData.color}; stroke: white; stroke-width: 1.5px;"/>
        </svg>
        <span class="cursor-label" style="background-color: ${cursorData.color};">${cursorData.name}</span>
      `;
      board.appendChild(cursorDiv);
    }

    // Posicionar cursor relativo ao board
    cursorDiv.style.left = `${cursorData.x}px`;
    cursorDiv.style.top = `${cursorData.y}px`;
  }

  function removeRemoteCursor(peerId) {
    const cursorDiv = document.getElementById(`cursor-${peerId}`);
    if (cursorDiv) {
      cursorDiv.remove();
    }
  }

  // --- UTILS ---
  function getRandomPastelColor() {
    const pastelKeys = Object.keys(PASTEL_PALETTE);
    const randKey = pastelKeys[Math.floor(Math.random() * pastelKeys.length)];
    return PASTEL_PALETTE[randKey].bg;
  }

  // Auto-inicializar
  window.addEventListener('DOMContentLoaded', init);

})();

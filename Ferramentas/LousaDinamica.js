// LousaDinamica.js - Board interactive logic with zoom, pan, nodes and vector connectors
let activeTool = 'select';
let activeColor = 'gray';
let scale = 1.0;
let panX = 50;
let panY = 50;

let selectedNode = null;
let selectedConnection = null;
let connectionStartNode = null;
let isDraggingNode = false;
let dragNode = null;
let dragStart = { x: 0, y: 0 };
let nodeStartPos = { x: 0, y: 0 };
let isResizingNode = false;
let resizeNode = null;
let resizeEdge = 'right';
let resizeStart = { x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 };

let isPanning = false;
let panStart = { x: 0, y: 0 };

let connections = [];
let nodeIdCounter = 1;

// --- Undo & Redo History System ---
let undoStack = [];
let redoStack = [];
let isRestoringState = false;

const viewport = document.getElementById('viewport');
const canvasContent = document.getElementById('canvas-content');
const nodesContainer = document.getElementById('nodes-container');
const svg = document.getElementById('connections-svg');
const zoomText = document.getElementById('zoom-text');

// Initialize positions
updateCanvasTransform();

// --- 1. Toolbar and Mode selection ---
document.querySelectorAll('.toolbar-btn[data-tool]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
    activeTool = btn.getAttribute('data-tool');
    btn.classList.add('active');

    // Reset connecting state if we change tools
    if (activeTool !== 'connect' && connectionStartNode) {
      connectionStartNode.style.outline = '';
      connectionStartNode = null;
    }
  });
});

// Color swatch selector
document.querySelectorAll('.color-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    activeColor = swatch.getAttribute('data-color');
    swatch.classList.add('active');

    // If a node is selected, apply the color directly
    if (selectedNode) {
      removeColorClasses(selectedNode);
      selectedNode.classList.add(`node-color-${activeColor}`);
      saveState();
    }
  });
});

function removeColorClasses(node) {
  node.classList.remove('node-color-gray', 'node-color-red', 'node-color-black', 'node-color-green');
}


// --- 2. Shapes Sidebar Spawning (Miro style) ---
document.querySelectorAll('.sidebar-shape-btn[data-add]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const shapeType = btn.getAttribute('data-add');
    if (shapeType) {
      addShapeAtCenter(shapeType);
    }
  });
});

function addShapeAtCenter(shapeType) {
  const screenCenterX = viewport.offsetWidth / 2;
  const screenCenterY = viewport.offsetHeight / 2;

  const canvasX = (screenCenterX - panX) / scale;
  const canvasY = (screenCenterY - panY) / scale;

  let shapeClass = 'shape-process';
  let defaultText = 'Novo Processo';

  if (shapeType === 'event') {
    shapeClass = 'shape-event';
    defaultText = 'Início/Fim';
  } else if (shapeType === 'decision') {
    shapeClass = 'shape-decision';
    defaultText = 'Decisão?';
  } else if (shapeType === 'sticky') {
    shapeClass = 'shape-sticky';
    defaultText = 'Nota Adesiva';
  } else if (shapeType === 'text') {
    shapeClass = 'shape-text';
    defaultText = 'Bloco de Texto';
  } else if (shapeType === 'and') {
    shapeClass = 'shape-and';
    defaultText = '[E] Porta E';
  } else if (shapeType === 'or') {
    shapeClass = 'shape-or';
    defaultText = '[OU] Porta OU';
  } else if (shapeType === 'line') {
    shapeClass = 'shape-line';
    defaultText = '';
  } else if (shapeType === 'line-left') {
    shapeClass = 'shape-line shape-line-left';
    defaultText = '';
  }

  const newNode = createNode(canvasX, canvasY, shapeClass, defaultText);

  // Automatically select the newly created node
  deselectAll();
  selectedNode = newNode;
  newNode.classList.add('selected');
  showSelectedHandles(newNode);
}


// --- 3. Zoom & Pan Canvas ---
viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = 0.08;

  if (e.deltaY < 0) {
    scale = Math.min(2.5, scale + zoomFactor);
  } else {
    scale = Math.max(0.3, scale - zoomFactor);
  }

  zoomText.textContent = `${Math.round(scale * 100)}%`;
  updateCanvasTransform();
}, { passive: false });

viewport.addEventListener('mousedown', (e) => {
  const isBackground = e.target === viewport ||
    e.target === canvasContent ||
    e.target === nodesContainer ||
    e.target.classList.contains('canvas-grid') ||
    e.target.id === 'connections-svg';
  
  if (isBackground && (e.button === 0 || e.button === 1)) {
    deselectAll();
    isPanning = true;
    panStart.x = e.clientX - panX;
    panStart.y = e.clientY - panY;
    viewport.style.cursor = 'grabbing';
  }
});

window.addEventListener('mousemove', (e) => {
  if (isPanning) {
    panX = e.clientX - panStart.x;
    panY = e.clientY - panStart.y;
    updateCanvasTransform();
  } else if (isResizingNode && resizeNode) {
    const dx = (e.clientX - resizeStart.x) / scale;
    const dy = (e.clientY - resizeStart.y) / scale;

    resizeSelectedNode(dx, dy);

    updateConnections();
  } else if (isDraggingNode && dragNode) {
    // Zoom corrected client coordinates delta
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    dragNode.style.left = `${nodeStartPos.x + dx}px`;
    dragNode.style.top = `${nodeStartPos.y + dy}px`;

    // Redraw SVG paths
    updateConnections();
  }
});

window.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    viewport.style.cursor = 'grab';
  }
  if (isDraggingNode) {
    isDraggingNode = false;
    dragNode = null;
    saveState(); // Save state on drag release
  }
  if (isResizingNode) {
    isResizingNode = false;
    resizeNode = null;
    saveState();
  }
});

function updateCanvasTransform() {
  canvasContent.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function resizeSelectedNode(dx, dy) {
  const minWidth = resizeNode.classList.contains('shape-line') ? 64 : 64;
  const minHeight = resizeNode.classList.contains('shape-line') ? 28 : (resizeNode.classList.contains('shape-image') ? 50 : 40);
  const shouldKeepSquare = resizeNode.classList.contains('shape-event') || resizeNode.classList.contains('shape-decision');
  let nextWidth = resizeStart.width;
  let nextHeight = resizeStart.height;
  let nextLeft = resizeStart.left;
  let nextTop = resizeStart.top;

  if (resizeEdge.includes('right')) nextWidth = resizeStart.width + dx;
  if (resizeEdge.includes('left')) {
    nextWidth = resizeStart.width - dx;
    nextLeft = resizeStart.left + dx;
  }
  if (resizeEdge.includes('bottom')) nextHeight = resizeStart.height + dy;
  if (resizeEdge.includes('top')) {
    nextHeight = resizeStart.height - dy;
    nextTop = resizeStart.top + dy;
  }

  if (resizeNode.classList.contains('shape-line')) {
    nextHeight = resizeStart.height;
    nextTop = resizeStart.top;
  }

  nextWidth = Math.max(minWidth, nextWidth);
  nextHeight = Math.max(minHeight, nextHeight);

  if (shouldKeepSquare) {
    const nextSize = Math.max(nextWidth, nextHeight);
    if (resizeEdge.includes('left')) nextLeft = resizeStart.left + resizeStart.width - nextSize;
    if (resizeEdge.includes('top')) nextTop = resizeStart.top + resizeStart.height - nextSize;
    nextWidth = nextSize;
    nextHeight = nextSize;
  } else {
    if (resizeEdge.includes('left')) nextLeft = resizeStart.left + resizeStart.width - nextWidth;
    if (resizeEdge.includes('top')) nextTop = resizeStart.top + resizeStart.height - nextHeight;
  }

  resizeNode.style.width = `${nextWidth}px`;
  resizeNode.style.height = `${nextHeight}px`;
  resizeNode.style.left = `${nextLeft}px`;
  resizeNode.style.top = `${nextTop}px`;
}

// Zoom HUD buttons
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  scale = Math.min(2.5, scale + 0.15);
  zoomText.textContent = `${Math.round(scale * 100)}%`;
  updateCanvasTransform();
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  scale = Math.max(0.3, scale - 0.15);
  zoomText.textContent = `${Math.round(scale * 100)}%`;
  updateCanvasTransform();
});

function deselectAll() {
  if (selectedNode) {
    selectedNode.classList.remove('selected');
    selectedNode = null;
  }
  if (selectedConnection) {
    selectedConnection.pathElement.classList.remove('selected');
    selectedConnection = null;
  }
  if (connectionStartNode) {
    connectionStartNode.style.outline = '';
    connectionStartNode = null;
  }
  clearSelectedHandles();
  updateFlipLineBtnVisibility(null);
}

function updateFlipLineBtnVisibility(node) {
  const btnFlipLine = document.getElementById('btn-flip-line');
  if (btnFlipLine) {
    if (node && node.classList.contains('shape-line')) {
      btnFlipLine.style.display = 'flex';
    } else {
      btnFlipLine.style.display = 'none';
    }
  }
}

// Botão de inverter seta da timeline
const btnFlipLine = document.getElementById('btn-flip-line');
if (btnFlipLine) {
  btnFlipLine.addEventListener('click', () => {
    if (selectedNode && selectedNode.classList.contains('shape-line')) {
      selectedNode.classList.toggle('shape-line-left');
      saveState();
    }
  });
}

// Create Whiteboard Node element
function createNode(x, y, shapeClass, text, isAbsoluteCoords = false) {
  const node = document.createElement('div');
  const id = `node-${Date.now()}-${nodeIdCounter++}`;
  node.id = id;
  
  let finalColorClass = `node-color-${activeColor}`;
  if (shapeClass === 'shape-sticky') {
    finalColorClass = 'node-color-gray';
  }

  node.className = `board-node ${shapeClass} ${finalColorClass}`;
  
  if (!isAbsoluteCoords) {
    let offsetX = 80;
    let offsetY = 35;
    if (shapeClass === 'shape-event') { offsetX = 50; offsetY = 50; }
    else if (shapeClass === 'shape-decision') { offsetX = 55; offsetY = 55; }
    else if (shapeClass === 'shape-sticky') { offsetX = 60; offsetY = 60; }
    else if (shapeClass === 'shape-text') { offsetX = 70; offsetY = 25; }
    else if (shapeClass === 'shape-and' || shapeClass === 'shape-or') { offsetX = 55; offsetY = 45; }
    else if (shapeClass.includes('shape-line')) { offsetX = 95; offsetY = 14; }

    node.style.left = `${x - offsetX}px`;
    node.style.top = `${y - offsetY}px`;
  } else {
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }

  const textSpan = document.createElement('span');
  textSpan.className = 'node-text';
  textSpan.textContent = text;
  node.appendChild(textSpan);

  // Setup Event Listeners
  node.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    
    if (activeTool === 'connect') {
      handleConnectionClick(node);
      return;
    }

    deselectAll();
    selectedNode = node;
    node.classList.add('selected');
    showSelectedHandles(node);
    updateFlipLineBtnVisibility(node);

    // Drag start coordinates
    isDraggingNode = true;
    dragNode = node;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    nodeStartPos.x = parseFloat(node.style.left) || 0;
    nodeStartPos.y = parseFloat(node.style.top) || 0;
  });

  // Double click editing text or flipping timeline line direction
  node.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (node.classList.contains('shape-line')) {
      node.classList.toggle('shape-line-left');
      saveState();
      return;
    }
    enterEditTextMode(node, textSpan);
  });

  nodesContainer.appendChild(node);
  fitNodeToText(node);
  
  if (!isRestoringState) {
    saveState();
  }
  
  return node;
}

// Create Image Node element
function createImageNode(x, y, imgSrc, customWidth = null, customHeight = null, isAbsoluteCoords = false) {
  const node = document.createElement('div');
  const id = `node-${Date.now()}-${nodeIdCounter++}`;
  node.id = id;
  
  node.className = `board-node shape-image node-color-gray`;
  
  const w = customWidth || 320;
  const h = customHeight || 220;
  
  if (!isAbsoluteCoords) {
    node.style.left = `${x - w / 2}px`;
    node.style.top = `${y - h / 2}px`;
  } else {
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }
  
  node.style.width = `${w}px`;
  node.style.height = `${h}px`;

  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = 'Imagem de guia / referência';
  node.appendChild(img);

  const textSpan = document.createElement('span');
  textSpan.className = 'node-text';
  textSpan.style.display = 'none';
  node.appendChild(textSpan);

  // Setup Event Listeners
  node.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    
    if (activeTool === 'connect') {
      handleConnectionClick(node);
      return;
    }

    deselectAll();
    selectedNode = node;
    node.classList.add('selected');
    showSelectedHandles(node);

    // Drag start coordinates
    isDraggingNode = true;
    dragNode = node;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    nodeStartPos.x = parseFloat(node.style.left) || 0;
    nodeStartPos.y = parseFloat(node.style.top) || 0;
  });

  nodesContainer.appendChild(node);
  
  if (!isRestoringState) {
    saveState();
  }
  
  return node;
}

function processAndAddImage(dataUrl) {
  const tempImg = new Image();
  tempImg.onload = () => {
    let w = tempImg.naturalWidth || 360;
    let h = tempImg.naturalHeight || 240;

    // Redimensionar para tamanho proporcional inicial adequado na tela (max 420px)
    const maxDim = 420;
    if (w > maxDim || h > maxDim) {
      if (w >= h) {
        h = Math.round((maxDim / w) * h);
        w = maxDim;
      } else {
        w = Math.round((maxDim / h) * w);
        h = maxDim;
      }
    }
    
    w = Math.max(120, w);
    h = Math.max(80, h);

    const screenCenterX = viewport.offsetWidth / 2;
    const screenCenterY = viewport.offsetHeight / 2;

    const canvasX = (screenCenterX - panX) / scale;
    const canvasY = (screenCenterY - panY) / scale;

    const newNode = createImageNode(canvasX, canvasY, dataUrl, w, h);

    deselectAll();
    selectedNode = newNode;
    newNode.classList.add('selected');
    showSelectedHandles(newNode);
  };
  tempImg.src = dataUrl;
}

// Global Clipboard Paste Listener (Ctrl+V)
window.addEventListener('paste', (e) => {
  const activeEl = document.activeElement;
  const isEditingText = activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT');
  
  const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
  if (!items) return;

  let imageItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      imageItem = items[i];
      break;
    }
  }

  if (imageItem) {
    if (isEditingText) return;
    e.preventDefault();
    const blob = imageItem.getAsFile();
    if (!blob) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      processAndAddImage(evt.target.result);
    };
    reader.readAsDataURL(blob);
  }
});

// Sidebar Image button & File Input Listeners
function setupImageInputListeners() {
  const btnAddImg = document.getElementById('btn-add-image');
  const imgFileInput = document.getElementById('image-file-input');

  if (btnAddImg && imgFileInput) {
    btnAddImg.addEventListener('click', () => {
      imgFileInput.click();
    });

    imgFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        processAndAddImage(evt.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupImageInputListeners);
} else {
  setupImageInputListeners();
}

// Text Editing inside node
function enterEditTextMode(node, textSpan) {
  if (node.classList.contains('shape-image')) return;
  if (node.querySelector('textarea')) return; // Already editing
  
  const currentText = textSpan.textContent;
  textSpan.style.display = 'none';

  const textarea = document.createElement('textarea');
  textarea.value = currentText;
  node.appendChild(textarea);
  
  textarea.focus();
  textarea.select();

  function finishEdit() {
    const newText = textarea.value.trim() || 'Forma';
    const oldText = textSpan.textContent;
    textSpan.textContent = newText;
    textSpan.style.display = 'block';
    textarea.remove();

    if (newText !== oldText) {
      fitNodeToText(node);
      updateConnections();
      saveState(); // Save state on text change
    }
  }

  textarea.addEventListener('blur', finishEdit);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
  });
}

function fitNodeToText(node) {
  if (node.classList.contains('shape-line') || node.classList.contains('shape-event') || node.classList.contains('shape-decision') || node.classList.contains('shape-image')) {
    return;
  }

  if (!node.style.height) {
    node.style.height = 'auto';
  }
}


// --- 4. Coggle-style Quick-connecting handles ---
function showSelectedHandles(node) {
  clearSelectedHandles();

  showResizeHandles(node);

  const directions = [
    { dir: 'top', symbol: '+', style: 'top: -24px; left: calc(50% - 10px);' },
    { dir: 'bottom', symbol: '+', style: 'bottom: -24px; left: calc(50% - 10px);' },
    { dir: 'left', symbol: '+', style: 'left: -24px; top: calc(50% - 10px);' },
    { dir: 'right', symbol: '+', style: 'right: -24px; top: calc(50% - 10px);' }
  ];

  directions.forEach((d) => {
    const handle = document.createElement('button');
    handle.className = 'connector-handle';
    handle.style = `position: absolute; ${d.style}`;
    handle.textContent = d.symbol;
    handle.setAttribute('title', `Conectar figura a partir do lado: ${d.dir}`);

    // Prevent dragging node when clicking handles
    handle.addEventListener('mousedown', e => e.stopPropagation());

    handle.addEventListener('click', (e) => {
      e.stopPropagation();
      handleQuickConnectClick(node);
    });

    node.appendChild(handle);
  });
}

function showResizeHandles(node) {
  const edges = node.classList.contains('shape-line')
    ? ['left', 'right']
    : ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  edges.forEach((edge) => {
    const handle = document.createElement('button');
    handle.className = 'resize-handle';
    handle.dataset.edge = edge;
    handle.type = 'button';
    handle.setAttribute('title', edge === 'right' ? 'Aumentar ou reduzir comprimento' : 'Ajustar início da linha');

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDraggingNode = false;
      dragNode = null;
      isResizingNode = true;
      resizeNode = node;
      resizeEdge = edge;
      resizeStart.x = e.clientX;
      resizeStart.y = e.clientY;
      resizeStart.width = node.offsetWidth;
      resizeStart.height = node.offsetHeight;
      resizeStart.left = parseFloat(node.style.left) || 0;
      resizeStart.top = parseFloat(node.style.top) || 0;
    });

    node.appendChild(handle);
  });
}

function clearSelectedHandles() {
  document.querySelectorAll('.connector-handle').forEach(h => h.remove());
  document.querySelectorAll('.resize-handle').forEach(h => h.remove());
}

function handleQuickConnectClick(parentNode) {
  // Start connection mode using the selected node as origin
  deselectAll();
  connectionStartNode = parentNode;
  
  // Highlight the node visually (using red outline to draw attention)
  parentNode.style.outline = '3px solid var(--color-danger, #dc2626)';

  // Switch workspace mode to connection tool
  activeTool = 'connect';
  document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
  document.querySelector('.toolbar-btn[data-tool="connect"]').classList.add('active');
}


// --- 5. Draw Vector Connections ---
function handleConnectionClick(node) {
  if (!connectionStartNode) {
    connectionStartNode = node;
    node.style.outline = '3px solid var(--color-accent)';
  } else {
    if (connectionStartNode !== node) {
      createConnection(connectionStartNode, node);
    }
    connectionStartNode.style.outline = '';
    connectionStartNode = null;
    
    // Revert tool back to select
    document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
    activeTool = 'select';
    document.querySelector('.toolbar-btn[data-tool="select"]').classList.add('active');
  }
}

function createConnection(fromNode, toNode) {
  const duplicate = connections.find(c => c.fromId === fromNode.id && c.toId === toNode.id);
  if (duplicate) return;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'connection-line');
  svg.appendChild(path);

  const connObj = {
    id: `conn-${Date.now()}`,
    fromId: fromNode.id,
    toId: toNode.id,
    pathElement: path
  };

  connections.push(connObj);

  // Attach select click event to line
  path.addEventListener('mousedown', (e) => {
    e.stopPropagation(); // Avoid deselecting on canvas background click
    deselectAll();
    selectedConnection = connObj;
    path.classList.add('selected');
  });

  drawConnection(fromNode, toNode, path);

  if (!isRestoringState) {
    saveState();
  }
}

function drawConnection(fromNode, toNode, pathElement) {
  const r1 = {
    x: parseFloat(fromNode.style.left),
    y: parseFloat(fromNode.style.top),
    w: fromNode.offsetWidth,
    h: fromNode.offsetHeight
  };
  const r2 = {
    x: parseFloat(toNode.style.left),
    y: parseFloat(toNode.style.top),
    w: toNode.offsetWidth,
    h: toNode.offsetHeight
  };

  // Anchors for each edge with face metadata
  const a1 = [
    { x: r1.x + r1.w / 2, y: r1.y,          face: 'top' },
    { x: r1.x + r1.w / 2, y: r1.y + r1.h,    face: 'bottom' },
    { x: r1.x,            y: r1.y + r1.h / 2, face: 'left' },
    { x: r1.x + r1.w,     y: r1.y + r1.h / 2, face: 'right' }
  ];
  const a2 = [
    { x: r2.x + r2.w / 2, y: r2.y,          face: 'top' },
    { x: r2.x + r2.w / 2, y: r2.y + r2.h,    face: 'bottom' },
    { x: r2.x,            y: r2.y + r2.h / 2, face: 'left' },
    { x: r2.x + r2.w,     y: r2.y + r2.h / 2, face: 'right' }
  ];

  const bestRoute = chooseBestConnectionRoute(a1, a2, fromNode, toNode);
  pathElement.setAttribute('d', pointsToPath(bestRoute.points));
}

function chooseBestConnectionRoute(sourceAnchors, targetAnchors, fromNode, toNode) {
  const routes = [];

  sourceAnchors.forEach((source) => {
    targetAnchors.forEach((target) => {
      const end = getArrowTargetPoint(target);
      const route = buildObstacleAvoidingRoute(
        { x: source.x, y: source.y, face: source.face },
        { x: end.x, y: end.y, face: target.face },
        fromNode,
        toNode
      );
      const directionPenalty = getAnchorDirectionPenalty(source, target);
      routes.push({
        ...route,
        score: route.collisions * 100000 + directionPenalty + route.length
      });
    });
  });

  return routes.sort((a, b) => a.score - b.score)[0];
}

function getArrowTargetPoint(anchor) {
  const offset = 8;
  if (anchor.face === 'top') return { x: anchor.x, y: anchor.y - offset };
  if (anchor.face === 'bottom') return { x: anchor.x, y: anchor.y + offset };
  if (anchor.face === 'left') return { x: anchor.x - offset, y: anchor.y };
  if (anchor.face === 'right') return { x: anchor.x + offset, y: anchor.y };
  return { x: anchor.x, y: anchor.y };
}

function getAnchorDirectionPenalty(source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  let penalty = 0;

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0 && source.face !== 'right') penalty += 900;
    if (dx < 0 && source.face !== 'left') penalty += 900;
    if (dx >= 0 && target.face !== 'left') penalty += 700;
    if (dx < 0 && target.face !== 'right') penalty += 700;
  } else {
    if (dy >= 0 && source.face !== 'bottom') penalty += 900;
    if (dy < 0 && source.face !== 'top') penalty += 900;
    if (dy >= 0 && target.face !== 'top') penalty += 700;
    if (dy < 0 && target.face !== 'bottom') penalty += 700;
  }

  return penalty;
}

function buildObstacleAvoidingRoute(start, end, fromNode, toNode) {
  const margin = 18;
  const minGap = 28;
  const stubLength = 24;
  const routedStart = getStubPoint(start, stubLength);
  const routedEnd = getStubPoint(end, stubLength);
  const obstacles = getConnectorObstacles(fromNode, toNode, margin);
  const sourceRect = getNodeRect(fromNode, 0);
  const targetRect = getNodeRect(toNode, 0);
  const minX = Math.min(start.x, end.x, routedStart.x, routedEnd.x, sourceRect.x, targetRect.x) - 80;
  const maxX = Math.max(start.x, end.x, routedStart.x, routedEnd.x, sourceRect.x + sourceRect.w, targetRect.x + targetRect.w) + 80;
  const minY = Math.min(start.y, end.y, routedStart.y, routedEnd.y, sourceRect.y, targetRect.y) - 80;
  const maxY = Math.max(start.y, end.y, routedStart.y, routedEnd.y, sourceRect.y + sourceRect.h, targetRect.y + targetRect.h) + 80;

  const candidatePaths = [
    ...buildSimplePathCandidates(routedStart, routedEnd),
    ...buildDetourPathCandidates(routedStart, routedEnd, sourceRect, targetRect, minGap, minX, maxX, minY, maxY)
  ].map(points => compactPathPoints([start, routedStart, ...points, routedEnd, end]));

  const bestPath = candidatePaths
    .map(points => ({ points, collisions: countPathCollisions(points, obstacles), length: getPathLength(points) }))
    .sort((a, b) => a.collisions - b.collisions || a.length - b.length)[0];

  return bestPath;
}

function getStubPoint(point, distance) {
  if (point.face === 'left') return { x: point.x - distance, y: point.y };
  if (point.face === 'right') return { x: point.x + distance, y: point.y };
  if (point.face === 'top') return { x: point.x, y: point.y - distance };
  if (point.face === 'bottom') return { x: point.x, y: point.y + distance };
  return { x: point.x, y: point.y };
}

function compactPathPoints(points) {
  return points.filter((point, index) => {
    const prev = points[index - 1];
    const next = points[index + 1];
    if (prev && point.x === prev.x && point.y === prev.y) return false;
    if (!prev || !next) return true;
    const sameVertical = prev.x === point.x && point.x === next.x;
    const sameHorizontal = prev.y === point.y && point.y === next.y;
    return !sameVertical && !sameHorizontal;
  });
}

function buildSimplePathCandidates(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  return [
    [{ x: start.x, y: start.y }, { x: end.x, y: start.y }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: start.x, y: end.y }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: midX, y: start.y }, { x: midX, y: end.y }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: start.x, y: midY }, { x: end.x, y: midY }, { x: end.x, y: end.y }]
  ];
}

function buildDetourPathCandidates(start, end, sourceRect, targetRect, minGap, minX, maxX, minY, maxY) {
  const horizontalLanes = uniqueSortedNumbers([
    sourceRect.y - minGap,
    sourceRect.y + sourceRect.h + minGap,
    targetRect.y - minGap,
    targetRect.y + targetRect.h + minGap,
    minY,
    maxY
  ]);
  const verticalLanes = uniqueSortedNumbers([
    sourceRect.x - minGap,
    sourceRect.x + sourceRect.w + minGap,
    targetRect.x - minGap,
    targetRect.x + targetRect.w + minGap,
    minX,
    maxX
  ]);

  const paths = [];
  horizontalLanes.forEach((laneY) => {
    paths.push([
      { x: start.x, y: start.y },
      { x: start.x, y: laneY },
      { x: end.x, y: laneY },
      { x: end.x, y: end.y }
    ]);
  });

  verticalLanes.forEach((laneX) => {
    paths.push([
      { x: start.x, y: start.y },
      { x: laneX, y: start.y },
      { x: laneX, y: end.y },
      { x: end.x, y: end.y }
    ]);
  });

  return paths;
}

function getConnectorObstacles(fromNode, toNode, margin = 0) {
  return Array.from(document.querySelectorAll('.board-node'))
    .filter(node => node !== fromNode && node !== toNode && !node.classList.contains('shape-line'))
    .map(node => getNodeRect(node, margin));
}

function getNodeRect(node, margin = 0) {
  return {
    x: (parseFloat(node.style.left) || 0) - margin,
    y: (parseFloat(node.style.top) || 0) - margin,
    w: node.offsetWidth + margin * 2,
    h: node.offsetHeight + margin * 2
  };
}

function countPathCollisions(points, obstacles) {
  let collisions = 0;
  for (let i = 0; i < points.length - 1; i++) {
    obstacles.forEach((rect) => {
      if (segmentIntersectsRect(points[i], points[i + 1], rect)) {
        collisions++;
      }
    });
  }
  return collisions;
}

function segmentIntersectsRect(p1, p2, rect) {
  if (p1.x === p2.x) {
    const x = p1.x;
    if (x < rect.x || x > rect.x + rect.w) return false;
    const y1 = Math.min(p1.y, p2.y);
    const y2 = Math.max(p1.y, p2.y);
    return y2 > rect.y && y1 < rect.y + rect.h;
  }

  if (p1.y === p2.y) {
    const y = p1.y;
    if (y < rect.y || y > rect.y + rect.h) return false;
    const x1 = Math.min(p1.x, p2.x);
    const x2 = Math.max(p1.x, p2.x);
    return x2 > rect.x && x1 < rect.x + rect.w;
  }

  return false;
}

function getPathLength(points) {
  return points.reduce((total, point, index) => {
    if (index === 0) return total;
    const prev = points[index - 1];
    return total + Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y);
  }, 0);
}

function pointsToPath(points) {
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map(point => `L ${point.x} ${point.y}`).join(' ')}`;
}

function uniqueSortedNumbers(numbers) {
  return Array.from(new Set(numbers.map(number => Math.round(number)))).sort((a, b) => a - b);
}

function updateConnections() {
  connections.forEach((conn) => {
    const fromNode = document.getElementById(conn.fromId);
    const toNode = document.getElementById(conn.toId);
    if (fromNode && toNode) {
      drawConnection(fromNode, toNode, conn.pathElement);
    }
  });
}


// --- 6. Delete and Clear Canvas ---
function deleteSelectedElement() {
  if (selectedNode) {
    const id = selectedNode.id;

    // Remove connections involving this node
    connections = connections.filter((conn) => {
      if (conn.fromId === id || conn.toId === id) {
        conn.pathElement.remove();
        return false;
      }
      return true;
    });

    // Remove Node Element
    selectedNode.remove();
    selectedNode = null;
    clearSelectedHandles();
    saveState();
  } else if (selectedConnection) {
    selectedConnection.pathElement.remove();
    connections = connections.filter(c => c.id !== selectedConnection.id);
    selectedConnection = null;
    saveState();
  }
}

document.getElementById('btn-delete').addEventListener('click', deleteSelectedElement);

document.getElementById('btn-clear').addEventListener('click', () => {
  if (confirm('Deseja limpar todos os elementos da lousa dinâmica?')) {
    connections.forEach(c => c.pathElement.remove());
    connections = [];

    nodesContainer.innerHTML = '';
    selectedNode = null;
    selectedConnection = null;
    connectionStartNode = null;
    clearSelectedHandles();
    saveState();
  }
});

// Bind Delete key to remove elements
window.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement.tagName !== 'TEXTAREA') {
    deleteSelectedElement();
  }
});


function getNodeStateData(node) {
  const isImage = node.classList.contains('shape-image');
  const imgEl = node.querySelector('img');
  const textEl = node.querySelector('.node-text');
  return {
    id: node.id,
    className: node.className.replace('selected', '').trim(),
    left: node.style.left,
    top: node.style.top,
    width: node.style.width || `${node.offsetWidth}px`,
    height: node.style.height || `${node.offsetHeight}px`,
    text: textEl ? textEl.textContent : '',
    imgSrc: isImage && imgEl ? imgEl.src : null
  };
}

// --- 7. Undo / Redo Logic Implementation ---
function saveState() {
  if (isRestoringState) return;

  const state = {
    nodes: Array.from(document.querySelectorAll('.board-node')).map(node => getNodeStateData(node)),
    connections: connections.map(conn => ({
      fromId: conn.fromId,
      toId: conn.toId
    }))
  };

  const serialized = JSON.stringify(state);
  
  // Avoid duplicating top state
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === serialized) return;

  undoStack.push(serialized);
  redoStack = []; // Clear redo stack on user changes
}

function undo() {
  if (undoStack.length <= 1) return; // Keep at least the initial state

  const currentState = undoStack.pop();
  redoStack.push(currentState);

  const prevStateStr = undoStack[undoStack.length - 1];
  const prevState = JSON.parse(prevStateStr);
  restoreState(prevState);
}

function redo() {
  if (redoStack.length === 0) return;

  const nextStateStr = redoStack.pop();
  undoStack.push(nextStateStr);

  const nextState = JSON.parse(nextStateStr);
  restoreState(nextState);
}

function restoreState(state) {
  isRestoringState = true;
  deselectAll();

  // Clear connections SVG and DOM
  connections.forEach(c => c.pathElement.remove());
  connections = [];
  nodesContainer.innerHTML = '';

  // Re-create nodes with exact dimensions and IDs
  state.nodes.forEach((n) => {
    // Retrieve clean shapeClasses list from saved classes
    const classes = n.className.split(' ');
    const shapeClasses = classes.filter(c => c.startsWith('shape-')).join(' ') || 'shape-process';
    
    // Extract base color class
    const colorClass = classes.find(c => c.startsWith('node-color-')) || 'node-color-gray';

    let node;
    if (shapeClasses.includes('shape-image') || n.imgSrc) {
      node = createImageNode(parseFloat(n.left), parseFloat(n.top), n.imgSrc, parseFloat(n.width), parseFloat(n.height), true);
    } else {
      node = createNode(parseFloat(n.left), parseFloat(n.top), shapeClasses, n.text, true);
    }
    node.id = n.id;
    if (n.width) {
      node.style.width = n.width;
    }
    if (n.height) {
      node.style.height = n.height;
    }
    
    removeColorClasses(node);
    node.classList.add(colorClass);
  });

  // Re-create connections
  state.connections.forEach((c) => {
    const fromNode = document.getElementById(c.fromId);
    const toNode = document.getElementById(c.toId);
    if (fromNode && toNode) {
      createConnection(fromNode, toNode);
    }
  });

  isRestoringState = false;
  
  // Try to preserve connection highlight rendering
  updateConnections();
}

// Bind Global Shortcuts
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'TEXTAREA') return;

  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redo();
  }
});


// --- 8. Initial Flowchart setup ---
function loadDefaultFlowchart() {
  isRestoringState = true; // Block individual saves for layout template

  const node1 = createNode(180, 220, 'shape-event', 'Início');
  const node2 = createNode(380, 220, 'shape-process', 'Identificar Sintoma');
  
  // Logic gate "AND" E
  const gateAnd = createNode(620, 220, 'shape-and', '[E] Porta E');
  
  const node4 = createNode(850, 150, 'shape-process', 'Disparar Análise RCA');
  const node5 = createNode(850, 290, 'shape-process', 'Tratamento Corretivo');
  
  // Add a yellow sticky note
  createNode(180, 70, 'shape-sticky', 'Mapear o fluxo de abertura de RCA para quebras crônicas.');
  
  // Add some standalone text
  createNode(510, 50, 'shape-text', 'Fluxograma de Processo');

  createConnection(node1, node2);
  createConnection(node2, gateAnd);
  createConnection(gateAnd, node4);
  createConnection(gateAnd, node5);

  isRestoringState = false;
  saveState(); // Save initial base state
}

// Load sample drawing on first run
loadDefaultFlowchart();

// Sincronizar com portal principal (envio de notas de ajuda do orador)
function notifyPortal() {
  if (window.parent) {
    window.parent.postMessage({
      type: 'SLIDE_CHANGED',
      slideIndex: 0,
      notes: '<h3>Lousa Dinâmica</h3><p>Espaço de quadro branco reativo. Excelente para exercícios em grupo, mapeamento de processos, árvore lógica e desenho de diagramas de causa física, humana e organizacional em tempo real com os alunos.</p>',
      totalSlides: 1
    }, '*');
  }
}

document.addEventListener('DOMContentLoaded', notifyPortal);
notifyPortal(); // Chamar direto para garantir sincronização caso já carregado

// --- 9. Save and Load Whiteboard Files (.json) with Turma Directory Integration ---

// IndexedDB Helper para carregar o manipulador de pasta da turma ativa
function getDirectoryHandle(turmaId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LCCTurmaFolders', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore('folders');
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('folders', 'readonly');
      const store = tx.objectStore('folders');
      const getReq = store.get(turmaId);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.result);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getActiveTurmaDirectory() {
  const activeId = localStorage.getItem('LCC_ACTIVE_TURMA_ID');
  if (!activeId) return null;
  try {
    const handle = await getDirectoryHandle(activeId);
    if (handle) {
      const opts = { mode: 'readwrite' };
      // Verifica/requisita permissão de acesso caso necessário
      if (await handle.queryPermission(opts) !== 'granted') {
        await handle.requestPermission(opts);
      }
      return handle;
    }
  } catch (err) {
    console.warn("Falha ao obter permissões da pasta da turma:", err);
  }
  return null;
}

document.getElementById('btn-save').addEventListener('click', async () => {
  const state = {
    nodes: Array.from(document.querySelectorAll('.board-node')).map(node => getNodeStateData(node)),
    connections: connections.map(conn => ({
      fromId: conn.fromId,
      toId: conn.toId
    }))
  };

  const dataStr = JSON.stringify(state, null, 2);

  // Utiliza a API showSaveFilePicker sugerindo a pasta vinculada à turma ativa
  if ('showSaveFilePicker' in window) {
    try {
      const startInDir = await getActiveTurmaDirectory();
      const options = {
        suggestedName: `exercicio-rca-${new Date().toISOString().slice(0,10)}.json`,
        types: [{
          description: 'Arquivo de Exercício RCA (.json)',
          accept: { 'application/json': ['.json'] }
        }],
        startIn: startInDir || undefined
      };
      
      const fileHandle = await window.showSaveFilePicker(options);
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      return; // Sucesso
    } catch (err) {
      if (err.name === 'AbortError') return; // Usuário cancelou
      console.warn("showSaveFilePicker falhou, usando fallback clássico", err);
    }
  }

  // Fallback clássico para download
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `exercicio-rca-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
});

document.getElementById('btn-load').addEventListener('click', async () => {
  // Utiliza a API showOpenFilePicker sugerindo a pasta vinculada à turma ativa
  if ('showOpenFilePicker' in window) {
    try {
      const startInDir = await getActiveTurmaDirectory();
      const options = {
        types: [{
          description: 'Arquivo de Exercício RCA (.json)',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false,
        startIn: startInDir || undefined
      };
      
      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      const text = await file.text();
      
      const state = JSON.parse(text);
      if (!state.nodes || !state.connections) {
        throw new Error("Formato de lousa inválido.");
      }
      restoreState(state);
      saveState(); // Adiciona o estado carregado ao histórico
      return; // Sucesso
    } catch (err) {
      if (err.name === 'AbortError') return; // Usuário cancelou
      console.warn("showOpenFilePicker falhou, usando fallback clássico", err);
    }
  }

  // Fallback clássico de clique no file input oculto
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const state = JSON.parse(event.target.result);
      if (!state.nodes || !state.connections) {
        throw new Error("Formato de lousa inválido.");
      }
      restoreState(state);
      saveState();
    } catch (err) {
      alert("Erro ao carregar o arquivo: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reseta input
});

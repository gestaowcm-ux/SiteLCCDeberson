/**
 * Ferramenta RCA — Árvore de Causas (Fault Tree Analysis / FTA)
 * Single Page Application dedicada com Reingold-Tilford layout, portas lógicas (OU/E/—)
 * e dimensionamento/arraste de cartões estilo Lousa Dinâmica.
 */

const NODE_W   = 260;   // default card width
const H_GAP    = 60;    // horizontal gap between sibling subtrees
const V_LEVEL  = 230;   // vertical gap between parent top and child top
const BADGE_R  = 16;    // half of gate-badge size (32px)

const state = {
  caseName: 'Case 1: Compressor C-01',
  problemText: 'Superaquecimento e Desarme no Compressor C-01'
};

let treeState = {};
let nodeCounter = 0;
let zoomScale = 1.0;
const MIN_ZOOM = 0.5, MAX_ZOOM = 2.0, ZOOM_STEP = 0.1;
let panModeActive = false;
let isPanning = false;
let panStartX, panStartY, panScrollLeft, panScrollTop;

let nodeDrag = {
  active: false, nodeId: null,
  startMouseX: 0, startMouseY: 0,
  origPositions: {}
};

let nodeResize = {
  active: false, nodeId: null,
  startMouseX: 0, startMouseY: 0,
  origW: 0, origH: 0
};

const presets = {
  compressor: {
    caseName: 'Case 1: Compressor C-01',
    problem: 'Superaquecimento e Desarme no Compressor C-01',
    tree: {
      "root": { id: "root", parentId: null, x: null, y: null, description: "Superaquecimento e Desarme no Compressor C-01", status: "Em análise", gate: "OU" },
      "cause-1": { id: "cause-1", parentId: "root", x: null, y: null, description: "Troca Térmica Ineficiente no Radiador do Compressor", status: "Comprovada", gate: "E", directConnect: false },
      "cause-2": { id: "cause-2", parentId: "root", x: null, y: null, description: "Circuito de Óleo Lubrificante com Temperatura Elevada", status: "Em análise", gate: "OU", directConnect: false },
      "cause-1-1": { id: "cause-1-1", parentId: "cause-1", x: null, y: null, description: "Aletas do Trocador Colmatadas por Poeira/Óleo", status: "Comprovada", gate: "OU", directConnect: false },
      "cause-1-2": { id: "cause-1-2", parentId: "cause-1", x: null, y: null, description: "Filtro de Sucção Rasgado (Passagem de Partículas)", status: "Causa Raiz", gate: "OU", directConnect: false }
    }
  },
  prensa: {
    caseName: 'Case 2: Prensa Hidráulica L-02',
    problem: 'Vazamento Crítico de Fluido Hidráulico na Prensa Principal',
    tree: {
      "root": { id: "root", parentId: null, x: null, y: null, description: "Vazamento Crítico de Fluido Hidráulico na Prensa Principal", status: "Em análise", gate: "OU" },
      "cause-1": { id: "cause-1", parentId: "root", x: null, y: null, description: "Ruptura Prematura do Anel de Vedação O-Ring", status: "Comprovada", gate: "E", directConnect: false },
      "cause-2": { id: "cause-2", parentId: "root", x: null, y: null, description: "Desaperto e Folga em Conexão Flangeada", status: "Em análise", gate: "OU", directConnect: false },
      "cause-1-1": { id: "cause-1-1", parentId: "cause-1", x: null, y: null, description: "Instalação de Anel NBR em Vez de Viton", status: "Causa Raiz", gate: "OU", directConnect: false },
      "cause-1-2": { id: "cause-1-2", parentId: "cause-1", x: null, y: null, description: "Ciclos Térmicos Extremos no Cilindro", status: "Comprovada", gate: "OU", directConnect: false }
    }
  },
  qualidade: {
    caseName: 'Case 3: Linha de Laminação 02',
    problem: 'Desvio de Espessura e Defeito Superficial nas Chapas',
    tree: {
      "root": { id: "root", parentId: null, x: null, y: null, description: "Desvio de Espessura e Defeito Superficial nas Chapas", status: "Em análise", gate: "OU" },
      "cause-1": { id: "cause-1", parentId: "root", x: null, y: null, description: "Oscilação de Pressão no Posicionamento dos Rolos", status: "Comprovada", gate: "E", directConnect: false },
      "cause-2": { id: "cause-2", parentId: "root", x: null, y: null, description: "Desgaste Mecânico Assimétrico nos Cilindros", status: "Em análise", gate: "OU", directConnect: false },
      "cause-1-1": { id: "cause-1-1", parentId: "cause-1", x: null, y: null, description: "Entrada de Ar no Bloco Servoválvula", status: "Comprovada", gate: "OU", directConnect: false },
      "cause-1-2": { id: "cause-1-2", parentId: "cause-1", x: null, y: null, description: "Nível de Óleo Abaixo do Mínimo no Reservatório", status: "Causa Raiz", gate: "OU", directConnect: false }
    }
  },
  bomba: {
    caseName: 'Case 4: Bomba B-102',
    problem: 'Trava Repentina do Eixo por Cavitação na Bomba B-102',
    tree: {
      "root": { id: "root", parentId: null, x: null, y: null, description: "Trava Repentina do Eixo por Cavitação na Bomba B-102", status: "Em análise", gate: "OU" },
      "cause-1": { id: "cause-1", parentId: "root", x: null, y: null, description: "Desbalanceamento Dinâmico por Erosão do Rotor", status: "Comprovada", gate: "E", directConnect: false },
      "cause-2": { id: "cause-2", parentId: "root", x: null, y: null, description: "Carga Axial Destrutiva nos Rolamentos de Apoio", status: "Em análise", gate: "OU", directConnect: false },
      "cause-1-1": { id: "cause-1-1", parentId: "cause-1", x: null, y: null, description: "Cavitação Severa Contínua na Sucção", status: "Comprovada", gate: "OU", directConnect: false },
      "cause-1-2": { id: "cause-1-2", parentId: "cause-1", x: null, y: null, description: "Válvula de Sucção Estrangulada a 30%", status: "Causa Raiz", gate: "OU", directConnect: false }
    }
  }
};

function getChildren(parentId) {
  return Object.values(treeState).filter(n => n.parentId === parentId);
}

function getGateChildren(parentId) {
  return Object.values(treeState).filter(n => n.parentId === parentId && !n.directConnect);
}

function getActiveNodeIds() {
  const active = new Set();
  Object.values(treeState)
    .filter(n => n.status === 'Causa Raiz')
    .forEach(node => {
      let cur = node;
      const visited = new Set();
      while (cur) {
        if (visited.has(cur.id)) break;
        visited.add(cur.id);
        active.add(cur.id);
        cur = cur.parentId ? treeState[cur.parentId] : null;
      }
    });
  return active;
}

function getSubtreeIds(nodeId) {
  const ids = [nodeId];
  let i = 0;
  while (i < ids.length) {
    getChildren(ids[i]).forEach(c => { if (!ids.includes(c.id)) ids.push(c.id); });
    i++;
  }
  return ids;
}

function autoResizeTextarea(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

function getNodeWidth(nodeId) {
  const node = treeState[nodeId];
  return (node && node.w) ? node.w : NODE_W;
}

function getSubtreeWidth(nodeId) {
  const ch = getChildren(nodeId);
  const myW = getNodeWidth(nodeId);
  if (!ch.length) return myW;
  const total = ch.reduce((s, c) => s + getSubtreeWidth(c.id) + H_GAP, -H_GAP);
  return Math.max(myW, total);
}

function layoutNode(nodeId, leftX, topY) {
  const node = treeState[nodeId];
  if (!node) return;
  const myW = getNodeWidth(nodeId);
  node.y = topY;

  const ch = getChildren(nodeId);
  if (!ch.length) {
    node.x = leftX;
    return;
  }

  let currentX = leftX;
  ch.forEach(child => {
    const sw = getSubtreeWidth(child.id);
    layoutNode(child.id, currentX, topY + V_LEVEL);
    currentX += sw + H_GAP;
  });

  const firstChild = ch[0];
  const lastChild  = ch[ch.length - 1];
  const firstCX    = (treeState[firstChild.id].x || 0) + getNodeWidth(firstChild.id) / 2;
  const lastCX     = (treeState[lastChild.id].x || 0) + getNodeWidth(lastChild.id) / 2;
  const parentCX   = (firstCX + lastCX) / 2;

  node.x = Math.round(parentCX - myW / 2);
}

function runAutoLayout() {
  const root = Object.values(treeState).find(n => n.parentId === null);
  if (!root) return;

  Object.values(treeState).forEach(n => { n.x = null; n.y = null; });
  layoutNode(root.id, 0, 48);

  const allNodes = Object.values(treeState);
  if (allNodes.length === 0) return;
  const minX = Math.min(...allNodes.map(n => n.x || 0));

  const targetMinX = 60;
  const shiftAmount = targetMinX - minX;
  allNodes.forEach(n => {
    n.x += shiftAmount;
  });
}

function addChildNode(parentId) {
  if (parentId !== null && !treeState[parentId]) return;
  nodeCounter++;
  const id = `cause-${Date.now()}-${Math.floor(Math.random() * 1e6)}-${nodeCounter}`;
  const existingSiblings = getChildren(parentId);

  treeState[id] = {
    id, parentId, x: null, y: null,
    description: 'Nova causa sob análise',
    status: 'Em análise', gate: 'OU', directConnect: false
  };

  if (existingSiblings.length === 0) {
    treeState[id].directConnect = true;
  } else {
    existingSiblings.forEach(c => { c.directConnect = false; });
    treeState[id].directConnect = false;
  }

  runAutoLayout();
  renderTree();
}

function deleteNode(nodeId) {
  if (nodeId === 'root') return;
  const parentId = treeState[nodeId]?.parentId;

  getSubtreeIds(nodeId).forEach(id => delete treeState[id]);

  if (parentId && treeState[parentId]) {
    const remainingSibs = getChildren(parentId);
    if (remainingSibs.length === 1) {
      remainingSibs[0].directConnect = true;
    }
  }

  runAutoLayout();
  renderTree();
}

function toggleDirectConnect(nodeId) {
  const node = treeState[nodeId];
  if (!node?.parentId) return;
  const siblings = getChildren(node.parentId);
  if (siblings.length <= 1) return;

  if (!node.directConnect) {
    const gateAfter = getGateChildren(node.parentId).length - 1;
    if (gateAfter < 2) {
      const btn = document.querySelector(`#card-${nodeId} .btn-toggle-connect`);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>⚠ Porta precisa de ≥ 2</span>';
        btn.style.color = 'var(--color-danger)';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
      }
      return;
    }
    treeState[nodeId].directConnect = true;
  } else {
    treeState[nodeId].directConnect = false;
  }
  renderTree();
}

function startNodeDrag(e, nodeId) {
  e.stopPropagation();

  const ids = getSubtreeIds(nodeId);
  const orig = {};
  ids.forEach(id => { orig[id] = { x: treeState[id].x || 0, y: treeState[id].y || 0 }; });

  nodeDrag = {
    active: true, nodeId,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origPositions: orig
  };

  const card = document.getElementById(`card-${nodeId}`);
  if (card) card.style.cursor = 'grabbing';
}

function onNodeDragMove(e) {
  if (!nodeDrag.active) return;
  const scale = zoomScale || 1;
  const dx = (e.clientX - nodeDrag.startMouseX) / scale;
  const dy = (e.clientY - nodeDrag.startMouseY) / scale;

  Object.entries(nodeDrag.origPositions).forEach(([id, orig]) => {
    treeState[id].x = Math.round(orig.x + dx);
    treeState[id].y = Math.round(orig.y + dy);
    const el = document.getElementById(`card-${id}`);
    if (el) {
      el.style.left = treeState[id].x + 'px';
      el.style.top  = treeState[id].y + 'px';
    }
  });

  updateGateBadgePositions();
  drawConnections();
}

function stopNodeDrag() {
  if (!nodeDrag.active) return;
  const card = document.getElementById(`card-${nodeDrag.nodeId}`);
  if (card) card.style.cursor = 'grab';
  nodeDrag.active = false;
}

function startNodeResize(e, nodeId) {
  e.stopPropagation();
  e.preventDefault();

  const card = document.getElementById(`card-${nodeId}`);
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const scale = zoomScale || 1;

  nodeResize = {
    active: true, nodeId,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origW: rect.width / scale,
    origH: rect.height / scale
  };
}

function onNodeResizeMove(e) {
  if (!nodeResize.active) return;
  const scale = zoomScale || 1;
  const dx = (e.clientX - nodeResize.startMouseX) / scale;
  const dy = (e.clientY - nodeResize.startMouseY) / scale;

  const newW = Math.max(180, Math.round(nodeResize.origW + dx));
  const newH = Math.max(100, Math.round(nodeResize.origH + dy));

  treeState[nodeResize.nodeId].w = newW;
  treeState[nodeResize.nodeId].h = newH;

  const card = document.getElementById(`card-${nodeResize.nodeId}`);
  if (card) {
    card.style.width = newW + 'px';
    card.style.minHeight = newH + 'px';
  }

  updateGateBadgePositions();
  drawConnections();
}

function stopNodeResize() {
  nodeResize.active = false;
}

function buildNodeCard(nodeId) {
  const node      = treeState[nodeId];
  const active    = getActiveNodeIds();
  const isActive  = active.has(nodeId);
  const isRC      = node.status === 'Causa Raiz';

  const card = document.createElement('div');
  card.className = `node-card${isActive ? ' active-path' : ''}${isRC ? ' root-cause' : ''}`;
  card.id = `card-${nodeId}`;
  
  const w = node.w || NODE_W;
  const h = node.h ? `min-height:${node.h}px;` : '';
  card.style.cssText = `position:absolute;left:${node.x || 0}px;top:${node.y || 0}px;width:${w}px;${h}cursor:grab;`;

  card.addEventListener('mousedown', e => {
    const tagName = e.target.tagName;
    if (['TEXTAREA', 'INPUT', 'SELECT', 'BUTTON'].includes(tagName) || 
        e.target.closest('.card-actions') || 
        e.target.classList.contains('resize-handle')) {
      return;
    }
    startNodeDrag(e, nodeId);
  });

  const header = document.createElement('div');
  header.className = 'card-header';
  const role = document.createElement('span');
  role.className = 'node-role';
  role.textContent = nodeId === 'root' ? 'Top Event (Falha)' : 'Causa';
  header.appendChild(role);
  if (nodeId !== 'root' && node.directConnect) {
    const db = document.createElement('span');
    db.className = 'direct-badge';
    db.textContent = '─ direto';
    header.appendChild(db);
  }
  card.appendChild(header);

  const ta = document.createElement('textarea');
  ta.className = 'node-description';
  ta.value = node.description;
  ta.placeholder = 'Descrição da causa...';
  ta.addEventListener('input', () => { 
    treeState[nodeId].description = ta.value; 
    if (nodeId === 'root') updateProblemText(ta.value);
    autoResizeTextarea(ta); 
    drawConnections(); 
  });
  ta.addEventListener('mousedown', e => e.stopPropagation());
  card.appendChild(ta);

  if (nodeId === 'root') {
    const rootLabel = document.createElement('div');
    rootLabel.className = 'root-status-label';
    rootLabel.textContent = 'Evento Topo';
    card.appendChild(rootLabel);
  } else {
    const sel = document.createElement('select');
    sel.className = 'node-status-select';
    ['Em análise', 'Comprovada', 'Causa Raiz'].forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      if (node.status === s) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => { treeState[nodeId].status = sel.value; renderTree(); });
    sel.addEventListener('mousedown', e => e.stopPropagation());
    card.appendChild(sel);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add-child';
  btnAdd.innerHTML = '<span>+ Causa</span>';
  btnAdd.addEventListener('click', e => { e.stopPropagation(); addChildNode(nodeId); });
  btnAdd.addEventListener('mousedown', e => e.stopPropagation());
  actions.appendChild(btnAdd);

  if (nodeId !== 'root') {
    const sibs = getChildren(node.parentId);
    if (sibs.length > 1) {
      const btnTog = document.createElement('button');
      btnTog.className = `btn-toggle-connect${node.directConnect ? ' is-direct' : ''}`;
      btnTog.title = node.directConnect ? 'Conectar via porta lógica' : 'Conectar diretamente';
      btnTog.textContent = node.directConnect ? 'Porta' : '- Direto';
      btnTog.addEventListener('click', e => { e.stopPropagation(); toggleDirectConnect(nodeId); });
      btnTog.addEventListener('mousedown', e => e.stopPropagation());
      actions.appendChild(btnTog);
    }
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-delete-node';
    btnDel.innerHTML = '<span>Excluir</span>';
    btnDel.addEventListener('click', e => { e.stopPropagation(); deleteNode(nodeId); });
    btnDel.addEventListener('mousedown', e => e.stopPropagation());
    actions.appendChild(btnDel);
  }
  card.appendChild(actions);

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  resizeHandle.title = 'Arrastar para redimensionar caixa';
  resizeHandle.addEventListener('mousedown', e => startNodeResize(e, nodeId));
  card.appendChild(resizeHandle);

  return card;
}

function renderTree() {
  const container = document.getElementById('tree-nodes');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(treeState).forEach(nodeId => {
    const card = buildNodeCard(nodeId);
    container.appendChild(card);
  });

  container.querySelectorAll('textarea').forEach(autoResizeTextarea);
  renderGateBadges();
  drawConnections();
}

function renderGateBadges() {
  const container = document.getElementById('tree-nodes');
  if (!container) return;
  container.querySelectorAll('.gate-badge').forEach(el => el.remove());

  Object.values(treeState).forEach(node => {
    const gch = getGateChildren(node.id);
    if (gch.length < 2) return;

    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;

    const pBottom = parentCard.offsetTop + parentCard.offsetHeight;
    const avgChildY = gch.reduce((s, c) => {
      const cc = document.getElementById(`card-${c.id}`);
      return s + (cc ? cc.offsetTop : (c.y || 0));
    }, 0) / gch.length;
    const gateY = Math.round((pBottom + avgChildY) / 2) - BADGE_R;

    const avgChildCX = gch.reduce((s, c) => {
      const cc = document.getElementById(`card-${c.id}`);
      return s + (cc ? cc.offsetLeft + cc.offsetWidth / 2 : (c.x || 0) + (c.w || NODE_W) / 2);
    }, 0) / gch.length;
    const gateX = Math.round(avgChildCX) - BADGE_R;

    const badge = document.createElement('div');
    let gateClass = 'gate-badge';
    if (node.gate === 'E') gateClass += ' gate-and';
    else if (node.gate === '—') gateClass += ' gate-none';
    badge.className = gateClass;
    badge.id = `gate-${node.id}`;
    badge.textContent = node.gate;
    badge.title = 'Clique para alternar: OU ↔ E ↔ —';
    badge.style.cssText = `position:absolute;left:${gateX}px;top:${gateY}px;z-index:10;`;
    badge.addEventListener('click', e => {
      e.stopPropagation();
      let nextGate = 'OU';
      if (node.gate === 'OU') nextGate = 'E';
      else if (node.gate === 'E') nextGate = '—';
      else nextGate = 'OU';
      treeState[node.id].gate = nextGate;
      renderTree();
    });
    badge.addEventListener('mousedown', e => e.stopPropagation());
    container.appendChild(badge);
  });
}

function updateGateBadgePositions() {
  Object.values(treeState).forEach(node => {
    const badge = document.getElementById(`gate-${node.id}`);
    if (!badge) return;
    const gch = getGateChildren(node.id);
    if (gch.length < 2) return;
    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;

    const pBottom = parentCard.offsetTop + parentCard.offsetHeight;
    const avgChildY = gch.reduce((s, c) => {
      const cc = document.getElementById(`card-${c.id}`);
      return s + (cc ? cc.offsetTop : (c.y || 0));
    }, 0) / gch.length;
    const gateY = Math.round((pBottom + avgChildY) / 2) - BADGE_R;

    const avgChildCX = gch.reduce((s, c) => {
      const cc = document.getElementById(`card-${c.id}`);
      return s + (cc ? cc.offsetLeft + cc.offsetWidth / 2 : (c.x || 0) + (c.w || NODE_W) / 2);
    }, 0) / gch.length;
    const gateX = Math.round(avgChildCX) - BADGE_R;

    badge.style.left = gateX + 'px';
    badge.style.top  = gateY + 'px';
  });
}

function drawConnections() {
  const treeSvg     = document.getElementById('tree-svg');
  const treeNodes   = document.getElementById('tree-nodes');
  const scaler      = document.getElementById('tree-nodes-scaler');
  const wsContainer = document.getElementById('workspace-container');
  const wsSpacer    = document.getElementById('workspace-spacer');
  if (!treeSvg || !treeNodes || !scaler || !wsContainer || !wsSpacer) return;

  treeSvg.innerHTML = '';

  const scale      = zoomScale || 1;
  const containerW = wsContainer.clientWidth || 0;

  const allCards = Array.from(treeNodes.querySelectorAll('.node-card'));
  let maxX = 800;
  let maxY = 600;

  allCards.forEach(c => {
    const right = c.offsetLeft + c.offsetWidth + 140;
    const bottom = c.offsetTop + c.offsetHeight + 180;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  });

  treeNodes.style.width  = maxX + 'px';
  treeNodes.style.height = maxY + 'px';

  const scaledW = maxX * scale;
  const scaledH = maxY * scale;
  scaler.style.left = scaledW < containerW ? ((containerW - scaledW) / 2) + 'px' : '0px';
  wsSpacer.style.width  = Math.max(containerW, scaledW) + 'px';
  wsSpacer.style.height = scaledH + 'px';

  treeSvg.setAttribute('width',  maxX);
  treeSvg.setAttribute('height', maxY);

  const activeIds = getActiveNodeIds();

  Object.values(treeState).forEach(node => {
    const children = getChildren(node.id);
    if (!children.length) return;

    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;

    const px = parentCard.offsetLeft + parentCard.offsetWidth / 2;
    const py = parentCard.offsetTop + parentCard.offsetHeight;

    const gateChildren   = children.filter(c => !c.directConnect);
    const directChildren = children.filter(c =>  c.directConnect);
    const gateBadge      = document.getElementById(`gate-${node.id}`);
    const hasGate        = gateChildren.length >= 2 && gateBadge;

    if (hasGate) {
      if (node.gate === '—') {
        gateChildren.forEach(child => {
          const cc = document.getElementById(`card-${child.id}`);
          if (!cc) return;
          const cx = cc.offsetLeft + cc.offsetWidth / 2;
          const cy = cc.offsetTop;
          const isA  = activeIds.has(child.id);
          const color = isA ? 'var(--color-danger)' : 'var(--color-mute)';
          const sw = isA ? '3' : '2';
          const my = py + (cy - py) / 2;
          svgPath(treeSvg, `M ${px} ${py} L ${px} ${my} L ${cx} ${my} L ${cx} ${cy}`, color, sw);
        });
      } else {
        const gtx = gateBadge.offsetLeft + BADGE_R;
        const gty = gateBadge.offsetTop;
        const gby = gateBadge.offsetTop + (BADGE_R * 2);

        const anyActive = gateChildren.some(c => activeIds.has(c.id)) || activeIds.has(node.id);
        const pgColor = anyActive ? 'var(--color-danger)' : 'var(--color-mute)';
        const pgWidth = anyActive ? '3' : '2';
        drawOrtho(treeSvg, px, py, gtx, gty, pgColor, pgWidth);

        gateChildren.forEach(child => {
          const cc = document.getElementById(`card-${child.id}`);
          if (!cc) return;
          const cx = cc.offsetLeft + cc.offsetWidth / 2;
          const cy = cc.offsetTop;
          const isA  = activeIds.has(child.id);
          drawOrtho(treeSvg, gtx, gby, cx, cy, isA ? 'var(--color-danger)' : 'var(--color-mute)', isA ? '3' : '2');
        });
      }
    }

    directChildren.forEach(child => {
      const cc = document.getElementById(`card-${child.id}`);
      if (!cc) return;
      const cx = cc.offsetLeft + cc.offsetWidth / 2;
      const cy = cc.offsetTop;
      const isA  = activeIds.has(child.id);
      const color = isA ? 'var(--color-danger)' : '#94a3b8';
      drawOrthoDashed(treeSvg, px, py, cx, cy, color, isA ? '2.5' : '1.8', '8,5');
    });
  });
}

function drawOrtho(svg, x1, y1, x2, y2, color, sw) {
  if (Math.abs(x1 - x2) < 2) {
    svgLine(svg, x1, y1, x2, y2, color, sw);
  } else {
    const my = y1 + (y2 - y1) / 2;
    svgPath(svg, `M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`, color, sw);
  }
}

function drawOrthoDashed(svg, x1, y1, x2, y2, color, sw, dash) {
  if (Math.abs(x1 - x2) < 2) {
    svgLineDashed(svg, x1, y1, x2, y2, color, sw, dash);
  } else {
    const my = y1 + (y2 - y1) / 2;
    svgPathDashed(svg, `M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`, color, sw, dash);
  }
}

function svgLine(svg, x1, y1, x2, y2, color, sw) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', color); el.setAttribute('stroke-width', sw);
  svg.appendChild(el);
}

function svgLineDashed(svg, x1, y1, x2, y2, color, sw, dash) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', color); el.setAttribute('stroke-width', sw);
  el.setAttribute('stroke-dasharray', dash);
  svg.appendChild(el);
}

function svgPath(svg, d, color, sw) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d); el.setAttribute('stroke', color);
  el.setAttribute('stroke-width', sw); el.setAttribute('fill', 'none');
  svg.appendChild(el);
}

function svgPathDashed(svg, d, color, sw, dash) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d); el.setAttribute('stroke', color);
  el.setAttribute('stroke-width', sw); el.setAttribute('fill', 'none');
  el.setAttribute('stroke-dasharray', dash);
  svg.appendChild(el);
}

function updateZoom(newZoom) {
  zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  const resetBtn = document.getElementById('zoom-reset-btn');
  if (resetBtn) resetBtn.textContent = Math.round(zoomScale * 100) + '%';
  const scaler = document.getElementById('tree-nodes-scaler');
  if (scaler) scaler.style.transform = `scale(${zoomScale})`;
  drawConnections();
}

document.addEventListener('DOMContentLoaded', () => {
  loadPreset('compressor');

  document.getElementById('reset-tree-btn')?.addEventListener('click', () => {
    runAutoLayout();
    renderTree();
  });
  document.getElementById('zoom-in-btn')?.addEventListener('click', () => updateZoom(zoomScale + ZOOM_STEP));
  document.getElementById('zoom-out-btn')?.addEventListener('click', () => updateZoom(zoomScale - ZOOM_STEP));
  document.getElementById('zoom-reset-btn')?.addEventListener('click', () => updateZoom(1.0));

  const ws = document.getElementById('workspace-container');
  if (ws) {
    ws.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      updateZoom(zoomScale * (e.deltaY < 0 ? 1.1 : 0.9));
    }, { passive: false });

    ws.addEventListener('scroll', () => {
      drawConnections();
    });

    const panBtn = document.getElementById('pan-toggle-btn');
    if (panBtn) {
      panBtn.addEventListener('click', () => {
        panModeActive = !panModeActive;
        panBtn.classList.toggle('active', panModeActive);
        ws.style.cursor = panModeActive ? 'grab' : '';
        if (!panModeActive) { isPanning = false; stopNodeDrag(); stopNodeResize(); }
      });
    }

    ws.addEventListener('mousedown', e => {
      const hasClosest = typeof e.target.closest === 'function';
      if (hasClosest) {
        if (e.target.closest('.node-card') || e.target.closest('.gate-badge')) return;
      } else {
        let curr = e.target;
        let shouldReturn = false;
        while (curr) {
          if (curr.classList && (curr.classList.contains('node-card') || curr.classList.contains('gate-badge'))) {
            shouldReturn = true;
            break;
          }
          curr = curr.parentNode;
        }
        if (shouldReturn) return;
      }
      e.preventDefault();
      isPanning = true;
      ws.style.cursor = 'grabbing';
      panStartX    = e.pageX - (ws.offsetLeft || 0);
      panStartY    = e.pageY - (ws.offsetTop  || 0);
      panScrollLeft = ws.scrollLeft || 0;
      panScrollTop  = ws.scrollTop || 0;
    });

    window.addEventListener('mousemove', e => {
      if (nodeResize.active) {
        e.preventDefault();
        onNodeResizeMove(e);
        return;
      }
      if (nodeDrag.active) {
        e.preventDefault();
        onNodeDragMove(e);
        return;
      }
      if (!isPanning) return;
      e.preventDefault();
      const x = e.pageX - (ws.offsetLeft || 0);
      const y = e.pageY - (ws.offsetTop  || 0);
      ws.scrollLeft = panScrollLeft - (x - panStartX);
      ws.scrollTop  = panScrollTop  - (y - panStartY);
    });

    const stopAll = () => {
      if (nodeResize.active) stopNodeResize();
      if (nodeDrag.active) stopNodeDrag();
      if (isPanning) {
        isPanning = false;
        ws.style.cursor = panModeActive ? 'grab' : '';
      }
    };
    window.addEventListener('mouseup', stopAll);
    ws.addEventListener('mouseleave', stopAll);

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(drawConnections);
      const treeNodes = document.getElementById('tree-nodes');
      if (treeNodes) ro.observe(treeNodes);
      ro.observe(ws);
    }
    window.addEventListener('resize', drawConnections);
  }
});

function updateCaseName(val) {
  state.caseName = val;
  const inputEl = document.getElementById('case-name-input');
  if (inputEl && inputEl.value !== val) inputEl.value = val;
}

function updateProblemText(val) {
  state.problemText = val;
  const inputEl = document.getElementById('problem-input');
  if (inputEl && inputEl.value !== val) inputEl.value = val;
  if (treeState && treeState['root']) {
    treeState['root'].description = val;
    renderTree();
  }
}

function loadPreset(key) {
  if (!presets[key]) return;
  const data = presets[key];

  state.caseName = data.caseName || 'Novo Case RCA';
  state.problemText = data.problem || 'Descrição do problema';
  if (data.tree) {
    treeState = JSON.parse(JSON.stringify(data.tree));
    runAutoLayout();
  }

  renderTree();
  showToast('Caso prático carregado!');
}

function clearBoard() {
  if (confirm('Tem certeza que deseja reiniciar a Árvore de Causas (FTA)?')) {
    state.caseName = 'Novo Case de Análise';
    state.problemText = 'Problema de Investigação RCA';

    treeState = {
      "root": { id: "root", parentId: null, x: null, y: null, description: state.problemText, status: "Em análise", gate: "OU" }
    };
    runAutoLayout();

    renderTree();
    showToast('Árvore reiniciada!');
  }
}

async function exportJSON() {
  const defaultFilename = (state.caseName || 'Arvore_de_Causas_FTA').replace(/[^a-z0-9_-]/gi, '_') + '.json';
  const payload = {
    ...state,
    treeState: treeState
  };
  const jsonContent = JSON.stringify(payload, null, 2);

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [{
          description: 'Arquivo JSON da Árvore de Causas (FTA)',
          accept: { 'application/json': ['.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      showToast('Arquivo JSON salvo!');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const userChosenName = prompt('Escolha o nome do arquivo JSON:', defaultFilename);
  if (!userChosenName) return;

  const finalName = userChosenName.endsWith('.json') ? userChosenName : `${userChosenName}.json`;
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = finalName;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Arquivo JSON salvo!');
}

function triggerImportJSON() {
  const fileInput = document.getElementById('json-file-input');
  if (fileInput) fileInput.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.treeState) {
        state.caseName = data.caseName || 'Case Importado';
        state.problemText = data.problemText || 'Descrição do Problema';
        treeState = data.treeState;
        runAutoLayout();

        renderTree();
        showToast('Árvore de Causas importada!');
      } else {
        alert('Arquivo JSON inválido para a Árvore de Causas (FTA).');
      }
    } catch (err) {
      alert('Erro ao processar o arquivo JSON.');
    }
  };
  reader.readAsText(file);
}

function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (toast) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

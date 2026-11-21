// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const NODE_W   = 210;   // card width
const H_GAP    = 56;    // horizontal gap between sibling subtrees
const V_LEVEL  = 250;   // vertical gap between parent top and child top
const BADGE_R  = 16;    // half of gate-badge size (32px)

// ─────────────────────────────────────────────────────────────────────────────
// STATE
//  root node:  { id, parentId:null, x, y, description, status, gate }
//  child node: { id, parentId, x, y, description, status, gate, directConnect }
//
//  directConnect=false → child connects via parent's shared gate badge
//  directConnect=true  → child connects directly (no gate)
//
//  RULE: gate badge requires ≥ 2 non-direct children to appear.
//        Sole child is always directConnect=true.
// ─────────────────────────────────────────────────────────────────────────────
let treeState = {};
let nodeCounter  = 0;

// Zoom
let zoomScale = 1.0;
const MIN_ZOOM = 0.5, MAX_ZOOM = 2.0, ZOOM_STEP = 0.1;

// Viewport pan
let panModeActive = false;
let isPanning     = false;
let panStartX, panStartY, panScrollLeft, panScrollTop;

// Node drag (moves node + whole subtree)
let nodeDrag = {
  active: false, nodeId: null,
  startMouseX: 0, startMouseY: 0,
  origPositions: {}   // { id: { x, y } }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT TREE
// ─────────────────────────────────────────────────────────────────────────────
const defaultState = {
  "root": {
    id: "root", parentId: null, x: null, y: null,
    description: "Parada Inesperada da Turbina de Gás G-101",
    status: "Em análise", gate: "OU"
  },
  "cause-1": {
    id: "cause-1", parentId: "root", x: null, y: null,
    description: "Disparo por Baixa Pressão de Óleo Lubrificante",
    status: "Comprovada", gate: "E", directConnect: false
  },
  "cause-2": {
    id: "cause-2", parentId: "root", x: null, y: null,
    description: "Sobretemperatura nos Mancais de Apoio",
    status: "Em análise", gate: "OU", directConnect: false
  },
  "cause-1-1": {
    id: "cause-1-1", parentId: "cause-1", x: null, y: null,
    description: "Vazamento no Flange da Bomba de Óleo Principal",
    status: "Causa Raiz", gate: "OU", directConnect: false
  },
  "cause-1-2": {
    id: "cause-1-2", parentId: "cause-1", x: null, y: null,
    description: "Colmatação (Entupimento) Severa dos Filtros Duplex",
    status: "Em análise", gate: "OU", directConnect: false  // both children via gate → gate badge appears
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT  (hierarchical auto-layout)
// ─────────────────────────────────────────────────────────────────────────────
function getSubtreeWidth(nodeId) {
  const ch = getChildren(nodeId);
  if (!ch.length) return NODE_W;
  const total = ch.reduce((s, c) => s + getSubtreeWidth(c.id) + H_GAP, -H_GAP);
  return Math.max(NODE_W, total);
}

function layoutNode(nodeId, centerX, topY) {
  const node = treeState[nodeId];
  if (!node) return;
  node.x = Math.round(centerX - NODE_W / 2);
  node.y = topY;
  const ch = getChildren(nodeId);
  if (!ch.length) return;
  const totalW = ch.reduce((s, c) => s + getSubtreeWidth(c.id) + H_GAP, -H_GAP);
  let cx = centerX - totalW / 2;
  ch.forEach(child => {
    const sw = getSubtreeWidth(child.id);
    layoutNode(child.id, cx + sw / 2, topY + V_LEVEL);
    cx += sw + H_GAP;
  });
}

function runAutoLayout() {
  const root = Object.values(treeState).find(n => n.parentId === null);
  if (!root) return;
  Object.values(treeState).forEach(n => { n.x = null; n.y = null; });
  const rootSW = getSubtreeWidth(root.id);
  layoutNode(root.id, Math.max(rootSW / 2, 400), 48);
}

// Position a newly added node initially below its parent
function positionNewNode(nodeId, parentId) {
  const parent = treeState[parentId];
  if (!parent || parent.x === null) return;
  const sibs = getChildren(parentId).filter(s => s.id !== nodeId && s.x !== null);
  const rightmostX = sibs.length
    ? Math.max(...sibs.map(s => s.x)) + NODE_W + H_GAP
    : parent.x;
  treeState[nodeId].x = rightmostX;
  treeState[nodeId].y = parent.y + V_LEVEL;
}

// ─────────────────────────────────────────────────────────────────────────────
// TREE MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────
function resetTree() {
  treeState = JSON.parse(JSON.stringify(defaultState));
  zoomScale = 1.0;
  const scaler = document.getElementById('tree-nodes-scaler');
  if (scaler) scaler.style.transform = 'scale(1)';
  const resetBtn = document.getElementById('zoom-reset-btn');
  if (resetBtn) resetBtn.textContent = '100%';
  runAutoLayout();
  renderTree();
}

function addChildNode(parentId) {
  if (parentId !== null && !treeState[parentId]) return;
  nodeCounter++;
  const id = `cause-${Date.now()}-${Math.floor(Math.random() * 1e6)}-${nodeCounter}`;
  const siblings = getChildren(parentId);

  treeState[id] = {
    id, parentId, x: null, y: null,
    description: 'Nova causa sob análise',
    status: 'Em análise', gate: 'OU', directConnect: false
  };

  if (siblings.length === 0) {
    // Sole child: must be direct
    treeState[id].directConnect = true;
  } else if (siblings.length === 1) {
    // Second child: offer gate for both
    treeState[siblings[0].id].directConnect = false;
    treeState[id].directConnect = false;
  }

  positionNewNode(id, parentId);
  renderTree();
}

function deleteNode(nodeId) {
  if (nodeId === 'root') return;
  getSubtreeIds(nodeId).forEach(id => delete treeState[id]);
  // Enforce sole-child rule
  Object.values(treeState).forEach(n => {
    if (!n.parentId) return;
    if (getChildren(n.parentId).length === 1) treeState[n.id].directConnect = true;
  });
  renderTree();
}

function toggleDirectConnect(nodeId) {
  const node = treeState[nodeId];
  if (!node?.parentId) return;
  const siblings = getChildren(node.parentId);
  if (siblings.length <= 1) return;

  if (!node.directConnect) {
    // Going direct: BLOCK if the gate would lose its minimum of 2 users
    const gateAfter = getGateChildren(node.parentId).length - 1;
    if (gateAfter < 2) {
      // Show a brief flash message on the button instead of cascading
      const btn = document.querySelector(`#card-${nodeId} .btn-toggle-connect`);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>⚠ Porta precisa de ≥ 2</span>';
        btn.style.color = 'var(--color-danger)';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
      }
      return; // block the action
    }
    treeState[nodeId].directConnect = true;
  } else {
    // Going via gate: always allowed
    treeState[nodeId].directConnect = false;
  }
  renderTree();
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE DRAG  (moves dragged node + its whole subtree)
// ─────────────────────────────────────────────────────────────────────────────
function startNodeDrag(e, nodeId) {
  if (!panModeActive) return;
  e.stopPropagation();
  e.preventDefault();

  const ids = getSubtreeIds(nodeId);
  const orig = {};
  ids.forEach(id => { orig[id] = { x: treeState[id].x || 0, y: treeState[id].y || 0 }; });

  nodeDrag = {
    active: true, nodeId,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origPositions: orig
  };

  // Show grab cursor on dragged card
  const card = document.getElementById(`card-${nodeId}`);
  if (card) card.style.cursor = 'grabbing';
}

function onNodeDragMove(e) {
  if (!nodeDrag.active) return;
  const scale = zoomScale || 1;
  const dx = (e.clientX - nodeDrag.startMouseX) / scale;
  const dy = (e.clientY - nodeDrag.startMouseY) / scale;

  Object.entries(nodeDrag.origPositions).forEach(([id, orig]) => {
    treeState[id].x = orig.x + dx;
    treeState[id].y = orig.y + dy;
    const el = document.getElementById(`card-${id}`);
    if (el) { el.style.left = treeState[id].x + 'px'; el.style.top = treeState[id].y + 'px'; }
  });

  // Update gate badge positions and redraw SVG during drag
  updateGateBadgePositions();
  drawConnections();
}

function stopNodeDrag() {
  if (!nodeDrag.active) return;
  const card = document.getElementById(`card-${nodeDrag.nodeId}`);
  if (card) card.style.cursor = 'grab';
  nodeDrag.active = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────────────────
function buildNodeCard(nodeId) {
  const node      = treeState[nodeId];
  const active    = getActiveNodeIds();
  const isActive  = active.has(nodeId);
  const isRC      = node.status === 'Causa Raiz';

  const card = document.createElement('div');
  card.className = `node-card${isActive ? ' active-path' : ''}${isRC ? ' root-cause' : ''}`;
  card.id = `card-${nodeId}`;
  card.style.cssText = `position:absolute;left:${node.x || 0}px;top:${node.y || 0}px;width:${NODE_W}px;box-sizing:border-box;`;
  if (panModeActive) card.style.cursor = 'grab';

  // Drag listener (only fires in pan mode, checked inside handler)
  card.addEventListener('mousedown', e => {
    if (panModeActive && !nodeDrag.active) startNodeDrag(e, nodeId);
  });

  // ── Header ────────────────────────────────────────────────────────────────
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

  // ── Textarea ──────────────────────────────────────────────────────────────
  const ta = document.createElement('textarea');
  ta.className = 'node-description';
  ta.value = node.description;
  ta.placeholder = 'Descrição da causa...';
  ta.addEventListener('input', () => { treeState[nodeId].description = ta.value; autoResizeTextarea(ta); drawConnections(); });
  ta.addEventListener('mousedown', e => e.stopPropagation());
  card.appendChild(ta);

  // ── Status: fixed label for root, dropdown for cause nodes ───────────────
  if (nodeId === 'root') {
    // Root (Top Event) never needs a status classification
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

  // ── Actions ───────────────────────────────────────────────────────────────
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
      btnTog.title = node.directConnect ? 'Conectar via porta logica' : 'Conectar diretamente';
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

  return card;
}

function buildDOMBranch(nodeId) {
  const node = treeState[nodeId];
  if (!node) return null;

  const branch = document.createElement('div');
  branch.className = 'tree-branch';
  branch.setAttribute('data-node-id', nodeId);
  branch.style.position = 'static';

  const card = buildNodeCard(nodeId);
  branch.appendChild(card);

  const children = getChildren(nodeId);
  if (children.length > 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'children-wrapper';
    wrapper.style.position = 'static';
    children.forEach(child => {
      const childBranch = buildDOMBranch(child.id);
      if (childBranch) {
        wrapper.appendChild(childBranch);
      }
    });
    branch.appendChild(wrapper);
  }
  return branch;
}

function renderTree() {
  const container = document.getElementById('tree-nodes');
  if (!container) return;
  container.querySelectorAll('.node-card, .gate-badge, .tree-branch, .children-wrapper').forEach(el => el.remove());

  const rootNode = Object.values(treeState).find(n => n.parentId === null);
  if (rootNode) {
    const rootBranch = buildDOMBranch(rootNode.id);
    if (rootBranch) {
      container.appendChild(rootBranch);
    }
  }

  container.querySelectorAll('textarea').forEach(autoResizeTextarea);

  // Apply pan-mode cursor to all cards
  if (panModeActive) {
    container.querySelectorAll('.node-card').forEach(c => { c.style.cursor = 'grab'; });
  }

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

    // Y: halfway between parent bottom and average gate-child top
    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;
    const pBottom = (node.y || 0) + parentCard.offsetHeight;
    const avgChildY = gch.reduce((s, c) => s + (c.y || 0), 0) / gch.length;
    const gateY = Math.round((pBottom + avgChildY) / 2) - BADGE_R;

    // X: center of gate children
    const avgChildCX = gch.reduce((s, c) => s + (c.x || 0) + NODE_W / 2, 0) / gch.length;
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
    const parentBranch = container.querySelector(`[data-node-id="${node.id}"]`);
    if (parentBranch) {
      const wrapper = parentBranch.querySelector('.children-wrapper');
      if (wrapper) {
        parentBranch.insertBefore(badge, wrapper);
      } else {
        parentBranch.appendChild(badge);
      }
    } else {
      container.appendChild(badge);
    }
  });
}

// Update gate badge positions during drag (no full re-render)
function updateGateBadgePositions() {
  Object.values(treeState).forEach(node => {
    const badge = document.getElementById(`gate-${node.id}`);
    if (!badge) return;
    const gch = getGateChildren(node.id);
    if (gch.length < 2) return;
    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;
    const pBottom = (node.y || 0) + parentCard.offsetHeight;
    const avgChildY = gch.reduce((s, c) => s + (c.y || 0), 0) / gch.length;
    const gateY = Math.round((pBottom + avgChildY) / 2) - BADGE_R;
    const avgChildCX = gch.reduce((s, c) => s + (c.x || 0) + NODE_W / 2, 0) / gch.length;
    const gateX = Math.round(avgChildCX) - BADGE_R;
    badge.style.left = gateX + 'px';
    badge.style.top  = gateY + 'px';
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG CONNECTIONS
// ─────────────────────────────────────────────────────────────────────────────
function drawConnections() {
  const treeSvg    = document.getElementById('tree-svg');
  const treeNodes  = document.getElementById('tree-nodes');
  const scaler     = document.getElementById('tree-nodes-scaler');
  const wsContainer = document.getElementById('workspace-container');
  const wsSpacer   = document.getElementById('workspace-spacer');
  if (!treeSvg || !treeNodes || !scaler || !wsContainer || !wsSpacer) return;

  treeSvg.innerHTML = '';

  const scale      = zoomScale || 1;
  const containerW = wsContainer.clientWidth || 0;

  // Compute canvas size from node positions
  const allNodes = Object.values(treeState);
  const maxX = allNodes.length ? Math.max(...allNodes.map(n => (n.x || 0) + NODE_W + 80)) : 800;
  const maxY = allNodes.length ? Math.max(...allNodes.map(n => (n.y || 0) + 300))         : 600;
  treeNodes.style.width  = maxX + 'px';
  treeNodes.style.height = maxY + 'px';

  const scaledW = maxX * scale;
  const scaledH = maxY * scale;
  scaler.style.left = scaledW < containerW ? ((containerW - scaledW) / 2) + 'px' : '0px';
  wsSpacer.style.width  = Math.max(containerW, scaledW) + 'px';
  wsSpacer.style.height = scaledH + 'px';

  treeSvg.setAttribute('width',  maxX);
  treeSvg.setAttribute('height', maxY);

  const baseRect  = treeNodes.getBoundingClientRect();
  const activeIds = getActiveNodeIds();

  Object.values(treeState).forEach(node => {
    const children = getChildren(node.id);
    if (!children.length) return;

    const parentCard = document.getElementById(`card-${node.id}`);
    if (!parentCard) return;
    const pRect = parentCard.getBoundingClientRect();
    const px = (pRect.left - baseRect.left) / scale + (pRect.width  / scale) / 2;
    const py = (pRect.top  - baseRect.top)  / scale + (pRect.height / scale);

    const gateChildren   = children.filter(c => !c.directConnect);
    const directChildren = children.filter(c =>  c.directConnect);
    const gateBadge      = document.getElementById(`gate-${node.id}`);
    const hasGate        = gateChildren.length >= 2 && gateBadge;

    // ── Via-gate connections ─────────────────────────────────────────────────
    if (hasGate) {
      if (node.gate === '—') {
        gateChildren.forEach(child => {
          const cc = document.getElementById(`card-${child.id}`);
          if (!cc) return;
          const cr = cc.getBoundingClientRect();
          const cx = (cr.left - baseRect.left) / scale + (cr.width  / scale) / 2;
          const cy = (cr.top  - baseRect.top)  / scale;
          const isA  = activeIds.has(child.id);
          const color = isA ? 'var(--color-danger)' : 'var(--color-mute)';
          const sw = isA ? '3' : '2';
          const my = py + (cy - py) / 2;
          svgPath(treeSvg, `M ${px} ${py} L ${px} ${my} L ${cx} ${my} L ${cx} ${cy}`, color, sw);
        });
      } else {
        const gRect = gateBadge.getBoundingClientRect();
        const gtx = (gRect.left - baseRect.left) / scale + (gRect.width  / scale) / 2;
        const gty = (gRect.top  - baseRect.top)  / scale;
        const gby = gty + (gRect.height / scale);

        const anyActive = gateChildren.some(c => activeIds.has(c.id)) || activeIds.has(node.id);
        const pgColor = anyActive ? 'var(--color-danger)' : 'var(--color-mute)';
        const pgWidth = anyActive ? '3' : '2';
        drawOrtho(treeSvg, px, py, gtx, gty, pgColor, pgWidth);

        gateChildren.forEach(child => {
          const cc = document.getElementById(`card-${child.id}`);
          if (!cc) return;
          const cr = cc.getBoundingClientRect();
          const cx = (cr.left - baseRect.left) / scale + (cr.width  / scale) / 2;
          const cy = (cr.top  - baseRect.top)  / scale;
          const isA  = activeIds.has(child.id);
          drawOrtho(treeSvg, gtx, gby, cx, cy, isA ? 'var(--color-danger)' : 'var(--color-mute)', isA ? '3' : '2');
        });
      }
    }

    // ── Direct connections (dashed, always from parent center-bottom)
    directChildren.forEach(child => {
      const cc = document.getElementById(`card-${child.id}`);
      if (!cc) return;
      const cr = cc.getBoundingClientRect();
      const cx = (cr.left - baseRect.left) / scale + (cr.width  / scale) / 2;
      const cy = (cr.top  - baseRect.top)  / scale;
      const isA  = activeIds.has(child.id);
      const color = isA ? 'var(--color-danger)' : '#94a3b8';
      // Always from parent center-bottom → child center-top (same anchor as gate lines)
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

// Dashed variant for direct (no-gate) connections
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

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM
// ─────────────────────────────────────────────────────────────────────────────
function updateZoom(newZoom) {
  zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  const resetBtn = document.getElementById('zoom-reset-btn');
  if (resetBtn) resetBtn.textContent = Math.round(zoomScale * 100) + '%';
  const scaler = document.getElementById('tree-nodes-scaler');
  if (scaler) scaler.style.transform = `scale(${zoomScale})`;
  drawConnections();
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  resetTree();

  document.getElementById('reset-tree-btn')?.addEventListener('click', resetTree);
  document.getElementById('zoom-in-btn')?.addEventListener('click', () => updateZoom(zoomScale + ZOOM_STEP));
  document.getElementById('zoom-out-btn')?.addEventListener('click', () => updateZoom(zoomScale - ZOOM_STEP));
  document.getElementById('zoom-reset-btn')?.addEventListener('click', () => updateZoom(1.0));

  const ws = document.getElementById('workspace-container');
  if (!ws) return;

  // Ctrl+Wheel zoom
  ws.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    updateZoom(zoomScale * (e.deltaY < 0 ? 1.1 : 0.9));
  }, { passive: false });

  // Pan toggle button
  const panBtn = document.getElementById('pan-toggle-btn');
  if (panBtn) {
    panBtn.addEventListener('click', () => {
      panModeActive = !panModeActive;
      panBtn.classList.toggle('active', panModeActive);

      // Update cursor on all cards
      document.querySelectorAll('.node-card').forEach(c => {
        c.style.cursor = panModeActive ? 'grab' : '';
      });
      ws.style.cursor = panModeActive ? 'grab' : '';
      if (!panModeActive) { isPanning = false; stopNodeDrag(); }
    });
  }

  // ── Mouse events on workspace ───────────────────────────────────────────
  ws.addEventListener('mousedown', e => {
    if (!panModeActive) return;
    // If clicking a node card or gate badge: node drag is handled by the card's own listener
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
    // Otherwise: pan the viewport
    e.preventDefault();
    isPanning = true;
    ws.style.cursor = 'grabbing';
    panStartX    = e.pageX - (ws.offsetLeft || 0);
    panStartY    = e.pageY - (ws.offsetTop  || 0);
    panScrollLeft = ws.scrollLeft || 0;
    panScrollTop  = ws.scrollTop || 0;
  });

  window.addEventListener('mousemove', e => {
    if (nodeDrag.active) {
      e.preventDefault();
      onNodeDragMove(e);
      return;
    }
    if (!isPanning || !panModeActive) return;
    e.preventDefault();
    const x = e.pageX - (ws.offsetLeft || 0);
    const y = e.pageY - (ws.offsetTop  || 0);
    ws.scrollLeft = panScrollLeft - (x - panStartX);
    ws.scrollTop  = panScrollTop  - (y - panStartY);
  });

  const stopAll = () => {
    if (nodeDrag.active) stopNodeDrag();
    if (isPanning) {
      isPanning = false;
      ws.style.cursor = panModeActive ? 'grab' : '';
    }
  };
  window.addEventListener('mouseup', stopAll);
  ws.addEventListener('mouseleave', stopAll);

  // Resize observer
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(drawConnections);
    const treeNodes = document.getElementById('tree-nodes');
    if (treeNodes) ro.observe(treeNodes);
    ro.observe(ws);
  }
  window.addEventListener('resize', drawConnections);
});

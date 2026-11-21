/**
 * Ferramentas RCA — Análise de Causa Raiz Interativa (Ishikawa 6M, 5 Porquês & Árvore de Causas FTA)
 * Desenvolvido para uso ao vivo em sala de aula e projeção 16:9.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FTA CONSTANTS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const NODE_W   = 260;   // default card width
const H_GAP    = 60;    // horizontal gap between sibling subtrees
const V_LEVEL  = 230;   // vertical gap between parent top and child top
const BADGE_R  = 16;    // half of gate-badge size (32px)

// Global Application State
const state = {
  activeMode: 'ishikawa',
  caseName: 'Case 1: Compressor C-01',
  problemText: 'Superaquecimento e Desarme no Compressor C-01',
  fishHeadText: 'Superaquecimento Compressor',
  causes: {
    metodo: [],
    maquina: [],
    material: [],
    maodeobra: [],
    medida: [],
    meioambiente: []
  },
  whys: [
    { level: 1, question: 'Por que o compressor C-01 desarmou repentinamente?', cause: 'O óleo lubrificante atingiu 115°C durante operação contínua.', evidence: 'Registro de temperatura no supervisório SCADA às 14:15h' },
    { level: 2, question: 'Por que o óleo lubrificante atingiu 115°C?', cause: 'O trocador de calor de placas não conseguiu resfriar o circuito de óleo.', evidence: 'Diferencial de temperatura IN/OUT menor que 3°C' },
    { level: 3, question: 'Por que a troca térmica do radiador ficou ineficiente?', cause: 'As aletas do trocador estavam colmatadas por poeira industrial e película de óleo.', evidence: 'Inspeção visual direta no radiador posterior' },
    { level: 4, question: 'Por que o radiador acumulou sujeira pesada sem ser limpo?', cause: 'A limpeza e inspeção do radiador não constavam no plano quinzenal.', evidence: 'Checklist de rotina da equipe de manutenção' },
    { level: 5, question: 'Por que o plano de manutenção estava incompleto?', cause: 'Falha no comissionamento: o manual do fabricante (OEM) não foi revisado pela Engenharia para cadastro no CMMS.', evidence: 'Relatório de entrega técnica do ativo em 2021' }
  ]
};

// FTA Tree State
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

// Preset Scenarios
const presets = {
  compressor: {
    caseName: 'Case 1: Compressor C-01',
    problem: 'Superaquecimento e Desarme no Compressor C-01',
    fishHead: 'Superaquecimento Compressor',
    causes: {
      metodo: [
        { id: 'm1', text: 'Ausência de rotina quinzenal de drenagem e inspeção de radiadores', subcauses: ['POP de manutenção desatualizado'] }
      ],
      maquina: [
        { id: 'mq1', text: 'Trocador de calor colmatado por poeira acumulada', subcauses: ['Filtro de sucção com rasgo lateral'] },
        { id: 'mq2', text: 'Válvula termostática com travamento parcial', subcauses: [] }
      ],
      material: [
        { id: 'mt1', text: 'Óleo sintético com viscosidade alterada por contaminação', subcauses: ['Lote recebido sem laudo de laboratório'] }
      ],
      maodeobra: [
        { id: 'mo1', text: 'Técnico de inspeção recente sem treinamento específico no modelo', subcauses: ['Matriz de treinamento pendente'] }
      ],
      medida: [
        { id: 'md1', text: 'Sensor de temperatura do cabeçote com desvio de +8°C', subcauses: ['Calibração anual vencida há 3 meses'] }
      ],
      meioambiente: [
        { id: 'ma1', text: 'Temperatura ambiente na sala de compressores acima de 40°C', subcauses: ['Exaustor de ar da sala inoperante'] }
      ]
    },
    whys: [
      { level: 1, question: 'Por que o compressor C-01 desarmou por sobretemperatura?', cause: 'A temperatura do circuito de óleo atingiu 115°C durante a operação.', evidence: 'Alarme no painel CLP e supervisório às 14:15h' },
      { level: 2, question: 'Por que a temperatura do óleo subiu além do limite de segurança?', cause: 'O trocador de calor a ar não conseguiu efetuar a troca térmica necessária.', evidence: 'Diferencial de temperatura no radiador abaixo de 3°C' },
      { level: 3, question: 'Por que a troca térmica do radiador foi ineficiente?', cause: 'As aletas metálicas estavam colmatadas por poeira abrasiva e película de óleo.', evidence: 'Inspeção visual direta no radiador' },
      { level: 4, question: 'Por que o radiador acumulou impregnação sem limpeza prévia?', cause: 'A inspeção periódica de radiadores não constava na ordem preventiva quinzenal.', evidence: 'Checklist do plano no sistema de manutenção' },
      { level: 5, question: 'Por que o procedimento preventivo omitiu essa tarefa essencial?', cause: 'Falha na etapa de comissionamento: recomendações do OEM não foram cadastradas no CMMS.', evidence: 'Manual do OEM vs. Plano cadastrado' }
    ],
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
    fishHead: 'Vazamento Óleo Prensa',
    causes: {
      metodo: [{ id: 'm1', text: 'Aperto de conexões flangeadas sem uso de torquímetro aferido', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Vibração excessiva na tubulação de alta pressão', subcauses: ['Abraçadeira de fixação quebrada'] }],
      material: [{ id: 'mt1', text: 'Vedação O-ring de nitrílica em local de alta temperatura', subcauses: ['Especificação exigia Viton'] }],
      maodeobra: [{ id: 'mo1', text: 'Montagem executada sob pressão de tempo na parada', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Manômetro com ponteiro travado no valor nominal', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Poeira metálica em suspensão danificando vedações', subcauses: [] }]
    },
    whys: [
      { level: 1, question: 'Por que houve vazamento de óleo hidráulico na prensa?', cause: 'O anel de vedação O-ring do cilindro principal rompeu durante o ciclo.', evidence: 'Óleo acumulado na bacia de contenção' },
      { level: 2, question: 'Por que o anel de vedação rompeu prematuramente?', cause: 'O elastômero sofreu degradação térmica severa e endurecimento.', evidence: 'Anel ressecado e trincado' },
      { level: 3, question: 'Por que a vedação sofreu degradação por temperatura?', cause: 'Foi instalado um anel de Nitrila (NBR) em vez do anel de Fluorcarbono (Viton).', evidence: 'Código do item aplicado no almoxarifado' },
      { level: 4, question: 'Por que foi utilizado o componente com material incorreto?', cause: 'O código de almoxarifado do O-ring Viton estava vinculado ao item de Nitrila.', evidence: 'Cadastro duplicado no sistema ERP' },
      { level: 5, question: 'Por que o cadastro no ERP continha ambiguidade de especificação?', cause: 'Falta de governança na criação de cadastros de sobressalentes críticos.', evidence: 'Auditoria de cadastro de materiais' }
    ],
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
    fishHead: 'Desvio Espessura Chapas',
    causes: {
      metodo: [{ id: 'm1', text: 'Velocidade de laminação ajustada manualmente sem receita padrão', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Desgaste assimétrico nos cilindros laminadores', subcauses: [] }],
      material: [{ id: 'mt1', text: 'Bobina de matéria-prima com variação de dureza Rockwell', subcauses: [] }],
      maodeobra: [{ id: 'mo1', text: 'Operador não realizou medição de controle no início do turno', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Micrômetro digital descalibrado', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Variação térmica brusca no galpão durante a noite', subcauses: [] }]
    },
    whys: [
      { level: 1, question: 'Por que a espessura da chapa ficou fora da tolerância?', cause: 'A folga entre os rolos laminadores variou durante a produção.', evidence: 'Relatório do sensor de espessura a laser' },
      { level: 2, question: 'Por que a folga entre rolos laminadores variou?', cause: 'O sistema hidráulico de posicionamento dos rolos oscilou em pressão.', evidence: 'Gráfico de pressão hidráulica de posicionamento' },
      { level: 3, question: 'Por que a pressão de posicionamento oscilou?', cause: 'Havia presença de bolhas de ar no bloco servovalvula.', evidence: 'Presença de espuma no reservatório' },
      { level: 4, question: 'Por que entrou ar no sistema hidráulico de controle?', cause: 'O nível de óleo no tanque caiu abaixo do mínimo, aspirando ar na sucção.', evidence: 'Visor de nível do reservatório hidráulico' },
      { level: 5, question: 'Por que o nível baixo do reservatório não foi identificado a tempo?', cause: 'O alarme sonoro de nível mínimo do tanque estava desativado.', evidence: 'Jumper elétrico encontrado no painel' }
    ],
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
    fishHead: 'Trava Eixo Bomba B-102',
    causes: {
      metodo: [{ id: 'm1', text: 'Partida da bomba com válvula de sucção parcialmente estrangulada', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Rotor da bomba com erosão severa nas pás', subcauses: [] }],
      material: [{ id: 'mt1', text: 'Fluido com viscosidade e temperatura fora do ponto de projeto', subcauses: [] }],
      maodeobra: [{ id: 'mo1', text: 'Manobra de alinhamento executada por equipe sem supervisão', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Manovacuômetro de sucção quebrado', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Pressão de sucção NPSH disponível menor que NPSH requerido', subcauses: [] }]
    },
    whys: [
      { level: 1, question: 'Por que o eixo da bomba B-102 travou durante operação?', cause: 'Os rolamentos de apoio sofreram colapso por carga axial excessiva.', evidence: 'Esferas do rolamento deformadas e azuladas' },
      { level: 2, question: 'Por que ocorreu carga axial destrutiva sobre o rolamento?', cause: 'O rotor da bomba entrou em desbalanceamento dinâmico severo por erosão.', evidence: 'Vibração triaxial acima de 12 mm/s RMS' },
      { level: 3, question: 'Por que o rotor sofreu erosão intensa e localizada?', cause: 'A bomba operou continuamente em regime de cavitação severa.', evidence: 'Ruído característico de "brita" e micro-cavidades no rotor' },
      { level: 4, question: 'Por que ocorreu cavitação contínua na sucção da bomba?', cause: 'A válvula borboleta de sucção ficou parcialmente fechada a 30%.', evidence: 'Indicador de posição mecânico da válvula' },
      { level: 5, question: 'Por que a válvula de sucção permaneceu parcialmente fechada?', cause: 'Falta de travamento físico LOTO e sinalização visual na tubulação.', evidence: 'Válvula sem lacre ou cadeado de bloqueio' }
    ],
    tree: {
      "root": { id: "root", parentId: null, x: null, y: null, description: "Trava Repentina do Eixo por Cavitação na Bomba B-102", status: "Em análise", gate: "OU" },
      "cause-1": { id: "cause-1", parentId: "root", x: null, y: null, description: "Desbalanceamento Dinâmico por Erosão do Rotor", status: "Comprovada", gate: "E", directConnect: false },
      "cause-2": { id: "cause-2", parentId: "root", x: null, y: null, description: "Carga Axial Destrutiva nos Rolamentos de Apoio", status: "Em análise", gate: "OU", directConnect: false },
      "cause-1-1": { id: "cause-1-1", parentId: "cause-1", x: null, y: null, description: "Cavitação Severa Contínua na Sucção", status: "Comprovada", gate: "OU", directConnect: false },
      "cause-1-2": { id: "cause-1-2", parentId: "cause-1", x: null, y: null, description: "Válvula de Sucção Estrangulada a 30%", status: "Causa Raiz", gate: "OU", directConnect: false }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ISHIKAWA (FISHBONE 6M) RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function renderIshikawa() {
  updateCaseName(state.caseName);
  updateProblemText(state.problemText);
  updateFishHeadText(state.fishHeadText);

  const categories = ['metodo', 'maquina', 'material', 'maodeobra', 'medida', 'meioambiente'];

  categories.forEach(cat => {
    const listEl  = document.getElementById(`list-${cat}`);
    const countEl = document.getElementById(`count-${cat}`);
    if (!listEl) return;

    listEl.innerHTML = '';
    const causeItems = state.causes[cat] || [];
    if (countEl) countEl.textContent = causeItems.length;

    causeItems.forEach((causeObj, idx) => {
      const li = document.createElement('li');
      li.className = 'cause-card';

      let subHtml = '';
      if (causeObj.subcauses && causeObj.subcauses.length > 0) {
        subHtml = `<ul class="sub-causes-list">
          ${causeObj.subcauses.map((sub, sIdx) => `
            <li class="sub-cause-item">
              <span>${escapeHTML(sub)}</span>
              <button class="btn-icon-sub" title="Excluir sub-causa" onclick="removeSubCause('${cat}', ${idx}, ${sIdx})">&times;</button>
            </li>
          `).join('')}
        </ul>`;
      }

      li.innerHTML = `
        <div class="cause-main-row">
          <span class="cause-text">${escapeHTML(causeObj.text)}</span>
          <div class="cause-actions">
            <button class="btn-icon-sub" title="Adicionar Sub-causa" onclick="openAddSubCausePrompt('${cat}', ${idx})">↳ +Sub</button>
            <button class="btn-icon-sub" title="Excluir Causa" onclick="removeCause('${cat}', ${idx})">&times;</button>
          </div>
        </div>
        ${subHtml}
      `;

      listEl.appendChild(li);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 WHYS CHAIN RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function renderWhys() {
  updateCaseName(state.caseName);
  updateProblemText(state.problemText);
  updateFishHeadText(state.fishHeadText);

  const container = document.getElementById('whys-chain-list');
  if (!container) return;

  container.innerHTML = '';

  state.whys.forEach((item, idx) => {
    const isRoot = (idx === state.whys.length - 1);
    const card = document.createElement('div');
    card.className = `why-step-card${isRoot ? ' root-cause' : ''}`;

    card.innerHTML = `
      <div class="why-number-badge">${item.level}°</div>
      <div class="why-content-group">
        <div class="why-question-label">${escapeHTML(item.question)}</div>
        <input type="text" class="why-input-field" value="${escapeHTML(item.cause)}" placeholder="Descreva a causa encontrada neste nível..." onchange="updateWhyCause(${idx}, this.value)">
        <input type="text" class="why-evidence-field" value="${escapeHTML(item.evidence)}" placeholder="🔎 Evidência / Fato comprovado (ex: relatório, foto, medição)..." onchange="updateWhyEvidence(${idx}, this.value)">
      </div>
    `;

    container.appendChild(card);

    if (idx < state.whys.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'why-step-arrow';
      arrow.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
      container.appendChild(arrow);
    }
  });
}

function updateWhyCause(idx, val) {
  if (state.whys[idx]) {
    state.whys[idx].cause = val;
  }
}

function updateWhyEvidence(idx, val) {
  if (state.whys[idx]) {
    state.whys[idx].evidence = val;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FTA HELPERS & LAYOUT ENGINE
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

// Bottom-Up Centered Reingold-Tilford Layout Algorithm
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

  // 1. Lay out children subtrees sequentially starting at leftX
  let currentX = leftX;
  ch.forEach(child => {
    const sw = getSubtreeWidth(child.id);
    layoutNode(child.id, currentX, topY + V_LEVEL);
    currentX += sw + H_GAP;
  });

  // 2. Center parent node 100% perfectly above its first and last child's center
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

  // 1. First pass layout starting at X = 0
  Object.values(treeState).forEach(n => { n.x = null; n.y = null; });
  layoutNode(root.id, 0, 48);

  // 2. Measure leftmost X coordinate across all levels & branches
  const allNodes = Object.values(treeState);
  if (allNodes.length === 0) return;
  const minX = Math.min(...allNodes.map(n => n.x || 0));

  // 3. Shift entire tree rightwards so leftmost node starts at safe margin (x >= 60px)
  const targetMinX = 60;
  const shiftAmount = targetMinX - minX;
  allNodes.forEach(n => {
    n.x += shiftAmount;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FTA MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────
function addChildNode(parentId) {
  if (parentId !== null && !treeState[parentId]) return;
  nodeCounter++;
  const id = `cause-${Date.now()}-${Math.floor(Math.random() * 1e6)}-${nodeCounter}`;

  // Get current siblings before adding new node
  const existingSiblings = getChildren(parentId);

  treeState[id] = {
    id, parentId, x: null, y: null,
    description: 'Nova causa sob análise',
    status: 'Em análise', gate: 'OU', directConnect: false
  };

  if (existingSiblings.length === 0) {
    // Sole child connects directly
    treeState[id].directConnect = true;
  } else {
    // Multiple children (2+): all siblings connect via gate badge
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

// ─────────────────────────────────────────────────────────────────────────────
// CARD DRAGGING & RESIZING (DIMENSIONAMENTO) - LOUSA DINÂMICA STYLE
// ─────────────────────────────────────────────────────────────────────────────
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

// Card Resizing (Dimensionamento) Handler
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

// ─────────────────────────────────────────────────────────────────────────────
// FTA RENDERING
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// SVG CONNECTIONS — PURE OFFSET LOCAL COORDINATES (SCROLL & ZOOM IMMUNE)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION CORE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
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

// Update Case Name
function updateCaseName(val) {
  state.caseName = val;
  const inputEl = document.getElementById('case-name-input');
  if (inputEl && inputEl.value !== val) {
    inputEl.value = val;
  }
}

// Update Problem Text
function updateProblemText(val) {
  state.problemText = val;
  const inputEl = document.getElementById('problem-input');
  if (inputEl && inputEl.value !== val) {
    inputEl.value = val;
  }
  if (treeState && treeState['root']) {
    treeState['root'].description = val;
    if (state.activeMode === 'fta') renderTree();
  }
}

// Update Fish Head Text
function updateFishHeadText(val) {
  state.fishHeadText = val;
  const bannerInput = document.getElementById('fish-head-banner-input');
  const inlineInput = document.getElementById('fish-head-text-inline');

  if (bannerInput && bannerInput.value !== val) bannerInput.value = val;
  if (inlineInput && inlineInput.value !== val) inlineInput.value = val;
}

// Switch Active View Mode
function switchMode(mode) {
  state.activeMode = mode;
  document.getElementById('tab-ishikawa').classList.toggle('active', mode === 'ishikawa');
  document.getElementById('tab-whys').classList.toggle('active', mode === 'whys');
  document.getElementById('tab-fta').classList.toggle('active', mode === 'fta');

  document.getElementById('stage-ishikawa').classList.toggle('active', mode === 'ishikawa');
  document.getElementById('stage-whys').classList.toggle('active', mode === 'whys');
  document.getElementById('stage-fta').classList.toggle('active', mode === 'fta');
  
  if (mode === 'whys') {
    renderWhys();
  } else if (mode === 'fta') {
    renderTree();
  } else {
    renderIshikawa();
  }
}

// Load Preset Scenario
function loadPreset(key) {
  if (!presets[key]) return;
  const data = presets[key];

  state.caseName = data.caseName || 'Novo Case RCA';
  state.problemText = data.problem || 'Descrição do problema';
  state.fishHeadText = data.fishHead || 'Causa Raiz / Efeito';

  state.causes = JSON.parse(JSON.stringify(data.causes));
  state.whys = JSON.parse(JSON.stringify(data.whys));
  if (data.tree) {
    treeState = JSON.parse(JSON.stringify(data.tree));
    runAutoLayout();
  }

  renderIshikawa();
  if (state.activeMode === 'whys') renderWhys();
  if (state.activeMode === 'fta') renderTree();

  showToast('Caso prático carregado!');
}

// Modal Controls for Adding Cause (Ishikawa)
function openAddCauseModal(category = 'metodo') {
  document.getElementById('modal-cause-category').value = category;
  document.getElementById('modal-cause-text').value = '';
  document.getElementById('modal-subcause-text').value = '';
  document.getElementById('modal-cause').classList.add('active');
}

function closeCauseModal() {
  document.getElementById('modal-cause').classList.remove('active');
}

function saveCauseFromModal() {
  const cat = document.getElementById('modal-cause-category').value;
  const text = document.getElementById('modal-cause-text').value.trim();
  const subtext = document.getElementById('modal-subcause-text').value.trim();

  if (!text) {
    alert('Por favor, informe a descrição da causa.');
    return;
  }

  const newCause = {
    id: 'c_' + Date.now(),
    text: text,
    subcauses: subtext ? [subtext] : []
  };

  if (!state.causes[cat]) {
    state.causes[cat] = [];
  }

  state.causes[cat].push(newCause);
  closeCauseModal();
  renderIshikawa();
  showToast('Causa adicionada ao diagrama!');
}

function openAddSubCausePrompt(cat, causeIdx) {
  const subText = prompt('Digite a sub-causa / detalhe adicional:');
  if (subText && subText.trim()) {
    if (!state.causes[cat][causeIdx].subcauses) {
      state.causes[cat][causeIdx].subcauses = [];
    }
    state.causes[cat][causeIdx].subcauses.push(subText.trim());
    renderIshikawa();
    showToast('Sub-causa vinculada!');
  }
}

function removeCause(cat, causeIdx) {
  state.causes[cat].splice(causeIdx, 1);
  renderIshikawa();
}

function removeSubCause(cat, causeIdx, subIdx) {
  state.causes[cat][causeIdx].subcauses.splice(subIdx, 1);
  renderIshikawa();
}

// Clear Board State
function clearBoard() {
  if (confirm('Tem certeza que deseja limpar todo o quadro da análise atual?')) {
    state.caseName = 'Novo Case de Análise';
    state.problemText = 'Problema de Investigação RCA';
    state.fishHeadText = 'Efeito Principal';
    
    Object.keys(state.causes).forEach(cat => {
      state.causes[cat] = [];
    });

    state.whys = [
      { level: 1, question: 'Por que o evento ocorreu?', cause: '', evidence: '' },
      { level: 2, question: 'Por que...', cause: '', evidence: '' },
      { level: 3, question: 'Por que...', cause: '', evidence: '' },
      { level: 4, question: 'Por que...', cause: '', evidence: '' },
      { level: 5, question: 'Por que...', cause: '', evidence: '' }
    ];

    treeState = {
      "root": { id: "root", parentId: null, x: null, y: null, description: state.problemText, status: "Em análise", gate: "OU" }
    };
    runAutoLayout();

    document.getElementById('preset-select').selectedIndex = 0;
    renderIshikawa();
    if (state.activeMode === 'whys') renderWhys();
    if (state.activeMode === 'fta') renderTree();
    showToast('Quadro reiniciado com sucesso!');
  }
}

// Export JSON
async function exportJSON() {
  const defaultFilename = (state.caseName || 'Analise_RCA').replace(/[^a-z0-9_-]/gi, '_') + '.json';
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
          description: 'Arquivo JSON de Análise RCA',
          accept: { 'application/json': ['.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      showToast('Arquivo JSON salvo na pasta escolhida!');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('showSaveFilePicker fallback:', err);
    }
  }

  const userChosenName = prompt('Escolha o nome do arquivo JSON para salvar:', defaultFilename);
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
  showToast('Arquivo JSON preparado para download!');
}

// Import JSON
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
      if (data.causes || data.whys || data.treeState) {
        state.caseName = data.caseName || 'Case Importado';
        state.problemText = data.problemText || 'Descrição do Problema';
        state.fishHeadText = data.fishHeadText || 'Cabeça do Peixe';
        if (data.causes) state.causes = data.causes;
        if (data.whys) state.whys = data.whys;
        if (data.treeState) {
          treeState = data.treeState;
          runAutoLayout();
        }

        renderIshikawa();
        if (state.activeMode === 'whys') renderWhys();
        if (state.activeMode === 'fta') renderTree();
        showToast('Análise JSON carregada com sucesso!');
      } else {
        alert('Formato de arquivo JSON inválido.');
      }
    } catch (err) {
      console.error('Erro ao ler JSON:', err);
      alert('Erro ao processar o arquivo JSON.');
    }
  };
  reader.readAsText(file);
}

// Show Toast Feedback
function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (toast) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

// Helper: Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

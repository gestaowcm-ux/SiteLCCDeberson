// Grafo.js - Interactive Obsidian-style Concept Graph using Vis.js + 2D Constellation Background
let network = null;
let selectedSwitcherIndex = 0;
let filteredSwitcherNodes = [];

let isUserInteracting = false;
let rotationSpeed = 0.0006; // Velocidade lenta e elegante de rotação angular por frame (em radianos)

// --- 2D Constellation Background State ---
let isConstellationEnabled = true;
let constellationCount = 90;
let constellationCanvas = null;
let constellationCtx = null;
let constellationParticles = [];
let mousePos = { x: -9999, y: -9999 };
let constellationAnimId = null;

// Color theme system matching design.md
const categoriesColors = {
  'Geral': {
    color: { background: '#ffffff', border: '#f59e0b', highlight: { background: '#ffffff', border: '#f59e0b' } },
    font: { color: '#ffffff' }
  },
  'Etapa': {
    color: { background: '#ffffff', border: '#38bdf8', highlight: { background: '#ffffff', border: '#38bdf8' } },
    font: { color: '#ffffff' }
  },
  'Análise': {
    color: { background: '#ffffff', border: '#f87171', highlight: { background: '#ffffff', border: '#f87171' } },
    font: { color: '#ffffff' }
  },
  'Técnica': {
    color: { background: '#ffffff', border: '#34d399', highlight: { background: '#ffffff', border: '#34d399' } },
    font: { color: '#ffffff' }
  },
  'Causa': {
    color: { background: '#ffffff', border: '#fbbf24', highlight: { background: '#ffffff', border: '#fbbf24' } },
    font: { color: '#ffffff' }
  },
  'Solução': {
    color: { background: '#ffffff', border: '#818cf8', highlight: { background: '#ffffff', border: '#818cf8' } },
    font: { color: '#ffffff' }
  }
};

const nodesArray = [
  { id: 1, label: 'LCC (Life Cycle Costing)', category: 'Geral', title: 'LCC — Custeio do Ciclo de Vida' },
  { id: 2, label: 'CAPEX (Aquisição e Instalação)', category: 'Etapa', title: 'CAPEX — Investimento Inicial' },
  { id: 3, label: 'OPEX (Operação e Manutenção)', category: 'Etapa', title: 'OPEX — Operação e Manutenção' },
  { id: 4, label: 'Custo de Indisponibilidade (Downtime)', category: 'Causa', title: 'Custo de Indisponibilidade (Downtime)' },
  { id: 5, label: 'Confiabilidade e RAM', category: 'Análise', title: 'Confiabilidade, MTBF, MTTR e RAM' },
  { id: 6, label: 'VPL e Taxa de Desconto', category: 'Técnica', title: 'VPL, CAUE e Taxa de Desconto' },
  { id: 7, label: 'Vida Econômica Ótima', category: 'Solução', title: 'Vida Econômica Ótima do Ativo' },
  { id: 8, label: 'Análise de Substituição de Ativos', category: 'Solução', title: 'Substituição: Defensor vs. Desafiante' },
  { id: 9, label: 'Descomissionamento e Descarte', category: 'Etapa', title: 'Descomissionamento e Valor Residual' },
  { id: 10, label: 'ISO 55000', category: 'Geral', title: 'ABNT NBR ISO 55000 — Gestão de Ativos' },
  { id: 11, label: 'ISO 15663', category: 'Técnica', title: 'ISO 15663 — Norma Internacional de LCC' }
];

const edgesArray = [
  { from: 1, to: 2, label: 'aquisição' },
  { from: 1, to: 3, label: 'operação' },
  { from: 1, to: 4, label: 'penalidade' },
  { from: 1, to: 9, label: 'fim de vida' },
  { from: 5, to: 4, label: 'modela' },
  { from: 5, to: 3, label: 'impacta' },
  { from: 1, to: 6, label: 'desconto' },
  { from: 6, to: 7, label: 'CAUE mín.' },
  { from: 7, to: 8, label: 'decisão' },
  { from: 10, to: 1, label: 'diretriz' },
  { from: 11, to: 1, label: 'metodologia' }
];

// Rich definitions content with nested Obsidian Wikilinks
const conceptDetails = {
  1: {
    title: 'LCC (Life Cycle Costing)',
    tag: 'Geral',
    description: `O **Custeio do Ciclo de Vida (LCC - Life Cycle Costing)** é a metodologia de engenharia econômica e gestão de ativos dedicada a quantificar todos os custos incorridos por um ativo físico desde sua concepção e aquisição até sua operação, manutenção e descarte final.

Alinhado à [[ISO 55000]] e à [[ISO 15663]], o LCC equilibra:
1. [[CAPEX (Aquisição e Instalação)]]
2. [[OPEX (Operação e Manutenção)]]
3. [[Custo de Indisponibilidade (Downtime)]] modelado via [[Confiabilidade e RAM]]
4. [[Descomissionamento e Descarte]]

Todos os fluxos futuros são trazidos a valor presente por meio do [[VPL e Taxa de Desconto]] para fundamentar decisões de seleção e [[Vida Econômica Ótima]].`
  },
  2: {
    title: 'CAPEX (Aquisição e Instalação)',
    tag: 'Etapa',
    description: `O **CAPEX (Capital Expenditure)** compreende todos os investimentos iniciais necessários para colocar o ativo em condição operacional.

Inclui:
- Pesquisa, engenharia conceitual e projeto detalhado.
- Preço de compra do equipamento principal e sobressalentes iniciais.
- Transporte, obras civis, montagem eletromecânica e comissionamento.
- Treinamento inicial da operação e manutenção.

Na visão de [[LCC (Life Cycle Costing)]], o CAPEX frequentemente representa apenas a "ponta do iceberg" (10% a 30% do custo total), influenciando diretamente o futuro [[OPEX (Operação e Manutenção)]].`
  },
  3: {
    title: 'OPEX (Operação e Manutenção)',
    tag: 'Etapa',
    description: `O **OPEX (Operational Expenditure)** abrange todos os dispêndios recorrentes necessários para operar e manter o ativo ao longo de sua vida útil.

Principais componentes:
- Consumo energético (eletricidade, combustível, vapor) e insumos.
- Mão de obra operacional e de manutenção.
- Manutenção preventiva, preditiva e corretiva (peças, serviços, lubrificantes).
- Grandes paradas e *overhauls*.

O OPEX cresce com o envelhecimento físico do ativo, sendo decisivo no cálculo da [[Vida Econômica Ótima]].`
  },
  4: {
    title: 'Custo de Indisponibilidade (Downtime)',
    tag: 'Causa',
    description: `O **Custo de Indisponibilidade (Penalidade por Falha / Downtime)** mensura as perdas financeiras decorrentes de paradas não programadas ou perda de performance operacional.

Envolve:
- Lucro cessante / perda de margem de contribuição por produção perdida.
- Multas contratuais, retrabalho, refugo e perdas de qualidade.
- Riscos de segurança, meio ambiente e imagem.

Sua estimativa depende diretamente da modelagem de [[Confiabilidade e RAM]] (MTBF e MTTR) integrada ao [[LCC (Life Cycle Costing)]].`
  },
  5: {
    title: 'Confiabilidade e RAM',
    tag: 'Análise',
    description: `A **Engenharia de Confiabilidade e Análise RAM (Reliability, Availability, Maintainability)** conecta o comportamento probabilístico de falhas ao impacto econômico do ativo.

Indicadores-chave:
- **MTBF / Taxa de Falhas (Weibull)**: Frequência esperada de eventos corretivos.
- **MTTR**: Tempo médio para reparo e retorno à operação.
- **Disponibilidade Inerente e Operacional**: Fração do tempo em que o ativo gera valor.

Projetos com maior confiabilidade intrínseca podem exigir maior [[CAPEX (Aquisição e Instalação)]], mas reduzem drasticamente o [[Custo de Indisponibilidade (Downtime)]] e o [[OPEX (Operação e Manutenção)]].`
  },
  6: {
    title: 'VPL e Taxa de Desconto',
    tag: 'Técnica',
    description: `O **Valor Presente Líquido (VPL / NPV)** e a **Taxa de Desconto (TMA / WACC)** permitem comparar desembolsos que ocorrem em diferentes momentos do horizonte de vida do ativo.

Conceitos essenciais:
- Valor do dinheiro no tempo e custo de oportunidade do capital.
- Taxa real vs. taxa nominal (efeito da inflação).
- **Custo Anual Uniforme Equivalente (CAUE / EAC)**: Fundamental para comparar ativos com vidas úteis diferentes e determinar a [[Vida Econômica Ótima]].`
  },
  7: {
    title: 'Vida Econômica Ótima',
    tag: 'Solução',
    description: `A **Vida Econômica Ótima (Economic Life)** é o ponto no tempo em que o Custo Anual Uniforme Equivalente (CAUE) de possuir, operar e manter um ativo atinge seu valor mínimo.

Ela resulta do equilíbrio entre duas forças opostas:
- Diluição do [[CAPEX (Aquisição e Instalação)]] ao longo dos anos (curva decrescente).
- Aumento progressivo do [[OPEX (Operação e Manutenção)]] e do [[Custo de Indisponibilidade (Downtime)]] pelo desgaste (curva crescente).

Ultrapassar a vida econômica significa operar na zona antieconômica, orientando a [[Análise de Substituição de Ativos]].`
  },
  8: {
    title: 'Análise de Substituição de Ativos',
    tag: 'Solução',
    description: `A **Análise de Substituição (Defensor vs. Desafiante)** avalia tecnicamente quando reformar (*retrofit/overhaul*) ou substituir um ativo em operação (**Defensor**) por uma nova alternativa tecnológica (**Desafiante**).

Compara o custo marginal de manter o ativo atual por mais um período contra o CAUE mínimo do novo equipamento na [[Vida Econômica Ótima]], usando [[VPL e Taxa de Desconto]].`
  },
  9: {
    title: 'Descomissionamento e Descarte',
    tag: 'Etapa',
    description: `O **Descomissionamento, Desmobilização e Descarte** corresponde à fase final do ciclo de vida do ativo.

Pode gerar:
- **Valor Residual Positivo**: Revenda do equipamento usado ou sucata metálica.
- **Custo de Saída (Passivo)**: Desmontagem, descontaminação ambiental, logística reversa e restauração do site (crítico em óleo & gás, mineração e químico, conforme [[ISO 15663]]).`
  },
  10: {
    title: 'ISO 55000',
    tag: 'Geral',
    description: `A série **ABNT NBR ISO 55000 (Gestão de Ativos)** estabelece os princípios para extrair valor máximo dos ativos ao longo de todo o seu ciclo de vida, equilibrando **Custo, Risco e Desempenho**.

O [[LCC (Life Cycle Costing)]] é a principal ferramenta quantitativa para materializar esse equilíbrio na tomada de decisão executiva.`
  },
  11: {
    title: 'ISO 15663',
    tag: 'Técnica',
    description: `A norma **ISO 15663 (Life Cycle Costing)** fornece a estrutura metodológica internacional para aplicação sistemática do [[LCC (Life Cycle Costing)]] em ativos industriais e de energia.

Define escopo, estrutura de decomposição de custos (CBS - Cost Breakdown Structure), tratamento de incertezas e análise de sensibilidade sobre [[CAPEX (Aquisição e Instalação)]], [[OPEX (Operação e Manutenção)]] e [[Custo de Indisponibilidade (Downtime)]].`
  }
};

// --- Configurações de Estado do Grafo ---
let graphMode = 'global'; // 'global' | 'local'
let useColors = true;     // true = colorido por categoria, false = monocromático
let labelVisibilityMode = 'always'; // 'always' | 'hover' (Obsidian padrão)
let globalNodeSize = 10;
let globalEdgeWidth = 1.5;
let targetRotationMultiplier = 1.0;
let localMatchingNodeIds = [];

// Backups estáticos originais para sincronismo Obsidian
const defaultNodesArray = JSON.parse(JSON.stringify(nodesArray));
const defaultEdgesArray = JSON.parse(JSON.stringify(edgesArray));
const defaultConceptDetails = JSON.parse(JSON.stringify(conceptDetails));
let isObsidianSyncActive = localStorage.getItem('LCC_OBSIDIAN_SYNC_ACTIVE') === 'true';

// Normaliza categorias de Markdown de acordo com o design.md
function matchCategory(catName) {
  if (!catName) return 'Geral';
  const clean = catName.trim().toLowerCase();
  if (clean === 'geral') return 'Geral';
  if (clean === 'etapa') return 'Etapa';
  if (clean === 'análise' || clean === 'analise') return 'Análise';
  if (clean === 'técnica' || clean === 'tecnica') return 'Técnica';
  if (clean === 'causa') return 'Causa';
  if (clean === 'solução' || clean === 'solucao') return 'Solução';
  return 'Geral';
}

function getBaseStyleForNode(node) {
  const isRoot = node.id === 1;
  const size = isRoot ? globalNodeSize + 3 : globalNodeSize;

  if (!useColors) {
    return {
      shape: 'dot',
      size: size,
      color: {
        background: isRoot ? '#ffffff' : '#94a3b8',
        border: isRoot ? '#f59e0b' : '#64748b',
        highlight: {
          background: '#ffffff',
          border: '#f59e0b'
        }
      },
      font: {
        color: '#ffffff',
        size: labelVisibilityMode === 'always' ? 12 : 0,
        face: 'Inter, system-ui, sans-serif',
        strokeWidth: 3,
        strokeColor: '#070913'
      }
    };
  }

  const catStyle = categoriesColors[node.category] || categoriesColors['Geral'];
  return {
    shape: 'dot',
    size: size,
    color: {
      background: catStyle.color.background === '#000000' ? '#ffffff' : catStyle.color.background,
      border: catStyle.color.border === '#000000' ? '#f59e0b' : catStyle.color.border,
      highlight: {
        background: '#ffffff',
        border: '#f59e0b'
      }
    },
    font: {
      color: '#ffffff',
      size: labelVisibilityMode === 'always' ? 12 : 0,
      face: 'Inter, system-ui, sans-serif',
      strokeWidth: 3,
      strokeColor: '#070913'
    }
  };
}

// Carrega os arquivos .md da subpasta 'Ferramentas/ConceitosObsidian' via API local
async function loadGraphFromObsidian() {
  try {
    const response = await fetch('/api/obsidian-concepts');
    if (!response.ok) return false;
    const files = await response.json();
    
    const newNodesArray = [];
    const filesData = {};
    const nameToIdMap = {};
    let nodeId = 1;

    files.forEach(entry => {
      const conceptName = entry.name;
      const text = entry.content;
      
      const id = nodeId++;
      nameToIdMap[conceptName.toLowerCase().trim()] = id;
      
      let category = 'Geral';
      const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        const yaml = fmMatch[1];
        const catMatch = yaml.match(/category:\s*(.*)/i);
        if (catMatch) {
          category = matchCategory(catMatch[1].trim());
        }
      }

      newNodesArray.push({
        id: id,
        label: conceptName,
        category: category,
        title: conceptName
      });

      filesData[conceptName] = {
        id: id,
        text: text,
        category: category
      };
    });

    if (newNodesArray.length === 0) {
      console.log("A pasta 'ConceitosObsidian' está vazia.");
      return false;
    }

    const newEdgesArray = [];
    let edgeId = 1;
    const connectedPairs = new Set();

    for (const [conceptName, data] of Object.entries(filesData)) {
      const sourceId = data.id;
      const text = data.text;
      
      const linkRegex = /\[\[\s*([^\]|#\n]+?)(?:\|[^\]\n]+)?\s*\]\]/g;
      let match;
      while ((match = linkRegex.exec(text)) !== null) {
        const targetName = match[1].trim().toLowerCase();
        const targetId = nameToIdMap[targetName];
        
        if (targetId && targetId !== sourceId) {
          const pairKey = sourceId < targetId ? `${sourceId}-${targetId}` : `${targetId}-${sourceId}`;
          if (!connectedPairs.has(pairKey)) {
            connectedPairs.add(pairKey);
            newEdgesArray.push({
              id: `e_${edgeId++}`,
              from: sourceId,
              to: targetId
            });
          }
        }
      }
    }

    const newConceptDetails = {};
    for (const [conceptName, data] of Object.entries(filesData)) {
      const cleanDescription = data.text.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
      newConceptDetails[data.id] = {
        title: conceptName,
        tag: data.category,
        description: cleanDescription
      };
    }

    nodesArray.length = 0;
    nodesArray.push(...newNodesArray);

    edgesArray.length = 0;
    edgesArray.push(...newEdgesArray);

    for (let key in conceptDetails) {
      delete conceptDetails[key];
    }
    Object.assign(conceptDetails, newConceptDetails);

    const nodesWithStyle = nodesArray.map(node => {
      const baseStyle = getBaseStyleForNode(node);
      return { ...node, ...baseStyle };
    });

    nodes.clear();
    nodes.add(nodesWithStyle);

    edges.clear();
    edges.add(edgesArray);

    if (graphMode === 'local') {
      updateLocalGraphSelection();
    } else {
      nodesView.refresh();
      edgesView.refresh();
    }

    if (network) {
      network.fit({ animation: { duration: 800 } });
    }

    return true;
  } catch (err) {
    console.error("Erro na leitura da pasta de conceitos do backend:", err);
  }
  return false;
}

function restoreDefaultGraph() {
  nodesArray.length = 0;
  nodesArray.push(...defaultNodesArray);

  edgesArray.length = 0;
  edgesArray.push(...defaultEdgesArray);

  for (let key in conceptDetails) {
    delete conceptDetails[key];
  }
  Object.assign(conceptDetails, defaultConceptDetails);

  const nodesWithStyle = nodesArray.map(node => {
    const baseStyle = getBaseStyleForNode(node);
    return { ...node, ...baseStyle };
  });

  nodes.clear();
  nodes.add(nodesWithStyle);

  edges.clear();
  edges.add(edgesArray.map((edge, index) => ({ id: `e_${index}`, ...edge })));

  if (graphMode === 'local') {
    updateLocalGraphSelection();
  } else {
    nodesView.refresh();
    edgesView.refresh();
  }

  if (network) {
    network.fit({ animation: { duration: 800 } });
  }
}

// Configurações do DataSet do Vis.js
const initialNodesArray = nodesArray.map(node => {
  const baseStyle = getBaseStyleForNode(node);
  return { ...node, ...baseStyle };
});

const initialEdgesArray = edgesArray.map((edge, index) => ({
  id: `e_${index}`,
  width: globalEdgeWidth,
  ...edge
}));

const nodes = new vis.DataSet(initialNodesArray);
const edges = new vis.DataSet(initialEdgesArray);

const nodesView = new vis.DataView(nodes, {
  filter: (node) => {
    if (graphMode === 'global') return true;
    return localMatchingNodeIds.includes(node.id);
  }
});

const edgesView = new vis.DataView(edges, {
  filter: (edge) => {
    if (graphMode === 'global') return true;
    return localMatchingNodeIds.includes(edge.from) && localMatchingNodeIds.includes(edge.to);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  initConstellationBackground();
  initGraph();
  setupEventListeners();
  setupSettingsListeners();
  notifyPortal();
  
  if (isObsidianSyncActive) {
    try {
      const success = await loadGraphFromObsidian();
      if (success) {
        updateSyncStatusUI(true);
      } else {
        updateSyncStatusUI(false, "Vazio");
      }
    } catch (e) {
      updateSyncStatusUI(false, "Erro");
    }
  } else {
    updateSyncStatusUI(false, "Inativo");
  }
  
  if (graphMode === 'local') {
    updateLocalGraphSelection();
  }
});

// =========================================================================
// --- 1. MOTOR 2D DA CONSTELAÇÃO DE FUNDO (CANVAS PLEXUS DINÂMICO) ---
// =========================================================================

function initConstellationBackground() {
  constellationCanvas = document.getElementById('constellation-bg');
  if (!constellationCanvas) return;

  constellationCtx = constellationCanvas.getContext('2d');

  function resize() {
    const parent = constellationCanvas.parentElement;
    constellationCanvas.width = parent ? parent.clientWidth : window.innerWidth;
    constellationCanvas.height = parent ? parent.clientHeight : window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Criar partículas
  createConstellationParticles();

  // Rastreamento suave do mouse
  window.addEventListener('mousemove', (e) => {
    const rect = constellationCanvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mousePos.x = -9999;
    mousePos.y = -9999;
  });

  animateConstellation();
}

function createConstellationParticles() {
  constellationParticles = [];
  const w = constellationCanvas ? constellationCanvas.width : window.innerWidth;
  const h = constellationCanvas ? constellationCanvas.height : window.innerHeight;

  for (let i = 0; i < constellationCount; i++) {
    const isGold = Math.random() > 0.35;
    constellationParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1.2 + Math.random() * 1.6,
      color: isGold ? '#f6e58d' : '#60a5fa',
      alpha: 0.4 + Math.random() * 0.5
    });
  }
}

function animateConstellation() {
  if (!constellationCanvas || !constellationCtx) return;

  const w = constellationCanvas.width;
  const h = constellationCanvas.height;

  constellationCtx.clearRect(0, 0, w, h);

  if (isConstellationEnabled) {
    const maxDist = 125;
    const mouseRadius = 150;

    // Atualizar e desenhar partículas
    for (let i = 0; i < constellationParticles.length; i++) {
      const p1 = constellationParticles[i];

      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > w) p1.vx *= -1;
      if (p1.y < 0 || p1.y > h) p1.vy *= -1;

      // Atração suave pelo mouse
      const mdx = mousePos.x - p1.x;
      const mdy = mousePos.y - p1.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDist < mouseRadius && mDist > 5) {
        const force = (1 - mDist / mouseRadius) * 0.4;
        p1.x += (mdx / mDist) * force;
        p1.y += (mdy / mDist) * force;
      }

      // Desenhar nó com brilho suave
      constellationCtx.beginPath();
      constellationCtx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      constellationCtx.fillStyle = p1.color;
      constellationCtx.shadowBlur = 6;
      constellationCtx.shadowColor = p1.color;
      constellationCtx.fill();

      // Conexões com outras partículas vizinhas
      for (let j = i + 1; j < constellationParticles.length; j++) {
        const p2 = constellationParticles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.45;
          constellationCtx.beginPath();
          constellationCtx.moveTo(p1.x, p1.y);
          constellationCtx.lineTo(p2.x, p2.y);
          constellationCtx.strokeStyle = `rgba(246, 229, 141, ${lineAlpha})`;
          constellationCtx.lineWidth = 0.55;
          constellationCtx.shadowBlur = 0;
          constellationCtx.stroke();
        }
      }
    }
  }

  constellationAnimId = requestAnimationFrame(animateConstellation);
}

// =========================================================================
// --- 2. CONFIGURAÇÃO DO GRAFO VIS.JS 2D ---
// =========================================================================

function initGraph() {
  const container = document.getElementById('network-container');
  const data = { nodes: nodesView, edges: edgesView };
  
  const options = {
    nodes: {
      borderWidth: 1.5,
      shadow: { enabled: false }
    },
    edges: {
      color: {
        color: '#475569',
        highlight: '#f59e0b',
        hover: '#38bdf8'
      },
      width: globalEdgeWidth,
      arrows: { to: { enabled: false } },
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'none',
        roundness: 0.4
      }
    },
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        iterations: 150
      },
      barnesHut: {
        gravitationalConstant: -2500,
        centralGravity: 0.12,
        springLength: 130,
        springConstant: 0.03,
        damping: 0.09,
        avoidOverlap: 1
      }
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: false,
      zoomView: true,
      dragView: true
    }
  };

  network = new vis.Network(container, data, options);

  network.once('afterDrawing', () => {
    rotateNetwork();
  });

  network.on('click', (params) => {
    if (params.nodes.length > 0) {
      const clickedId = params.nodes[0];
      openConceptDetails(clickedId);
    } else {
      closeSidebar();
    }
  });

  network.on('hoverNode', (params) => {
    const hoveredNodeId = params.node;
    const connectedNodes = network.getConnectedNodes(hoveredNodeId);
    
    const nodeUpdates = [];
    nodesArray.forEach(n => {
      const isHovered = n.id === hoveredNodeId;
      const isConnected = connectedNodes.includes(n.id);
      const baseStyle = getBaseStyleForNode(n);

      if (isHovered) {
        nodeUpdates.push({
          id: n.id,
          color: { background: '#ffffff', border: '#f59e0b' },
          font: { color: '#ffffff', size: 13, strokeWidth: 3, strokeColor: '#070913' }
        });
      } else if (isConnected) {
        nodeUpdates.push({
          id: n.id,
          color: baseStyle.color,
          font: { color: '#ffffff', size: 12, strokeWidth: 3, strokeColor: '#070913' }
        });
      } else {
        nodeUpdates.push({
          id: n.id,
          color: { background: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.2)' },
          font: { color: 'rgba(255, 255, 255, 0.15)', size: labelVisibilityMode === 'always' ? 12 : 0, strokeWidth: 0 }
        });
      }
    });
    nodes.update(nodeUpdates);

    const edgeUpdates = [];
    edges.get().forEach(e => {
      const isConnectedToHovered = e.from === hoveredNodeId || e.to === hoveredNodeId;
      if (isConnectedToHovered) {
        edgeUpdates.push({
          id: e.id,
          color: { color: '#f59e0b', opacity: 1.0 },
          width: globalEdgeWidth * 1.6
        });
      } else {
        edgeUpdates.push({
          id: e.id,
          color: { color: '#334155', opacity: 0.2 },
          width: globalEdgeWidth * 0.7
        });
      }
    });
    edges.update(edgeUpdates);
  });

  network.on('blurNode', () => {
    applyGraphStyleSettings();
  });

  network.on('dragStart', () => { isUserInteracting = true; });
  network.on('dragEnd', () => { isUserInteracting = false; });
  network.on('hold', () => { isUserInteracting = true; });
  network.on('release', () => { isUserInteracting = false; });
}

// =========================================================================
// --- 3. DETALHES DO CONCEITO, SIDEBAR E MARKDOWN WIKILINKS ---
// =========================================================================

let activeEditConceptId = null;
let isCreatingNewConcept = false;

function openConceptDetails(id) {
  cancelEditMode();

  const detail = conceptDetails[id];
  if (!detail) return;

  activeEditConceptId = id;

  document.getElementById('concept-title').textContent = detail.title;
  document.getElementById('concept-tag').textContent = detail.tag;
  document.getElementById('concept-description').innerHTML = renderMarkdownContent(detail.description);

  const btnEdit = document.getElementById('btn-edit-concept');
  if (btnEdit) {
    btnEdit.style.display = isObsidianSyncActive ? 'block' : 'none';
  }

  const sidebar = document.getElementById('sidebar');
  sidebar.style.transform = 'translateX(0)';
  
  const node = nodes.get(id);
  const colorClass = node ? node.category : 'Geral';
  const tagEl = document.getElementById('concept-tag');
  tagEl.style.backgroundColor = getTagColor(colorClass);
  tagEl.style.color = colorClass === 'Geral' ? '#ffffff' : '#000000';
}

function getTagColor(category) {
  switch (category) {
    case 'Geral': return '#000000';
    case 'Etapa': return '#eaeaea';
    case 'Análise': return '#fee2e2';
    case 'Técnica': return '#d1fae5';
    case 'Causa': return '#fef9c3';
    case 'Solução': return '#dbeafe';
    default: return '#eaeaea';
  }
}

function closeSidebar() {
  cancelEditMode();
  const sidebar = document.getElementById('sidebar');
  sidebar.style.transform = 'translateX(-100%)';
  if (network) network.unselectAll();
}

function enterEditMode() {
  const detail = conceptDetails[activeEditConceptId];
  if (!detail && !isCreatingNewConcept) return;

  document.getElementById('sidebar-view-mode').style.display = 'none';
  document.getElementById('sidebar-edit-mode').style.display = 'flex';

  const titleInput = document.getElementById('edit-concept-title');
  const catSelect = document.getElementById('edit-concept-category');
  const textInput = document.getElementById('edit-concept-text');
  const header = document.getElementById('edit-mode-header');
  const deleteBtn = document.getElementById('btn-delete-concept');

  if (isCreatingNewConcept) {
    header.textContent = "Criar Novo Conceito";
    titleInput.value = "";
    titleInput.disabled = false;
    catSelect.value = "Geral";
    textInput.value = "# Novo Conceito\n\nDescreva seu conceito aqui...";
    deleteBtn.style.display = 'none';
  } else {
    header.textContent = "Editar Conceito";
    titleInput.value = detail.title;
    titleInput.disabled = true;
    catSelect.value = detail.tag;
    textInput.value = `---\ncategory: ${detail.tag}\n---\n${detail.description}`;
    deleteBtn.style.display = 'block';
  }
}

function cancelEditMode() {
  document.getElementById('sidebar-view-mode').style.display = 'flex';
  document.getElementById('sidebar-edit-mode').style.display = 'none';
  isCreatingNewConcept = false;
}

async function saveConceptEdits() {
  const title = document.getElementById('edit-concept-title').value.trim();
  const category = document.getElementById('edit-concept-category').value;
  const rawText = document.getElementById('edit-concept-text').value;

  if (!title) {
    alert("O nome do conceito é obrigatório.");
    return;
  }

  let textToSave = rawText;
  if (!rawText.trim().startsWith("---")) {
    textToSave = `---\ncategory: ${category}\n---\n${rawText}`;
  } else {
    textToSave = rawText.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\ncategory: ${category}\n---`);
  }

  try {
    const response = await fetch('/api/obsidian-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: title,
        content: textToSave,
        action: 'save'
      })
    });

    if (response.ok) {
      await loadGraphFromObsidian();
      cancelEditMode();
      navigateToNodeByName(title);
    } else {
      alert("Erro ao salvar o conceito no servidor local.");
    }
  } catch (err) {
    console.error("Falha ao salvar conceito:", err);
    alert("Falha de conexão com o servidor local.");
  }
}

async function deleteConcept() {
  const title = document.getElementById('edit-concept-title').value.trim();
  if (!title) return;

  if (confirm(`Deseja realmente excluir permanentemente o conceito "${title}" de seus arquivos?`)) {
    try {
      const response = await fetch('/api/obsidian-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          action: 'delete'
        })
      });

      if (response.ok) {
        cancelEditMode();
        closeSidebar();
        await loadGraphFromObsidian();
      } else {
        alert("Erro ao excluir o conceito no servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor.");
    }
  }
}

function navigateToNodeByName(name) {
  const cleanName = name.toLowerCase().trim();
  const node = nodes.get().find(n => n.label.toLowerCase() === cleanName || n.title.toLowerCase() === cleanName);
  
  if (node) {
    if (graphMode === 'local') {
      setGraphMode('global');
    }

    network.selectNodes([node.id]);
    network.focus(node.id, {
      scale: 1.25,
      animation: {
        duration: 900,
        easingFunction: 'easeInOutQuad'
      }
    });
    openConceptDetails(node.id);
  }
}

function renderMarkdownContent(text) {
  if (!text) return '';

  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const renderInlineMarkdown = (line) => line
    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[\s*([^\]\n]+)\s*\]\]/g, (match, p1) => {
    const conceptName = p1.trim();
    return `<span class="wikilink" data-concept="${conceptName}">[[${conceptName}]]</span>`;
  });

  const lines = escapedText.split('\n');
  const htmlParts = [];
  let openList = null;

  const closeOpenList = () => {
    if (!openList) return;
    htmlParts.push(`</${openList}>`);
    openList = null;
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      closeOpenList();
      htmlParts.push('<br>');
      return;
    }

    const unorderedMatch = trimmedLine.match(/^-\s+(.*)$/);
    const orderedMatch = trimmedLine.match(/^\d+\.\s+(.*)$/);

    if (unorderedMatch || orderedMatch) {
      const listType = unorderedMatch ? 'ul' : 'ol';
      const itemContent = unorderedMatch ? unorderedMatch[1] : orderedMatch[1];

      if (openList !== listType) {
        closeOpenList();
        htmlParts.push(`<${listType}>`);
        openList = listType;
      }

      htmlParts.push(`<li>${renderInlineMarkdown(itemContent)}</li>`);
      return;
    }

    closeOpenList();

    const blockquoteMatch = trimmedLine.match(/^&gt;\s?(.*)$/);
    if (blockquoteMatch) {
      htmlParts.push(`<blockquote>${renderInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      return;
    }

    htmlParts.push(`<p>${renderInlineMarkdown(trimmedLine)}</p>`);
  });

  closeOpenList();
  return htmlParts.join('\n');
}

// =========================================================================
// --- 4. LISTENERS DE HUD E QUICK SWITCHER ---
// =========================================================================

function setupEventListeners() {
  document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    network.moveTo({ scale: network.getScale() + 0.2 });
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    network.moveTo({ scale: network.getScale() - 0.2 });
  });
  document.getElementById('btn-fit').addEventListener('click', () => {
    network.fit({ animation: { duration: 800 } });
  });

  document.getElementById('concept-description').addEventListener('click', (e) => {
    const link = e.target.closest('.wikilink');
    if (link) {
      const conceptName = link.getAttribute('data-concept');
      navigateToNodeByName(conceptName);
    }
  });

  const switcher = document.getElementById('switcher');
  const switcherInput = document.getElementById('switcher-input');
  
  document.getElementById('btn-search').addEventListener('click', openSwitcher);

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.ctrlKey && e.key.toLowerCase() === 'p')) {
      e.preventDefault();
      openSwitcher();
    }
  });

  switcherInput.addEventListener('input', () => {
    selectedSwitcherIndex = 0;
    renderSwitcherList();
  });

  switcher.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSwitcher();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSwitcherIndex = (selectedSwitcherIndex + 1) % filteredSwitcherNodes.length;
      renderSwitcherList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSwitcherIndex = (selectedSwitcherIndex - 1 + filteredSwitcherNodes.length) % filteredSwitcherNodes.length;
      renderSwitcherList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSwitcherNodes.length > 0) {
        const item = filteredSwitcherNodes[selectedSwitcherIndex];
        navigateToNodeByName(item.label);
        closeSwitcher();
      }
    }
  });
 
  switcher.addEventListener('mousedown', (e) => {
    if (e.target === switcher) {
      closeSwitcher();
    }
  });

  const btnEdit = document.getElementById('btn-edit-concept');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      isCreatingNewConcept = false;
      enterEditMode();
    });
  }

  const btnCancel = document.getElementById('btn-cancel-edit');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (isCreatingNewConcept) {
        closeSidebar();
      } else {
        cancelEditMode();
      }
    });
  }

  const btnSave = document.getElementById('btn-save-concept');
  if (btnSave) {
    btnSave.addEventListener('click', saveConceptEdits);
  }

  const btnDelete = document.getElementById('btn-delete-concept');
  if (btnDelete) {
    btnDelete.addEventListener('click', deleteConcept);
  }

  const btnCreateHud = document.getElementById('btn-create-concept-hud');
  if (btnCreateHud) {
    btnCreateHud.addEventListener('click', () => {
      isCreatingNewConcept = true;
      activeEditConceptId = null;
      
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.style.transform = 'translateX(0)';
      
      enterEditMode();
    });
  }
}

function openSwitcher() {
  const switcher = document.getElementById('switcher');
  const switcherInput = document.getElementById('switcher-input');
  
  switcher.style.display = 'flex';
  switcherInput.value = '';
  selectedSwitcherIndex = 0;
  
  renderSwitcherList();
  setTimeout(() => switcherInput.focus(), 50);
}

function closeSwitcher() {
  const switcher = document.getElementById('switcher');
  switcher.style.display = 'none';
}

function renderSwitcherList() {
  const query = document.getElementById('switcher-input').value.toLowerCase().trim();
  const list = document.getElementById('switcher-list');
  
  filteredSwitcherNodes = nodesArray.filter(node => {
    return node.label.toLowerCase().includes(query) || node.title.toLowerCase().includes(query);
  });

  if (filteredSwitcherNodes.length === 0) {
    list.innerHTML = `<div style="padding: 16px 24px; font-size: 13px; color: #888; text-align: center;">Nenhum conceito encontrado.</div>`;
    return;
  }

  list.innerHTML = filteredSwitcherNodes.map((node, index) => {
    const isSelected = index === selectedSwitcherIndex;
    return `
      <div class="switcher-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <span>${node.label}</span>
        <span class="switcher-item-tag">${node.category}</span>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.switcher-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      const node = filteredSwitcherNodes[idx];
      navigateToNodeByName(node.label);
      closeSwitcher();
    });
  });
}

function updateSyncStatusUI(active, text) {
  const btn = document.getElementById('btn-sync-obsidian');
  const status = document.getElementById('obsidian-sync-status');
  const btnCreate = document.getElementById('btn-create-concept-hud');

  if (btn) {
    btn.textContent = active ? "Desativar" : "Ativar";
  }
  if (status) {
    status.textContent = `Status: ${text || (active ? "Ativo" : "Inativo")}`;
  }
  if (btnCreate) {
    btnCreate.style.display = active ? 'flex' : 'none';
  }
}

function notifyPortal() {
  window.parent.postMessage({ type: 'TOOL_LOADED', tool: 'Grafo' }, '*');
}

function rotateNetwork() {
  if (network && !isUserInteracting && targetRotationMultiplier > 0) {
    const speed = rotationSpeed * targetRotationMultiplier;
    const positions = network.getPositions();
    const nodeUpdates = [];
    
    let sumX = 0, sumY = 0, count = 0;
    for (let id in positions) {
      sumX += positions[id].x;
      sumY += positions[id].y;
      count++;
    }
    
    if (count > 0) {
      const centerX = sumX / count;
      const centerY = sumY / count;
      
      const cos = Math.cos(speed);
      const sin = Math.sin(speed);
      
      for (let id in positions) {
        const p = positions[id];
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        
        nodeUpdates.push({
          id: parseInt(id),
          x: centerX + rx,
          y: centerY + ry
        });
      }
      
      nodes.update(nodeUpdates);
    }
  }
  requestAnimationFrame(rotateNetwork);
}

// =========================================================================
// --- 5. CONFIGURAÇÕES E CONTROLES (SETTINGS PANEL) ---
// =========================================================================

function setupSettingsListeners() {
  const panel = document.getElementById('settings-panel');
  const btnSettings = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings');

  btnSettings.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  });

  btnClose.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  // Toggle Constelação de Fundo
  const chkConstellation = document.getElementById('chk-constellation');
  const rowDensity = document.getElementById('row-constellation-density');
  if (chkConstellation) {
    chkConstellation.addEventListener('change', (e) => {
      isConstellationEnabled = e.target.checked;
      if (rowDensity) {
        rowDensity.style.display = isConstellationEnabled ? 'flex' : 'none';
      }
    });
  }

  // Slider Densidade da Constelação
  const sliderConstDensity = document.getElementById('slider-constellation-density');
  const valConstDensity = document.getElementById('val-constellation-density');
  if (sliderConstDensity) {
    sliderConstDensity.addEventListener('input', (e) => {
      const newCount = parseInt(e.target.value, 10);
      constellationCount = newCount;
      if (valConstDensity) valConstDensity.textContent = newCount;
      createConstellationParticles();
    });
  }

  const btnSync = document.getElementById('btn-sync-obsidian');
  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      if (isObsidianSyncActive) {
        isObsidianSyncActive = false;
        localStorage.setItem('LCC_OBSIDIAN_SYNC_ACTIVE', 'false');
        restoreDefaultGraph();
        updateSyncStatusUI(false, "Inativo");
      } else {
        updateSyncStatusUI(false, "Conectando...");
        try {
          isObsidianSyncActive = true;
          localStorage.setItem('LCC_OBSIDIAN_SYNC_ACTIVE', 'true');
          const success = await loadGraphFromObsidian();
          if (success) {
            updateSyncStatusUI(true);
          } else {
            updateSyncStatusUI(false, "Vazio");
            alert("A pasta 'ConceitosObsidian' está vazia ou não pôde ser lida. Adicione notas .md nela!");
          }
        } catch (err) {
          console.error(err);
          updateSyncStatusUI(false, "Erro");
          alert("Erro ao conectar com a pasta de conceitos local.");
        }
      }
    });
  }

  const setTabActive = (groupSelectors, activeId) => {
    groupSelectors.forEach(id => {
      const el = document.getElementById(id);
      if (id === activeId) el.classList.add('active');
      else el.classList.remove('active');
    });
  };

  document.getElementById('btn-graph-global').addEventListener('click', () => {
    setTabActive(['btn-graph-global', 'btn-graph-local'], 'btn-graph-global');
    setGraphMode('global');
  });

  document.getElementById('btn-graph-local').addEventListener('click', () => {
    setTabActive(['btn-graph-global', 'btn-graph-local'], 'btn-graph-local');
    setGraphMode('local');
  });

  document.getElementById('btn-style-mono').addEventListener('click', () => {
    setTabActive(['btn-style-mono', 'btn-style-color'], 'btn-style-mono');
    useColors = false;
    applyGraphStyleSettings();
  });

  document.getElementById('btn-style-color').addEventListener('click', () => {
    setTabActive(['btn-style-mono', 'btn-style-color'], 'btn-style-color');
    useColors = true;
    applyGraphStyleSettings();
  });

  document.getElementById('btn-labels-always').addEventListener('click', () => {
    setTabActive(['btn-labels-always', 'btn-labels-hover'], 'btn-labels-always');
    labelVisibilityMode = 'always';
    applyGraphStyleSettings();
  });

  document.getElementById('btn-labels-hover').addEventListener('click', () => {
    setTabActive(['btn-labels-always', 'btn-labels-hover'], 'btn-labels-hover');
    labelVisibilityMode = 'hover';
    applyGraphStyleSettings();
  });

  document.getElementById('chk-physics').addEventListener('change', (e) => {
    togglePhysics(e.target.checked);
  });

  const sliderRot = document.getElementById('slider-rotation');
  const valRot = document.getElementById('val-rotation');
  sliderRot.addEventListener('input', (e) => {
    targetRotationMultiplier = parseFloat(e.target.value);
    valRot.textContent = `${targetRotationMultiplier.toFixed(1)}x`;
  });

  const sliderSize = document.getElementById('slider-nodesize');
  const valSize = document.getElementById('val-nodesize');
  sliderSize.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value, 10);
    valSize.textContent = `${newSize}px`;
    updateNodeSizes(newSize);
  });

  const sliderEdge = document.getElementById('slider-edgewidth');
  const valEdge = document.getElementById('val-edgewidth');
  sliderEdge.addEventListener('input', (e) => {
    const newWidth = parseFloat(e.target.value);
    valEdge.textContent = `${newWidth.toFixed(1)}px`;
    updateEdgeWidths(newWidth);
  });
}

function setGraphMode(mode) {
  graphMode = mode;
  updateLocalGraphSelection();
}

function updateLocalGraphSelection() {
  if (graphMode === 'local') {
    localMatchingNodeIds = selectedNodeId ? [selectedNodeId, ...(network ? network.getConnectedNodes(selectedNodeId) : [])] : nodesArray.map(n => n.id);
  } else {
    localMatchingNodeIds = nodesArray.map(n => n.id);
  }
  nodesView.refresh();
  edgesView.refresh();
}

function applyGraphStyleSettings() {
  const nodeUpdates = [];
  nodesArray.forEach(n => {
    const baseStyle = getBaseStyleForNode(n);
    nodeUpdates.push({
      id: n.id,
      ...baseStyle
    });
  });
  nodes.update(nodeUpdates);
}

function updateNodeSizes(newSize) {
  globalNodeSize = newSize;
  const nodeUpdates = [];
  nodesArray.forEach(n => {
    const isRoot = n.id === 1;
    nodeUpdates.push({
      id: n.id,
      size: isRoot ? globalNodeSize + 3 : globalNodeSize
    });
  });
  nodes.update(nodeUpdates);
}

function updateEdgeWidths(newWidth) {
  globalEdgeWidth = newWidth;
  const edgeUpdates = [];
  initialEdgesArray.forEach(e => {
    edgeUpdates.push({
      id: e.id,
      width: globalEdgeWidth
    });
  });
  edges.update(edgeUpdates);
}

function togglePhysics(enabled) {
  if (network) {
    network.setOptions({
      physics: { enabled: enabled }
    });
  }
}

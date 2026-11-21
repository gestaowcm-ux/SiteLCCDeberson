/**
 * Matriz3DManutencao.js
 * Visualização e Análise Tridimensional de Risco, Retorno e Maturidade da Atividade de Manutenção
 * Plataforma Curso RCA - Mentoria em Gestão de Ativos
 */

// Initial Seed Data: Ações realistas de manutenção industrial
const DEFAULT_ACTIONS = [
  {
    id: 'act-1',
    title: 'Monitoramento de Vibração Contínuo (Turbina)',
    category: 'Preditiva',
    risk: 85,       // Alto Risco mitigado (85%)
    returns: 90,    // Altíssimo Retorno financeiro (90%)
    maturity: 80,   // Maturidade Técnica Requerida (80%)
    desc: 'Instalação de sensores triaxiais piezoelétricos online nos mancais do turbo-gerador para prever falhas catastróficas.',
    cost: 'R$ 140.000',
    owner: 'Equipe Preditiva',
    impact: 'Evita paradas não planejadas de alto custo na geração térmica.'
  },
  {
    id: 'act-2',
    title: 'Adequação de Lubrificação e Padrões 5S',
    category: 'Lubrificação',
    risk: 35,       // Baixo a médio risco (35%)
    returns: 80,    // Alto Retorno (80% - Quick Win clássico)
    maturity: 40,   // Maturidade (40%)
    desc: 'Padronização de pontos de graxa, codificação por cores e implantação de amostragem periódica de óleo.',
    cost: 'R$ 18.000',
    owner: 'Manutenção Mecânica',
    impact: 'Redução de 40% nas falhas prematuras de rolamentos em bombas.'
  },
  {
    id: 'act-3',
    title: 'Revisão Sistemática RCM em Bombas de Alimentação',
    category: 'RCM',
    risk: 75,
    returns: 85,
    maturity: 75,
    desc: 'Análise de Modos e Efeitos de Falha (FMEA) e árvore de decisão RCM para otimização do plano de manutenção.',
    cost: 'R$ 35.000',
    owner: 'Engenharia de Confiabilidade',
    impact: 'Eliminação de tarefas preventivas redundantes e foco em preditiva.'
  },
  {
    id: 'act-4',
    title: 'Instalação de Bomba Stand-by com Auto-Start',
    category: 'Engenharia',
    risk: 95,       // Crítico (95%)
    returns: 70,    // Alto Retorno (70%)
    maturity: 60,   // Maturidade (60%)
    desc: 'Engenharia de modificação para inserção de redundância física 100% no circuito de água de resfriamento.',
    cost: 'R$ 220.000',
    owner: 'Projetos / Engenharia',
    impact: 'Garante continuidade operacional total em caso de falha da bomba primária.'
  },
  {
    id: 'act-5',
    title: 'Termografia Semanal em Painéis CCM',
    category: 'Preditiva',
    risk: 50,
    returns: 75,
    maturity: 55,
    desc: 'Rotas de inspeção termográfica com câmera infravermelha de alta sensibilidade para detecção de pontos quentes.',
    cost: 'R$ 25.000',
    owner: 'Elétrica / Preditiva',
    impact: 'Prevenção de queima de disjuntores e incêndios elétricos.'
  },
  {
    id: 'act-6',
    title: 'Manutenção Autônoma e Checklist Operacional',
    category: 'Operação',
    risk: 30,
    returns: 65,
    maturity: 20,
    desc: 'Capacitação dos operadores de campo para limpeza, inspeção tátil/visual e aperto de conexões.',
    cost: 'R$ 12.000',
    owner: 'Operação & Manutenção',
    impact: 'Detecção antecipada de anomalias simples antes da degradação funcional.'
  },
  {
    id: 'act-7',
    title: 'Gêmeo Digital & Algoritmos de IA Prescritiva',
    category: 'Preditiva',
    risk: 60,
    returns: 95,
    maturity: 95,
    desc: 'Modelagem termodinâmica e aprendizado de máquina para previsão de vida útil remanescente (RUL) de compressores.',
    cost: 'R$ 380.000',
    owner: 'Transformação Digital',
    impact: 'Otimização energética e manutenção sob demanda em tempo real.'
  },
  {
    id: 'act-8',
    title: 'Padronização de Ordens de Serviço Preventivas',
    category: 'Preventiva',
    risk: 25,
    returns: 45,
    maturity: 35,
    desc: 'Revisão dos procedimentos operacionais padrão (POPs) no ERP/CMMS para manutenções baseadas em tempo/hora.',
    cost: 'R$ 8.000',
    owner: 'PCM',
    impact: 'Organização do histórico de falhas e melhoria do MTTR.'
  }
];

// App State & Data Migration (Normalize legacy 1-5 levels to 0-100%)
let rawLoaded = JSON.parse(localStorage.getItem('rca_matrix3d_actions')) || DEFAULT_ACTIONS;
let actions = rawLoaded.map(a => ({
  ...a,
  maturity: (a.maturity <= 5) ? Math.min(100, Math.round(a.maturity * 20)) : a.maturity
}));
let selectedActionId = null;
let activeFilter = 'all';
let searchQuery = '';
let currentView = 'isometric';
let nodeShape = 'spheres'; // 'spheres' or 'cubes'
let showProjections = true;
let showNodeLabels = true;
let isAutoRotating = false;

// Three.js Globals
let scene, camera, renderer, controls;
let nodeMeshes = [];
let projectionLinesGroup;
let gridHelpersGroup;
let axisLabelsGroup;
let nodeLabelsGroup;
let raycaster, mouse;
let hoveredNode = null;
const CUBE_SIZE = 100; // 0 to 100 in coordinates

// Colors Definition (Monochromatic Scale)
const CATEGORY_COLORS = {
  'Preditiva': 0x111111,    // Deep Charcoal / Near Black
  'RCM': 0x2e2e2e,          // Dark Gray
  'Preventiva': 0x4a4a4a,   // Slate Gray
  'Engenharia': 0x666666,   // Mid Gray
  'Lubrificação': 0x828282, // Silver Gray
  'Operação': 0x9c9c9c      // Light Gray
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  initThreeScene();
  setupEventListeners();
  renderActionList();
  render3DNodes();
  animate();

  // Select first item by default if available
  if (actions.length > 0) {
    selectAction(actions[0].id, false);
  }
});

/**
 * -------------------------------------------------------------
 * THREE.JS 3D SCENE INITIALIZATION & SETUP
 * -------------------------------------------------------------
 */
function initThreeScene() {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('webgl-canvas');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfbfbfb);

  // Camera
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
  setCameraPreset('isometric', false);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.maxDistance = 600;
  controls.minDistance = 30;
  controls.target.set(50, 50, 50); // Center of the 100x100x100 cube

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
  mainLight.position.set(120, 200, 150);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
  fillLight.position.set(-100, -50, -100);
  scene.add(fillLight);

  // Groups
  gridHelpersGroup = new THREE.Group();
  projectionLinesGroup = new THREE.Group();
  axisLabelsGroup = new THREE.Group();
  nodeLabelsGroup = new THREE.Group();

  scene.add(gridHelpersGroup);
  scene.add(projectionLinesGroup);
  scene.add(axisLabelsGroup);
  scene.add(nodeLabelsGroup);

  // Build the 3D Bounding Cube, Grids and Axis
  build3DSpaceEnvironment();

  // Raycaster for interactivity
  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 5;
  mouse = new THREE.Vector2();

  // Window resize handler
  window.addEventListener('resize', onWindowResize);
}

/**
 * Cria a estrutura do Cubo 3D (Planos, Eixos, Grades Minimalistas e Textos)
 */
function build3DSpaceEnvironment() {
  gridHelpersGroup.clear();
  axisLabelsGroup.clear();

  // 1. Wireframe Bounding Cube (Caixa Externa Delimitadora)
  const boxGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  const boxEdges = new THREE.EdgesGeometry(boxGeometry);
  const boxLineMat = new THREE.LineBasicMaterial({
    color: 0xcccccc,
    linewidth: 1,
    transparent: true,
    opacity: 0.8
  });
  const boundingBoxLines = new THREE.LineSegments(boxEdges, boxLineMat);
  boundingBoxLines.position.set(50, 50, 50);
  gridHelpersGroup.add(boundingBoxLines);

  // 2. Base Ground Grid (XZ Plane at Y = 0)
  const groundGrid = new THREE.GridHelper(CUBE_SIZE, 10, 0x111111, 0xe0e0e0);
  groundGrid.position.set(50, 0, 50);
  gridHelpersGroup.add(groundGrid);

  // 3. Back Wall Grid (XY Plane at Z = 0)
  const backGrid = new THREE.GridHelper(CUBE_SIZE, 10, 0x111111, 0xe8e8e8);
  backGrid.rotation.x = Math.PI / 2;
  backGrid.position.set(50, 50, 0);
  gridHelpersGroup.add(backGrid);

  // 4. Side Wall Grid (YZ Plane at X = 0)
  const sideGrid = new THREE.GridHelper(CUBE_SIZE, 10, 0x111111, 0xe8e8e8);
  sideGrid.rotation.z = Math.PI / 2;
  sideGrid.position.set(0, 50, 50);
  gridHelpersGroup.add(sideGrid);

  // 5. Halfway Mid-Planes (Divisores de Quadrante/Octante a 50%)
  const midPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide
  });

  // Mid Horizontal Plane (Y = 50)
  const midHoriz = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE), midPlaneMaterial);
  midHoriz.rotation.x = Math.PI / 2;
  midHoriz.position.set(50, 50, 50);
  gridHelpersGroup.add(midHoriz);

  // Mid Vertical Plane X (X = 50)
  const midVertX = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE), midPlaneMaterial);
  midVertX.rotation.y = Math.PI / 2;
  midVertX.position.set(50, 50, 50);
  gridHelpersGroup.add(midVertX);

  // Mid Vertical Plane Z (Z = 50)
  const midVertZ = new THREE.Mesh(new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE), midPlaneMaterial);
  midVertZ.position.set(50, 50, 50);
  gridHelpersGroup.add(midVertZ);

  // 6. Styled Monochrome Axis Lines
  createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(CUBE_SIZE + 10, 0, 0), 0x000000, 'EIXO X: RISCO / CRITICIDADE (%)', new THREE.Vector3(CUBE_SIZE + 15, 0, 0));
  createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, CUBE_SIZE + 10, 0), 0x333333, 'EIXO Y: RETORNO / ROI (%)', new THREE.Vector3(0, CUBE_SIZE + 15, 0));
  createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, CUBE_SIZE + 10), 0x666666, 'EIXO Z: MATURIDADE DA ATIVIDADE (%)', new THREE.Vector3(0, 0, CUBE_SIZE + 15));

  // 7. Corner and Scale Markers (Monochrome 0-100%)
  add3DTextSprite('0%', 0, -4, 0, '#666666', 10);
  add3DTextSprite('100% Risco', CUBE_SIZE, -4, 0, '#000000', 12, true);
  add3DTextSprite('100% Retorno', -6, CUBE_SIZE, 0, '#222222', 12, true);
  add3DTextSprite('100% Maturidade', 0, -4, CUBE_SIZE, '#444444', 12, true);
}

/**
 * Cria linha de eixo grossa e etiqueta de texto 3D
 */
function createAxisLine(start, end, colorHex, labelText, labelPos) {
  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 3 });
  const line = new THREE.Line(geometry, material);
  gridHelpersGroup.add(line);

  // Axis Arrow Head
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const arrow = new THREE.ArrowHelper(dir, end, 6, colorHex, 4, 3);
  gridHelpersGroup.add(arrow);

  // Text Sprite Label
  const colorStr = '#' + colorHex.toString(16).padStart(6, '0');
  add3DTextSprite(labelText, labelPos.x, labelPos.y, labelPos.z, colorStr, 14, true);
}

/**
 * Gera um Sprite 2D de alta nitidez para renderizar textos em 3D
 */
function add3DTextSprite(text, x, y, z, color = '#000000', fontSize = 16, isBold = false) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  context.font = `${isBold ? 'bold' : '600'} ${fontSize * 3.5}px Inter, system-ui, sans-serif`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);

  sprite.position.set(x, y, z);
  sprite.scale.set(36, 9, 1);
  axisLabelsGroup.add(sprite);
}

/**
 * -------------------------------------------------------------
 * RENDERIZAÇÃO DOS NÓS 3D (CÍRCULOS/ESFERAS OU MICRO-CUBOS)
 * -------------------------------------------------------------
 */
/**
 * Calcula a cor do Heatmap Monocromático baseada no produto dos 3 eixos (Risco * Retorno * Maturidade)
 * Quanto maior o fator de multiplicação, mais escuro (preto); quanto menor, mais claro (cinza)
 */
function getMonochromeHeatmapColor(risk, returns, maturity) {
  const factor = (risk / 100) * (returns / 100) * (maturity / 100); // 0.0 a 1.0
  // Curva de distribuição perceptual para excelente contraste entre projetos
  const intensity = Math.min(1.0, Math.pow(factor, 0.42));
  
  // Interpolação de Cinza Claro (215, 215, 215) para Preto Profundo (18, 18, 18)
  const lightVal = 215;
  const darkVal = 18;
  const val = Math.round(lightVal - intensity * (lightVal - darkVal));
  
  return (val << 16) | (val << 8) | val;
}

function render3DNodes() {
  // Limpar meshes e rótulos anteriores
  nodeMeshes.forEach(mesh => scene.remove(mesh));
  nodeMeshes = [];
  projectionLinesGroup.clear();
  nodeLabelsGroup.clear();

  // Filtrar ações conforme busca e categoria
  const filtered = getFilteredActions();

  // Tamanho uniforme e levemente menor para todos os nós
  const uniformCubeDim = 4.2;
  const uniformSphereRadius = 2.6;

  filtered.forEach(action => {
    // Mapeamento direto de coordenadas 0 a 100% para os 3 eixos (X, Y, Z)
    const x = action.risk;
    const y = action.returns;
    const z = action.maturity;

    const isSelected = action.id === selectedActionId;
    
    // Cor calculada pelo Heatmap monocromático (X * Y * Z)
    const heatmapColorHex = getMonochromeHeatmapColor(x, y, z);

    // Criar Geometria uniforme conforme o modo (Esferas Minimalistas ou Micro-Cubos)
    let geometry;
    if (nodeShape === 'cubes') {
      geometry = new THREE.BoxGeometry(uniformCubeDim, uniformCubeDim, uniformCubeDim);
    } else {
      geometry = new THREE.SphereGeometry(uniformSphereRadius, 32, 32);
    }

    // Material: Vermelho se selecionado, ou tom do Heatmap Monocromático (Cinza -> Preto)
    const material = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xdc2626 : heatmapColorHex,
      roughness: isSelected ? 0.2 : 0.35,
      metalness: isSelected ? 0.1 : 0.15,
      emissive: isSelected ? 0x440000 : 0x000000,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { actionId: action.id, action: action };

    // Arestas de contraste sutis para cubos em tons de cinza claro
    if (nodeShape === 'cubes') {
      const edgeGeo = new THREE.EdgesGeometry(geometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0xdc2626 : 0x111111,
        linewidth: 1,
        transparent: true,
        opacity: isSelected ? 0.8 : 0.25
      });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      mesh.add(edgeLine);
    }

    // Halo / Anel Externo se selecionado (Vermelho)
    if (isSelected) {
      const ringRadius = (nodeShape === 'cubes' ? uniformCubeDim : uniformSphereRadius);
      const ringGeo = new THREE.RingGeometry(ringRadius * 1.3, ringRadius * 1.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(camera.position);
      mesh.add(ring);
    }

    scene.add(mesh);
    nodeMeshes.push(mesh);

    // Rótulos Minimalistas Flutuantes (com tamanho e nitidez ampliados)
    if (showNodeLabels) {
      const labelSprite = createNodeLabelSprite(action, isSelected, uniformSphereRadius + 1.0);
      nodeLabelsGroup.add(labelSprite);
    }

    // Linhas de Projeção e Sombras nos 3 eixos (APENAS para o cubo selecionado)
    if (showProjections && isSelected) {
      createProjectionDropLines(x, y, z, action);
    }
  });

  updateActionCountBadge(filtered.length);
}

/**
 * Cria um rótulo minimalista 3D em cápsula de alta legibilidade, com quebra de linha inteligente
 * e posicionado acima do cubo para nunca sobrepor outros elementos
 */
function createNodeLabelSprite(action, isSelected, nodeRadius) {
  const lines = wrapTextLines(action.title, 16);
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const baseWidth = 480;
  const lineHeight = 44;
  const paddingY = 22;
  const canvasHeight = paddingY * 2 + lines.length * lineHeight;
  
  canvas.width = baseWidth;
  canvas.height = canvasHeight;

  // Background da pílula/cápsula minimalista de alta nitidez
  const cornerRadius = 18;
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(6, 6, baseWidth - 12, canvasHeight - 12, cornerRadius);
  } else {
    context.rect(6, 6, baseWidth - 12, canvasHeight - 12);
  }
  
  // Fundo branco sólido com leve translucidez
  context.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.94)';
  context.fill();

  // Borda nítida de destaque
  context.lineWidth = isSelected ? 4 : 2;
  context.strokeStyle = isSelected ? '#dc2626' : 'rgba(0, 0, 0, 0.2)';
  context.stroke();

  // Texto com tipografia ampliada, encorpada e bem visível
  context.font = `${isSelected ? '800' : '700'} 26px Inter, system-ui, -apple-system, sans-serif`;
  context.fillStyle = isSelected ? '#dc2626' : '#000000';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const startY = paddingY + lineHeight / 2;
  lines.forEach((line, idx) => {
    context.fillText(line, baseWidth / 2, startY + idx * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    depthTest: false // Mantém o rótulo legível em primeiro plano sem cortes
  });
  const sprite = new THREE.Sprite(spriteMaterial);

  // Escala ampliada no mundo 3D para leitura confortável
  const worldWidth = 24;
  const worldHeight = (canvasHeight / baseWidth) * worldWidth;
  sprite.scale.set(worldWidth, worldHeight, 1);

  // Posição: projetado acima do nó com folga suficiente
  const yOffset = nodeRadius + worldHeight / 2 + 2.0;
  sprite.position.set(action.risk, action.returns + yOffset, action.maturity);
  
  return sprite;
}

/**
 * Quebra de linha inteligente por palavras para rótulos compactos
 */
function wrapTextLines(text, maxCharsPerLine = 18) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  // Limita a no máximo 3 linhas para máxima sobriedade visual
  if (lines.length > 3) {
    const trimmed = lines.slice(0, 2);
    trimmed.push(lines.slice(2).join(' '));
    return trimmed.slice(0, 3);
  }
  return lines;
}

/**
 * Cria linhas guia (drop lines) e sombras projetadas nos 3 planos de coordenadas (XZ, XY, YZ)
 * EXCLUSIVAMENTE para o cubo selecionado em (x, y, z), sem traçar pontos ou linhas para a origem
 */
function createProjectionDropLines(x, y, z, action) {
  const lineMat = new THREE.LineDashedMaterial({
    color: 0xdc2626,
    dashSize: 2.5,
    gapSize: 1.5,
    transparent: true,
    opacity: 0.95
  });

  // Material para as sombras projetadas nos 3 planos
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xdc2626,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });

  const shadowRingMat = new THREE.MeshBasicMaterial({
    color: 0xdc2626,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  });

  const dotRadius = 2.6;

  // -------------------------------------------------------------
  // 1. PROJEÇÃO VERTICAL NO PLANO DO CHÃO (XZ) EM (x, 0, z)
  // -------------------------------------------------------------
  // Linha perpendicular do cubo (x, y, z) até sua sombra no chão (x, 0, z)
  const ptsGround = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, 0.05, z)];
  const geoGround = new THREE.BufferGeometry().setFromPoints(ptsGround);
  const lineGround = new THREE.Line(geoGround, lineMat);
  lineGround.computeLineDistances();
  projectionLinesGroup.add(lineGround);

  // Sombra circular vermelha com anel no chão (x, 0, z)
  const groundDot = new THREE.Mesh(new THREE.CircleGeometry(dotRadius, 24), shadowMat);
  groundDot.rotation.x = Math.PI / 2;
  groundDot.position.set(x, 0.08, z);
  projectionLinesGroup.add(groundDot);

  const groundRing = new THREE.Mesh(new THREE.RingGeometry(dotRadius * 1.2, dotRadius * 1.5, 24), shadowRingMat);
  groundRing.rotation.x = Math.PI / 2;
  groundRing.position.set(x, 0.09, z);
  projectionLinesGroup.add(groundRing);

  // -------------------------------------------------------------
  // 2. PROJEÇÃO HORIZONTAL NA PAREDE TRASEIRA (XY) EM (x, y, 0)
  // -------------------------------------------------------------
  // Linha perpendicular do cubo (x, y, z) até sua sombra na parede traseira (x, y, 0)
  const ptsBack = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, 0.05)];
  const geoBack = new THREE.BufferGeometry().setFromPoints(ptsBack);
  const lineBack = new THREE.Line(geoBack, lineMat);
  lineBack.computeLineDistances();
  projectionLinesGroup.add(lineBack);

  // Sombra circular vermelha com anel na parede traseira (x, y, 0)
  const backDot = new THREE.Mesh(new THREE.CircleGeometry(dotRadius, 24), shadowMat);
  backDot.position.set(x, y, 0.08);
  projectionLinesGroup.add(backDot);

  const backRing = new THREE.Mesh(new THREE.RingGeometry(dotRadius * 1.2, dotRadius * 1.5, 24), shadowRingMat);
  backRing.position.set(x, y, 0.09);
  projectionLinesGroup.add(backRing);

  // -------------------------------------------------------------
  // 3. PROJEÇÃO HORIZONTAL NA PAREDE LATERAL (YZ) EM (0, y, z)
  // -------------------------------------------------------------
  // Linha perpendicular do cubo (x, y, z) até sua sombra na parede lateral (0, y, z)
  const ptsSide = [new THREE.Vector3(x, y, z), new THREE.Vector3(0.05, y, z)];
  const geoSide = new THREE.BufferGeometry().setFromPoints(ptsSide);
  const lineSide = new THREE.Line(geoSide, lineMat);
  lineSide.computeLineDistances();
  projectionLinesGroup.add(lineSide);

  // Sombra circular na parede lateral (0, y, z)
  const sideDot = new THREE.Mesh(new THREE.CircleGeometry(dotRadius, 24), shadowMat);
  sideDot.rotation.y = Math.PI / 2;
  sideDot.position.set(0.08, y, z);
  projectionLinesGroup.add(sideDot);

  const sideRing = new THREE.Mesh(new THREE.RingGeometry(dotRadius * 1.2, dotRadius * 1.5, 24), shadowRingMat);
  sideRing.rotation.y = Math.PI / 2;
  sideRing.position.set(0.09, y, z);
  projectionLinesGroup.add(sideRing);
}

/**
 * -------------------------------------------------------------
 * CONTROLES DE CÂMERA E PRESETS DE VISUALIZAÇÃO
 * -------------------------------------------------------------
 */
function setCameraPreset(preset, animateCam = true) {
  currentView = preset;
  
  // Atualizar botões na barra
  document.querySelectorAll('.cam-btn[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === preset);
  });

  const target = new THREE.Vector3(50, 50, 50);
  let pos = new THREE.Vector3();

  switch (preset) {
    case 'front': // Risco (X) x Retorno (Y)
      pos.set(50, 50, 240);
      break;
    case 'top': // Risco (X) x Maturidade (Z)
      pos.set(50, 240, 50);
      break;
    case 'side': // Maturidade (Z) x Retorno (Y)
      pos.set(240, 50, 50);
      break;
    case 'isometric':
    default:
      pos.set(160, 150, 180);
      break;
  }

  if (animateCam) {
    smoothMoveCamera(pos, target);
  } else {
    camera.position.copy(pos);
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
  }
}

/**
 * Animação fluida de transição de câmera
 */
function smoothMoveCamera(targetPos, targetLookAt, duration = 600) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Smooth cosine ease

    camera.position.lerpVectors(startPos, targetPos, ease);
    controls.target.lerpVectors(startTarget, targetLookAt, ease);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/**
 * -------------------------------------------------------------
 * INTERATIVIDADE: RAYCASTING (HOVER E CLICK 3D)
 * -------------------------------------------------------------
 */
function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodeMeshes, false);

  const tooltip = document.getElementById('node-tooltip');

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    const action = hitMesh.userData.action;
    hoveredNode = hitMesh;
    document.body.style.cursor = 'pointer';

    // Show Tooltip
    const productFactor = ((action.risk / 100) * (action.returns / 100) * (action.maturity / 100) * 100).toFixed(1);
    document.getElementById('tooltip-title').textContent = action.title;
    document.getElementById('tooltip-body').innerHTML = `
      <div style="font-size:11px; margin-top:2px; line-height: 1.4;">
        <div><strong>Risco:</strong> ${action.risk}% | <strong>Retorno:</strong> ${action.returns}% | <strong>Maturidade:</strong> ${action.maturity}%</div>
        <div style="margin-top: 3px; color: var(--color-ink); font-weight: 600;">
          <strong>Heatmap (X×Y×Z):</strong> ${productFactor}%
        </div>
      </div>
    `;

    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
    tooltip.classList.add('visible');
  } else {
    hoveredNode = null;
    document.body.style.cursor = 'default';
    tooltip.classList.remove('visible');
  }
}

function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodeMeshes, false);

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    const actionId = hitMesh.userData.actionId;
    selectAction(actionId, true);
  }
}

/**
 * -------------------------------------------------------------
 * GESTÃO DE AÇÕES & SIDEBAR LIST
 * -------------------------------------------------------------
 */
function getFilteredActions() {
  return actions.filter(action => {
    const matchCategory = activeFilter === 'all' || action.category === activeFilter;
    const matchSearch = searchQuery === '' || 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.desc && action.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });
}

function renderActionList() {
  const container = document.getElementById('action-list-items');
  container.innerHTML = '';

  const filtered = getFilteredActions();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--color-body); font-size:13px;">
        Nenhuma ação encontrada com os filtros selecionados.
      </div>
    `;
    return;
  }

  filtered.forEach(action => {
    const isSelected = action.id === selectedActionId;
    const productFactor = ((action.risk / 100) * (action.returns / 100) * (action.maturity / 100) * 100).toFixed(1);
    const card = document.createElement('div');
    card.className = `action-card ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-id', action.id);

    card.innerHTML = `
      <div class="action-card-header">
        <span class="action-card-title">${action.title}</span>
        <span class="action-category-tag">${action.category}</span>
      </div>
      <div class="action-metrics-row">
        <div class="metric-col">
          <span class="metric-col-label">Risco</span>
          <span class="metric-col-val" style="color:var(--color-ink);">${action.risk}%</span>
        </div>
        <div class="metric-col">
          <span class="metric-col-label">Retorno</span>
          <span class="metric-col-val" style="color:var(--color-ink);">${action.returns}%</span>
        </div>
        <div class="metric-col">
          <span class="metric-col-label">Maturidade</span>
          <span class="metric-col-val" style="color:var(--color-ink);">${action.maturity}%</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 11px; color: var(--color-body); border-top: 1px dashed var(--color-border); padding-top: 5px;">
        <span>Heatmap (X×Y×Z):</span>
        <strong style="color: var(--color-ink);">${productFactor}%</strong>
      </div>
    `;

    card.addEventListener('click', () => {
      selectAction(action.id, true);
    });

    container.appendChild(card);
  });
}

/**
 * Seleciona uma ação, atualiza inspetor e foca a câmera no nó 3D
 */
function selectAction(actionId, focusCamera = false) {
  selectedActionId = actionId;
  const action = actions.find(a => a.id === actionId);

  // Atualizar visual da lista
  document.querySelectorAll('.action-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-id') === actionId);
  });

  // Re-renderizar nós 3D para atualizar seleção visual
  render3DNodes();

  // Atualizar Inspetor Lateral Direito
  renderInspector(action);

  // Animar câmera para focar no nó 3D selecionado (coordenadas diretas X, Y, Z)
  if (focusCamera && action) {
    const nodeTarget = new THREE.Vector3(action.risk, action.returns, action.maturity);
    const camOffset = new THREE.Vector3(35, 30, 45);
    const newCamPos = nodeTarget.clone().add(camOffset);
    smoothMoveCamera(newCamPos, nodeTarget, 500);
  }
}

/**
 * Renderiza o painel de inspeção de detalhes e análise de quadrantes
 */
function renderInspector(action) {
  const container = document.getElementById('inspector-content');
  if (!action) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 10px; color: var(--color-body);">
        <i data-lucide="mouse-pointer-click" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.5;"></i>
        <p style="font-size: 13px;">Selecione uma ação para visualizar a avaliação tridimensional.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Classificação Estratégica baseada nos 3 eixos (Monocromática)
  let badgeClass = 'badge-strategic';
  let badgeLabel = 'Projeto Estratégico';
  let quadrantAnalysis = '';

  if (action.risk <= 50 && action.returns >= 70) {
    badgeClass = 'badge-quick-win';
    badgeLabel = '⚡ Quick Win (Alto Retorno & Baixo Risco)';
    quadrantAnalysis = 'Ação de execução prioritária imediata. Excelente relação custo-benefício com baixo risco operacional de implementação.';
  } else if (action.risk > 70 && action.returns >= 70) {
    badgeClass = 'badge-critical';
    badgeLabel = '■ Ação Crítica de Alta Relevância';
    quadrantAnalysis = 'Ação fundamental para mitigação de risco de grandes paralisações ou segurança de processo com alto valor preservado.';
  } else if (action.maturity >= 70) {
    badgeClass = 'badge-strategic';
    badgeLabel = '◆ Excelência & Alta Maturidade';
    quadrantAnalysis = 'Iniciativa que eleva o patamar de maturidade corporativa, exigindo engenharia de confiabilidade e tecnologia preditiva avançada.';
  } else {
    badgeClass = 'badge-foundation';
    badgeLabel = '● Ação Fundacional / Rotina';
    quadrantAnalysis = 'Ação necessária para sustentação da rotina e consolidação dos processos básicos de manutenção.';
  }

  container.innerHTML = `
    <div>
      <div class="inspector-quadrant-badge ${badgeClass}">${badgeLabel}</div>
      <h2 class="inspector-title" style="margin-top: 10px;">${action.title}</h2>
      <div style="font-size:12px; color:var(--color-body); margin-top:4px;">
        Categoria: <strong>${action.category}</strong> ${action.owner ? `| Resp: <strong>${action.owner}</strong>` : ''}
      </div>
    </div>

    <p class="inspector-desc">${action.desc || 'Nenhuma descrição detalhada informada.'}</p>

    <!-- Score Meters (0 - 100%) -->
    <div class="score-meters-box">
      <div class="meter-row">
        <div class="meter-header">
          <span>Risco Mitigado (Eixo X)</span>
          <span>${action.risk}%</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill fill-risk" style="width: ${action.risk}%;"></div>
        </div>
      </div>

      <div class="meter-row">
        <div class="meter-header">
          <span>Retorno Esperado (Eixo Y)</span>
          <span>${action.returns}%</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill fill-return" style="width: ${action.returns}%;"></div>
        </div>
      </div>

      <div class="meter-row">
        <div class="meter-header">
          <span>Maturidade da Atividade (Eixo Z)</span>
          <span>${action.maturity}%</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill fill-maturity" style="width: ${action.maturity}%;"></div>
        </div>
      </div>
    </div>

    <!-- Análise Técnica e Impacto -->
    <div style="background:#f8f8f8; padding:12px 14px; border-radius:8px; border:1px solid #e2e2e2; font-size:12px; line-height:1.5;">
      <strong>Diretriz de Decisão:</strong>
      <p style="margin-top:4px; color:var(--color-body);">${quadrantAnalysis}</p>
      ${action.impact ? `<div style="margin-top:8px;"><strong>Impacto Operacional:</strong> <span style="color:var(--color-body);">${action.impact}</span></div>` : ''}
      ${action.cost ? `<div style="margin-top:4px;"><strong>Custo Estimado:</strong> <span style="color:var(--color-ink); font-weight:700;">${action.cost}</span></div>` : ''}
    </div>

    <!-- Ações de Edição e Exclusão -->
    <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 16px;">
      <button class="btn-action" style="flex:1;" id="btn-edit-action" data-id="${action.id}">
        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
        Editar
      </button>
      <button class="btn-action" style="color:var(--color-body); border-color:var(--color-border);" id="btn-delete-action" data-id="${action.id}">
        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
        Excluir
      </button>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach button events
  document.getElementById('btn-edit-action')?.addEventListener('click', () => openEditModal(action.id));
  document.getElementById('btn-delete-action')?.addEventListener('click', () => deleteAction(action.id));
}

function updateActionCountBadge(count) {
  const badge = document.getElementById('action-count');
  if (badge) badge.textContent = count;
}

/**
 * -------------------------------------------------------------
 * MODAL: NOVA / EDITAR AÇÃO
 * -------------------------------------------------------------
 */
function openAddModal() {
  document.getElementById('modal-heading').textContent = 'Nova Ação de Manutenção';
  document.getElementById('form-action-id').value = '';
  document.getElementById('action-form').reset();
  
  // Valores padrão (0-100%)
  document.getElementById('form-risk').value = 50;
  document.getElementById('form-return').value = 75;
  document.getElementById('form-maturity').value = 70;
  updateFormSliderLabels();

  document.getElementById('modal-action').classList.add('open');
}

function openEditModal(actionId) {
  const action = actions.find(a => a.id === actionId);
  if (!action) return;

  document.getElementById('modal-heading').textContent = 'Editar Ação de Manutenção';
  document.getElementById('form-action-id').value = action.id;
  document.getElementById('form-title').value = action.title;
  document.getElementById('form-category').value = action.category;
  document.getElementById('form-risk').value = action.risk;
  document.getElementById('form-return').value = action.returns;
  document.getElementById('form-maturity').value = action.maturity;
  document.getElementById('form-desc').value = action.desc || '';
  
  updateFormSliderLabels();
  document.getElementById('modal-action').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-action').classList.remove('open');
}

function updateFormSliderLabels() {
  const risk = document.getElementById('form-risk').value;
  const returns = document.getElementById('form-return').value;
  const mat = document.getElementById('form-maturity').value;

  document.getElementById('val-risk-display').textContent = `${risk}%`;
  document.getElementById('val-return-display').textContent = `${returns}%`;
  document.getElementById('val-maturity-display').textContent = `${mat}%`;
}

function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-action-id').value;
  const title = document.getElementById('form-title').value.trim();
  const category = document.getElementById('form-category').value;
  const risk = parseInt(document.getElementById('form-risk').value, 10);
  const returns = parseInt(document.getElementById('form-return').value, 10);
  const maturity = parseInt(document.getElementById('form-maturity').value, 10);
  const desc = document.getElementById('form-desc').value.trim();

  if (id) {
    // Edit
    const index = actions.findIndex(a => a.id === id);
    if (index !== -1) {
      actions[index] = { ...actions[index], title, category, risk, returns, maturity, desc };
    }
  } else {
    // Add New
    const newAction = {
      id: 'act-' + Date.now(),
      title,
      category,
      risk,
      returns,
      maturity,
      desc,
      owner: 'PCM / Confiabilidade',
      cost: 'A definir'
    };
    actions.push(newAction);
    selectedActionId = newAction.id;
  }

  saveActionsToStorage();
  closeModal();
  renderActionList();
  render3DNodes();
  selectAction(selectedActionId || actions[actions.length - 1].id, true);
}

function deleteAction(actionId) {
  if (confirm('Tem certeza que deseja remover esta ação da matriz?')) {
    actions = actions.filter(a => a.id !== actionId);
    saveActionsToStorage();
    selectedActionId = actions.length > 0 ? actions[0].id : null;
    renderActionList();
    render3DNodes();
    selectAction(selectedActionId, false);
  }
}

function saveActionsToStorage() {
  localStorage.setItem('rca_matrix3d_actions', JSON.stringify(actions));
}

/**
 * -------------------------------------------------------------
 * EVENT LISTENERS SETUP
 * -------------------------------------------------------------
 */
function setupEventListeners() {
  // Preset Camera Buttons
  document.querySelectorAll('.cam-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      setCameraPreset(view, true);
    });
  });

  // Reset Camera
  document.getElementById('btn-reset-cam')?.addEventListener('click', () => {
    setCameraPreset('isometric', true);
  });

  // Export JSON
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(actions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "matriz_3d_manutencao.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Toggle Left Sidebar
  document.getElementById('btn-toggle-left')?.addEventListener('click', () => {
    document.getElementById('sidebar-drawer').classList.toggle('collapsed');
    setTimeout(onWindowResize, 300);
  });
  document.getElementById('btn-close-sidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar-drawer').classList.add('collapsed');
    setTimeout(onWindowResize, 300);
  });

  // Close Right Inspector
  document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
    document.getElementById('inspector-drawer').classList.add('collapsed');
    setTimeout(onWindowResize, 300);
  });

  // Add Action Button
  document.getElementById('btn-add-action')?.addEventListener('click', openAddModal);
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-form')?.addEventListener('click', closeModal);
  document.getElementById('action-form')?.addEventListener('submit', handleFormSubmit);

  // Form Sliders dynamic update
  ['form-risk', 'form-return', 'form-maturity'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateFormSliderLabels);
  });

  // Category Filter Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-cat');
      renderActionList();
      render3DNodes();
    });
  });

  // Search Input
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderActionList();
    render3DNodes();
  });

  // Shape Switcher (Spheres vs Cubes)
  document.getElementById('btn-shape-spheres')?.addEventListener('click', () => {
    nodeShape = 'spheres';
    document.getElementById('btn-shape-spheres').classList.add('active');
    document.getElementById('btn-shape-cubes').classList.remove('active');
    render3DNodes();
  });

  document.getElementById('btn-shape-cubes')?.addEventListener('click', () => {
    nodeShape = 'cubes';
    document.getElementById('btn-shape-cubes').classList.add('active');
    document.getElementById('btn-shape-spheres').classList.remove('active');
    render3DNodes();
  });

  // Labels Toggle
  document.getElementById('btn-toggle-labels')?.addEventListener('click', () => {
    showNodeLabels = !showNodeLabels;
    document.getElementById('btn-toggle-labels').classList.toggle('active', showNodeLabels);
    render3DNodes();
  });

  // Projections Toggle
  document.getElementById('btn-toggle-projections')?.addEventListener('click', () => {
    showProjections = !showProjections;
    document.getElementById('btn-toggle-projections').classList.toggle('active', showProjections);
    render3DNodes();
  });

  // Auto-rotate Toggle
  document.getElementById('btn-toggle-autorotate')?.addEventListener('click', () => {
    isAutoRotating = !isAutoRotating;
    document.getElementById('btn-toggle-autorotate').classList.toggle('active', isAutoRotating);
  });

  // 3D Canvas Raycasting Events
  const canvas = document.getElementById('webgl-canvas');
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('click', onPointerClick);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container || !renderer || !camera) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * -------------------------------------------------------------
 * RENDER LOOP & ANIMATION
 * -------------------------------------------------------------
 */
function animate() {
  requestAnimationFrame(animate);

  if (isAutoRotating && controls) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
  } else if (controls) {
    controls.autoRotate = false;
  }

  if (controls) {
    controls.update();
  }

  // Billboard effect: manter labels de eixos, rótulos e halos virados para a câmera
  if (axisLabelsGroup) {
    axisLabelsGroup.children.forEach(sprite => {
      sprite.lookAt(camera.position);
    });
  }

  if (nodeLabelsGroup) {
    nodeLabelsGroup.children.forEach(sprite => {
      sprite.lookAt(camera.position);
    });
  }

  renderer.render(scene, camera);
}

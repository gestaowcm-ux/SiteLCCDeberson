# Documentação de Interação: Matriz de Auditoria e Gráfico Radar (Audit Dashboard & Radar Chart)

Este documento especifica os padrões de comportamento interativo, renderização trigonométrica do Gráfico Radar em SVG e técnicas de performance para a página **Auditoria de Manutenção**, com base nos arquivos analisados do projeto SiteMentoria.

---

## Descrição da Funcionalidade

### 1. Painel de Auditoria Multi-Fase
O painel gerencia o ciclo completo de auditoria por meio de abas interativas representando cada fase (Iniciação, Planejamento, Aplicação, Relatório, Plano de Ação):
* **Filtros de Papel (Roles Split)**: Cada fase exibe as atribuições específicas divididas em três papéis chave: Sponsor, Auditor e Auditado. Ao mudar de fase, o script realiza um mapeamento para atualizar os cards de papéis com micro-animações de opacidade.
* **Checklists de Fase**: Cada fase tem um checklist interativo de tarefas que o usuário pode marcar para fins ilustrativos, com transição visual riscada sobre o texto ao ser selecionado.

### 2. Gráfico Radar Dinâmico (Spider/Radar Chart SVG)
O coração visual do módulo de auditoria é um Gráfico Radar trigonométrico desenhado 100% em SVG no lado do cliente:
* **Grupos de Critérios (Knowledge Groups)**: O gráfico mapeia áreas técnicas da manutenção (ex: Criticidade, Cadastro, CMMS, Mão de Obra, etc.).
* **Estrutura Geométrica do Gráfico**:
  * O centro do gráfico é definido em $(X=200, Y=200)$ de uma viewBox de $400 \times 400$.
  * O raio máximo da matriz de pontuação (nível 5) é $RAIO = 150px$.
  * Teias poligonais concêntricas de nível 1 a 5 são desenhadas em SVG para servir de grade de referência.
* **Projeção de Coordenadas**:
  * Para cada um dos $N$ grupos de critérios, o ângulo em radianos é calculado dividindo o círculo:
    $$\theta = \left(\frac{2\pi}{N}\right) \times i - \left(\frac{\pi}{2}\right)$$
    *(Subtrai-se $\pi/2$ para rotacionar o primeiro vértice para o topo central do gráfico).*
  * A coordenada do score do critério (de 1 a 5) é mapeada a partir do centro:
    $$X = Centro_X + Raio_{score} \times \cos(\theta)$$
    $$Y = Centro_Y + Raio_{score} \times \sin(\theta)$$
    *(Onde $Raio_{score} = (score / 5) \times RAIO_{max}$).*
* **Atualização Reativa (Slider Binding)**:
  * Quando o usuário clica em um critério da lista, a interface abre a barra de notas (de 1 a 5).
  * Ao arrastar o slider, a nota correspondente é alterada em tempo real no estado local da aplicação, e o elemento `<polygon>` que representa a área preenchida das pontuações do usuário reconstrói seu atributo `points` dinamicamente.
  * O gráfico também atualiza em tempo real um badge central com a **Nota Média Global** ponderada ou aritmética.

---

## Guia Conceitual de Performance

### 1. Cálculos de Math Caching
* As operações trigonométricas (`Math.sin`, `Math.cos`) para as direções angulares de cada critério não precisam ser calculadas a cada frame de interação do slider. Elas são computadas uma única vez no carregamento da página e salvas em um array de fatores de escala angulares (`{cosFactor, sinFactor}`).
* Durante o arrastar do slider, o script realiza apenas multiplicações simples ($Raio \times cosFactor$) para recalcular o polígono, economizando processamento de CPU.

### 2. Renderização do Polígono de Dados
* Em vez de limpar e recriar nós SVG, o polígono de dados (`<polygon id="user-path">`) é mantido estático. Somente o seu atributo de vértices `points` é substituído na string de dados (`polygon.setAttribute('points', pointsString)`), o que aciona o pipeline de desenho acelerado por hardware do navegador de forma otimizada.

---

## Código de Exemplo Completo

Abaixo está a implementação autônoma completa do Gráfico Radar dinâmico interativo usando SVG e Vanilla JS.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador de Auditoria & Gráfico Radar</title>
  <style>
    :root {
      --color-bg: #09090b;
      --color-panel: #18181b;
      --color-border: #27272a;
      --color-text: #f4f4f5;
      --color-text-dim: #a1a1aa;
      --color-accent: #10b981;
      --color-accent-dim: rgba(16, 185, 129, 0.15);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
      width: 100%;
      max-width: 900px;
      justify-content: center;
    }

    .card {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      flex: 1;
      min-width: 320px;
    }

    .chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h2 { font-size: 20px; margin-bottom: 15px; }

    /* List of Criteria */
    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .crit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .crit-item:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .crit-item.active {
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .crit-score {
      font-weight: 700;
      color: var(--color-accent);
    }

    /* Slider Container */
    .slider-box {
      margin-top: 20px;
      padding: 16px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      display: none;
    }
    .slider-box.visible { display: block; }
    .slider-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
    }

    input[type="range"] {
      width: 100%;
      cursor: pointer;
    }

    /* Radar SVG styles */
    .radar-grid {
      fill: none;
      stroke: #3f3f46;
      stroke-width: 1;
    }
    .radar-axis {
      stroke: #3f3f46;
      stroke-width: 1;
    }
    .radar-user-path {
      fill: rgba(16, 185, 129, 0.25);
      stroke: var(--color-accent);
      stroke-width: 2.5;
    }
    .radar-label {
      font-size: 9px;
      fill: var(--color-text-dim);
      font-weight: 600;
    }
    .average-badge {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-accent);
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- Graphic Card (Radar Chart) -->
    <div class="card chart-container">
      <h2>Gráfico de Maturação</h2>
      
      <svg id="radar" width="360" height="360" viewBox="0 0 400 400">
        <!-- Inside here we will dynamically generate the teia grid and axis lines -->
        <g id="radar-grid-group"></g>
        <!-- The user score polygon path -->
        <polygon id="user-path" class="radar-user-path" points=""></polygon>
        <g id="radar-axis-group"></g>
        <g id="radar-labels-group"></g>
      </svg>

      <div class="average-badge">
        Média Geral: <span id="avg-val">3.0</span> / 5.0
      </div>
    </div>

    <!-- Controls Card -->
    <div class="card">
      <h2>Áreas Críticas de Auditoria</h2>
      <p style="color:var(--color-text-dim); font-size:13px; margin-bottom:15px;">Selecione um critério para alterar sua nota:</p>

      <div class="criteria-list" id="criteria-list"></div>

      <div class="slider-box" id="slider-box">
        <div class="slider-header">
          <span id="slider-title">Critério</span>
          <span>Nota: <strong id="slider-val" style="color:var(--color-accent)">3</strong></span>
        </div>
        <input type="range" id="score-range" min="1" max="5" value="3">
      </div>
    </div>

  </div>

  <script>
    // 1. Audit State
    const CRITERIA = [
      { name: "Taxonomia & Ativos", score: 3 },
      { name: "Preenchimento OS", score: 4 },
      { name: "Integração CMMS", score: 2 },
      { name: "Matriz Qualificação", score: 4 },
      { name: "Análise de RCA", score: 3 },
      { name: "Preditiva e Óleo", score: 2 }
    ];

    let activeIndex = null;

    const CX = 200;
    const CY = 200;
    const MAX_R = 140;
    const TOTAL_GRPS = CRITERIA.length;

    // Prefil angles cache
    const angles = [];
    for(let i=0; i<TOTAL_GRPS; i++) {
      const angle = (2 * Math.PI / TOTAL_GRPS) * i - (Math.PI / 2);
      angles.push({
        cos: Math.cos(angle),
        sin: Math.sin(angle)
      });
    }

    // Elements
    const gridGrp = document.getElementById('radar-grid-group');
    const axisGrp = document.getElementById('radar-axis-group');
    const labelsGrp = document.getElementById('radar-labels-group');
    const userPath = document.getElementById('user-path');
    const criteriaList = document.getElementById('criteria-list');
    const sliderBox = document.getElementById('slider-box');
    const sliderTitle = document.getElementById('slider-title');
    const sliderVal = document.getElementById('slider-val');
    const scoreRange = document.getElementById('score-range');
    const avgVal = document.getElementById('avg-val');

    // Init Radar Grid Lines
    function initRadarGrid() {
      // Draw 5 rings (web)
      for (let lvl = 1; lvl <= 5; lvl++) {
        const r = (lvl / 5) * MAX_R;
        const pts = [];
        for (let i = 0; i < TOTAL_GRPS; i++) {
          const x = CX + r * angles[i].cos;
          const y = CY + r * angles[i].sin;
          pts.push(`${x},${y}`);
        }
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', pts.join(' '));
        poly.setAttribute('class', 'radar-grid');
        gridGrp.appendChild(poly);
      }

      // Draw axis lines and text anchors
      for (let i = 0; i < TOTAL_GRPS; i++) {
        const x = CX + MAX_R * angles[i].cos;
        const y = CY + MAX_R * angles[i].sin;
        
        // axis line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', CX);
        line.setAttribute('y1', CY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'radar-axis');
        axisGrp.appendChild(line);

        // Label
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', CX + (MAX_R + 24) * angles[i].cos);
        txt.setAttribute('y', CY + (MAX_R + 12) * angles[i].sin);
        txt.setAttribute('class', 'radar-label');
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = CRITERIA[i].name;
        labelsGrp.appendChild(txt);
      }
    }

    // Update Scores Visual Radar Polygon
    function updateRadarScores() {
      const pts = [];
      let totalScore = 0;

      for (let i = 0; i < TOTAL_GRPS; i++) {
        const r = (CRITERIA[i].score / 5) * MAX_R;
        const x = CX + r * angles[i].cos;
        const y = CY + r * angles[i].sin;
        pts.push(`${x},${y}`);

        totalScore += CRITERIA[i].score;
      }

      userPath.setAttribute('points', pts.join(' '));
      avgVal.textContent = (totalScore / TOTAL_GRPS).toFixed(1);
    }

    // Populate List
    function renderCriteriaList() {
      criteriaList.innerHTML = '';
      CRITERIA.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `crit-item ${idx === activeIndex ? 'active' : ''}`;
        div.innerHTML = `
          <span>${item.name}</span>
          <span class="crit-score">${item.score} / 5</span>
        `;
        div.addEventListener('click', () => {
          activeIndex = idx;
          renderCriteriaList();
          openSlider(idx);
        });
        criteriaList.appendChild(div);
      });
    }

    function openSlider(idx) {
      const item = CRITERIA[idx];
      sliderBox.classList.add('visible');
      sliderTitle.textContent = item.name;
      sliderVal.textContent = item.score;
      scoreRange.value = item.score;
    }

    scoreRange.addEventListener('input', (e) => {
      if (activeIndex === null) return;
      const score = parseInt(e.target.value, 10);
      CRITERIA[activeIndex].score = score;
      sliderVal.textContent = score;
      renderCriteriaList();
      updateRadarScores();
    });

    // Init
    initRadarGrid();
    updateRadarScores();
    renderCriteriaList();
  </script>
</body>
</html>
```

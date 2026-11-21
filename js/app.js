// app.js - Lógica interativa da Landing Page de Confiabilidade

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Navegação de Scroll (IntersectionObserver) para o Split-Screen
     ========================================================================== */
  const steps = document.querySelectorAll('.scroll-step');
  const frames = document.querySelectorAll('.widget-frame');
  const boardTitle = document.getElementById('visual-board-title');
  const widgetStatus = document.getElementById('widget-status');

  const stepMeta = {
    'step-bathtub': { title: 'Taxa de Falhas', status: 'Simulação da Curva Banheira' },
    'step-risk': { title: 'Matriz de Criticidade', status: 'Matriz de Criticidade 5x5' },
    'step-calc': { title: 'Cálculo de Disponibilidade', status: 'Cálculo de Disponibilidade' },
    'step-rbd': { title: 'Diagrama de Blocos (RBD)', status: 'Simulação de Redundância RBD' }
  };

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', // Aciona quando a etapa está centrada no viewport
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Desativa todas as etapas e ativa a atual no scroll
        steps.forEach(s => s.classList.remove('active'));
        entry.target.classList.add('active');

        // Determina qual widget ativar
        const stepId = entry.target.id;
        const widgetId = entry.target.getAttribute('data-widget');
        
        // Ativa o frame correspondente à direita
        frames.forEach(f => {
          f.classList.remove('active');
          if (f.id === widgetId || f.id === `${widgetId}-frame`) {
            f.classList.add('active');
          }
        });

        // Atualiza cabeçalho e rodapé do painel visual
        if (stepMeta[stepId]) {
          boardTitle.textContent = stepMeta[stepId].title;
          widgetStatus.textContent = stepMeta[stepId].status;
        }
      }
    });
  }, observerOptions);

  steps.forEach(step => observer.observe(step));


  /* ==========================================================================
     2. Simulador da Curva Banheira (Step 2)
     ========================================================================== */
  const slideInfant = document.getElementById('slide-infant');
  const slideWearout = document.getElementById('slide-wearout');
  const valInfant = document.getElementById('val-infant');
  const valWearout = document.getElementById('val-wearout');
  const bathtubCurve = document.getElementById('bathtub-curve');

  function updateBathtubCurve() {
    const infantVal = parseFloat(slideInfant.value);
    const wearoutVal = parseFloat(slideWearout.value);

    // Atualiza os labels textuais
    if (infantVal < 50) valInfant.textContent = 'Baixa (Pós-revisão)';
    else if (infantVal < 100) valInfant.textContent = 'Normal';
    else valInfant.textContent = 'Alta (Falta QC)';

    if (wearoutVal < 50) valWearout.textContent = 'Tardia (Excelente)';
    else if (wearoutVal < 100) valWearout.textContent = 'Normal';
    else valWearout.textContent = 'Precoce (Fadiga)';

    // Recalcula o path da curva
    // SVG viewBox="0 0 400 200". O chão do gráfico é y=180.
    // y_infant inicia na esquerda: 180 - infantVal.
    // y_wearout termina na direita: 180 - wearoutVal.
    const startY = 180 - infantVal;
    const endY = 180 - wearoutVal;
    const midY = 150; // Período útil

    // Atualiza o path com curvas Bézier cúbicas suaves
    bathtubCurve.setAttribute('d', `M 0,${startY} C 30,${startY} 60,${midY} 100,${midY} L 280,${midY} C 320,${midY} 370,${endY} 400,${endY}`);
  }

  if (slideInfant && slideWearout) {
    slideInfant.addEventListener('input', updateBathtubCurve);
    slideWearout.addEventListener('input', updateBathtubCurve);
    updateBathtubCurve(); // Inicialização
  }


  /* ==========================================================================
     3. Matriz de Criticidade / Risco RCM (Step 3)
     ========================================================================== */
  const matrixGrid = document.getElementById('matrix-grid');
  const assetSelect = document.getElementById('matrix-asset-select');
  const riskBadge = document.getElementById('matrix-risk-badge');
  const strategyText = document.getElementById('matrix-strategy');

  // Estado dos ativos (salva a seleção de Probabilidade e Severidade por ativo)
  const assetStates = {
    turbine: { prob: 2, sev: 5 }, // Baixa probabilidade, Alta consequência
    pump: { prob: 4, sev: 3 },    // Média-alta probabilidade, Média consequência
    compressor: { prob: 3, sev: 2 } // Média probabilidade, Baixa consequência
  };

  const strategies = {
    low: {
      label: 'Baixo',
      text: '<strong>Estratégia RTF (Run-to-Failure):</strong> Manutenção corretiva reativa pós-quebra. Indicado devido ao baixo custo de reposição e baixo impacto operacional.'
    },
    medium: {
      label: 'Médio',
      text: '<strong>Estratégia Preventiva Sistemática:</strong> Inspeção visual quinzenal, lubrificação calendarizada e substituição preventiva de vedações em paradas programadas.'
    },
    high: {
      label: 'Alto (Crítico)',
      text: '<strong>Estratégia Preditiva e RCM:</strong> Monitoramento contínuo de vibração, análise de óleo online, termografia semanal e plano detalhado de contingência de backup.'
    }
  };

  function selectMatrixCell(prob, sev) {
    // Limpa seleções anteriores nas células da matriz
    const cells = matrixGrid.querySelectorAll('.matrix-cell');
    cells.forEach(c => c.classList.remove('selected'));

    // Localiza e destaca a célula correspondente
    // Nota: Como a grid é montada linha por linha de cima (prob=5) para baixo (prob=1)
    // E da esquerda (sev=1) para a direita (sev=5), buscamos os atributos corretos.
    const targetCell = matrixGrid.querySelector(`.matrix-cell[data-prob="${prob}"][data-sev="${sev}"]`);
    if (targetCell) {
      targetCell.classList.add('selected');
    }

    // Calcula e atualiza a criticidade
    const riskScore = prob * sev;
    let category = 'low';
    if (riskScore > 12) {
      category = 'high';
    } else if (riskScore > 5) {
      category = 'medium';
    }

    // Atualiza UI
    riskBadge.textContent = strategies[category].label;
    riskBadge.className = `risk-badge ${category}`;
    strategyText.innerHTML = strategies[category].text;
  }

  function handleAssetChange() {
    const selectedAsset = assetSelect.value;
    const state = assetStates[selectedAsset];
    if (state) {
      selectMatrixCell(state.prob, state.sev);
    }
  }

  // Configura cliques nas células da matriz
  if (matrixGrid) {
    matrixGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.matrix-cell');
      if (cell) {
        const prob = parseInt(cell.getAttribute('data-prob'));
        const sev = parseInt(cell.getAttribute('data-sev'));
        
        // Atualiza estado do ativo atual
        const currentAsset = assetSelect.value;
        assetStates[currentAsset] = { prob, sev };

        // Aplica a seleção
        selectMatrixCell(prob, sev);
      }
    });

    assetSelect.addEventListener('change', handleAssetChange);
    handleAssetChange(); // Inicialização do ativo padrão (pump)
  }


  /* ==========================================================================
     4. Calculadora Dinâmica MTBF / MTTR (Step 4)
     ========================================================================== */
  const slideMtbf = document.getElementById('slide-mtbf');
  const slideMttr = document.getElementById('slide-mttr');
  const valMtbf = document.getElementById('val-mtbf');
  const valMttr = document.getElementById('val-mttr');
  const gaugeProgress = document.getElementById('gauge-progress');
  const gaugePercentage = document.getElementById('gauge-percentage');
  const uptimeSummary = document.getElementById('uptime-summary');
  const heroAvailability = document.getElementById('hero-availability');

  function updateAvailability() {
    const mtbf = parseFloat(slideMtbf.value);
    const mttr = parseFloat(slideMttr.value);

    // Atualiza labels de controle
    valMtbf.textContent = `${mtbf}h`;
    valMttr.textContent = `${mttr}h`;

    // Calcula Disponibilidade: A = MTBF / (MTBF + MTTR)
    const availability = mtbf / (mtbf + mttr);
    const percentage = availability * 100;
    
    // Atualiza o texto do velocímetro
    gaugePercentage.textContent = `${percentage.toFixed(2)}%`;

    // Atualiza o círculo de progresso da gauge
    // stroke-dasharray é 283. O offset vai de 283 (0%) a 0 (100%)
    const offset = 283 * (1 - availability);
    gaugeProgress.style.strokeDashoffset = offset;

    // Se a disponibilidade for muito baixa, muda a cor do fill para vermelho/laranja
    if (percentage < 90) {
      gaugeProgress.style.stroke = 'var(--color-danger)';
    } else if (percentage < 97) {
      gaugeProgress.style.stroke = 'var(--color-warning)';
    } else {
      gaugeProgress.style.stroke = 'var(--color-ink)';
    }

    // Calcula tempo fora de operação anual (Total horas ano = 8760)
    const annualDowntimeHours = 8760 * (1 - availability);
    const annualDowntimeDays = annualDowntimeHours / 24;

    if (annualDowntimeDays < 1) {
      uptimeSummary.innerHTML = `Excelente! Apenas <strong>${annualDowntimeHours.toFixed(1)} horas</strong> fora de operação por ano.`;
    } else {
      uptimeSummary.innerHTML = `Equivale a <strong>${annualDowntimeDays.toFixed(1)} dias</strong> (${annualDowntimeHours.toFixed(0)}h) fora do ar por ano.`;
    }

    // Sincroniza com a porcentagem mostrada no mockup do Hero
    if (heroAvailability) {
      heroAvailability.textContent = `${percentage.toFixed(1)}%`;
    }
  }

  if (slideMtbf && slideMttr) {
    slideMtbf.addEventListener('input', updateAvailability);
    slideMttr.addEventListener('input', updateAvailability);
    updateAvailability(); // Inicialização
  }

  /* ==========================================================================
     5. Simulador de Diagrama de Blocos de Confiabilidade (RBD)
     ========================================================================== */
  const slideRbdT = document.getElementById('slide-rbd-t');
  const slideRbdMtbf1 = document.getElementById('slide-rbd-mtbf1');
  const slideRbdMtbf2 = document.getElementById('slide-rbd-mtbf2');

  const valRbdT = document.getElementById('val-rbd-t');
  const valRbdMtbf1 = document.getElementById('val-rbd-mtbf1');
  const valRbdMtbf2 = document.getElementById('val-rbd-mtbf2');

  const rbdRsysValue = document.getElementById('rbd-rsys-value');
  const tabBtns = document.querySelectorAll('.rbd-tab-btn');

  let activeConfig = 'series';

  function calculateRsys(t, mtbf1, mtbf2, config) {
    const R1 = Math.exp(-t / mtbf1);
    const R2 = Math.exp(-t / mtbf2);

    if (config === 'series') {
      return { Rsys: R1 * R2, R1, R2 };
    } else if (config === 'parallel') {
      return { Rsys: 1 - (1 - R1) * (1 - R2), R1, R2 };
    } else if (config === 'standby') {
      let Rsys = 0;
      if (Math.abs(mtbf1 - mtbf2) < 0.01) {
        Rsys = R1 * (1 + t / mtbf1);
      } else {
        Rsys = R1 + (mtbf2 / (mtbf2 - mtbf1)) * (R2 - R1);
      }
      return { Rsys, R1, R2 };
    }
    return { Rsys: 0, R1: 0, R2: 0 };
  }

  function createSVGLine(x1, y1, x2, y2, isActive, className = 'rbd-line') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', className + (isActive ? ' active' : ''));
    return line;
  }

  function createSVGPath(d, isActive, className = 'rbd-line') {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className + (isActive ? ' active' : ''));
    return path;
  }

  function createSVGCircle(cx, cy, r) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'var(--color-mute)');
    return circle;
  }

  function createSVGBlock(x, y, w, h, name, subtitle, state) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('class', `rbd-block-rect ${state}`);
    
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', x + w / 2);
    text1.setAttribute('y', y + 16);
    text1.setAttribute('class', 'rbd-block-text');
    text1.textContent = name;

    const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', x + w / 2);
    text2.setAttribute('y', y + h - 8);
    text2.setAttribute('class', 'rbd-block-subtext');
    text2.textContent = subtitle;

    group.appendChild(rect);
    group.appendChild(text1);
    group.appendChild(text2);
    return group;
  }

  function drawRBDCanvas(config, t, mtbf1, mtbf2, R1, R2) {
    const svg = document.getElementById('rbd-svg');
    if (!svg) return;
    svg.innerHTML = ''; // Limpa

    // Limiar operacional arbitrário (R >= 0.368, ou seja, e^-1)
    const aActive = t < mtbf1;
    const bActive = Math.exp(-t / mtbf2) >= 0.368;

    if (config === 'series') {
      const activeLine = aActive && bActive;
      const line1 = createSVGLine(0, 60, 60, 60, activeLine);
      const line2 = createSVGLine(130, 60, 190, 60, activeLine);
      const line3 = createSVGLine(260, 60, 320, 60, activeLine);

      const blockA = createSVGBlock(60, 42, 70, 36, 'Bloco A', `R=${(R1*100).toFixed(0)}%`, aActive ? 'active' : 'inactive');
      const blockB = createSVGBlock(190, 42, 70, 36, 'Bloco B', `R=${(R2*100).toFixed(0)}%`, bActive ? 'active' : 'inactive');

      svg.appendChild(line1);
      svg.appendChild(line2);
      svg.appendChild(line3);
      svg.appendChild(blockA);
      svg.appendChild(blockB);
    } else if (config === 'parallel') {
      const activeLine = aActive || bActive;
      const lineIn = createSVGLine(0, 60, 60, 60, activeLine);
      const lineSplit = createSVGPath('M 60,60 L 60,33 L 125,33 M 60,60 L 60,87 L 125,87', activeLine);
      const lineMerge = createSVGPath('M 195,33 L 260,33 L 260,60 M 195,87 L 260,87 L 260,60', activeLine);
      const lineOut = createSVGLine(260, 60, 320, 60, activeLine);

      const blockA = createSVGBlock(125, 15, 70, 36, 'Bloco A', `R=${(R1*100).toFixed(0)}%`, aActive ? 'active' : 'inactive');
      const blockB = createSVGBlock(125, 69, 70, 36, 'Bloco B', `R=${(R2*100).toFixed(0)}%`, bActive ? 'active' : 'inactive');

      svg.appendChild(lineIn);
      svg.appendChild(lineSplit);
      svg.appendChild(lineMerge);
      svg.appendChild(lineOut);
      svg.appendChild(blockA);
      svg.appendChild(blockB);
    } else if (config === 'standby') {
      const aFailed = t >= mtbf1;
      const sysActive = !aFailed ? aActive : bActive;

      const lineIn = createSVGLine(0, 60, 45, 60, sysActive);
      const switchY = !aFailed ? 38 : 82;
      const switchLine = createSVGLine(45, 60, 75, switchY, sysActive);

      const lineA = createSVGLine(75, 38, 100, 38, !aFailed);
      const lineB = createSVGLine(75, 82, 100, 82, aFailed && bActive);

      const lineAOut = createSVGLine(170, 38, 220, 38, !aFailed);
      const lineBOut = createSVGLine(170, 82, 220, 82, aFailed && bActive);
      const lineMerge = createSVGPath('M 220,38 L 250,38 L 250,60 M 220,82 L 250,82 L 250,60', sysActive);
      const lineOut = createSVGLine(250, 60, 320, 60, sysActive);

      const stateA = !aFailed ? 'active' : 'inactive';
      const stateB = !aFailed ? 'standby' : (bActive ? 'active' : 'inactive');

      const blockA = createSVGBlock(100, 20, 70, 36, 'Bloco A', !aFailed ? `R=${(R1*100).toFixed(0)}%` : 'FALHOU', stateA);
      const blockB = createSVGBlock(100, 64, 70, 36, 'Bloco B', !aFailed ? 'STANDBY' : `R=${(R2*100).toFixed(0)}%`, stateB);

      const circleIn = createSVGCircle(45, 60, 3);
      const circleA = createSVGCircle(75, 38, 3);
      const circleB = createSVGCircle(75, 82, 3);

      svg.appendChild(lineIn);
      svg.appendChild(switchLine);
      svg.appendChild(lineA);
      svg.appendChild(lineB);
      svg.appendChild(lineAOut);
      svg.appendChild(lineBOut);
      svg.appendChild(lineMerge);
      svg.appendChild(lineOut);
      svg.appendChild(blockA);
      svg.appendChild(blockB);
      svg.appendChild(circleIn);
      svg.appendChild(circleA);
      svg.appendChild(circleB);

      if (aFailed) {
        const xMark = createSVGPath('M 120,25 L 150,51 M 150,25 L 120,51', false, 'x-mark');
        xMark.setAttribute('stroke', 'var(--color-danger)');
        xMark.setAttribute('stroke-width', '2.5');
        svg.appendChild(xMark);
      }
    }
  }

  function updateRBDChart(config, mtbf1, mtbf2, currentT) {
    const path = document.getElementById('rbd-chart-path');
    const marker = document.getElementById('rbd-chart-marker');
    if (!path || !marker) return;

    let points = [];
    for (let t = 0; t <= 1000; t += 50) {
      const { Rsys } = calculateRsys(t, mtbf1, mtbf2, config);
      const x = t / 10;
      const y = 50 * (1 - Rsys);
      points.push(`${x},${y}`);
    }

    path.setAttribute('d', `M ${points.join(' L ')}`);
    marker.setAttribute('x1', currentT / 10);
    marker.setAttribute('x2', currentT / 10);
  }

  function updateRBD() {
    if (!slideRbdT || !slideRbdMtbf1 || !slideRbdMtbf2) return;

    const t = parseFloat(slideRbdT.value);
    const mtbf1 = parseFloat(slideRbdMtbf1.value);
    const mtbf2 = parseFloat(slideRbdMtbf2.value);

    // Atualiza labels numéricos
    valRbdT.textContent = `${t}h`;
    valRbdMtbf1.textContent = `${mtbf1}h`;
    valRbdMtbf2.textContent = `${mtbf2}h`;

    // Calcula Rsys, R1, R2
    const { Rsys, R1, R2 } = calculateRsys(t, mtbf1, mtbf2, activeConfig);

    // Atualiza percentual de Rsys na tela
    rbdRsysValue.textContent = `${(Rsys * 100).toFixed(1)}%`;

    // Desenha diagrama de blocos SVG
    drawRBDCanvas(activeConfig, t, mtbf1, mtbf2, R1, R2);

    // Desenha mini gráfico
    updateRBDChart(activeConfig, mtbf1, mtbf2, t);
  }

  if (slideRbdT && slideRbdMtbf1 && slideRbdMtbf2) {
    slideRbdT.addEventListener('input', updateRBD);
    slideRbdMtbf1.addEventListener('input', updateRBD);
    slideRbdMtbf2.addEventListener('input', updateRBD);

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeConfig = e.target.getAttribute('data-config');
        updateRBD();
      });
    });

    updateRBD(); // Inicialização do RBD
  }


  // Modal "Diferenciais da minha Mentoria" gerenciado por mentoria-modal.js

  /* ==========================================================================
     5. Lógica de Sanfona das Perguntas Frequentes (FAQ Accordion)
     ========================================================================== */
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const faqAnswer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');
      
      // Fecha outros itens de FAQ abertos
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        faqItem.classList.add('active');
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
      }
    });
  });
});

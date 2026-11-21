// caminho-da-confiabilidade.js — Caminho da Confiabilidade interactivity

// ── Phase Data ──────────────────────────────────────────────────────────────
const PHASES = {
  conceito: {
    tag: 'Fase 1 · Concepção',
    title: 'Conceito, Desenho & Especificação',
    description:
      'A fase de concepção é onde se define a estratégia de manutenção para toda a vida do ativo. ' +
      'Decisões tomadas nesta etapa — como a escolha de tecnologia, redundâncias e acesso à manutenção — ' +
      'determinam mais de 80% dos custos totais de ciclo de vida. É o momento de aplicar o RCM na origem.',
    activities: [
      'Definição dos requisitos de confiabilidade (RAM)',
      'Seleção de tecnologia baseada em facilidade de manutenção',
      'Especificação de pontos de monitoramento preditivo',
      'Análise de FMEA na fase de projeto',
      'Definição de estratégia de sobressalentes críticos',
    ],
  },
  compra: {
    tag: 'Fase 2 · Aquisição',
    title: 'Compra',
    description:
      'A aquisição vai além do preço de compra. O custo total de propriedade (TCO) deve incluir ' +
      'custos de instalação, treinamento, manutenção e descarte. Especificações técnicas rigorosas ' +
      'e qualificação de fornecedores garantem que o ativo chegue com o nível de confiabilidade contratado.',
    activities: [
      'Avaliação de custo total de propriedade (TCO)',
      'Qualificação e auditoria de fornecedores',
      'Negociação de garantias e níveis de serviço (SLA)',
      'Especificação de documentação técnica (manuais, peças)',
      'Exigência de testes de aceitação em fábrica (FAT)',
    ],
  },
  instalacao: {
    tag: 'Fase 3 · Instalação',
    title: 'Instalação',
    description:
      'A maioria das falhas da "mortalidade infantil" origina-se em erros de instalação. ' +
      'O correto alinhamento, torque adequado, condicionamento elétrico e proteções mecânicas ' +
      'definem se o ativo entrará na fase de operação útil ou na curva de mortalidade infantil da Curva Banheira.',
    activities: [
      'Inspeção de recebimento contra especificação técnica',
      'Alinhamento de eixos e balanceamento de rotores',
      'Torque de parafusos conforme tabela do fabricante',
      'Testes de isolamento elétrico e continuidade',
      'Registro fotográfico e documentação de instalação',
    ],
  },
  comissionamento: {
    tag: 'Fase 4 · Comissionamento',
    title: 'Comissionamento',
    description:
      'O comissionamento valida que o ativo instalado atende às especificações funcionais em condições reais. ' +
      'É o momento de coletar as linhas de base de monitoramento preditivo — vibração, temperatura, corrente — ' +
      'que serão usadas como referência futura para detectar degradação.',
    activities: [
      'Testes de aceitação no local (SAT)',
      'Coleta de baseline de vibração, temperatura e corrente',
      'Verificação de todos os pontos de instrumentação',
      'Treinamento inicial das equipes de operação e manutenção',
      'Estabelecimento de parâmetros operacionais normais',
    ],
  },
  operacao: {
    tag: 'Fase 5 · Operação',
    title: 'Operação',
    description:
      'A fase de maior duração — e onde a estratégia de manutenção se executa continuamente. ' +
      'O objetivo é manter o ativo na "vida útil" da Curva Banheira: taxa de falhas constante e baixa, ' +
      'mediante monitoramento contínuo, operação dentro dos parâmetros de projeto e cumprimento do plano de manutenção.',
    activities: [
      'Operação dentro dos parâmetros de projeto (sem sobrecarga)',
      'Monitoramento contínuo de variáveis de processo',
      'Cumprimento do plano de manutenção preventiva',
      'Coleta e análise de ordens de serviço (MTBF/MTTR)',
      'Atualização contínua do plano de sobressalentes críticos',
    ],
  },
  preditiva: {
    tag: 'Manutenção · Preditiva',
    title: 'Manutenção Preditiva',
    description:
      'A estratégia de maior ROI: intervir apenas quando os indicadores mostram que o ativo atingiu o ' +
      'Ponto P da Curva P-F. Usa tecnologias de monitoramento de condição para detectar falhas potenciais ' +
      'com antecedência suficiente para programar a intervenção sem paradas não planejadas.',
    activities: [
      'Análise de vibração (rolamentos, desbalanceamento, desalinhamento)',
      'Termografia infravermelha (conexões elétricas, motores)',
      'Análise de óleo (contaminação, desgaste de partículas)',
      'Ultrassom (vazamentos, lubrificação, arcos elétricos)',
      'Monitoramento de corrente elétrica e tensão',
    ],
  },
  preventiva: {
    tag: 'Manutenção · Preventiva',
    title: 'Manutenção Preventiva',
    description:
      'Manutenção executada em intervalos fixos — tempo ou número de horas/ciclos — ' +
      'independentemente do estado de condição do ativo. Adequada quando o ativo tem padrão de ' +
      'falha previsível pelo tempo, quando a tecnologia de monitoramento não está disponível ' +
      'ou quando a falha não tem intervalo P-F detectável.',
    activities: [
      'Substituição periódica de componentes de desgaste (filtros, correias, velas)',
      'Lubrificação programada conforme plano do fabricante',
      'Calibração de instrumentos em intervalos fixos',
      'Inspeção visual programada e limpeza',
      'Revisão geral em grandes intervalos (overhaul)',
    ],
  },
  reativa: {
    tag: 'Manutenção · Reativa',
    title: 'Manutenção Reativa "Correção"',
    description:
      'Manutenção executada após a falha funcional — o ativo atingiu o Ponto F da Curva P-F. ' +
      'Estratégia deliberada e aceitável apenas para ativos não-críticos com custo de parada ' +
      'baixo e baixo impacto em segurança, qualidade e meio ambiente. Requer alta disponibilidade de sobressalentes.',
    activities: [
      'Diagnóstico rápido da causa raiz da falha',
      'Reparo ou substituição do componente falhado',
      'Alta disponibilidade de sobressalentes no estoque',
      'Análise pós-falha para evitar recorrência',
      'Revisão da estratégia se a falha for recorrente ou crítica',
    ],
  },
  descomissionamento: {
    tag: 'Fase Final · Descomissionamento',
    title: 'Descomissionamento',
    description:
      'O descomissionamento não é o fim — é o fechamento consciente de um ciclo. ' +
      'Ocorre quando o ativo atinge o ponto em que o custo de mantê-lo operando supera o valor que ele gera: ' +
      'custo de manutenção crescente, obsolescência tecnológica, indisponibilidade de peças ou risco inaceitável. ' +
      'Executado corretamente, o descomissionamento alimenta o próximo ciclo: os dados históricos de falha, ' +
      'os padrões de desgaste e as lições aprendidas tornam a próxima concepção mais confiável e econômica.',
    activities: [
      'Decisão baseada em dados: LCC (Life Cycle Cost) vs. valor residual',
      'Isolamento seguro com procedimento LOTO e permissão de trabalho',
      'Preservação e transferência do histórico técnico ao CMMS',
      'Gestão ambiental: descarte de fluidos, resíduos e materiais perigosos',
      'Análise das lições aprendidas para alimentar a próxima concepção',
    ],
  },
};

// ── Phase Explorer ───────────────────────────────────────────────────────────
function renderPhaseDetail(phaseKey) {
  const data = PHASES[phaseKey];
  if (!data) return;

  const contentEl = document.getElementById('phase-detail-content');
  if (!contentEl) return;

  const activitiesHTML = data.activities
    .map(act => `<li>${act}</li>`)
    .join('');

  contentEl.innerHTML = `
    <div class="detail-title">${data.title}</div>
    <div class="detail-body">
      <p class="detail-description">${data.description}</p>
      <div class="detail-activities">
        <div class="detail-activities-title">Principais atividades</div>
        <ul class="detail-activity-list">
          ${activitiesHTML}
        </ul>
      </div>
    </div>
  `;

  // Smooth transition: briefly remove visible to re-trigger, then re-add
  const card = document.getElementById('phase-detail');
  if (card) {
    card.classList.add('visible');
    
    // Set custom border color based on active phase
    const phaseColors = {
      conceito: '#1e293b',
      compra: '#1e293b',
      instalacao: '#1e293b',
      comissionamento: '#1e293b',
      operacao: '#1e293b',
      preditiva: '#1a6b8a',
      preventiva: '#3a7d44',
      reativa: '#b86a1e',
      descomissionamento: '#4b5563'
    };
    card.style.setProperty('--active-phase-border-color', phaseColors[phaseKey] || '#1e293b');
  }
}

function initPhaseFlow() {
  const buttons = document.querySelectorAll('[data-phase]');
  const container = document.getElementById('phase-flow');
  const indicator = document.getElementById('limelightIndicator');

  if (!buttons.length) return;

  let pinnedPhaseKey = 'conceito';
  let cachedPositions = [];

  const PHASE_COLORS = {
    conceito: { color: '#1e293b', rgb: '30, 41, 59' },
    compra: { color: '#1e293b', rgb: '30, 41, 59' },
    instalacao: { color: '#1e293b', rgb: '30, 41, 59' },
    comissionamento: { color: '#1e293b', rgb: '30, 41, 59' },
    operacao: { color: '#1e293b', rgb: '30, 41, 59' },
    preditiva: { color: '#1a6b8a', rgb: '26, 107, 138' },
    preventiva: { color: '#3a7d44', rgb: '58, 125, 68' },
    reativa: { color: '#b86a1e', rgb: '184, 106, 30' },
    descomissionamento: { color: '#4b5563', rgb: '75, 85, 99' }
  };

  // 1. Cache horizontal center positions relative to the container scroll context
  function cachePositions() {
    if (!container || !indicator) return;
    const containerRect = container.getBoundingClientRect();

    cachedPositions = Array.from(buttons).map(btn => {
      const wrapper = btn.querySelector('.step-icon-wrapper');
      if (!wrapper) return { left: 0 };

      const rect = wrapper.getBoundingClientRect();
      const wrapperCenter = (rect.left - containerRect.left) + container.scrollLeft + (rect.width / 2);
      const indicatorWidth = indicator.offsetWidth || 48;
      const leftPosition = wrapperCenter - (indicatorWidth / 2);

      return { left: leftPosition };
    });

    // Re-align indicator with current active element
    const currentActiveBtn = Array.from(buttons).find(b => b.classList.contains('active'));
    if (currentActiveBtn) {
      const index = Array.from(buttons).indexOf(currentActiveBtn);
      updateIndicator(index, currentActiveBtn.dataset.phase);
    }
  }

  // 2. Animate and color-tint the limelight indicator
  function updateIndicator(index, phaseKey) {
    if (!indicator || !cachedPositions[index]) return;

    indicator.style.transform = `translateX(${cachedPositions[index].left}px)`;
    indicator.style.opacity = '1';

    const colors = PHASE_COLORS[phaseKey] || PHASE_COLORS.conceito;
    indicator.style.setProperty('--limelight-color', colors.color);
    indicator.style.setProperty('--limelight-shadow', `0 2px 8px rgba(${colors.rgb}, 0.4)`);
    indicator.style.setProperty('--limelight-beam-start', `rgba(${colors.rgb}, 0.15)`);
  }

  // 3. Register hover, click, and leave events
  buttons.forEach((btn, index) => {
    // Hover: preview state and slide spotlight
    btn.addEventListener('mouseenter', () => {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      renderPhaseDetail(btn.dataset.phase);
      updateIndicator(index, btn.dataset.phase);
    });

    // Click: lock/pin the selected state
    btn.addEventListener('click', () => {
      pinnedPhaseKey = btn.dataset.phase;
    });
  });

  // Mouse leave: revert back to pinned phase
  if (container) {
    container.addEventListener('mouseleave', () => {
      const pinnedBtn = Array.from(buttons).find(b => b.dataset.phase === pinnedPhaseKey);
      if (pinnedBtn) {
        const index = Array.from(buttons).indexOf(pinnedBtn);

        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        pinnedBtn.classList.add('active');
        pinnedBtn.setAttribute('aria-selected', 'true');

        renderPhaseDetail(pinnedPhaseKey);
        updateIndicator(index, pinnedPhaseKey);
      }
    });
  }

  // 4. Initial setup
  renderPhaseDetail(pinnedPhaseKey);

  // Cache position measurements
  cachePositions();
  window.addEventListener('resize', cachePositions);
  window.addEventListener('load', cachePositions);

  // Late fallback to make sure layouts finished calculations
  setTimeout(cachePositions, 200);
}

// ── P-F Curve Slider ─────────────────────────────────────────────────────────
function getPFRecommendation(days) {
  if (days <= 30) {
    return 'monitoramento semanal de vibração e termografia contínua';
  } else if (days <= 90) {
    return 'monitoramento mensal com análise de vibração e óleo';
  } else if (days <= 180) {
    return 'monitoramento trimestral com análise de vibração';
  } else {
    return 'inspeção semestral com revisão do plano de manutenção preventiva';
  }
}

function initPFSlider() {
  const slider = document.getElementById('pf-interval-slider');
  const display = document.getElementById('pf-interval-display');
  const recommendation = document.getElementById('pf-recommendation-text');
  const pLineEl = document.getElementById('pf-p-line');
  const fLineEl = document.getElementById('pf-f-line');
  const intervalAreaEl = document.getElementById('pf-interval-area');

  if (!slider) return;

  const BASE_P_X = 220; // X of Ponto P
  const BASE_F_X = 310; // X of Ponto F
  const SVG_WIDTH = 380; // usable width (50 to 430)

  slider.addEventListener('input', () => {
    const days = parseInt(slider.value, 10);
    display.textContent = `${days} dias`;
    recommendation.textContent = getPFRecommendation(days);

    // Animate the P-F interval visually: move Ponto P earlier/later
    // Range: 14–365 days → map P-X between 140 and 280 (F stays at 310)
    const minDays = 14, maxDays = 365;
    const minPx = 140, maxPx = 295;
    const pX = maxPx - ((days - minDays) / (maxDays - minDays)) * (maxPx - minPx);

    if (pLineEl) {
      pLineEl.setAttribute('x1', pX);
      pLineEl.setAttribute('x2', pX);
    }
    if (intervalAreaEl) {
      intervalAreaEl.setAttribute('d',
        `M ${pX},66 C ${pX + 30},85 ${BASE_F_X - 30},120 ${BASE_F_X},160 L ${BASE_F_X},210 L ${pX},210 Z`
      );
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPhaseFlow();
  initPFSlider();
});

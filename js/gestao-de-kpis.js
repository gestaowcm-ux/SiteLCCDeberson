// gestao-de-kpis.js — KPI Management page-specific script

// ── 1. Ordem de Serviço Fields Data ──────────────────────────────────────────
const OS_FIELDS = {
  num_ordem: {
    category: 'Identificação',
    title: 'Número da Ordem',
    desc: 'Identificador único, exclusivo e sequencial de cada serviço. Impede duplicidade e garante a auditoria de todo o histórico técnico.',
    impact: 'Base de dados primária para quantificar o volume total de intervenções e backlog de ordens de serviço pendentes.',
    tip: '💡 Dica: Nunca reutilize ou apague números de ordens de serviço no banco de dados (CMMS/ERP).'
  },
  data_abertura: {
    category: 'Tempos',
    title: 'Data e Hora de Abertura',
    desc: 'Registro exato do momento em que a necessidade de manutenção foi detectada ou formalizada no sistema.',
    impact: 'Crucial para o cálculo do Tempo de Atendimento e para medir o tempo decorrido até a intervenção real (tempo de resposta).',
    tip: '💡 Dica: A abertura automática via alarmes SCADA reduz o viés de preenchimento manual.'
  },
  semana_programacao: {
    category: 'Planejamento',
    title: 'Semana de Programação',
    desc: 'Determina a janela semanal em que a atividade foi planejada e programada para ser executada pela equipe.',
    impact: 'Dado base para calcular o Cumprimento da Programação Semanal (Adherence to Schedule).',
    tip: '💡 Dica: Alterar este campo frequentemente sem justificativa mascara desvios de programação.'
  },
  local_funcional: {
    category: 'Taxonomia',
    title: 'Local Funcional',
    desc: 'Posição hierárquica do ativo na planta, representando o sistema de processo ao qual pertence (ex: Sistema de Bombeamento).',
    impact: 'Permite agrupar custos e analisar perdas de disponibilidade por sistemas ou áreas operacionais da fábrica.',
    tip: '💡 Dica: Use campos fechados (dropdown) no software para evitar variações ortográficas.'
  },
  ativo_tag: {
    category: 'Taxonomia',
    title: 'TAG do Ativo',
    desc: 'Código identificador específico do componente mecânico, elétrico ou de instrumentação sob manutenção (ex: Motor Elétrico).',
    impact: 'Essencial para a rastreabilidade do histórico de falhas individual, cálculo de MTBF e MTTR por TAG do equipamento.',
    tip: '💡 Dica: O TAG deve conter placa física visível no campo para facilitar a coleta do mantenedor.'
  },
  tipo_manutencao: {
    category: 'Tática',
    title: 'Tipo de Manutenção',
    desc: 'Classificação da natureza do trabalho: Corretiva (reativa), Preventiva (periódica), Preditiva (condição) ou Melhoria.',
    impact: 'Utilizado para calcular o percentual de horas gastas em ordens corretivas, preventivas e preditivas no total da planta.',
    tip: '💡 Dica: Limite as opções a tipos regulamentados (ex: NBR 5462) para evitar duplicidades.'
  },
  prioridade: {
    category: 'Planejamento',
    title: 'Prioridade da Ordem',
    desc: 'Nível de criticidade de atendimento estabelecido com base no impacto operacional da falha (geralmente de 1 a 5).',
    impact: 'Direciona as ações do planejador no cálculo do Backlog e no sequenciamento dos trabalhos da equipe técnica.',
    tip: '💡 Dica: Use matrizes de criticidade claras para evitar que tudo vire prioridade emergencial.'
  },
  oficina: {
    category: 'Recursos',
    title: 'Oficina / Especialidade',
    desc: 'Grupo de trabalho especializado responsável pela execução da manutenção (Mecânica, Elétrica, Calibração, etc.).',
    impact: 'Base de dados para dimensionar e balancear a carga de trabalho de Hh por especialidade e calcular a ociosidade.',
    tip: '💡 Dica: Facilita o agendamento de recursos e a contratação focada de prestadores táticos.'
  },
  sintoma: {
    category: 'Abertura',
    title: 'Sintoma / Prognóstico',
    desc: 'Relato inicial do operador ou solicitante descrevendo o desvio detectado (ruído, aquecimento, vazamento, paradas).',
    impact: 'Ajuda a equipe de inspeção e planejamento a definir as ferramentas e peças antes de enviar os mantenedores ao campo.',
    tip: '💡 Dica: Incentive a equipe a preencher com riqueza de detalhes qualitativos.'
  },
  data_fechamento: {
    category: 'Tempos',
    title: 'Data e Hora de Fechamento Técnico',
    desc: 'Momento exato em que a manutenção é concluída em campo e o ativo é disponibilizado novamente para a operação.',
    impact: 'Elemento fundamental para o cálculo do tempo real de reparo (MTTR) e da Disponibilidade operacional do ativo.',
    tip: '💡 Dica: O fechamento imediato no encerramento da jornada evita atrasos artificiais de MTTR.'
  },
  colaboradores: {
    category: 'Recursos',
    title: 'Executantes da Ordem',
    desc: 'Lista de profissionais (internos ou terceirizados) alocados para a realização física do trabalho técnico.',
    impact: 'Garante o controle de quem executou a atividade para auditoria e permite rastrear necessidades de treinamento técnico.',
    tip: '💡 Dica: O registro individual evita anonimato em caso de retrabalho ou falhas prematuras.'
  },
  horas_trabalhadas: {
    category: 'Recursos',
    title: 'Homem-Hora (Hh)',
    desc: 'Soma total do tempo efetivo despendido por todos os executantes para concluir a tarefa.',
    impact: 'Utilizado para calcular a produtividade (Wrench Time) e a apropriação dos custos de mão de obra direta da ordem.',
    tip: '💡 Dica: O preenchimento deve ser o tempo real de trabalho, descontando esperas ou deslocamentos.'
  },
  modo_falha: {
    category: 'Confiabilidade',
    title: 'Modo de Falha',
    desc: 'A forma física como a falha se manifestou no componente do ativo (ex: Rolamento quebrado, enrolamento queimado).',
    impact: 'Alimenta os estudos qualitativos de confiabilidade (FMEA/RCM) e ajuda na elaboração de planos para evitar recorrências.',
    tip: '💡 Dica: Utilize uma lista restrita com base na norma ISO 14224.'
  },
  causa_falha: {
    category: 'Confiabilidade',
    title: 'Causa da Falha',
    desc: 'O motivo de origem que levou ao modo de falha (ex: Falta de lubrificação, fadiga mecânica, erro de operação).',
    impact: 'Base para a Análise de Causa Raiz (RCA), auxiliando a engenharia a propor melhorias nas inspeções periódicas.',
    tip: '💡 Dica: Use os "5 Porquês" na investigação para atingir a causa raiz física ou humana real.'
  },
  acao_corretiva: {
    category: 'Confiabilidade',
    title: 'Ação Tomada',
    desc: 'Descrição detalhada do trabalho corretivo executado em campo para sanar o desvio técnico.',
    impact: 'Garante a documentação histórica da resolução e ajuda a treinar novos mantenedores a resolver problemas semelhantes.',
    tip: '💡 Dica: Registre também as peças substituídas e ajustes de calibração efetuados.'
  },
  apropriacao_custos: {
    category: 'Finanças',
    title: 'Apropriação de Custos',
    desc: 'Lançamento financeiro somando o custo da mão de obra (Hh), materiais/peças de estoque aplicados e serviços de terceiros.',
    impact: 'Base de dados para o cálculo do Custo de Manutenção Corretiva e do percentual de Custo de Manutenção sobre o RAV (Asset Value).',
    tip: '💡 Dica: Lançar custos diretamente na OS evita rateios genéricos e irreais no final do mês.'
  }
};

// ── 2. Pareto Cost Simulator Data ──────────────────────────────────────────
let PARETO_DATA = [
  { account: 'Mão de obra', cost: 40000 },
  { account: 'Peças', cost: 30000 },
  { account: 'Terceiros', cost: 11000 },
  { account: 'Frete', cost: 4000 },
  { account: 'Lubrificantes', cost: 4000 },
  { account: 'Consultoria', cost: 3000 },
  { account: 'Ferramentas', cost: 2000 },
  { account: 'EPI', cost: 2000 },
  { account: 'Transporte pessoal', cost: 1000 },
  { account: 'Matéria de limpeza', cost: 1000 },
  { account: 'Informática', cost: 500 },
  { account: 'Telefonia', cost: 500 },
  { account: 'Material escritório', cost: 500 },
  { account: 'Calibração ferramentas', cost: 500 }
];

// ── 3. KPI Definitions Data ──────────────────────────────────────────────────
const KPIS = [
  {
    id: 'disponibilidade',
    name: 'Disponibilidade (%)',
    hierarquia: 'Estratégico',
    visao: 'Lagging',
    analise: 'Verificação',
    objective: 'Medir a porcentagem de tempo que um ativo está disponível para operar comparado com o que foi programado.',
    benefits: 'A disponibilidade é a base para outros indicadores e serve de suporte para a tomada de decisão da gerência produtiva.',
    formula: 'Tempo Disponível / (Tempo Total - Tempo Sem Programação de Produção) * 100',
    meta: '>= 92%',
    inputs: [
      { id: 'disp_total', label: 'Tempo Total (h)', default: 720 },
      { id: 'disp_sem_prog', label: 'Tempo Sem Prog. (h)', default: 120 },
      { id: 'disp_disp', label: 'Tempo Disponível (h)', default: 550 }
    ],
    calculate: (vals) => {
      const total = parseFloat(vals['disp_total']);
      const semProg = parseFloat(vals['disp_sem_prog']);
      const disp = parseFloat(vals['disp_disp']);
      if (total - semProg <= 0) return 0;
      return (disp / (total - semProg)) * 100;
    },
    evaluate: (result) => {
      if (result >= 92) return 'dentro';
      if (result >= 85) return 'atencao';
      return 'fora';
    },
    trend: 'up' // up means higher is better
  },
  {
    id: 'mtbf',
    name: 'MTBF (Tempo Médio Entre Falhas)',
    hierarquia: 'Tático',
    visao: 'Lagging',
    analise: 'Controle',
    objective: 'Determinar o tempo médio de operação contínua entre eventos de falhas funcionais. Indicador essencial de confiabilidade.',
    benefits: 'Identificar a cada quanto tempo o equipamento falha para planejar melhor os planos de preventivas e revisões.',
    formula: 'Tempo Total de Operação / Quantidade de Falhas',
    meta: '>= 300 horas',
    inputs: [
      { id: 'mtbf_op', label: 'Tempo de Operação (h)', default: 600 },
      { id: 'mtbf_falhas', label: 'Qtd de Falhas', default: 2 }
    ],
    calculate: (vals) => {
      const op = parseFloat(vals['mtbf_op']);
      const falhas = parseFloat(vals['mtbf_falhas']);
      if (falhas <= 0) return op;
      return op / falhas;
    },
    evaluate: (result) => {
      if (result >= 300) return 'dentro';
      if (result >= 200) return 'atencao';
      return 'fora';
    },
    trend: 'up'
  },
  {
    id: 'mttr',
    name: 'MTTR (Tempo Médio de Reparo)',
    hierarquia: 'Tático',
    visao: 'Lagging',
    analise: 'Controle',
    objective: 'Determinar o tempo médio gasto pela equipe de manutenção para reparar e recolocar os ativos em operação após a falha.',
    benefits: 'Apontar gargalos de capacitação técnica, falta de ferramentas específicas ou atraso na entrega de peças de reposição.',
    formula: 'Tempo Total de Reparo / Quantidade de Falhas',
    meta: '<= 2.5 horas',
    inputs: [
      { id: 'mttr_reparo', label: 'Tempo de Reparo (h)', default: 12 },
      { id: 'mttr_falhas', label: 'Qtd de Falhas', default: 3 }
    ],
    calculate: (vals) => {
      const reparo = parseFloat(vals['mttr_reparo']);
      const falhas = parseFloat(vals['mttr_falhas']);
      if (falhas <= 0) return 0;
      return reparo / falhas;
    },
    evaluate: (result) => {
      if (result <= 2.5) return 'dentro';
      if (result <= 5.0) return 'atencao';
      return 'fora';
    },
    trend: 'down' // down means lower is better
  },
  {
    id: 'oee',
    name: 'OEE (Overall Equipment Effectiveness)',
    hierarquia: 'Estratégico',
    visao: 'Lagging',
    analise: 'Verificação',
    objective: 'Avaliar a eficiência global do ativo industrial multiplicando os fatores de Disponibilidade, Desempenho e Qualidade.',
    benefits: 'Permite entender se as perdas de produção ocorrem por paradas técnicas, lentidão operacional ou refugos.',
    formula: 'Disponibilidade (%) x Desempenho (%) x Qualidade (%) / 10000',
    meta: '>= 90%',
    inputs: [
      { id: 'oee_disp', label: 'Disponibilidade (%)', default: 92 },
      { id: 'oee_des', label: 'Desempenho (%)', default: 95 },
      { id: 'oee_qual', label: 'Qualidade (%)', default: 99 }
    ],
    calculate: (vals) => {
      const d = parseFloat(vals['oee_disp']);
      const des = parseFloat(vals['oee_des']);
      const q = parseFloat(vals['oee_qual']);
      return (d * des * q) / 10000;
    },
    evaluate: (result) => {
      if (result >= 90) return 'dentro';
      if (result >= 80) return 'atencao';
      return 'fora';
    },
    trend: 'up'
  },
  {
    id: 'wrench_time',
    name: 'Wrench Time (Tempo Produtivo)',
    hierarquia: 'Tático',
    visao: 'Lagging',
    analise: 'Controle',
    objective: 'Medir o percentual de tempo em que a equipe técnica está executando serviços produtivos de ferramentas na mão.',
    benefits: 'Apontar perdas de produtividade por excesso de deslocamentos, esperas por peças no estoque ou falta de clareza de ordens.',
    formula: 'Tempo Produtivo / Tempo Total Disponível * 100',
    meta: '>= 50%',
    inputs: [
      { id: 'wt_prod', label: 'Tempo Produtivo (h)', default: 4 },
      { id: 'wt_disp', label: 'Tempo Disponível (h)', default: 8 }
    ],
    calculate: (vals) => {
      const prod = parseFloat(vals['wt_prod']);
      const disp = parseFloat(vals['wt_disp']);
      if (disp <= 0) return 0;
      return (prod / disp) * 100;
    },
    evaluate: (result) => {
      if (result >= 50) return 'dentro';
      if (result >= 40) return 'atencao';
      return 'fora';
    },
    trend: 'up'
  },
  {
    id: 'backlog',
    name: 'Backlog (Semanas)',
    hierarquia: 'Tático',
    visao: 'Leading',
    analise: 'Verificação',
    objective: 'Determinar a carteira total de serviços de manutenção pendentes, medidos em unidades de tempo de trabalho da equipe.',
    benefits: 'Auxiliar no dimensionamento da equipe. Backlog alto indica falta de pessoas, muito baixo indica ociosidade.',
    formula: 'Total de Hh Planejado / Tempo Disponível da Equipe (semanal)',
    meta: '2 a 4 semanas',
    inputs: [
      { id: 'bk_planejado', label: 'Horas Planejadas (Hh)', default: 320 },
      { id: 'bk_capacidade', label: 'Hh Equipe / Semana', default: 80 }
    ],
    calculate: (vals) => {
      const plan = parseFloat(vals['bk_planejado']);
      const cap = parseFloat(vals['bk_capacidade']);
      if (cap <= 0) return 0;
      return plan / cap;
    },
    evaluate: (result) => {
      if (result >= 2 && result <= 4) return 'dentro';
      if ((result >= 1 && result < 2) || (result > 4 && result <= 6)) return 'atencao';
      return 'fora';
    },
    trend: 'range' // Ideal range, no simple up/down
  },
  {
    id: 'retrabalho',
    name: 'Retrabalho (%)',
    hierarquia: 'Tático',
    visao: 'Leading',
    analise: 'Controle',
    objective: 'Avaliar a qualidade da mão de obra mensurando o tempo gasto refazendo corretivas devido a erros anteriores.',
    benefits: 'Indica a necessidade de treinamentos, melhoria na qualidade de peças de reposição ou padronização de montagem.',
    formula: 'Horas em Corretivas Refeitas / Horas Totais Trabalhadas * 100',
    meta: '<= 0.5%',
    inputs: [
      { id: 'ret_refeitas', label: 'Hh Refeito (h)', default: 1 },
      { id: 'ret_totais', label: 'Hh Total Trabalhado (h)', default: 400 }
    ],
    calculate: (vals) => {
      const ref = parseFloat(vals['ret_refeitas']);
      const tot = parseFloat(vals['ret_totais']);
      if (tot <= 0) return 0;
      return (ref / tot) * 100;
    },
    evaluate: (result) => {
      if (result <= 0.5) return 'dentro';
      if (result <= 1.5) return 'atencao';
      return 'fora';
    },
    trend: 'down'
  },
  {
    id: 'cumprimento_programacao',
    name: 'Cumprimento da Programação (%)',
    hierarquia: 'Operacional',
    visao: 'Leading',
    analise: 'Verificação',
    objective: 'Mensurar se as ordens de serviço programadas para a semana anterior foram efetivamente executadas pela equipe.',
    benefits: 'Demonstra a estabilidade do processo. Cumprimento alto indica ambiente proativo, sem interrupções por quebras.',
    formula: 'Ordens Programadas Executadas / Ordens Programadas * 100',
    meta: '>= 70%',
    inputs: [
      { id: 'cp_exec', label: 'Ordens Executadas', default: 15 },
      { id: 'cp_prog', label: 'Ordens Programadas', default: 20 }
    ],
    calculate: (vals) => {
      const exec = parseFloat(vals['cp_exec']);
      const prog = parseFloat(vals['cp_prog']);
      if (prog <= 0) return 0;
      return (exec / prog) * 100;
    },
    evaluate: (result) => {
      if (result >= 70) return 'dentro';
      if (result >= 55) return 'atencao';
      return 'fora';
    },
    trend: 'up'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Ordem de Serviço Interaction ───────────────────────────────────────
  const osFields = document.querySelectorAll('.os-field');
  const osTab1 = document.getElementById('os-tab-1');
  const osTab2 = document.getElementById('os-tab-2');
  const sheet1Content = document.getElementById('sheet-1-content');
  const sheet2Content = document.getElementById('sheet-2-content');

  const fieldCategoryEl = document.getElementById('os-field-category');
  const fieldTitleEl = document.getElementById('os-field-title');
  const fieldDescEl = document.getElementById('os-field-desc');
  const fieldImpactEl = document.getElementById('os-field-impact');
  const fieldTipEl = document.getElementById('os-field-tip');

  function selectOSField(fieldKey) {
    const data = OS_FIELDS[fieldKey];
    if (!data) return;

    osFields.forEach(f => f.classList.remove('active'));
    const activeFieldEl = document.querySelector(`.os-field[data-field="${fieldKey}"]`);
    if (activeFieldEl) activeFieldEl.classList.add('active');

    fieldCategoryEl.textContent = data.category;
    fieldTitleEl.textContent = data.title;
    fieldDescEl.textContent = data.desc;
    fieldImpactEl.textContent = data.impact;
    fieldTipEl.textContent = data.tip || '';
  }

  osFields.forEach(fieldEl => {
    fieldEl.addEventListener('click', () => {
      const fieldKey = fieldEl.getAttribute('data-field');
      selectOSField(fieldKey);
    });
  });

  osTab1.addEventListener('click', () => {
    osTab1.classList.add('active');
    osTab2.classList.remove('active');
    sheet1Content.style.display = 'block';
    sheet2Content.style.display = 'none';
    selectOSField('num_ordem');
  });

  osTab2.addEventListener('click', () => {
    osTab1.classList.remove('active');
    osTab2.classList.add('active');
    sheet1Content.style.display = 'none';
    sheet2Content.style.display = 'block';
    selectOSField('data_fechamento');
  });

  // ── 2. Pareto Cost Simulator ───────────────────────────────────────────────
  const paretoTableBody = document.querySelector('#pareto-table tbody');
  const paretoSvg = document.getElementById('pareto-svg');

  function renderPareto() {
    // 1. Sort data descending by cost
    PARETO_DATA.sort((a, b) => b.cost - a.cost);

    // 2. Calculate totals
    const totalCost = PARETO_DATA.reduce((sum, item) => sum + item.cost, 0);

    // 3. Render Table
    paretoTableBody.innerHTML = '';
    let cumulativeSum = 0;
    
    PARETO_DATA.forEach((item, index) => {
      cumulativeSum += item.cost;
      const relPercent = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
      const cumPercent = totalCost > 0 ? (cumulativeSum / totalCost) * 100 : 0;
      
      // Pareto threshold: items that contribute to cumulative sum <= 80% (plus the first item that crosses 80%)
      const prevCumulative = cumulativeSum - item.cost;
      const prevCumPercent = totalCost > 0 ? (prevCumulative / totalCost) * 100 : 0;
      const isCritical = prevCumPercent < 80;

      const tr = document.createElement('tr');
      if (isCritical) {
        tr.classList.add('pareto-critical');
      }

      tr.innerHTML = `
        <td>${item.account}</td>
        <td style="text-align: right;">
          <input type="number" class="pareto-input" data-index="${index}" value="${item.cost}" min="0" step="100">
        </td>
        <td style="text-align: right;">${relPercent.toFixed(1)}%</td>
        <td style="text-align: right; font-weight: ${isCritical ? '700' : '400'};">${cumPercent.toFixed(1)}%</td>
      `;
      paretoTableBody.appendChild(tr);
    });

    // Hook inputs
    document.querySelectorAll('.pareto-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        const val = parseFloat(e.target.value) || 0;
        PARETO_DATA[index].cost = val;
        renderPareto();
      });
    });

    // 4. Render SVG Diagram
    renderParetoChart(totalCost);
  }

  function renderParetoChart(totalCost) {
    if (!paretoSvg) return;
    paretoSvg.innerHTML = '';

    const width = 500;
    const height = 300;
    const padding = { top: 30, right: 50, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const numItems = PARETO_DATA.length;
    const barWidth = chartWidth / numItems - 4;

    // Maximum cost to scale bars
    const maxCost = PARETO_DATA[0]?.cost || 1;

    // Draw background guides
    // 80% line guide
    const y80 = padding.top + chartHeight * 0.2; // 80% line represents 80% on cumulative (which goes 0% top, 100% bottom, so y=20% from top is 80%)
    // Wait, cumulative scale: 0% is at bottom (y = padding.top + chartHeight), 100% is at top (y = padding.top)
    // So 80% cumulative is at: y = padding.top + chartHeight * (1 - 0.8) = padding.top + chartHeight * 0.2
    const line80 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line80.setAttribute('x1', padding.left);
    line80.setAttribute('y1', y80);
    line80.setAttribute('x2', width - padding.right);
    line80.setAttribute('y2', y80);
    line80.setAttribute('class', 'pareto-80-guide');
    paretoSvg.appendChild(line80);

    // Label for 80% guide
    const text80 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text80.setAttribute('x', width - padding.right + 5);
    text80.setAttribute('y', y80 + 3);
    text80.setAttribute('font-size', '9');
    text80.setAttribute('fill', '#d97706');
    text80.setAttribute('font-weight', '700');
    text80.textContent = '80%';
    paretoSvg.appendChild(text80);

    // Y Axis Left (Cost) & Right (Percentage)
    const axisLeft = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisLeft.setAttribute('x1', padding.left);
    axisLeft.setAttribute('y1', padding.top);
    axisLeft.setAttribute('x2', padding.left);
    axisLeft.setAttribute('y2', height - padding.bottom);
    axisLeft.setAttribute('stroke', '#e2e2e2');
    paretoSvg.appendChild(axisLeft);

    const axisRight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisRight.setAttribute('x1', width - padding.right);
    axisRight.setAttribute('y1', padding.top);
    axisRight.setAttribute('x2', width - padding.right);
    axisRight.setAttribute('y2', height - padding.bottom);
    axisRight.setAttribute('stroke', '#e2e2e2');
    paretoSvg.appendChild(axisRight);

    // Draw Bars and Cumulative Line Points
    let cumSum = 0;
    const points = [];

    PARETO_DATA.forEach((item, index) => {
      cumSum += item.cost;
      const relPercent = totalCost > 0 ? (item.cost / totalCost) : 0;
      const cumPercent = totalCost > 0 ? (cumSum / totalCost) : 0;

      // Bar Dimensions
      const x = padding.left + index * (chartWidth / numItems) + 2;
      const barHeight = (item.cost / maxCost) * chartHeight;
      const y = height - padding.bottom - barHeight;

      // Check if critical (cumulative before this item < 80%)
      const prevCum = cumSum - item.cost;
      const prevCumPercent = totalCost > 0 ? (prevCum / totalCost) : 0;
      const isCritical = prevCumPercent < 0.8;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', Math.max(0, barHeight));
      rect.setAttribute('class', `pareto-bar ${isCritical ? 'critical' : ''}`);
      paretoSvg.appendChild(rect);

      // Cumulative line coordinate (point is centered on the bar)
      const lineX = x + barWidth / 2;
      const lineY = padding.top + chartHeight * (1 - cumPercent);
      points.push({ x: lineX, y: lineY });
    });

    // Draw Cumulative Line
    if (points.length > 0) {
      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'pareto-line');
      paretoSvg.appendChild(path);

      // Draw Dots
      points.forEach(pt => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('class', 'pareto-line-dot');
        paretoSvg.appendChild(circle);
      });
    }

    // Label first few bars
    PARETO_DATA.forEach((item, index) => {
      if (index < 4) { // Only first 4 to avoid overlapping text
        const x = padding.left + index * (chartWidth / numItems) + barWidth / 2 + 2;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding.bottom + 14);
        text.setAttribute('font-size', '8');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#5e5e5e');
        text.textContent = item.account.split(' ')[0]; // short name
        paretoSvg.appendChild(text);
      }
    });

    // General X-axis label
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', width / 2);
    xAxisLabel.setAttribute('y', height - 10);
    xAxisLabel.setAttribute('font-size', '9');
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('font-weight', '700');
    xAxisLabel.textContent = 'Contas de Custo (Ordenadas por Impacto)';
    paretoSvg.appendChild(xAxisLabel);
  }

  // ── 3. KPI Calculator ──────────────────────────────────────────────────────
  const kpiSelect = document.getElementById('kpi-select');
  const badgeHierarquia = document.getElementById('kpi-badge-hierarquia');
  const badgeVisao = document.getElementById('kpi-badge-visao');
  const badgeAnalise = document.getElementById('kpi-badge-analise');
  const kpiObjective = document.getElementById('kpi-objective');
  const kpiFormula = document.getElementById('kpi-formula');
  const kpiBenefits = document.getElementById('kpi-benefits');
  const kpiMetaDisplay = document.getElementById('kpi-meta-display');
  const calcInputsContainer = document.getElementById('calc-inputs-container');

  const semaforoDisplay = document.getElementById('semaforo-display');
  const trendArrowBox = document.getElementById('trend-arrow-box');
  const trendArrowIcon = document.getElementById('trend-arrow-icon');
  const trendArrowText = document.getElementById('trend-arrow-text');

  // Populate Select
  KPIS.forEach(kpi => {
    const opt = document.createElement('option');
    opt.value = kpi.id;
    opt.textContent = kpi.name;
    kpiSelect.appendChild(opt);
  });

  function selectKPI(kpiId) {
    const kpi = KPIS.find(k => k.id === kpiId);
    if (!kpi) return;

    badgeHierarquia.textContent = kpi.hierarquia;
    badgeVisao.textContent = kpi.visao;
    badgeAnalise.textContent = kpi.analise;
    kpiObjective.textContent = kpi.objective;
    kpiFormula.textContent = kpi.formula;
    kpiBenefits.textContent = kpi.benefits;
    kpiMetaDisplay.textContent = kpi.meta;

    // Render Input Fields
    calcInputsContainer.innerHTML = '';
    kpi.inputs.forEach(input => {
      const div = document.createElement('div');
      div.classList.add('calc-input-group');
      div.innerHTML = `
        <label for="${input.id}">${input.label}</label>
        <input type="number" id="${input.id}" value="${input.default}" step="any">
      `;
      calcInputsContainer.appendChild(div);

      // Bind input events
      div.querySelector('input').addEventListener('input', calculateKPI);
    });

    calculateKPI();
  }

  function calculateKPI() {
    const kpiId = kpiSelect.value;
    const kpi = KPIS.find(k => k.id === kpiId);
    if (!kpi) return;

    // Gather inputs
    const inputVals = {};
    kpi.inputs.forEach(input => {
      const el = document.getElementById(input.id);
      inputVals[input.id] = el ? parseFloat(el.value) || 0 : 0;
    });

    const result = kpi.calculate(inputVals);
    
    // Display result
    let displayVal = result.toFixed(2);
    if (kpiId === 'disponibilidade' || kpiId === 'oee' || kpiId === 'wrench_time' || kpiId === 'retrabalho' || kpiId === 'cumprimento_programacao') {
      displayVal += '%';
    } else if (kpiId === 'backlog') {
      displayVal += ' sem';
    } else {
      displayVal += 'h';
    }
    semaforoDisplay.textContent = displayVal;

    // Evaluate meta and semaforo status
    const status = kpi.evaluate(result);
    semaforoDisplay.className = `semaforo-display ${status}`;

    // Set visual indicators
    if (status === 'dentro') {
      trendArrowBox.className = 'trend-arrow-box green-trend';
      trendArrowText.textContent = 'Dentro da Meta';
      trendArrowIcon.textContent = kpi.trend === 'down' ? '↓' : '↑';
    } else if (status === 'atencao') {
      trendArrowBox.className = 'trend-arrow-box';
      trendArrowBox.style.color = 'var(--color-warning)';
      trendArrowBox.style.backgroundColor = '#fffbeb';
      trendArrowText.textContent = 'Tenha Atenção';
      trendArrowIcon.textContent = '⚠';
    } else {
      trendArrowBox.className = 'trend-arrow-box red-trend';
      trendArrowText.textContent = 'Fora da Meta';
      trendArrowIcon.textContent = kpi.trend === 'down' ? '↑' : '↓';
    }
  }

  kpiSelect.addEventListener('change', (e) => {
    selectKPI(e.target.value);
  });

  // ── 4. Initializations ────────────────────────────────────────────────────
  selectOSField('num_ordem');
  renderPareto();
  selectKPI(KPIS[0].id);
});

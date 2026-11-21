import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { DEFAULTS, cloneParams, comparison, money, num } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
  const PHASES = [
    {
      kicker: 'FASE 01 DE 05 • INÍCIO DO CICLO',
      title: '1. Concepção & Especificação',
      desc: 'Define necessidade, vazão, pressão, eficiência e acessibilidade. Decisões aqui travam grande parte dos custos futuros antes mesmo da compra.',
      impact: 'Selecionar mal o ponto de operação gera consumo excessivo e falhas crônicas por anos.',
      next: 'Conexão → Entrega os requisitos técnicos para a Fase 02 (Aquisição).'
    },
    {
      kicker: 'FASE 02 DE 05 • COMPROMISSO DE CAPITAL',
      title: '2. Aquisição & Contratação',
      desc: 'Preço comercial do equipamento, engenharia de aplicação, logística e impostos. É apenas a primeira parcela visível do desembolso.',
      impact: 'Comparar apenas o preço de compra (R$ 80k vs R$ 110k) oculta eficiência e confiabilidade.',
      next: 'Conexão → Exige planejamento de interfaces para a Fase 03 (Instalação).'
    },
    {
      kicker: 'FASE 03 DE 05 • PARTIDA DO ATIVO',
      title: '3. Instalação & Comissionamento',
      desc: 'Base civil, alinhamento, adequações elétricas, testes em carga e entrega formal para a equipe de operação.',
      impact: 'Instalação e alinhamento deficientes reduzem drasticamente o MTBF logo nos primeiros meses.',
      next: 'Conexão → Coloca o ativo em regime real na Fase 04 (Operação & Manutenção).'
    },
    {
      kicker: 'FASE 04 DE 05 • MAIOR PESO NO LCC',
      title: '4. Operação & Manutenção',
      desc: 'Consumo contínuo de energia, rotinas planejadas, reformas intermediárias, reparos corretivos e perdas por parada.',
      impact: 'Em operação contínua (6.000 h/ano), esta fase costuma superar 80% do Custo do Ciclo de Vida.',
      next: 'Conexão → Define o desgaste e momento da Fase 05 (Descomissionamento).'
    },
    {
      kicker: 'FASE 05 DE 05 • ENCERRAMENTO & RETROALIMENTAÇÃO',
      title: '5. Descomissionamento',
      desc: 'Desmontagem segura, destinação ambiental de resíduos e recuperação de eventual valor residual no fim do horizonte.',
      impact: 'O histórico real de falhas e custos desta vida útil retroalimenta novos projetos.',
      next: 'Retroalimentação ↺ Volta para calibrar a Fase 01 (Concepção) do próximo ativo.'
    }
  ];

  const PERSONAS = [
    {
      badge: 'Paulo • Gerência de Suprimentos',
      proposal: 'Defesa: Proposta A (R$ 80.000)',
      quote: '“Se ambas atendem à vazão e à pressão especificadas, por que pagar R$ 30 mil a mais? O orçamento de compras precisa proteger o caixa agora.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Economizar R$ 30.000 no desembolso imediato (t = 0) e cumprir a meta de redução de custo na compra.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Ignora quanto a bomba mais barata pode consumir a mais de energia elétrica e exigir de manutenção nos próximos anos.',
      turningPoint: false
    },
    {
      badge: 'Rafael • Gerência de Operação',
      proposal: 'Defesa: Proposta B (R$ 110.000)',
      quote: '“Uma parada não planejada na linha custa muito mais que R$ 30 mil em poucas horas. Prefiro pagar mais na compra por um conjunto mais robusto.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Proteger a continuidade operacional e evitar paradas abruptas que comprometem a meta de produção.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Assume que pagar mais caro garante automaticamente maior confiabilidade e menor custo total, sem checar dados nem regime de uso.',
      turningPoint: false
    },
    {
      badge: 'Clara • Engenharia e Manutenção',
      proposal: 'Alerta técnico: Faltam dados de operação',
      quote: '“Nenhuma das duas propostas mostra eficiência energética, consumo em kW, MTBF ou custo de sobressalentes. Sem isso, estamos comparando no escuro.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Avaliar desempenho físico, consumo de energia e acessibilidade de manutenção antes de validar qualquer proposta.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Mesmo com os dados técnicos na mão, ainda falta definir por quantas horas/ano e por quantos anos a bomba vai operar.',
      turningPoint: false
    },
    {
      badge: 'Beatriz • Finanças • A Pergunta-Virada',
      proposal: 'Enquadramento LCC: Custo total no horizonte',
      quote: '“Quanto cada bomba vai nos custar no total — compra, energia, manutenção e paradas — durante todo o horizonte em que precisarmos dela?”',
      focusLabel: 'A mudança de patamar decisório',
      focusVal: 'Une Suprimentos, Operação e Engenharia na mesma régua econômica: o Custo do Ciclo de Vida (LCC) em valor presente.',
      blindLabel: 'Resultado para a gestão',
      blindVal: 'Troca o embate de opiniões departamentais por uma comparação auditável — e mostra quando a mais barata na compra sai mais cara no tempo.',
      turningPoint: true
    }
  ];

  function renderPersona(idx) {
    const data = PERSONAS[idx] || PERSONAS[0];
    document.querySelectorAll('#m1-persona-tabs .persona-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });
    const card = document.getElementById('m1-persona-card');
    if (card) card.classList.toggle('turning-point', !!data.turningPoint);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('m1-p-badge', data.badge);
    set('m1-p-proposal', data.proposal);
    set('m1-p-quote', data.quote);
    set('m1-p-focus-label', data.focusLabel);
    set('m1-p-focus-val', data.focusVal);
    set('m1-p-blind-label', data.blindLabel);
    set('m1-p-blind-val', data.blindVal);

    const stepLabel = document.querySelector('#slide-3 [data-step-label]');
    if (stepLabel) stepLabel.textContent = `Perspectiva ${idx + 1}/4`;
  }

  function renderPhase(idx) {
    const p = PHASES[idx] || PHASES[0];
    const nodes = document.querySelectorAll('#lifecycle-phase-nodes [data-phase]');
    nodes.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === idx);
      btn.classList.toggle('is-passed', i < idx);
    });
    const line = document.getElementById('lc-progress-line');
    if (line) line.style.width = `${(idx / 4) * 100}%`;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('lc-detail-kicker', p.kicker);
    set('lc-detail-title', p.title);
    set('lc-detail-desc', p.desc);
    set('lc-detail-impact', p.impact);
    set('lc-detail-next', p.next);
  }

  const engine = initSlideEngine({
    lessonFile: '001.PorQueUtilizarLCC.html',
    maxSteps: [0, 0, 3, 4, 0, 0, 0, 0],
    onStepChange: (slideIdx, stepIdx) => {
      if (slideIdx === 2) renderPersona(stepIdx);
      if (slideIdx === 3) renderPhase(stepIdx);
    }
  });

  document.querySelectorAll('#m1-persona-tabs [data-persona]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-persona'), 10);
      engine.setSlideStep(2, idx);
    });
  });
  renderPersona(0);

  document.querySelectorAll('#lifecycle-phase-nodes [data-phase]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-phase'), 10);
      engine.setSlideStep(3, idx);
    });
  });
  renderPhase(0);

  // Slide 2: Votação A vs B
  let votesA = 0;
  let votesB = 0;
  const countA = document.getElementById('count-vote-a');
  const countB = document.getElementById('count-vote-b');
  const summaryEl = document.getElementById('vote-summary-text');

  function updateVotes() {
    if (countA) countA.textContent = `${votesA} ${votesA === 1 ? 'voto' : 'votos'}`;
    if (countB) countB.textContent = `${votesB} ${votesB === 1 ? 'voto' : 'votos'}`;
  }

  document.getElementById('btn-vote-a')?.addEventListener('click', () => {
    votesA++;
    updateVotes();
  });
  document.getElementById('btn-vote-b')?.addEventListener('click', () => {
    votesB++;
    updateVotes();
  });
  document.getElementById('btn-reset-votes')?.addEventListener('click', () => {
    votesA = 0;
    votesB = 0;
    updateVotes();
    if (summaryEl) {
      summaryEl.textContent = 'Registre os votos da turma acima antes de revelar o que falta na proposta.';
    }
  });
  document.getElementById('btn-reveal-trap')?.addEventListener('click', () => {
    if (summaryEl) {
      summaryEl.textContent =
        'Ponto cego: R$ 80 mil vs R$ 110 mil mostra apenas a compra (t=0). Sem consumo (kW), horas/ano, MTBF e manutenção, qualquer escolha é chute.';
    }
  });

  // Slide 3 já gerenciado por renderPhase + engine.setSlideStep(2, idx) acima

  // Slide 4: Simulador de Inversão de Custos
  const hoursInput = document.getElementById('sim1-hours');
  const yearsInput = document.getElementById('sim1-years');
  const hoursVal = document.getElementById('sim1-hours-val');
  const yearsVal = document.getElementById('sim1-years-val');
  const btnLow = document.getElementById('btn-sim1-low');
  const btnBase = document.getElementById('btn-sim1-base');

  function updateSim1() {
    const h = Number(hoursInput?.value || 6000);
    const y = Number(yearsInput?.value || 8);
    if (hoursVal) hoursVal.textContent = `${num(h, 0)} h`;
    if (yearsVal) yearsVal.textContent = `${y} ${y === 1 ? 'ano' : 'anos'}`;

    const p = cloneParams(DEFAULTS);
    p.hours = h;
    p.years = y;
    const res = comparison(h, p);
    const maxLCC = Math.max(res.A.lcc, res.B.lcc, 1);

    const applyBar = (prefix, m) => {
      const capex = m.initial;
      const energy = m.energy * m.factor;
      const maint = (m.operation + m.planned + m.corrective) * m.factor + m.renewalPV + m.terminalPV;
      const loss = m.lossPV;
      const pct = (v) => `${Math.max(0, (v / maxLCC) * 100).toFixed(1)}%`;

      document.getElementById(`${prefix}-capex`).style.width = pct(capex);
      document.getElementById(`${prefix}-energy`).style.width = pct(energy);
      document.getElementById(`${prefix}-maint`).style.width = pct(maint);
      document.getElementById(`${prefix}-loss`).style.width = pct(loss);
    };

    applyBar('sim1-a', res.A);
    applyBar('sim1-b', res.B);

    document.getElementById('sim1-total-a').textContent = money(res.A.lcc);
    document.getElementById('sim1-total-b').textContent = money(res.B.lcc);

    const verdict = document.getElementById('sim1-verdict');
    if (verdict) {
      if (Math.abs(res.delta) < 1) {
        verdict.textContent = 'Empate técnico neste regime de uso e horizonte.';
      } else if (res.delta > 0) {
        verdict.textContent = `A diferença inicial se inverteu: Bomba B é ${money(res.delta)} mais econômica no ciclo de vida (${num(h, 0)} h/ano em ${y} anos).`;
      } else {
        verdict.textContent = `Com baixo uso (${num(h, 0)} h/ano), a Bomba A mantém vantagem de ${money(-res.delta)} no LCC.`;
      }
    }

    btnLow?.classList.toggle('active', h === 300);
    btnBase?.classList.toggle('active', h === 6000);
  }

  hoursInput?.addEventListener('input', updateSim1);
  yearsInput?.addEventListener('input', updateSim1);
  btnLow?.addEventListener('click', () => {
    if (hoursInput) hoursInput.value = 300;
    updateSim1();
  });
  btnBase?.addEventListener('click', () => {
    if (hoursInput) hoursInput.value = 6000;
    updateSim1();
  });
  updateSim1();

  // Slide 5: 3 Cartões Giratórios (Manter, Modernizar, Substituir)
  document.querySelectorAll('#m1-flip-cards .flip-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });

  // Slide 6: Construtor da Pergunta
  const needSel = document.getElementById('q-builder-need');
  const yearsSel = document.getElementById('q-builder-years');
  const condSel = document.getElementById('q-builder-cond');
  const qOutput = document.getElementById('q-builder-output');

  function updateQuestion() {
    if (!qOutput) return;
    qOutput.textContent = `“Qual alternativa entrega o menor Custo do Ciclo de Vida (LCC) para ${needSel.value}, durante ${yearsSel.value}, ${condSel.value}, atendendo a todos os requisitos obrigatórios?”`;
  }
  needSel?.addEventListener('change', updateQuestion);
  yearsSel?.addEventListener('change', updateQuestion);
  condSel?.addEventListener('change', updateQuestion);
  updateQuestion();

  // Slide 7: Quiz Oficial
  initQuiz([
    {
      tab: 'Cenário 1: Preço vs LCC',
      tag: 'CONCEITO FUNDAMENTAL',
      prompt: 'Por que escolher automaticamente a bomba de menor preço de compra (R$ 80 mil vs R$ 110 mil) pode gerar prejuízo?',
      options: [
        {
          letter: 'A',
          text: 'Porque equipamentos mais baratos nunca atendem à vazão nominal.',
          correct: false,
          feedback: 'Mesmo atendendo à vazão e pressão, uma bomba pode consumir mais energia e falhar mais.'
        },
        {
          letter: 'B',
          text: 'Porque custos futuros de energia, manutenção e paradas podem superar rapidamente a economia inicial de R$ 30 mil.',
          correct: true,
          feedback: 'Exato! Em operação contínua (ex: 6.000 h/ano), energia e confiabilidade dominam o custo total.'
        },
        {
          letter: 'C',
          text: 'Porque o LCC exige sempre comprar o equipamento mais caro do mercado.',
          correct: false,
          feedback: 'Não! Em regimes de baixo uso (ex: reserva 300 h/ano), a opção mais barata pode vencer no LCC.'
        },
        {
          letter: 'D',
          text: 'Porque o preço de compra não entra no cálculo do LCC.',
          correct: false,
          feedback: 'O preço de compra entra integralmente em t=0; ele apenas não é o único custo.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Requisitos',
      tag: 'CRITÉRIO DE ADMISSIBILIDADE',
      prompt: 'Uma proposta apresenta o menor LCC calculado, mas descumpre um requisito obrigatório de segurança. O que fazer?',
      options: [
        {
          letter: 'A',
          text: 'Aprovar mesmo assim, pois o menor LCC compensa o risco.',
          correct: false,
          feedback: 'Menor custo nunca compensa requisito obrigatório de segurança ou conformidade descumprido.'
        },
        {
          letter: 'B',
          text: 'Desclassificar a alternativa ou incluir o custo real de adequação para cumprir o requisito.',
          correct: true,
          feedback: 'Correto! O LCC só compara alternativas tecnicamente admissíveis para a mesma necessidade.'
        },
        {
          letter: 'C',
          text: 'Aumentar a taxa de desconto para equilibrar o resultado.',
          correct: false,
          feedback: 'Alterar taxa de desconto não resolve descumprimento de requisito técnico ou de segurança.'
        },
        {
          letter: 'D',
          text: 'Ignorar o requisito e transferir o risco para a equipe de manutenção.',
          correct: false,
          feedback: 'Transferir déficit de projeto viola os princípios de gestão de ativos.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Custos Passados',
      tag: 'DECISÃO FUTURA',
      prompt: 'Ao decidir hoje entre manter, modernizar ou substituir uma bomba existente, como tratar o valor pago por ela há 5 anos?',
      options: [
        {
          letter: 'A',
          text: 'Como custo irrecuperável (sunk cost): não entra na comparação das decisões futuras.',
          correct: true,
          feedback: 'Perfeito! A análise de uma decisão atual compara apenas custos e créditos futuros afetados pela escolha.'
        },
        {
          letter: 'B',
          text: 'Somar o valor histórico ao custo da alternativa "Manter".',
          correct: false,
          feedback: 'O gasto passado já ocorreu independentemente do que for decidido hoje.'
        },
        {
          letter: 'C',
          text: 'Subtrair o valor histórico da compra de uma bomba nova.',
          correct: false,
          feedback: 'Isso distorceria o fluxo de caixa real da substituição.'
        },
        {
          letter: 'D',
          text: 'Usar o valor histórico como valor residual garantido.',
          correct: false,
          feedback: 'Valor residual é uma estimativa futura de recuperação, não o preço histórico de aquisição.'
        }
      ]
    }
  ]);
});

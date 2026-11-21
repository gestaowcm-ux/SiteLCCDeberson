// Auto-generated from Aulas/001..008.js for SiteLCC.html single-page mode
import { initSlideEngine, initQuiz as _initQuiz } from '/js/site-lcc-engine.js';
import { DEFAULTS, cloneParams, comparison, model, thresholdHours, sensitivityData, decisionCurvePoints, money, num, signedMoney } from '/js/lcc-model.js';

// === Módulo 1 — Por que utilizar o LCC? ===
export function initModule1() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-1');
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

    const stepLabel = document.querySelector('#mod-1 #slide-3 [data-step-label]');
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
}

// === Módulo 2 — Como estruturar a análise ===
export function initModule2() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-2');
  initSlideEngine({
    lessonFile: '002.EstruturarAnalise.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 0]
  });

  // Slide 2: Decisão
  const DEC_TEXTS = [
    '<strong>Selecionar Equipamento:</strong> Foco na escolha entre propostas (A vs B) que atendam à mesma necessidade operacional definida.',
    '<strong>Ampliar Capacidade:</strong> Exige definir se a demanda adicional será contínua ou em pico, e quais interfaces serão impactadas.',
    '<strong>Substituir Ativo:</strong> Compara continuar operando o ativo atual (com custos crescentes) contra o investimento em um ativo novo ou reformado.'
  ];
  const m2DecTabs = document.querySelectorAll('#m2-dec-tabs .tab-pill');
  const m2DecOut = document.getElementById('m2-dec-text');
  m2DecTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-m2dec'), 10);
      m2DecTabs.forEach((b, i) => b.classList.toggle('active', i === idx));
      if (m2DecOut) m2DecOut.innerHTML = DEC_TEXTS[idx] || '';
    });
  });

  // Slide 3: Matriz de Requisitos
  const reqBtns = document.querySelectorAll('[data-req]');
  const reqStatus = document.getElementById('req-matrix-status');
  const reqState = { a0: true, a1: true, a2: true, a3: true, b0: true, b1: true, b2: true, b3: true };

  function updateReqStatus() {
    const aOk = reqState.a0 && reqState.a1 && reqState.a2 && reqState.a3;
    const bOk = reqState.b0 && reqState.b1 && reqState.b2 && reqState.b3;
    if (!reqStatus) return;
    if (aOk && bOk) {
      reqStatus.innerHTML = 'Ambas as propostas atendem aos critérios obrigatórios e estão <strong>admissíveis</strong> para comparação de LCC.';
    } else if (!aOk && bOk) {
      reqStatus.innerHTML = '⚠️ <strong>Proposta A reprovada em requisito obrigatório!</strong> Só pode voltar à disputa se incluir o custo real de adequação.';
    } else if (aOk && !bOk) {
      reqStatus.innerHTML = '⚠️ <strong>Proposta B reprovada em requisito obrigatório!</strong> Menor LCC não compensa critério obrigatório descumprido.';
    } else {
      reqStatus.innerHTML = '❌ <strong>Ambas as propostas falharam em requisitos obrigatórios.</strong> Revisar especificação ou solicitar adequações.';
    }
  }

  reqBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-req');
      reqState[key] = !reqState[key];
      btn.classList.toggle('active', reqState[key]);
      btn.textContent = reqState[key] ? '✓ Atende' : '✕ Não atende';
      btn.style.background = reqState[key] ? '' : 'var(--color-danger)';
      btn.style.color = reqState[key] ? '' : '#ffffff';
      updateReqStatus();
    });
  });

  // Slide 4: Fronteiras
  const BND_TEXTS = [
    '<strong>Nível 1 (Bomba Isolada):</strong> Fronteira estreita demais se uma proposta incluir motor/acoplamento e a outra não. Risco de comparação injusta.',
    '<strong>Nível 2 (Conjunto de Bombeamento):</strong> Compara soluções completas para o mesmo serviço. Custos comuns (como engenharia R$ 5 mil) são reconhecidos; sunk costs ficam fora.',
    '<strong>Nível 3 (Sistema e Interfaces):</strong> Necessário quando uma alternativa exige adequação elétrica, novo inversor ou muda o consumo de utilidades da planta.'
  ];
  const bndTabs = document.querySelectorAll('#boundary-tabs .tab-pill');
  const bndCards = [
    document.getElementById('bnd-card-0'),
    document.getElementById('bnd-card-1'),
    document.getElementById('bnd-card-2')
  ];
  const bndDetail = document.getElementById('boundary-detail');

  bndTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-bnd'), 10);
      bndTabs.forEach((b, i) => b.classList.toggle('active', i === idx));
      bndCards.forEach((c, i) => {
        if (!c) return;
        c.classList.toggle('accent-dark', i === idx);
        c.classList.toggle('is-dimmed', i !== idx);
      });
      if (bndDetail) bndDetail.innerHTML = BND_TEXTS[idx] || '';
    });
  });

  // Slide 5: Horizonte vs Vida Útil
  const hzSlider = document.getElementById('hz-slider');
  const vuaSlider = document.getElementById('vua-slider');
  const vubSlider = document.getElementById('vub-slider');

  function updateHorizonSim() {
    const h = Number(hzSlider?.value || 8);
    const va = Number(vuaSlider?.value || 8);
    const vb = Number(vubSlider?.value || 10);

    document.getElementById('hz-val').textContent = `${h} anos`;
    document.getElementById('vua-val').textContent = `${va} anos`;
    document.getElementById('vub-val').textContent = `${vb} anos`;

    const evalSide = (life, titleId, descId) => {
      const tEl = document.getElementById(titleId);
      const dEl = document.getElementById(descId);
      if (!tEl || !dEl) return;
      if (life === h) {
        tEl.textContent = 'Alinhada ao horizonte';
        dEl.textContent = `Vida útil (${life} anos) coincide com o horizonte (${h} anos). Considerar apenas custo de descomissionamento e eventual sucata.`;
      } else if (life < h) {
        const reps = Math.floor((h - 1) / life);
        tEl.textContent = `Exige ${reps} substituição(ões)`;
        dEl.textContent = `Como a vida útil (${life} anos) é menor que o horizonte (${h} anos), é preciso incluir reinvestimento intermediário e residual ao final.`;
      } else {
        tEl.textContent = `Sobra de ${life - h} ano(s) de vida`;
        dEl.textContent = `O ativo ainda terá vida útil remanescente ao fim dos ${h} anos. Avaliar crédito de valor residual coerente no ano ${h}.`;
      }
    };

    evalSide(va, 'hz-status-a', 'hz-desc-a');
    evalSide(vb, 'hz-status-b', 'hz-desc-b');
  }

  hzSlider?.addEventListener('input', updateHorizonSim);
  vuaSlider?.addEventListener('input', updateHorizonSim);
  vubSlider?.addEventListener('input', updateHorizonSim);
  updateHorizonSim();

  // Slide 7: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Fronteiras',
      tag: 'ESCOPO DA ANÁLISE',
      prompt: 'A Proposta B exige uma adequação no painel elétrico de R$ 15 mil que a Proposta A não exige. O que fazer?',
      options: [
        {
          letter: 'A',
          text: 'Ignorar a adequação porque ela não faz parte do orçamento da bomba.',
          correct: false,
          feedback: 'Omitir um custo provocado pela escolha distorce a comparação econômica.'
        },
        {
          letter: 'B',
          text: 'Incluir os R$ 15 mil na fronteira da Proposta B para comparar soluções completas.',
          correct: true,
          feedback: 'Correto! Soluções diferentes só são comparáveis quando os custos complementares de interface são reconhecidos.'
        },
        {
          letter: 'C',
          text: 'Dividir os R$ 15 mil igualmente entre A e B.',
          correct: false,
          feedback: 'Apenas custos verdadeiramente comuns às duas alternativas poderiam ser tratados assim.'
        },
        {
          letter: 'D',
          text: 'Excluir a Proposta B automaticamente sem calcular.',
          correct: false,
          feedback: 'Uma adequação elétrica não torna a proposta inadmissível se o requisito técnico for atendido e o custo for contabilizado.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Horizonte',
      tag: 'ESCOPO TEMPORAL',
      prompt: 'A bomba A tem vida útil de 4 anos e a bomba B de 8 anos. Posso comparar o LCC de 4 anos da A direto com o de 8 anos da B?',
      options: [
        {
          letter: 'A',
          text: 'Não. É obrigatório comparar no mesmo horizonte (ex: 8 anos), incluindo a substituição ou reforma da A.',
          correct: true,
          feedback: 'Perfeito! Comparar períodos diferentes sem tratamento favorece artificialmente a alternativa de vida mais curta.'
        },
        {
          letter: 'B',
          text: 'Sim, basta escolher a que tiver menor soma nominal.',
          correct: false,
          feedback: 'Oito anos de operação sempre acumulam mais custos que quatro anos; a comparação seria inválida.'
        },
        {
          letter: 'C',
          text: 'Sim, desde que o preço inicial seja igual.',
          correct: false,
          feedback: 'Mesmo com preços iguais, os períodos precisam ser equalizados.'
        },
        {
          letter: 'D',
          text: 'Basta multiplicar o preço inicial de A por 2 e ignorar energia.',
          correct: false,
          feedback: 'Energia, manutenção e valor do dinheiro no tempo também precisam estar no horizonte comum.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Premissas',
      tag: 'QUALIDADE DOS DADOS',
      prompt: 'Não temos o histórico exato de horas de operação da nova planta, apenas uma estimativa de 6.000 h/ano. Devemos parar a análise?',
      options: [
        {
          letter: 'A',
          text: 'Sim, sem dado exato não é possível fazer LCC.',
          correct: false,
          feedback: 'Na engenharia, quase toda decisão futura envolve estimativas.'
        },
        {
          letter: 'B',
          text: 'Inventar um número sem documentar e marcar como dado confirmado.',
          correct: false,
          feedback: 'Nunca marque desconhecidos ou hipóteses como dados confirmados.'
        },
        {
          letter: 'C',
          text: 'Registrar como hipótese com responsável, fonte e testar seu impacto na análise de sensibilidade.',
          correct: true,
          feedback: 'Exato! Uma estimativa explícita e testada por sensibilidade é muito mais útil que a paralisia.'
        },
        {
          letter: 'D',
          text: 'Adotar 0 horas/ano para ser conservador.',
          correct: false,
          feedback: 'Zerar horas elimina o custo de uso e distorce completamente a decisão.'
        }
      ]
    }
  ]);
}

// === Módulo 3 — Quais custos considerar ===
export function initModule3() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-3');
  initSlideEngine({
    lessonFile: '003.CustosConsiderar.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 0]
  });

  // Slide 2: Simulador CAPEX
  const capexIds = ['m3-a-buy', 'm3-b-buy', 'm3-eng', 'm3-log', 'm3-inst', 'm3-comm'];
  function updateCapex() {
    const val = (id) => Math.max(0, Number(document.getElementById(id)?.value || 0));
    const extras = val('m3-eng') + val('m3-log') + val('m3-inst') + val('m3-comm');
    const totA = val('m3-a-buy') + extras;
    const totB = val('m3-b-buy') + extras;
    document.getElementById('m3-capex-a').textContent = money(totA);
    document.getElementById('m3-capex-b').textContent = money(totB);
    const diff = totB - totA;
    document.getElementById('m3-capex-diff').textContent =
      diff >= 0 ? `Diferença inicial: +${money(diff)} em B` : `Diferença inicial: +${money(-diff)} em A`;
  }
  capexIds.forEach((id) => document.getElementById(id)?.addEventListener('input', updateCapex));
  document.getElementById('m3-capex-reset')?.addEventListener('click', () => {
    document.getElementById('m3-a-buy').value = 80000;
    document.getElementById('m3-b-buy').value = 110000;
    document.getElementById('m3-eng').value = 5000;
    document.getElementById('m3-log').value = 3000;
    document.getElementById('m3-inst').value = 8000;
    document.getElementById('m3-comm').value = 4000;
    updateCapex();
  });
  updateCapex();

  // Slide 3: Calculadora de Energia
  const eIds = ['m3-pa', 'm3-pb', 'm3-h', 'm3-t'];
  function updateEnergy() {
    const pa = Number(document.getElementById('m3-pa')?.value || 30);
    const pb = Number(document.getElementById('m3-pb')?.value || 25);
    const h = Number(document.getElementById('m3-h')?.value || 6000);
    const t = Number(document.getElementById('m3-t')?.value || 0.8);

    document.getElementById('m3-pa-val').textContent = `${pa} kW`;
    document.getElementById('m3-pb-val').textContent = `${pb} kW`;
    document.getElementById('m3-h-val').textContent = `${num(h, 0)} h`;
    document.getElementById('m3-t-val').textContent = money(t, 2);

    const ea = pa * h * t;
    const eb = pb * h * t;
    const diff = ea - eb;
    document.getElementById('m3-ea').textContent = money(ea);
    document.getElementById('m3-eb').textContent = money(eb);
    document.getElementById('m3-ediff').textContent = money(Math.abs(diff));
    const note = document.getElementById('m3-payback-note');
    if (note) {
      note.textContent =
        diff > 0
          ? `Economia anual de B. Em ~${num(30000 / diff, 2)} anos compensa R$ 30k iniciais (sem desconto).`
          : diff < 0
            ? `Neste ajuste, A economiza ${money(-diff)}/ano em energia.`
            : 'Consumo energético equivalente.';
    }
  }
  eIds.forEach((id) => document.getElementById(id)?.addEventListener('input', updateEnergy));
  updateEnergy();

  // Slide 5: Terminal
  ['m3-decomm', 'm3-res-a', 'm3-res-b'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => {
      const d = Number(document.getElementById('m3-decomm')?.value || 0);
      const ra = Number(document.getElementById('m3-res-a')?.value || 0);
      const rb = Number(document.getElementById('m3-res-b')?.value || 0);
      const netA = d - ra;
      const netB = d - rb;
      document.getElementById('m3-term-result').innerHTML =
        `Líquido Ano 8: <strong>A = ${netA >= 0 ? '+' : ''}${money(netA)}</strong> | <strong>B = ${netB >= 0 ? '+' : ''}${money(netB)}</strong>`;
    });
  });

  // Slide 6: Dupla Contagem
  const DC_RULES = [
    '<strong>Regra 01 (Pacote vs Componentes):</strong> Desdobre o escopo por nível (ex.: conjunto motobomba completo). Se o motor já está no pacote, marque "já incluído" na linha de motor.',
    '<strong>Regra 02 (Rotina vs Intervenção):</strong> A intervenção do Ano 4 (R$ 12k / R$ 8k) entra pontualmente no Ano 4. O orçamento anual (R$ 6k / R$ 4k) reflete apenas rotinas recorrentes.',
    '<strong>Regra 03 (Reparo vs Perda):</strong> Custo de reparo (R$ 4k) contém apenas mão de obra, peças e serviços diretos. Perdas produtivas (R$ 1.000/h) entram em rubrica separada.',
    '<strong>Regra 04 (Crédito Residual):</strong> O valor residual só ocorre ao fim do horizonte (t = 8), como crédito único abatendo o descomissionamento.'
  ];
  const dcCards = document.querySelectorAll('#double-count-grid .lcc-card');
  const dcVerdict = document.getElementById('dc-verdict');
  dcCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-dc'), 10);
      dcCards.forEach((c, i) => c.classList.toggle('is-highlighted', i === idx));
      if (dcVerdict) dcVerdict.innerHTML = DC_RULES[idx] || '';
    });
  });

  // Slide 7: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Energia',
      tag: 'CÁLCULO DE ENERGIA',
      prompt: 'A bomba A tem potência elétrica absorvida de 30 kW e rendimento hidráulico de 75%. Para calcular a energia elétrica consumida, devemos:',
      options: [
        {
          letter: 'A',
          text: 'Dividir 30 kW por 0,75 antes de multiplicar pelas horas e tarifa.',
          correct: false,
          feedback: 'Cuidado! 30 kW já é a potência elétrica absorvida da rede; dividir por 0,75 causaria erro.'
        },
        {
          letter: 'B',
          text: 'Multiplicar diretamente 30 kW × 6.000 h × R$ 0,80/kWh = R$ 144.000/ano.',
          correct: true,
          feedback: 'Exato! A potência elétrica absorvida já incorpora as perdas do conjunto motor-bomba.'
        },
        {
          letter: 'C',
          text: 'Multiplicar 30 kW por 0,75 para reduzir a conta.',
          correct: false,
          feedback: 'Potência no eixo é menor que a elétrica, não o inverso; pagamos pela potência elétrica absorvida.'
        },
        {
          letter: 'D',
          text: 'Desconsiderar energia se a bomba operar menos de 8.760 h/ano.',
          correct: false,
          feedback: 'Em qualquer regime com horas relevantes, a energia deve ser calculada proporcionalmente às horas efetivas.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Ano 4',
      tag: 'PREVENÇÃO DE DUPLA CONTAGEM',
      prompt: 'No caso base, a Bomba A tem rotina anual de R$ 6 mil e intervenção prevista no Ano 4 de R$ 12 mil. Quanto entra de manutenção planejada no Ano 4?',
      options: [
        {
          letter: 'A',
          text: 'Apenas R$ 6 mil, porque a intervenção já está dentro da rotina.',
          correct: false,
          feedback: 'No caso, a intervenção é uma parcela pontual não incluída nas rotinas anuais.'
        },
        {
          letter: 'B',
          text: 'R$ 18 mil (R$ 6 mil da rotina anual + R$ 12 mil da intervenção pontual do Ano 4).',
          correct: true,
          feedback: 'Correto! E nos demais anos (1, 2, 3, 5, 6, 7, 8) entram apenas os R$ 6 mil da rotina anual.'
        },
        {
          letter: 'C',
          text: 'R$ 12 mil somados em todos os 8 anos.',
          correct: false,
          feedback: 'Isso multiplicaria por 8 uma intervenção que ocorre apenas uma vez no Ano 4.'
        },
        {
          letter: 'D',
          text: 'Zero, pois manutenção planejada não entra no LCC.',
          correct: false,
          feedback: 'Toda manutenção futura (planejada e corretiva) integra o LCC.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Fim de Vida',
      tag: 'VALOR RESIDUAL',
      prompt: 'A Bomba B tem custo de descomissionamento de R$ 10 mil e valor residual estimado de R$ 8 mil no Ano 8. Qual o fluxo líquido no Ano 8?',
      options: [
        {
          letter: 'A',
          text: 'Um crédito líquido de R$ 18 mil.',
          correct: false,
          feedback: 'Descomissionamento é saída de caixa (custo) e residual é entrada (crédito).'
        },
        {
          letter: 'B',
          text: 'Uma saída líquida de R$ 2 mil (R$ 10 mil de custo menos R$ 8 mil de crédito).',
          correct: true,
          feedback: 'Perfeito! E como ocorre no Ano 8, esse valor líquido ainda será trazido a valor presente no Módulo 5.'
        },
        {
          letter: 'C',
          text: 'Uma saída de R$ 10 mil, pois residual nunca pode entrar no LCC.',
          correct: false,
          feedback: 'O residual estimado e justificável entra como crédito no ano de encerramento.'
        },
        {
          letter: 'D',
          text: 'Abater R$ 8 mil do preço inicial de R$ 110 mil em t = 0.',
          correct: false,
          feedback: 'O valor residual só se realiza no Ano 8; abatê-lo em t=0 ignoraria o desconto no tempo.'
        }
      ]
    }
  ]);
}

// === Módulo 4 — Confiabilidade e impacto nos custos ===
export function initModule4() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-4');
  initSlideEngine({
    lessonFile: '004.ConfiabilidadeCustos.html',
    maxSteps: [0, 2, 0, 0, 0, 0, 0]
  });

  // Slide 3: Simulador MTBF & Indisponibilidade
  function updateRelSim() {
    const h = Number(document.getElementById('m4-h')?.value || 6000);
    const mtbfA = Number(document.getElementById('m4-mtbfa')?.value || 6000);
    const mtbfB = Number(document.getElementById('m4-mtbfb')?.value || 12000);
    const da = Math.max(0, Number(document.getElementById('m4-da')?.value || 8));
    const db = Math.max(0, Number(document.getElementById('m4-db')?.value || 6));

    document.getElementById('m4-h-val').textContent = `${num(h, 0)} h`;
    document.getElementById('m4-mtbfa-val').textContent = `${num(mtbfA, 0)} h`;
    document.getElementById('m4-mtbfb-val').textContent = `${num(mtbfB, 0)} h`;

    const fa = h / mtbfA;
    const fb = h / mtbfB;
    const ha = fa * da;
    const hb = fb * db;

    document.getElementById('m4-res-a').textContent = `${num(fa, 2)} falha/ano`;
    document.getElementById('m4-res-b').textContent = `${num(fb, 2)} falha/ano`;
    document.getElementById('m4-down-a').innerHTML = `Indisponibilidade esperada: <strong>${num(ha, 1)} h/ano</strong>`;
    document.getElementById('m4-down-b').innerHTML = `Indisponibilidade esperada: <strong>${num(hb, 1)} h/ano</strong>`;
  }
  ['m4-h', 'm4-mtbfa', 'm4-mtbfb', 'm4-da', 'm4-db'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateRelSim);
  });
  updateRelSim();

  // Slide 4: Calculadora de Corretivo & Perda
  let lossEnabled = true;
  function updateLossSim() {
    const rep = Math.max(0, Number(document.getElementById('m4-rep')?.value || 4000));
    const lossRate = lossEnabled ? Math.max(0, Number(document.getElementById('m4-loss')?.value || 1000)) : 0;

    const corrA = 1.0 * rep;
    const lossA = 8.0 * lossRate;
    const corrB = 0.5 * rep;
    const lossB = 3.0 * lossRate;

    document.getElementById('m4-cost-a').textContent = `${money(corrA + lossA)} / ano`;
    document.getElementById('m4-break-a').textContent = `Corretivo: ${money(corrA)} + Perda: ${money(lossA)}`;
    document.getElementById('m4-cost-b').textContent = `${money(corrB + lossB)} / ano`;
    document.getElementById('m4-break-b').textContent = `Corretivo: ${money(corrB)} + Perda: ${money(lossB)}`;
  }

  document.getElementById('m4-rep')?.addEventListener('input', updateLossSim);
  document.getElementById('m4-loss')?.addEventListener('input', updateLossSim);
  document.getElementById('m4-ctx-nored')?.addEventListener('click', (e) => {
    lossEnabled = true;
    e.currentTarget.classList.add('active');
    document.getElementById('m4-ctx-rec')?.classList.remove('active');
    updateLossSim();
  });
  document.getElementById('m4-ctx-rec')?.addEventListener('click', (e) => {
    lossEnabled = false;
    e.currentTarget.classList.add('active');
    document.getElementById('m4-ctx-nored')?.classList.remove('active');
    updateLossSim();
  });
  updateLossSim();

  // Slide 7: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Frequência',
      tag: 'MODELAGEM DE FALHAS',
      prompt: 'Com 6.000 h/ano e MTBF de 12.000 h, obtemos 0,5 falha/ano. O que isso significa?',
      options: [
        {
          letter: 'A',
          text: 'Que o equipamento quebra pela metade todo ano.',
          correct: false,
          feedback: 'Não existe meia falha física; trata-se de uma taxa média esperada.'
        },
        {
          letter: 'B',
          text: 'Uma frequência média esperada equivalente a 1 falha a cada 2 anos sob taxa constante.',
          correct: true,
          feedback: 'Exato! É uma expectativa média anual para fins de projeção econômica.'
        },
        {
          letter: 'C',
          text: 'Que o equipamento dura exatamente 12.000 horas e depois é descartado.',
          correct: false,
          feedback: 'MTBF (tempo médio entre falhas reparáveis) não é sinônimo de vida útil.'
        },
        {
          letter: 'D',
          text: 'Que podemos arredondar para zero e ignorar a corretiva.',
          correct: false,
          feedback: 'Arredondar para zero ocultaria custos reais de manutenção e paradas.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Perda Produtiva',
      tag: 'VALORAÇÃO ECONÔMICA',
      prompt: 'Qual valor deve ser usado para monetizar cada hora de parada não recuperável de uma linha?',
      options: [
        {
          letter: 'A',
          text: 'O faturamento bruto por hora, pois representa toda a receita.',
          correct: false,
          feedback: 'Faturamento bruto superestima a perda porque ignora custos variáveis não incorridos (matéria-prima, energia de processo).'
        },
        {
          letter: 'B',
          text: 'A margem de contribuição líquida não recuperável por hora.',
          correct: true,
          feedback: 'Correto! Deve refletir o impacto econômico líquido efetivamente perdido pela empresa.'
        },
        {
          letter: 'C',
          text: 'Apenas o salário hora do operador parado.',
          correct: false,
          feedback: 'Se há perda de produção não recuperável, a margem perdida vai além da folha.'
        },
        {
          letter: 'D',
          text: 'Sempre R$ 1.000/h, mesmo quando existe bomba reserva automática.',
          correct: false,
          feedback: 'Se há redundância efetiva que evita perda de produção, não se deve cobrar perda produtiva integral.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Risco Extremo',
      tag: 'LIMITES DA MÉDIA',
      prompt: 'Uma falha tem probabilidade muito baixa (0,01/ano), mas se ocorrer causa acidente grave ambiental. O valor esperado é baixo. Basta usar a média no LCC?',
      options: [
        {
          letter: 'A',
          text: 'Não. Eventos raros de alta severidade exigem tratamento próprio de risco e critérios obrigatórios de segurança.',
          correct: true,
          feedback: 'Perfeito! Baixo valor esperado não torna aceitável um risco catastrófico ou ilegal.'
        },
        {
          letter: 'B',
          text: 'Sim, se o valor esperado for menor que R$ 500/ano pode aprovar.',
          correct: false,
          feedback: 'Critérios de segurança e conformidade ambiental são eliminatórios, não compensáveis por média.'
        },
        {
          letter: 'C',
          text: 'Sim, basta aumentar a taxa de desconto.',
          correct: false,
          feedback: 'Taxa de desconto não resolve risco severo de segurança.'
        },
        {
          letter: 'D',
          text: 'Basta excluir o evento da fronteira da análise.',
          correct: false,
          feedback: 'Excluir um risco conhecido mascara a decisão.'
        }
      ]
    }
  ]);
}

// === Módulo 5 — Comparação econômica e VPL ===
export function initModule5() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-5');
  initSlideEngine({
    lessonFile: '005.ComparacaoEconomica.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 3, 0, 0]
  });

  // Slide 2: Tabela de fluxo ano a ano
  const tbody = document.getElementById('m5-flow-tbody');
  const flowSummary = document.getElementById('m5-flow-summary');
  const btnFlowA = document.getElementById('m5-flow-a');
  const btnFlowB = document.getElementById('m5-flow-b');

  function renderFlow(side) {
    const m = model(DEFAULTS, side, 6000);
    btnFlowA?.classList.toggle('active', side === 'A');
    btnFlowB?.classList.toggle('active', side === 'B');
    if (flowSummary) flowSummary.textContent = `Total em Valor Presente (LCC ${side}): ${money(m.lcc)}`;
    if (!tbody) return;
    tbody.innerHTML = m.flow
      .map((r) => {
        const extra = r.renewal + r.disposal - r.residual;
        return `<tr>
          <td><strong>Ano ${r.year}</strong></td>
          <td>${r.initial ? money(r.initial) : '—'}</td>
          <td>${r.year > 0 ? money(m.annual) : '—'}</td>
          <td>${extra !== 0 ? (extra > 0 ? '+' : '') + money(extra) : '—'}</td>
          <td>${money(r.total)}</td>
          <td><strong>${money(r.pv)}</strong></td>
        </tr>`;
      })
      .join('');
  }
  btnFlowA?.addEventListener('click', () => renderFlow('A'));
  btnFlowB?.addEventListener('click', () => renderFlow('B'));
  renderFlow('A');

  // Slide 3: Simulador de Valor Presente e Fator F
  function updatePVSim() {
    const rPct = Number(document.getElementById('m5-r')?.value || 8);
    const n = Number(document.getElementById('m5-n')?.value || 8);
    const c = Math.max(0, Number(document.getElementById('m5-c')?.value || 164000));
    const r = rPct / 100;
    const f = r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r;

    document.getElementById('m5-r-val').textContent = `${num(rPct, 1)}% a.a.`;
    document.getElementById('m5-n-val').textContent = `${n} ${n === 1 ? 'ano' : 'anos'}`;
    document.getElementById('m5-factor').textContent = num(f, 4);
    document.getElementById('m5-nom').textContent = money(c * n);
    document.getElementById('m5-pv').textContent = money(c * f);
  }
  ['m5-r', 'm5-n', 'm5-c'].forEach((id) => document.getElementById(id)?.addEventListener('input', updatePVSim));
  updatePVSim();

  // Slide 4: Conversor Taxa Real vs Nominal (Equação de Fisher)
  function updateFisherSim() {
    const nomInput = document.getElementById('m5-nom-r');
    const infInput = document.getElementById('m5-inf-r');
    const nomPct = nomInput ? Number(nomInput.value) : 10;
    const infPct = infInput ? Number(infInput.value) : 4;
    const nom = nomPct / 100;
    const inf = infPct / 100;
    const realPct = ((1 + nom) / (1 + inf) - 1) * 100;
    const approxPct = nomPct - infPct;

    const nomEl = document.getElementById('m5-nom-r-val');
    const infEl = document.getElementById('m5-inf-r-val');
    const realEl = document.getElementById('m5-real-r-val');
    const subEl = document.getElementById('m5-real-r-sub');

    if (nomEl) nomEl.textContent = `${num(nomPct, 1)}% a.a.`;
    if (infEl) infEl.textContent = `${num(infPct, 1)}% a.a.`;
    if (realEl) realEl.textContent = `${num(realPct, 2)}% a.a.`;
    if (subEl) subEl.textContent = `Subtração simples daria ${num(approxPct, 2)}% (aprox.)`;
  }
  ['m5-nom-r', 'm5-inf-r'].forEach((id) => document.getElementById(id)?.addEventListener('input', updateFisherSim));
  updateFisherSim();

  // Slide 4: Fluxo de Caixa Horizontal & VPL
  function updateHCF() {
    const rPct = Number(document.getElementById('m5-hcf-r')?.value || 8);
    const inv = Number(document.getElementById('m5-hcf-inv')?.value || -100000);
    const ann = Number(document.getElementById('m5-hcf-ann')?.value || 30000);
    const r = rPct / 100;

    document.getElementById('m5-hcf-r-val').textContent = `${num(rPct, 1)}% a.a.`;

    const grid = document.getElementById('m5-hcf-grid');
    if (!grid) return;

    let vpl = 0;
    let vp5 = 0;
    const cols = [];
    const barMaxPx = 104;
    const annScale = Math.max(Math.abs(ann), 1);

    for (let t = 0; t <= 5; t++) {
      const nom = t === 0 ? inv : ann;
      const factor = Math.pow(1 + r, t);
      const pv = nom / factor;
      vpl += pv;
      if (t === 5) vp5 = pv;

      const isZero = t === 0;
      const nomH = isZero ? barMaxPx : Math.max(12, Math.round((Math.abs(nom) / annScale) * barMaxPx));
      const pvH = isZero ? barMaxPx : Math.max(10, Math.round((Math.abs(pv) / annScale) * barMaxPx));
      const isNeg = nom < 0;

      cols.push(`
        <div class="lcc-card ${t === 5 ? 'editorial-red-frame' : ''}" style="padding:12px 10px; gap:8px; text-align:center;">
          <span class="card-kicker" style="color:${isZero ? 'var(--color-danger)' : ''};">Ano ${t}</span>
          <div style="font-size:13px; font-weight:700; color:var(--color-body);">Nom: ${money(nom)}</div>
          <div style="height:${barMaxPx + 6}px; display:flex; align-items:flex-end; justify-content:center; gap:8px; border-bottom:2px solid #cbd5e1; padding-bottom:4px;">
            <div title="Nominal" style="width:22px; height:${nomH}px; background:#cbd5e1; border-radius:4px 4px 0 0;"></div>
            <div title="Valor Presente" style="width:22px; height:${pvH}px; background:${isNeg ? '#dc2626' : '#0f172a'}; border-radius:4px 4px 0 0; transition:height 0.25s;"></div>
          </div>
          <div style="font-size:11px; color:var(--color-body);">${isZero ? 't = 0 (base)' : '÷ ' + num(factor, 2)}</div>
          <div style="font-size:clamp(14px,1.2vw,18px); font-weight:900; color:${isNeg ? 'var(--color-danger)' : 'var(--color-ink)'};">${money(pv)}</div>
        </div>
      `);
    }

    grid.innerHTML = cols.join('');
    const vplEl = document.getElementById('m5-hcf-vpl');
    if (vplEl) {
      vplEl.textContent = money(vpl);
      vplEl.style.color = vpl >= 0 ? '#86efac' : '#fca5a5';
    }
    const noteEl = document.getElementById('m5-hcf-note');
    if (noteEl) {
      noteEl.innerHTML = `Observe: o retorno nominal de ${money(ann)} no <strong>Ano 5</strong> vale hoje apenas <strong>${money(vp5)}</strong> (÷ ${num(Math.pow(1 + r, 5), 2)}). A soma de todas as colunas descontadas é o VPL (${money(vpl)}).`;
    }
  }
  ['m5-hcf-r', 'm5-hcf-inv', 'm5-hcf-ann'].forEach((id) => document.getElementById(id)?.addEventListener('input', updateHCF));
  updateHCF();

  // Slide 5: TIR, Payback Simples e Payback Descontado
  function calcIRR(flows) {
    let low = -0.5;
    let high = 2.0;
    for (let i = 0; i < 60; i++) {
      const mid = (low + high) / 2;
      const npv = flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + mid, t), 0);
      if (npv > 0) low = mid;
      else high = mid;
    }
    return ((low + high) / 2) * 100;
  }

  function calcPayback(series) {
    let cum = 0;
    for (let t = 0; t < series.length; t++) {
      const prev = cum;
      cum += series[t];
      if (t > 0 && cum >= 0) {
        return t - 1 + Math.abs(prev) / series[t];
      }
    }
    return null;
  }

  function updatePaybackSlide() {
    const rPct = Number(document.getElementById('m5-pb-r')?.value || 8);
    const inv = Number(document.getElementById('m5-hcf-inv')?.value || -100000);
    const ann = Number(document.getElementById('m5-hcf-ann')?.value || 30000);
    const r = rPct / 100;

    document.getElementById('m5-pb-r-val').textContent = `${num(rPct, 1)}% a.a.`;

    const nomFlows = [inv, ann, ann, ann, ann, ann];
    const discFlows = nomFlows.map((cf, t) => cf / Math.pow(1 + r, t));

    let cumNom = 0;
    let cumDisc = 0;
    const nomCums = [];
    const discCums = [];
    for (let t = 0; t <= 5; t++) {
      cumNom += nomFlows[t];
      cumDisc += discFlows[t];
      nomCums.push(cumNom);
      discCums.push(cumDisc);
    }

    const pbSimple = calcPayback(nomFlows);
    const pbDisc = calcPayback(discFlows);
    const irr = calcIRR(nomFlows);

    document.getElementById('m5-pb-simple').textContent = pbSimple !== null ? `${num(pbSimple, 2)} anos` : '> 5 anos';
    document.getElementById('m5-pb-disc').textContent = pbDisc !== null ? `${num(pbDisc, 2)} anos` : '> 5 anos';
    document.getElementById('m5-pb-irr').textContent = `${num(irr, 2)}% a.a.`;

    const pbBody = document.getElementById('m5-pb-tbody');
    if (pbBody) {
      const cell = (v, bold = false) =>
        `<td style="color:${v < 0 ? 'var(--color-danger)' : '#0f172a'}; font-weight:${bold ? 800 : 500};">${money(v)}</td>`;
      pbBody.innerHTML = `
        <tr><td><strong>Fluxo Nominal</strong></td>${nomFlows.map((v) => cell(v)).join('')}</tr>
        <tr style="background:var(--color-canvas-softer);"><td><strong>Acumulado Simples</strong></td>${nomCums.map((v) => cell(v, true)).join('')}</tr>
        <tr><td><strong>Valor Presente (VP_t)</strong></td>${discFlows.map((v) => cell(v)).join('')}</tr>
        <tr style="background:var(--color-canvas-softer);"><td><strong>Acumulado Descontado</strong></td>${discCums.map((v) => cell(v, true)).join('')}</tr>
      `;
    }

    const vEl = document.getElementById('m5-pb-verdict');
    if (vEl) {
      const vpl = discCums[discCums.length - 1];
      vEl.innerHTML =
        irr > rPct
          ? `<strong>TIR (${num(irr, 2)}%) &gt; TMA (${num(rPct, 1)}%):</strong> VPL positivo (${money(vpl)}). O Payback Descontado (${pbDisc !== null ? num(pbDisc, 2) + ' anos' : '> 5 anos'}) é sempre maior que o Simples (${pbSimple !== null ? num(pbSimple, 2) + ' anos' : '> 5 anos'}) quando r &gt; 0.`
          : `<strong>TIR (${num(irr, 2)}%) ≤ TMA (${num(rPct, 1)}%):</strong> VPL negativo (${money(vpl)}). O investimento não se paga dentro do horizonte considerando o custo de capital.`;
    }
  }
  document.getElementById('m5-pb-r')?.addEventListener('input', updatePaybackSlide);
  ['m5-hcf-inv', 'm5-hcf-ann'].forEach((id) => document.getElementById(id)?.addEventListener('input', updatePaybackSlide));
  updatePaybackSlide();

  // Slide 8: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Desconto',
      tag: 'VALOR DO DINHEIRO NO TEMPO',
      prompt: 'Aplicar uma taxa de desconto de 8% a.a. sobre um custo futuro reduz o valor que a empresa vai desembolsar no caixa daqui a 4 anos?',
      options: [
        {
          letter: 'A',
          text: 'Sim, o fornecedor cobra 8% a menos por ano.',
          correct: false,
          feedback: 'O desconto não altera o desembolso físico futuro; ele traz esse valor para a data-base de comparação.'
        },
        {
          letter: 'B',
          text: 'Não. O desconto não reduz o custo físico: ele expressa o custo futuro em valor presente na data-base.',
          correct: true,
          feedback: 'Exato! Permite somar corretamente um real de hoje com um real do Ano 4 ou do Ano 8.'
        },
        {
          letter: 'C',
          text: 'Sim, se a taxa for real.',
          correct: false,
          feedback: 'Taxa real ou nominal são apenas réguas de equivalência temporal.'
        },
        {
          letter: 'D',
          text: 'O desconto só se aplica a receitas, nunca a custos.',
          correct: false,
          feedback: 'Todo fluxo econômico (custos e créditos) deve ser trazido à mesma data-base.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Inflação',
      tag: 'TAXA REAL VS NOMINAL',
      prompt: 'Se todas as estimativas do estudo estão em moeda constante de hoje (sem inflação geral projetada), qual taxa de desconto deve ser usada?',
      options: [
        {
          letter: 'A',
          text: 'A taxa nominal (que já embute inflação).',
          correct: false,
          feedback: 'Usar taxa nominal em valores constantes subestimaria os custos futuros.'
        },
        {
          letter: 'B',
          text: 'A taxa real de desconto.',
          correct: true,
          feedback: 'Perfeito! Valores constantes combinam com taxa real; valores nominais (inflacionados) combinam com taxa nominal.'
        },
        {
          letter: 'C',
          text: 'Zero por cento.',
          correct: false,
          feedback: 'Taxa zero ignora o custo de oportunidade do capital.'
        },
        {
          letter: 'D',
          text: 'Qualquer taxa, pois o resultado do LCC não muda.',
          correct: false,
          feedback: 'A taxa de desconto altera o peso relativo entre CAPEX inicial e custos futuros.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Payback',
      tag: 'INDICADORES ECONÔMICOS',
      prompt: 'Por que o Payback simples não substitui o LCC na seleção de ativos?',
      options: [
        {
          letter: 'A',
          text: 'Porque o Payback simples ignora o desconto no tempo e tudo o que ocorre após a recuperação do investimento.',
          correct: true,
          feedback: 'Correto! Um ativo pode ter retorno rápido e logo depois exigir reforma cara ou ter vida curta.'
        },
        {
          letter: 'B',
          text: 'Porque o Payback não usa valores em reais.',
          correct: false,
          feedback: 'Ele usa valores em reais, mas mede apenas tempo até o equilíbrio inicial.'
        },
        {
          letter: 'C',
          text: 'Porque o Payback sempre escolhe a alternativa mais cara.',
          correct: false,
          feedback: 'Na verdade, o payback curto tende a favorecer soluções de baixo horizonte.'
        },
        {
          letter: 'D',
          text: 'Porque o Payback inclui o valor residual automaticamente.',
          correct: false,
          feedback: 'O payback simples ignora eventos terminais após o ponto de retorno.'
        }
      ]
    }
  ]);
}

// === Módulo 6 — Avaliar incertezas e sensibilidade ===
export function initModule6() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-6');
  initSlideEngine({
    lessonFile: '006.AvaliarIncertezas.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 0]
  });

  // Slide 3: Tornado SVG
  const spreadInput = document.getElementById('m6-spread');
  const spreadVal = document.getElementById('m6-spread-val');
  const tornadoSvg = document.getElementById('m6-tornado-svg');

  function renderTornado() {
    const spread = Number(spreadInput?.value || 20);
    if (spreadVal) spreadVal.textContent = `±${spread}%`;
    if (!tornadoSvg) return;

    const base = comparison(DEFAULTS.hours, DEFAULTS).delta;
    const rows = sensitivityData(DEFAULTS, spread);
    const maxAbs = Math.max(
      Math.abs(base),
      ...rows.map((r) => Math.max(Math.abs(r.min), Math.abs(r.max))),
      50000
    );

    const xLeft = 205;
    const xRight = 680;
    const width = xRight - xLeft;
    const toX = (v) => xLeft + ((v + maxAbs) / (2 * maxAbs)) * width;
    const xZero = toX(0);
    const xBase = toX(base);

    let out = `<line x1="${xZero}" y1="20" x2="${xZero}" y2="250" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    out += `<line x1="${xBase}" y1="20" x2="${xBase}" y2="250" stroke="#0284c7" stroke-width="2"/>`;
    out += `<text x="${xZero}" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Indiferença (Δ=0)</text>`;
    out += `<text x="${xBase}" y="268" text-anchor="middle" font-size="11" font-weight="700" fill="#0284c7">Base (+${money(base)})</text>`;

    rows.forEach((r, idx) => {
      const y = 34 + idx * 31;
      const x1 = toX(r.min);
      const x2 = toX(r.max);
      const w = Math.max(4, x2 - x1);
      out += `<text x="${xLeft - 12}" y="${y + 13}" text-anchor="end" font-size="12.5" font-weight="700" fill="#0f172a">${r.label}</text>`;
      out += `<rect x="${x1}" y="${y}" width="${w}" height="18" rx="4" fill="${r.flips ? '#dc2626' : '#0f172a'}" opacity="0.88"/>`;
      out += `<text x="${xRight + 10}" y="${y + 13}" font-size="11.5" font-weight="600" fill="#334155">${signedMoney(r.min)} a ${signedMoney(r.max)}</text>`;
    });

    tornadoSvg.innerHTML = out;
  }
  spreadInput?.addEventListener('input', renderTornado);
  renderTornado();

  // Slide 4: Curva de Decisão
  let curveVar = 'hours';
  const curveSvg = document.getElementById('m6-curve-svg');
  const curveIndiff = document.getElementById('m6-curve-indiff');
  const btnHours = document.getElementById('m6-curve-hours');
  const btnTariff = document.getElementById('m6-curve-tariff');

  function renderCurve() {
    if (!curveSvg) return;
    btnHours?.classList.toggle('active', curveVar === 'hours');
    btnTariff?.classList.toggle('active', curveVar === 'tariff');

    const { points, maxX } = decisionCurvePoints(DEFAULTS, curveVar);
    const maxY = Math.max(...points.map((pt) => Math.max(pt.a, pt.b))) * 1.05;
    const minY = Math.min(...points.map((pt) => Math.min(pt.a, pt.b))) * 0.9;

    const padL = 95;
    const padR = 30;
    const padT = 22;
    const padB = 40;
    const W = 860 - padL - padR;
    const H = 270 - padT - padB;

    const mapX = (x) => padL + (x / maxX) * W;
    const mapY = (y) => padT + H - ((y - minY) / (maxY - minY)) * H;

    const pathA = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapX(pt.x).toFixed(1)},${mapY(pt.a).toFixed(1)}`).join(' ');
    const pathB = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapX(pt.x).toFixed(1)},${mapY(pt.b).toFixed(1)}`).join(' ');

    let svg = `<line x1="${padL}" y1="${padT + H}" x2="${padL + W}" y2="${padT + H}" stroke="#cbd5e1" stroke-width="1.5"/>`;
    svg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + H}" stroke="#cbd5e1" stroke-width="1.5"/>`;
    svg += `<path d="${pathA}" fill="none" stroke="#1e293b" stroke-width="3.5"/>`;
    svg += `<path d="${pathB}" fill="none" stroke="#dc2626" stroke-width="3.5"/>`;

    svg += `<text x="${padL + W}" y="${mapY(points[points.length - 1].a) - 6}" text-anchor="end" font-size="13" font-weight="800" fill="#1e293b">LCC Bomba A</text>`;
    svg += `<text x="${padL + W}" y="${mapY(points[points.length - 1].b) + 16}" text-anchor="end" font-size="13" font-weight="800" fill="#dc2626">LCC Bomba B</text>`;

    if (curveVar === 'hours') {
      const th = thresholdHours(DEFAULTS);
      if (th !== null && th >= 0 && th <= maxX) {
        const cx = mapX(th);
        const cy = mapY(comparison(th, DEFAULTS).A.lcc);
        svg += `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + H}" stroke="#dc2626" stroke-dasharray="4 4"/>`;
        svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="#dc2626"/>`;
        svg += `<text x="${cx + 10}" y="${cy - 10}" font-size="12" font-weight="800" fill="#dc2626">Inversão ≈ ${num(th, 0)} h/ano</text>`;
      }
      if (curveIndiff) curveIndiff.textContent = `Ponto de indiferença: ≈ ${num(th, 0)} h/ano (abaixo vence A; acima vence B)`;
      [0, 300, 600, 900, 1200].forEach((tick) => {
        const tx = mapX(tick);
        svg += `<line x1="${tx}" y1="${padT + H}" x2="${tx}" y2="${padT + H + 5}" stroke="#64748b" stroke-width="1.5"/>`;
        svg += `<text x="${tx}" y="${padT + H + 17}" text-anchor="middle" font-size="11" fill="#475569">${num(tick, 0)}</text>`;
      });
      svg += `<text x="${padL + W / 2}" y="264" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">Horas de operação por ano (0 a 1.200 h)</text>`;
    } else {
      if (curveIndiff) curveIndiff.textContent = 'Tarifa ≥ 0 não inverte a escolha em 6.000 h/ano (B sempre vence)';
      svg += `<text x="${padL + W / 2}" y="262" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">Tarifa de energia elétrica (R$ 0,00 a R$ 2,00 / kWh)</text>`;
    }

    curveSvg.innerHTML = svg;
  }

  btnHours?.addEventListener('click', () => {
    curveVar = 'hours';
    renderCurve();
  });
  btnTariff?.addEventListener('click', () => {
    curveVar = 'tariff';
    renderCurve();
  });
  renderCurve();

  // Slide 5: Cenários Combinados
  const scenariosTbody = document.getElementById('m6-scenarios-tbody');
  if (scenariosTbody) {
    const scenarios = [
      { name: 'Cenário Base', desc: '6.000 h/ano · R$ 0,80/kWh · Perda R$ 1.000/h', mod: () => cloneParams(DEFAULTS) },
      { name: 'Tarifa +30%', desc: 'Tarifa = R$ 1,04/kWh (demais iguais)', mod: () => ({ ...cloneParams(DEFAULTS), tariff: 1.04 }) },
      { name: 'Uso Intermediário', desc: '3.000 h/ano (metade das horas base)', mod: () => ({ ...cloneParams(DEFAULTS), hours: 3000 }) },
      { name: 'Sem Perda Produtiva', desc: 'Perda = R$ 0/h (produção recuperável)', mod: () => ({ ...cloneParams(DEFAULTS), loss: 0 }) },
      { name: 'Uso Reduzido (5%)', desc: '300 h/ano (regime de reserva)', mod: () => ({ ...cloneParams(DEFAULTS), hours: 300 }) }
    ];

    scenariosTbody.innerHTML = scenarios
      .map((sc) => {
        const p = sc.mod();
        const res = comparison(p.hours, p);
        const win = res.delta > 0 ? 'B' : 'A';
        return `<tr>
          <td><strong>${sc.name}</strong></td>
          <td>${sc.desc}</td>
          <td>${money(res.A.lcc)}</td>
          <td>${money(res.B.lcc)}</td>
          <td><strong>${signedMoney(res.delta)}</strong></td>
          <td><span class="tab-pill ${win === 'A' ? '' : 'active'}" style="padding:3px 10px; font-size:12px;">Bomba ${win}</span></td>
        </tr>`;
      })
      .join('');
  }

  // Slide 7: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Tornado',
      tag: 'ANÁLISE DE SENSIBILIDADE',
      prompt: 'No gráfico Tornado, uma variável tem barra muito larga cruzando a linha zero (Δ = 0). O que isso indica?',
      options: [
        {
          letter: 'A',
          text: 'Que essa variável não tem importância nenhuma.',
          correct: false,
          feedback: 'Pelo contrário! Barras largas que cruzam zero são as mais críticas para a decisão.'
        },
        {
          letter: 'B',
          text: 'Que variações plausíveis nessa variável têm grande impacto e podem inverter a alternativa vencedora.',
          correct: true,
          feedback: 'Exato! É aí que devemos concentrar esforços de medição e validação.'
        },
        {
          letter: 'C',
          text: 'Que houve erro de cálculo na taxa de desconto.',
          correct: false,
          feedback: 'Cruzamento do zero indica mudança de preferência entre A e B, não erro matemático.'
        },
        {
          letter: 'D',
          text: 'Que devemos excluir essa variável do modelo.',
          correct: false,
          feedback: 'Nunca exclua uma variável decisiva; valide-a ou condicione a recomendação.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Ponto de Indiferença',
      tag: 'CONDIÇÃO CRÍTICA',
      prompt: 'Se o ponto de indiferença do caso base ocorre perto de 470 h/ano e a operação prevista é de 6.000 h/ano, o que concluir?',
      options: [
        {
          letter: 'A',
          text: 'A decisão a favor de B é robusta quanto ao regime de horas, pois está muito acima do limite de inversão.',
          correct: true,
          feedback: 'Perfeito! Mesmo se as horas caírem pela metade (3.000 h), B continua vencendo com folga.'
        },
        {
          letter: 'B',
          text: 'A decisão é muito arriscada porque 470 é próximo de 6.000.',
          correct: false,
          feedback: '6.000 h/ano é mais de 12 vezes acima do ponto de inversão.'
        },
        {
          letter: 'C',
          text: 'O limite de 470 h/ano vale universalmente para qualquer bomba.',
          correct: false,
          feedback: 'O ponto de indiferença pertence exclusivamente ao cenário e parâmetros modelados.'
        },
        {
          letter: 'D',
          text: 'A bomba A vence em 6.000 h/ano.',
          correct: false,
          feedback: 'Acima do ponto de indiferença (~470 h), B apresenta menor LCC.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Decisão Condicional',
      tag: 'RECOMENDAÇÃO PRÁTICA',
      prompt: 'Quando a operação real está muito próxima do ponto de indiferença e um dado-chave é apenas hipótese, qual a melhor recomendação?',
      options: [
        {
          letter: 'A',
          text: 'Escolher a opção mais barata na compra sem avisar o comitê.',
          correct: false,
          feedback: 'Omitir incertezas críticas compromete a governança da decisão.'
        },
        {
          letter: 'B',
          text: 'Emitir recomendação condicional definindo qual dado validar, o responsável, o prazo e o gatilho de mudança.',
          correct: true,
          feedback: 'Correto! Transparência sobre limites transforma incerteza em ação gerenciável.'
        },
        {
          letter: 'C',
          text: 'Forçar um cruzamento alterando a taxa de desconto arbitrariamente.',
          correct: false,
          feedback: 'Nunca manipule a taxa de desconto para justificar uma preferência prévia.'
        },
        {
          letter: 'D',
          text: 'Abandonar a análise de LCC e decidir por intuição.',
          correct: false,
          feedback: 'O modelo justamente mostrou onde está a dúvida crítica que precisa ser confirmada.'
        }
      ]
    }
  ]);
}

// === Módulo 7 — Aplicação prática integrada ===
export function initModule7() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-7');
  initSlideEngine({
    lessonFile: '007.AplicacaoPratica.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 0]
  });

  // Slide 2: Palpite da turma
  const guessStatus = document.getElementById('m7-guess-status');
  document.getElementById('m7-guess-a')?.addEventListener('click', (e) => {
    e.currentTarget.classList.add('active');
    document.getElementById('m7-guess-b')?.classList.remove('active');
    if (guessStatus) guessStatus.textContent = 'Palpite registrado: Bomba A (menor CAPEX deve pesar mais). Vamos calcular!';
  });
  document.getElementById('m7-guess-b')?.addEventListener('click', (e) => {
    e.currentTarget.classList.add('active');
    document.getElementById('m7-guess-a')?.classList.remove('active');
    if (guessStatus) guessStatus.textContent = 'Palpite registrado: Bomba B (menor manutenção fixa ainda compensa?). Vamos calcular!';
  });

  // Slide 3: Revelar Gabarito Anual (300 h/ano)
  const res300 = comparison(300, DEFAULTS);
  let annualRevealed = false;
  document.getElementById('m7-reveal-annual')?.addEventListener('click', (e) => {
    annualRevealed = !annualRevealed;
    if (annualRevealed) {
      document.getElementById('m7-a-en').textContent = money(res300.A.energy);
      document.getElementById('m7-b-en').textContent = money(res300.B.energy);
      document.getElementById('m7-a-cor').textContent = money(res300.A.corrective);
      document.getElementById('m7-b-cor').textContent = money(res300.B.corrective);
      document.getElementById('m7-a-los').textContent = money(res300.A.loss);
      document.getElementById('m7-b-los').textContent = money(res300.B.loss);
      document.getElementById('m7-a-tot').textContent = `${money(res300.A.annual)} / ano`;
      document.getElementById('m7-b-tot').textContent = `${money(res300.B.annual)} / ano`;
      e.currentTarget.textContent = 'Ocultar Gabarito';
    } else {
      document.getElementById('m7-a-en').textContent = '? (30 × 300 × 0,80)';
      document.getElementById('m7-b-en').textContent = '? (25 × 300 × 0,80)';
      document.getElementById('m7-a-cor').textContent = '? (0,05 × 4.000)';
      document.getElementById('m7-b-cor').textContent = '? (0,025 × 4.000)';
      document.getElementById('m7-a-los').textContent = '? (0,40 h × 1.000)';
      document.getElementById('m7-b-los').textContent = '? (0,15 h × 1.000)';
      document.getElementById('m7-a-tot').textContent = 'Aguardando conferência...';
      document.getElementById('m7-b-tot').textContent = 'Aguardando conferência...';
      e.currentTarget.textContent = 'Revelar Gabarito Anual';
    }
  });

  // Slide 4: Revelar Cálculo Completo do LCC (300 h/ano)
  let lccRevealed = false;
  document.getElementById('m7-reveal-lcc')?.addEventListener('click', (e) => {
    lccRevealed = !lccRevealed;
    if (lccRevealed) {
      document.getElementById('m7-vp-a-ann').textContent = money(res300.A.annual * res300.A.factor, 2);
      document.getElementById('m7-vp-a-r4').textContent = money(res300.A.renewalPV, 2);
      document.getElementById('m7-vp-a-end').textContent = money(res300.A.terminalPV, 2);
      document.getElementById('m7-lcc-a').textContent = `LCC A = ${money(res300.A.lcc, 2)}`;

      document.getElementById('m7-vp-b-ann').textContent = money(res300.B.annual * res300.B.factor, 2);
      document.getElementById('m7-vp-b-r4').textContent = money(res300.B.renewalPV, 2);
      document.getElementById('m7-vp-b-end').textContent = money(res300.B.terminalPV, 2);
      document.getElementById('m7-lcc-b').textContent = `LCC B = ${money(res300.B.lcc, 2)}`;
      e.currentTarget.textContent = 'Ocultar Cálculo';
    } else {
      ['m7-vp-a-ann', 'm7-vp-a-r4', 'm7-vp-a-end', 'm7-vp-b-ann', 'm7-vp-b-r4', 'm7-vp-b-end'].forEach((id) => {
        document.getElementById(id).textContent = '?';
      });
      document.getElementById('m7-lcc-a').textContent = 'LCC A = ?';
      document.getElementById('m7-lcc-b').textContent = 'LCC B = ?';
      e.currentTarget.textContent = 'Revelar Cálculo Completo do LCC';
    }
  });

  // Slide 7: Quiz
  initQuiz([
    {
      tab: 'Cenário 1: Custos Fixos',
      tag: 'RECALCULO DE 300 h/ano',
      prompt: 'Ao reduzir a operação de 6.000 h/ano para 300 h/ano, quais parcelas anuais NÃO diminuíram proporcionalmente no modelo do caso?',
      options: [
        {
          letter: 'A',
          text: 'Energia elétrica e perdas de produção.',
          correct: false,
          feedback: 'Essas dependem diretamente das horas de operação e caem para 5% do valor anterior.'
        },
        {
          letter: 'B',
          text: 'Manutenção planejada por calendário (rotinas e Ano 4) e outros custos operacionais fixos.',
          correct: true,
          feedback: 'Exato! Custos vinculados ao calendário permanecem fixos e ganham peso relativo no regime de baixo uso.'
        },
        {
          letter: 'C',
          text: 'Frequência de falhas corretivas.',
          correct: false,
          feedback: 'No modelo, N_falhas = H / MTBF, então as falhas acompanham a redução das horas.'
        },
        {
          letter: 'D',
          text: 'Todas as parcelas caem igualmente em 95%.',
          correct: false,
          feedback: 'CAPEX inicial e custos de calendário não caem com a redução de horas.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Margem Estreita',
      tag: 'INTERPRETAÇÃO DO RESULTADO',
      prompt: 'Em 300 h/ano, A vence por R$ 5.038,51 (R$ 202.319 vs R$ 207.357). Como apresentar isso ao comitê?',
      options: [
        {
          letter: 'A',
          text: 'Aprovar A de olhos fechados, pois a vitória é absoluta e imutável.',
          correct: false,
          feedback: 'Uma margem de ~2,5% próxima ao limite de 470 h/ano exige atenção às premissas.'
        },
        {
          letter: 'B',
          text: 'Recomendar A condicionada à confirmação de que o uso permanecerá abaixo de ~470 h/ano.',
          correct: true,
          feedback: 'Perfeito! Reconhece que o cálculo favorece A, mas explicita a sensibilidade ao regime de horas.'
        },
        {
          letter: 'C',
          text: 'Recomendar B porque ela foi melhor em 6.000 h/ano.',
          correct: false,
          feedback: 'O cenário atual da decisão é 300 h/ano, não 6.000 h/ano.'
        },
        {
          letter: 'D',
          text: 'Excluir o valor residual para aumentar a vantagem de A.',
          correct: false,
          feedback: 'Nunca altere premissas arbitrariamente para inflar uma margem.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Erro Comum',
      tag: 'AUDITORIA DE ANÁLISE',
      prompt: 'Um grupo calculou R$ 202 mil para A, mas esqueceu de incluir a adequação elétrica de R$ 20 mil exigida por A. O cálculo está correto, mas a análise é válida?',
      options: [
        {
          letter: 'A',
          text: 'Sim, se a matemática do VP estiver certa a decisão está garantida.',
          correct: false,
          feedback: 'Cálculo correto com escopo incompleto gera decisão errada.'
        },
        {
          letter: 'B',
          text: 'Não. Omissão de custo provocado pela escolha invalida a comparação, mesmo sem erro aritmético.',
          correct: true,
          feedback: 'Correto! Revisar requisitos, fronteiras e omissões faz parte da qualidade da análise.'
        },
        {
          letter: 'C',
          text: 'Sim, desde que o erro seja menor que 10%.',
          correct: false,
          feedback: 'R$ 20 mil inverteria completamente a vantagem de R$ 5 mil da Bomba A!'
        },
        {
          letter: 'D',
          text: 'Sim, pois adequação elétrica é sempre sunk cost.',
          correct: false,
          feedback: 'Se ainda será gasta por causa da escolha, é custo futuro relevante, não sunk cost.'
        }
      ]
    }
  ]);
}

// === Módulo 8 — Incorporar o LCC na gestão ===
export function initModule8() {
  const initQuiz = (questions) => _initQuiz(questions, '#mod-8');
  initSlideEngine({
    lessonFile: '008.IncorporarGestao.html',
    maxSteps: [0, 0, 0, 0, 0, 0, 0]
  });

  // Slide 3: Checklist
  const chks = document.querySelectorAll('.m8-chk');
  const chkStatus = document.getElementById('m8-chk-status');
  function updateChecklist() {
    const done = Array.from(chks).filter((c) => c.checked).length;
    if (chkStatus) {
      chkStatus.innerHTML =
        done === chks.length
          ? `✅ <strong>${done} de ${chks.length}</strong> itens verificados — Análise pronta para comitê!`
          : `Completude do checklist: <strong>${done} de ${chks.length}</strong> itens verificados.`;
    }
  }
  chks.forEach((c) => c.addEventListener('change', updateChecklist));

  // Slide 4: Audit Scorer
  function updateAudit() {
    const ids = ['m8-s1', 'm8-s2', 'm8-s3', 'm8-s4'];
    let sum = 0;
    ids.forEach((id) => {
      const v = Number(document.getElementById(id)?.value || 3);
      sum += v;
      const lbl = document.getElementById(`${id}-v`);
      if (lbl) lbl.textContent = String(v);
    });
    const avg = sum / ids.length;
    document.getElementById('m8-audit-avg').textContent = `${num(avg, 1)} / 5,0`;
    const lvl =
      avg < 2.2
        ? 'Nível Inicial (Decisões por Preço Isolado)'
        : avg < 3.5
          ? 'Nível Intermediário (Em Estruturação)'
          : avg < 4.5
            ? 'Nível Avançado (Governança Ativa)'
            : 'Nível Excelência (LCC Integrado à Gestão de Ativos)';
    document.getElementById('m8-audit-level').textContent = lvl;
  }
  ['m8-s1', 'm8-s2', 'm8-s3', 'm8-s4'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateAudit);
  });
  updateAudit();

  // Slide 6: Simulador Livre
  function updateFreeSim() {
    const p = cloneParams(DEFAULTS);
    p.hours = Math.max(0, Math.min(8760, Number(document.getElementById('m8-f-h')?.value || 6000)));
    p.years = Math.max(1, Math.min(30, Math.round(Number(document.getElementById('m8-f-y')?.value || 8))));
    p.rate = Math.max(0, Math.min(30, Number(document.getElementById('m8-f-r')?.value || 8)));
    p.tariff = Math.max(0, Number(document.getElementById('m8-f-t')?.value || 0.8));
    p.loss = Math.max(0, Number(document.getElementById('m8-f-l')?.value || 1000));

    const res = comparison(p.hours, p);
    const th = thresholdHours(p);

    document.getElementById('m8-f-lcca').textContent = money(res.A.lcc);
    document.getElementById('m8-f-caea').textContent = `CAE: ${money(res.A.cae)}/ano`;
    document.getElementById('m8-f-lccb').textContent = money(res.B.lcc);
    document.getElementById('m8-f-caeb').textContent = `CAE: ${money(res.B.cae)}/ano`;

    const winEl = document.getElementById('m8-f-win');
    if (winEl) {
      winEl.textContent =
        Math.abs(res.delta) < 1
          ? 'Empate Técnico'
          : res.delta > 0
            ? `B vence (+${money(res.delta)})`
            : `A vence (+${money(-res.delta)})`;
    }
    const thEl = document.getElementById('m8-f-th');
    if (thEl) {
      thEl.textContent =
        th !== null && th >= 0 && th <= 8760
          ? `Indiferença: ~${num(th, 0)} h/ano`
          : 'Sem inversão na faixa 0–8.760 h/ano';
    }
  }
  ['m8-f-h', 'm8-f-y', 'm8-f-r', 'm8-f-t', 'm8-f-l'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateFreeSim);
  });
  updateFreeSim();

  // Slide 7: Quiz Final
  initQuiz([
    {
      tab: 'Cenário 1: Gatilhos',
      tag: 'GOVERNANÇA',
      prompt: 'Devemos exigir uma análise completa de LCC com sensibilidade para a compra de uma válvula simples de R$ 800?',
      options: [
        {
          letter: 'A',
          text: 'Sim, toda compra da empresa deve ter um estudo de 20 páginas.',
          correct: false,
          feedback: 'Isso travaria o processo de compras e geraria burocracia sem retorno.'
        },
        {
          letter: 'B',
          text: 'Não. O esforço da análise deve ser proporcional à criticidade, valor e incerteza da decisão.',
          correct: true,
          feedback: 'Exato! Defina gatilhos claros para aplicar LCC completo onde ele realmente muda decisões relevantes.'
        },
        {
          letter: 'C',
          text: 'Sim, porque válvulas pequenas consomem muita energia elétrica.',
          correct: false,
          feedback: 'Critérios de criticidade e impacto orientam onde o esforço analítico compensa.'
        },
        {
          letter: 'D',
          text: 'Nunca usar LCC para ativos abaixo de R$ 10 milhões.',
          correct: false,
          feedback: 'Um ativo de R$ 100 mil pode consumir R$ 1 milhão em energia e falhas; o gatilho deve considerar criticidade e custo total.'
        }
      ]
    },
    {
      tab: 'Cenário 2: Retroalimentação',
      tag: 'PREVISTO VS REALIZADO',
      prompt: 'Um ano após aprovar e instalar a Bomba B, o que a gestão de ativos deve fazer com os dados reais de operação e manutenção?',
      options: [
        {
          letter: 'A',
          text: 'Comparar previsto vs realizado (horas, kWh, falhas, custos) para calibrar futuras análises.',
          correct: true,
          feedback: 'Perfeito! Sem confronto entre previsto e realizado, o LCC vira apenas uma planilha isolada.'
        },
        {
          letter: 'B',
          text: 'Arquivar o estudo e nunca mais olhar os números.',
          correct: false,
          feedback: 'Desperdiça a principal fonte de aprendizado organizacional.'
        },
        {
          letter: 'C',
          text: 'Demitir quem estimou o MTBF se houver pequena variação.',
          correct: false,
          feedback: 'Estimativas têm incerteza natural; o objetivo é aprender e calibrar modelos futuros.'
        },
        {
          letter: 'D',
          text: 'Alterar o estudo passado para parecer que acertou na vírgula.',
          correct: false,
          feedback: 'Preservar o histórico original é essencial para transparência e auditoria.'
        }
      ]
    },
    {
      tab: 'Cenário 3: Visão Completa',
      tag: 'SÍNTESE DO CURSO',
      prompt: 'Qual frase resume melhor uma decisão madura baseada em LCC?',
      options: [
        {
          letter: 'A',
          text: 'Comprar sempre o equipamento mais caro porque dura mais.',
          correct: false,
          feedback: 'Em baixo uso (ex: 300 h/ano), o mais barato pode vencer.'
        },
        {
          letter: 'B',
          text: 'Comprar sempre o equipamento mais barato na cotação inicial.',
          correct: false,
          feedback: 'Em uso contínuo (ex: 6.000 h/ano), o barato na compra pode custar muito mais caro.'
        },
        {
          letter: 'C',
          text: 'Comparar alternativas admissíveis no mesmo horizonte, com fronteiras claras, valor presente e sensibilidade às condições de uso.',
          correct: true,
          feedback: 'Excelente! Essa é a essência técnica e gerencial do Life Cycle Costing.'
        },
        {
          letter: 'D',
          text: 'Calcular tudo com 4 casas decimais e ignorar premissas.',
          correct: false,
          feedback: 'Precisão numérica sem premissas rastreáveis e sensibilidade não garante boa decisão.'
        }
      ]
    }
  ]);
}

export function initAllModules() {
  try { initModule1(); } catch (e) { console.error('Erro initModule1:', e); }
  try { initModule2(); } catch (e) { console.error('Erro initModule2:', e); }
  try { initModule3(); } catch (e) { console.error('Erro initModule3:', e); }
  try { initModule4(); } catch (e) { console.error('Erro initModule4:', e); }
  try { initModule5(); } catch (e) { console.error('Erro initModule5:', e); }
  try { initModule6(); } catch (e) { console.error('Erro initModule6:', e); }
  try { initModule7(); } catch (e) { console.error('Erro initModule7:', e); }
  try { initModule8(); } catch (e) { console.error('Erro initModule8:', e); }
}

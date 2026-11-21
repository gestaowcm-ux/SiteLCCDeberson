// ============================================================================
// 001.DecisaoLCC.js — Controlador Fluido de Slides, Passos Internos e Quiz
// Bloco 1, Capítulo 1: A decisão que o LCC ajuda a tomar
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('slides-wrapper');
  const slides = Array.from(document.querySelectorAll('.slide-section'));
  const dots = Array.from(document.querySelectorAll('.slide-indicator-dot'));
  const totalSlides = slides.length;

  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === 'true';

  if (isPreview) {
    document.body.classList.add('is-preview');
  }

  let currentSlide = 0;
  let isAnimating = false;

  // Estado de micro-passos por slide (inspirado em passador fluido de apresentação)
  const slideSteps = [0, 0, 0, 0, 0, 0, 0];
  const maxSteps =   [0, 3, 2, 2, 3, 0, 0];

  // ==========================================================================
  // 1. DADOS RICOS DOS COMPONENTES INTERATIVOS
  // ==========================================================================

  // Slide 2: As 4 cadeiras da reunião sobre a motobomba P-204
  const P204_PERSONAS = [
    {
      badge: 'Rafael • Gerência de Operação',
      proposal: 'Proposta: Substituir por bomba nova já',
      quote: '“Não dá mais para conviver com sustos às seis da manhã. Precisamos comprar uma bomba nova imediatamente e estancar a perda de ritmo operacional.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Proteger a continuidade do processo produtivo e eliminar paradas corretivas no turno.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Assume alto desembolso imediato (CAPEX) sem testar se modernização ou ajuste operacional resolveriam por menor custo global.',
      turningPoint: false
    },
    {
      badge: 'Paulo • Gerência de Suprimentos',
      proposal: 'Proposta: Continuar reparando o conjunto atual',
      quote: '“O orçamento deste ano está extremamente apertado. Continuar reparando exige o menor desembolso agora e preserva nosso caixa imediato.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Conter a saída de caixa no exercício corrente (t = 0) e respeitar o teto anual de compras.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Mantém consumo energético degradado, horas extras de manutenção e o risco real de uma 4ª ou 5ª parada mais grave.',
      turningPoint: false
    },
    {
      badge: 'Clara • Engenharia e Manutenção',
      proposal: 'Proposta: Modernizar e adequar condição operacional',
      quote: '“Talvez não seja comprar zero nem só trocar peça quebrada: podemos reformar o conjunto existente e corrigir o ponto de operação hidráulica.”',
      focusLabel: 'Foco legítimo da área',
      focusVal: 'Atacar o mecanismo físico de degradação aproveitando parte da infraestrutura já instalada.',
      blindLabel: 'O que fica fora deste recorte',
      blindVal: 'Precisa demonstrar economicamente se a reforma sustenta confiabilidade no horizonte exigido frente a um ativo novo.',
      turningPoint: false
    },
    {
      badge: 'Beatriz • Finanças • A Pergunta-Virada',
      proposal: 'Enquadramento LCC: Custo total no horizonte do serviço',
      quote: '“Quanto cada uma dessas escolhas vai nos custar durante todo o período em que ainda precisaremos desse serviço operando?”',
      focusLabel: 'A mudança de patamar decisório',
      focusVal: 'Une Operação, Suprimentos e Engenharia na mesma régua econômica: o custo total ao longo do ciclo de vida (LCC).',
      blindLabel: 'Resultado para a gestão',
      blindVal: 'Troca o embate de opiniões departamentais por uma comparação auditável entre manter, reformar ou substituir.',
      turningPoint: true
    }
  ];

  // Slide 3: As 3 lentes financeiras (Preço vs. Orçamento Anual vs. LCC)
  const LENSES_DATA = [
    {
      chartTitle: 'O que aparece quando olhamos apenas a cotação de compra (t = 0)',
      winnerText: 'Aparente vencedora: Opção A (33% mais barata na compra)',
      alertFlip: false,
      scoreA: 'Índice visível: 28',
      scoreB: 'Índice visível: 42',
      widthsA: { capex: 28, maint: 0, energy: 0, risk: 0 },
      widthsB: { capex: 42, maint: 0, energy: 0, risk: 0 },
      kicker: 'Lente 01 • Fotografia no instante zero',
      title: 'Preço de compra (cotação)',
      scope: 'Enxerga exclusivamente o valor da fatura inicial e montagem básica no momento da aquisição (t = 0).',
      hidden: 'Ignora anos de conta de energia elétrica, sobressalentes, mão de obra corretiva e perdas de produção.',
      trap: 'Premia equipamentos de menor eficiência ou menor robustez, criando um passivo operacional oculto.'
    },
    {
      chartTitle: 'O que aparece no orçamento anual isolado de uma área',
      winnerText: 'Visão parcial: Opção A ainda parece menor (40 vs. 49)',
      alertFlip: false,
      scoreA: 'Índice parcial: 40',
      scoreB: 'Índice parcial: 49',
      widthsA: { capex: 28, maint: 12, energy: 0, risk: 0 },
      widthsB: { capex: 42, maint: 7, energy: 0, risk: 0 },
      kicker: 'Lente 02 • Recorte departamental de 12 meses',
      title: 'Orçamento anual de uma área',
      scope: 'Soma o gasto inicial à verba de manutenção de um único exercício fiscal (visão em silos).',
      hidden: 'Deixa de fora a energia paga pela Operação, grandes intervenções plurianuais e o custo das falhas nos anos seguintes.',
      trap: 'Cada gerência defende sua própria linha orçamentária anual, sem enxergar a conta consolidada da planta.'
    },
    {
      chartTitle: 'O custo completo para manter o serviço operando no horizonte (LCC)',
      winnerText: 'Virada econômica: Opção B economiza 27% no ciclo de vida!',
      alertFlip: true,
      scoreA: 'LCC Total: 100',
      scoreB: 'LCC Total: 73 ✓',
      widthsA: { capex: 28, maint: 12, energy: 34, risk: 26 },
      widthsB: { capex: 42, maint: 7, energy: 19, risk: 5 },
      kicker: 'Lente 03 • Visão integrada de gestão de ativos',
      title: 'Custo do Ciclo de Vida (LCC)',
      scope: 'Integra CAPEX + energia + operação + manutenção + indisponibilidade + fim de vida durante todo o horizonte do serviço.',
      hidden: 'Nada relevante fica oculto entre centros de custo: o “barato que sai caro” aparece antes de assinar o pedido.',
      trap: 'Regra de ouro: preço é um evento na compra; LCC é o compromisso econômico total da organização com o ativo.'
    }
  ];

  // Slide 4: Blindagem de Siglas
  const ACRONYMS_TAKEAWAYS = [
    {
      kicker: 'Família LCC / LCCA (IEC 60300-3-3)',
      text: 'LCC (ou CCV) é a soma econômica dos custos ao longo da vida; LCCA (ou ACCV) é o processo estruturado que compara alternativas com base nesse indicador.',
      alert: false
    },
    {
      kicker: 'Convergência prática com TCO e WLC',
      text: 'Em vez de discutir se o estudo deve se chamar LCC ou TCO, explicite fronteira, horizonte e taxa de desconto: com escopo claro, a decisão converge.',
      alert: false
    },
    {
      kicker: 'Atenção redobrada em editais e especificações • LCC ≠ ACV',
      text: 'ACV / LCA (ISO 14040) mede impactos ambientais físicos (carbono, água, resíduos). LCC mede fluxo econômico-financeiro. Podem se complementar, nunca se confundir.',
      alert: true
    }
  ];

  // Slide 5: As 4 aplicações no ciclo de vida
  const LIFECYCLE_APPS = [
    {
      eyebrow: 'Aplicação 01 • Seleção técnica e comercial',
      question: 'Qual proposta entrega o menor custo total para cumprir a função exigida?',
      desc: 'Nivela propostas técnicas além do preço de vitrine: incorpora adequação civil/elétrica, comissionamento, eficiência energética nominal, sobressalentes iniciais e confiabilidade.',
      drivers: ['Cotação + instalação', 'Consumo energético (kWh)', 'Sobressalentes iniciais', 'Confiabilidade de projeto'],
      trap: 'Premiar o fornecedor de menor CAPEX que consome mais energia e exige paradas frequentes durante uma década.',
      p204: 'Se a Usina Aurora decidir comprar uma bomba nova (proposta de Rafael), precisará cotar eficiência e confiabilidade — não apenas preço.'
    },
    {
      eyebrow: 'Aplicação 02 • Estratégia em operação',
      question: 'Qual política de manutenção e sobressalentes minimiza a soma de intervenção + falha?',
      desc: 'Compara periodicidades preventivas, monitoramento preditivo e estoque de peças críticas equilibrando o gasto planejado contra a penalidade financeira da indisponibilidade.',
      drivers: ['Preventiva vs. preditiva', 'Giro e guarda de sobressalentes', 'Tempo médio de reparo (MTTR)', 'Custo da hora parada'],
      trap: 'Cortar verba de preventiva/preditiva para “economizar no trimestre” e pagar múltiplas vezes mais em reparos emergenciais.',
      p204: 'As 3 paradas da P-204 no mesmo ano mostram que o regime atual de reparo corretivo já está corroendo a disponibilidade do processo.'
    },
    {
      eyebrow: 'Aplicação 03 • Intervenção de meia-vida',
      question: 'Vale investir na modernização (retrofit) para reduzir OPEX e taxa de falhas?',
      desc: 'Avalia projetos de atualização tecnológica, redimensionamento hidráulico ou melhoria de materiais que exigem investimento moderado hoje para capturar economia operacional futura.',
      drivers: ['Custo da reforma/retrofit', 'Parada programada de implantação', 'Queda no consumo elétrico', 'Redução de falhas futuras'],
      trap: 'Rejeitar uma modernização pagável em poucos anos apenas porque a despesa não estava prevista na rotina.',
      p204: 'É exatamente a hipótese levantada por Clara: modernizar o conjunto P-204 e corrigir suas condições operacionais.'
    },
    {
      eyebrow: 'Aplicação 04 • Decisão de fim de vida econômica',
      question: 'Até quando insistir no ativo atual antes que reparar custe mais do que renovar?',
      desc: 'Confronta a continuidade de um equipamento envelhecido ou degradado (custos crescentes de falha e energia) contra o investimento líquido em um substituto moderno.',
      drivers: ['Tendência de falhas (degradação)', 'Grandes reparos iminentes', 'CAPEX do ativo novo', 'Valor residual / desmobilização'],
      trap: 'Cair na armadilha de continuar consertando indefinidamente apenas para adiar o pedido de investimento (CAPEX).',
      p204: 'É o dilema central na mesa da Usina Aurora: insistir no ativo atual (Paulo), modernizar (Clara) ou substituir (Rafael).'
    }
  ];

  // Slide 7: Banco de Questões do Quiz Multi-Cenários
  const QUIZ_QUESTIONS = [
    {
      prompt: 'Cenário 1 — Na reunião da motobomba P-204, Suprimentos defende o reparo simples por exigir menor gasto imediato neste ano, enquanto Operação pede troca imediata. Qual é o papel exato do LCC trazido por Finanças?',
      options: [
        {
          letter: 'A',
          text: 'Priorizar sempre a alternativa de menor desembolso no ano fiscal corrente para proteger o fluxo de caixa de curto prazo.',
          correct: false,
          feedback: 'Incorreto. Olhar apenas o desembolso de 12 meses reproduz a visão de orçamento anual e ignora custos futuros de energia e falhas.'
        },
        {
          letter: 'B',
          text: 'Aprovar automaticamente a compra do equipamento mais caro e moderno disponível no mercado para zerar qualquer falha.',
          correct: false,
          feedback: 'Incorreto. O LCC não escolhe o ativo mais caro por princípio; ele verifica se o investimento adicional realmente se paga pela redução de custos e riscos.'
        },
        {
          letter: 'C',
          text: 'Reunir na mesma base temporal todos os custos relevantes (aquisição, energia, manutenção, falhas e fim de vida) para manter o serviço operando.',
          correct: true,
          feedback: 'Exato! O LCC rompe os silos entre CAPEX e OPEX, consolidando todos os custos gerados pelas alternativas ao longo do horizonte de decisão.'
        },
        {
          letter: 'D',
          text: 'Substituir os critérios de segurança e desempenho da engenharia por uma conta puramente contábil de depreciação.',
          correct: false,
          feedback: 'Incorreto. LCC utiliza fluxos econômicos reais (e não mera depreciação contábil) e jamais elimina requisitos técnicos ou de segurança.'
        }
      ]
    },
    {
      prompt: 'Cenário 2 — Durante a elaboração de uma especificação técnica, um colega afirma que “solicitar análise de LCC é exatamente a mesma coisa que exigir uma ACV pela ISO 14040”. Como você deve orientar a equipe?',
      options: [
        {
          letter: 'A',
          text: 'Concordar, pois LCC e ACV são apenas traduções em inglês e português para o mesmo cálculo financeiro.',
          correct: false,
          feedback: 'Incorreto. A tradução econômica equivalente a LCC em português é CCV (Custo do Ciclo de Vida), e não ACV.'
        },
        {
          letter: 'B',
          text: 'Esclarecer que o LCC avalia fluxos econômico-financeiros (R$), enquanto a ACV (ISO 14040) mede impactos ambientais físicos — sendo complementares, mas distintos.',
          correct: true,
          feedback: 'Correto! Conforme destacam a IEC 60300-3-3 e os guias de compras públicas/industriais, LCC é econômico e ACV é ambiental.'
        },
        {
          letter: 'C',
          text: 'Trocar ambos os termos por TCO, já que o TCO dispensa a definição de horizonte de tempo e fronteira de custos.',
          correct: false,
          feedback: 'Incorreto. Qualquer análise séria (seja chamada de LCC, CCV ou TCO) exige fronteira de custos e horizonte temporal explícitos.'
        },
        {
          letter: 'D',
          text: 'Informar que o LCC só pode ser usado após o descarte do ativo, enquanto a ACV é usada apenas na compra.',
          correct: false,
          feedback: 'Incorreto. O LCC tem seu maior poder justamente antes da decisão (aquisição, manutenção, reforma ou substituição).'
        }
      ]
    },
    {
      prompt: 'Cenário 3 — Uma alternativa de bombeamento apresentou o menor LCC calculado na planilha, porém não atende à vazão mínima de segurança exigida pelo processo da Usina Aurora. À luz da ISO 55000, qual é a decisão correta?',
      options: [
        {
          letter: 'A',
          text: 'Escolher essa alternativa mesmo assim, pois a regra do LCC determina que o menor valor numérico vence obrigatoriamente.',
          correct: false,
          feedback: 'Incorreto. “LCC não é escolher cegamente o menor número na planilha”: alternativas que violam requisitos essenciais não entregam valor.'
        },
        {
          letter: 'B',
          text: 'Multiplicar o preço de compra por dois apenas para forçar um empate artificial na planilha.',
          correct: false,
          feedback: 'Incorreto. Premissas não devem ser adulteradas arbitrariamente; o filtro técnico de admissibilidade precede a escolha econômica.'
        },
        {
          letter: 'C',
          text: 'Ignorar a vazão requerida pela Operação e deixar que a manutenção compense a diferença no futuro.',
          correct: false,
          feedback: 'Incorreto. Transferir déficit de projeto para a rotina operacional viola o equilíbrio entre custo, risco e desempenho.'
        },
        {
          letter: 'D',
          text: 'Desclassificar a alternativa como tecnicamente inadmissível (ou incluir o custo real das adequações necessárias para que ela cumpra integralmente o serviço).',
          correct: true,
          feedback: 'Perfeito! Na ISO 55000, valor nasce do equilíbrio entre custo, risco e desempenho: só comparamos o LCC de alternativas capazes de cumprir a função requerida.'
        }
      ]
    }
  ];

  // ==========================================================================
  // 2. RENDERIZADORES DE MICRO-ESTADOS (FLUID INTRA-SLIDE STEPS)
  // ==========================================================================

  function renderMiniDots(containerId, total, activeIdx, slideIdx) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = `step-dot-mini ${i === activeIdx ? 'active' : ''}`;
      dot.title = `Ir para etapa ${i + 1}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        setSlideStep(slideIdx, i);
      });
      el.appendChild(dot);
    }
  }

  function renderSlide2Persona(stepIdx) {
    const data = P204_PERSONAS[stepIdx] || P204_PERSONAS[0];
    document.querySelectorAll('.persona-tab').forEach((tab, idx) => {
      tab.classList.toggle('active', idx === stepIdx);
    });

    const card = document.getElementById('p204-detail-card');
    if (card) {
      card.classList.toggle('turning-point', Boolean(data.turningPoint));
    }

    const setTxt = (id, txt) => {
      const node = document.getElementById(id);
      if (node) node.textContent = txt;
    };

    setTxt('p204-badge', data.badge);
    setTxt('p204-proposal', data.proposal);
    setTxt('p204-quote', data.quote);
    setTxt('p204-focus-label', data.focusLabel);
    setTxt('p204-focus-val', data.focusVal);
    setTxt('p204-blind-label', data.blindLabel);
    setTxt('p204-blind-val', data.blindVal);
    setTxt('step-label-s2', `Perspectiva ${stepIdx + 1}/4`);
    renderMiniDots('step-dots-s2', 4, stepIdx, 1);
  }

  function renderSlide3Lens(stepIdx) {
    const data = LENSES_DATA[stepIdx] || LENSES_DATA[0];
    document.querySelectorAll('.lens-pill-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === stepIdx);
    });

    const setTxt = (id, txt) => {
      const node = document.getElementById(id);
      if (node) node.textContent = txt;
    };

    setTxt('lens-chart-title', data.chartTitle);
    setTxt('lens-winner-badge', data.winnerText);
    setTxt('score-opt-a', data.scoreA);
    setTxt('score-opt-b', data.scoreB);
    setTxt('lens-kicker', data.kicker);
    setTxt('lens-title', data.title);
    setTxt('lens-scope', data.scope);
    setTxt('lens-hidden', data.hidden);
    setTxt('lens-trap', data.trap);
    setTxt('step-label-s3', `Lente ${stepIdx + 1}/3`);

    const winnerBadge = document.getElementById('lens-winner-badge');
    if (winnerBadge) {
      winnerBadge.classList.toggle('alert-flip', data.alertFlip);
    }

    const insightCard = document.getElementById('lens-insight-card');
    if (insightCard) {
      insightCard.classList.toggle('is-lcc-active', stepIdx === 2);
    }

    const applySeg = (id, widthVal) => {
      const seg = document.getElementById(id);
      if (!seg) return;
      seg.style.width = `${widthVal}%`;
      seg.style.opacity = widthVal > 0 ? '1' : '0';
    };

    applySeg('seg-a-capex', data.widthsA.capex);
    applySeg('seg-a-maint', data.widthsA.maint);
    applySeg('seg-a-energy', data.widthsA.energy);
    applySeg('seg-a-risk', data.widthsA.risk);

    applySeg('seg-b-capex', data.widthsB.capex);
    applySeg('seg-b-maint', data.widthsB.maint);
    applySeg('seg-b-energy', data.widthsB.energy);
    applySeg('seg-b-risk', data.widthsB.risk);

    renderMiniDots('step-dots-s3', 3, stepIdx, 2);
  }

  function renderSlide4Acronym(stepIdx) {
    const info = ACRONYMS_TAKEAWAYS[stepIdx] || ACRONYMS_TAKEAWAYS[0];
    document.querySelectorAll('.acronym-card').forEach((card, idx) => {
      card.classList.toggle('active', idx === stepIdx);
    });

    const bar = document.getElementById('acronym-takeaway-bar');
    if (bar) {
      bar.classList.toggle('is-alert', Boolean(info.alert));
    }

    const kicker = document.getElementById('acronym-takeaway-kicker');
    const text = document.getElementById('acronym-takeaway-text');
    if (kicker) kicker.textContent = info.kicker;
    if (text) text.textContent = info.text;

    const lbl = document.getElementById('step-label-s4');
    if (lbl) lbl.textContent = `Família ${stepIdx + 1}/3`;
    renderMiniDots('step-dots-s4', 3, stepIdx, 3);
  }

  function renderSlide5Lifecycle(stepIdx) {
    const app = LIFECYCLE_APPS[stepIdx] || LIFECYCLE_APPS[0];
    document.querySelectorAll('.lc-stage-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === stepIdx);
    });

    const setTxt = (id, txt) => {
      const node = document.getElementById(id);
      if (node) node.textContent = txt;
    };

    setTxt('lc-eyebrow', app.eyebrow);
    setTxt('lc-question', app.question);
    setTxt('lc-desc', app.desc);
    setTxt('lc-trap', app.trap);
    setTxt('lc-p204', app.p204);
    setTxt('step-label-s5', `Aplicação ${stepIdx + 1}/4`);

    const driversWrap = document.getElementById('lc-drivers');
    if (driversWrap) {
      driversWrap.innerHTML = app.drivers
        .map(d => `<span class="lc-driver-chip">${d}</span>`)
        .join('');
    }

    renderMiniDots('step-dots-s5', 4, stepIdx, 4);
  }

  function setSlideStep(slideIdx, stepIdx) {
    const clamped = Math.max(0, Math.min(stepIdx, maxSteps[slideIdx] || 0));
    slideSteps[slideIdx] = clamped;

    if (slideIdx === 1) renderSlide2Persona(clamped);
    if (slideIdx === 2) renderSlide3Lens(clamped);
    if (slideIdx === 3) renderSlide4Acronym(clamped);
    if (slideIdx === 4) renderSlide5Lifecycle(clamped);
  }

  // Inicializa todos os painéis interativos (em modo preview exibe a visão completa no Slide 3)
  renderSlide2Persona(isPreview ? 3 : 0);
  renderSlide3Lens(isPreview ? 2 : 0);
  renderSlide4Acronym(0);
  renderSlide5Lifecycle(0);

  // ==========================================================================
  // 3. ANIMAÇÃO FLUIDA DE CONTADORES NUMÉRICOS (TABULAR NUMS)
  // ==========================================================================
  function animateSlideCounters(slideEl) {
    if (!slideEl || isPreview) return;
    const counters = slideEl.querySelectorAll('[data-count-target]');
    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-count-target'), 10);
      const suffix = el.getAttribute('data-count-suffix') || '';
      if (isNaN(target)) return;

      const duration = 650;
      const t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const currentVal = Math.max(1, Math.round(target * eased));
        el.textContent = `${currentVal}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // ==========================================================================
  // 4. TRANSIÇÃO VERTICAL DE SLIDES & SINCRONIZAÇÃO COM SHELL / PRESENTER
  // ==========================================================================
  function syncWithParentShell() {
    if (isPreview) return;
    const activeSection = slides[currentSlide];
    const notesEl = activeSection ? activeSection.querySelector('.speaker-notes') : null;
    const notesHtml = notesEl ? notesEl.innerHTML : '';

    window.parent.postMessage({
      type: 'SLIDE_CHANGED',
      slideIndex: currentSlide,
      notes: notesHtml,
      totalSlides: totalSlides
    }, '*');
  }

  function goToSlide(index, options = {}) {
    if (index < 0 || index >= totalSlides) return;
    if (isAnimating && !options.instant) return;

    isAnimating = true;
    currentSlide = index;

    if (typeof options.step === 'number') {
      setSlideStep(currentSlide, options.step);
    }

    if (options.instant) {
      wrapper.style.transition = 'none';
      wrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
      void window.getComputedStyle(wrapper).transform;
      wrapper.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      wrapper.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      wrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
    }

    const container = document.querySelector('.slides-container');
    if (container && container.scrollTop !== 0) container.scrollTop = 0;
    if (window.scrollY !== 0) window.scrollTo(0, 0);

    slides.forEach((sec, idx) => {
      sec.classList.toggle('active', idx === currentSlide);
    });

    const isDark = slides[currentSlide] && slides[currentSlide].classList.contains('slide-dark');
    document.body.classList.toggle('on-dark-slide', Boolean(isDark));

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    animateSlideCounters(slides[currentSlide]);
    syncWithParentShell();

    if (options.instant) {
      isAnimating = false;
    } else {
      setTimeout(() => {
        isAnimating = false;
      }, 660);
    }
  }

  // Passador Inteligente: avança micro-etapa do slide atual antes de mudar de slide
  function nextStepOrSlide(forceSlideJump = false) {
    if (isAnimating) return;
    const currentMax = maxSteps[currentSlide] || 0;
    const currentStep = slideSteps[currentSlide] || 0;

    if (!forceSlideJump && currentStep < currentMax) {
      setSlideStep(currentSlide, currentStep + 1);
      return;
    }

    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1, { step: 0 });
    }
  }

  function prevStepOrSlide(forceSlideJump = false) {
    if (isAnimating) return;
    const currentStep = slideSteps[currentSlide] || 0;

    if (!forceSlideJump && currentStep > 0) {
      setSlideStep(currentSlide, currentStep - 1);
      return;
    }

    if (currentSlide > 0) {
      const prevIdx = currentSlide - 1;
      goToSlide(prevIdx, { step: maxSteps[prevIdx] || 0 });
    }
  }

  // ==========================================================================
  // 5. EVENTOS DE CLIQUE NOS WIDGETS INTERATIVOS
  // ==========================================================================

  // Evita que foco residual em botões capture Barra de Espaço / Setas
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      setTimeout(() => btn.blur(), 0);
    }
  });

  const btnStart = document.getElementById('btn-start-chapter');
  if (btnStart) {
    btnStart.addEventListener('click', () => goToSlide(1, { step: 0 }));
  }

  // Botões "Avançar ▸" nos cabeçalhos dos slides interativos
  document.querySelectorAll('[data-step-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      nextStepOrSlide(false);
    });
  });

  // Slide 2: Tabs das 4 personas
  document.querySelectorAll('.persona-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-persona'), 10);
      setSlideStep(1, idx);
    });
  });

  // Slide 3: Pills das 3 lentes
  document.querySelectorAll('.lens-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-lens'), 10);
      setSlideStep(2, idx);
    });
  });

  // Slide 4: Cards de siglas
  document.querySelectorAll('.acronym-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-acronym'), 10);
      setSlideStep(3, idx);
    });
  });

  // Slide 5: 4 fases do ciclo de vida
  document.querySelectorAll('.lc-stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-lc'), 10);
      setSlideStep(4, idx);
    });
  });

  // Dots laterais direitos + geração das miniaturas ao vivo (apenas fora de preview)
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx, { step: 0 });
    });

    if (!isPreview) {
      const previewWrap = document.getElementById(`preview-wrapper-${idx}`);
      if (previewWrap) {
        let previewLoaded = false;
        dot.addEventListener('mouseenter', () => {
          if (previewLoaded) return;
          previewLoaded = true;
          const miniFrame = document.createElement('iframe');
          miniFrame.src = `./001.DecisaoLCC.html?preview=true#slide-${idx + 1}`;
          miniFrame.className = 'slide-preview-iframe';
          miniFrame.setAttribute('scrolling', 'no');
          miniFrame.setAttribute('tabindex', '-1');
          miniFrame.setAttribute('aria-hidden', 'true');
          previewWrap.appendChild(miniFrame);
        });
      }
    }
  });

  // ==========================================================================
  // 6. NAVEGAÇÃO POR TECLADO, RODA DO MOUSE, SWIPE E POSTMESSAGE
  // ==========================================================================
  if (!isPreview) {
    document.addEventListener('keydown', (e) => {
      const tag = e.target ? e.target.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        nextStepOrSlide(e.shiftKey);
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prevStepOrSlide(e.shiftKey);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0, { step: 0 });
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1, { step: 0 });
      }
    });

    let lastWheelAt = 0;
    window.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) < 18) return;
      const now = performance.now();
      if (now - lastWheelAt < 620) return;
      lastWheelAt = now;

      if (e.deltaY > 0) {
        nextStepOrSlide(false);
      } else {
        prevStepOrSlide(false);
      }
    }, { passive: true });

    let touchStartY = null;
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (touchStartY === null || !e.changedTouches || !e.changedTouches.length) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      touchStartY = null;
      if (Math.abs(dy) < 42) return;
      if (dy > 0) nextStepOrSlide(false);
      else prevStepOrSlide(false);
    }, { passive: true });
  }

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'GOTO_SLIDE' && typeof data.slideIndex === 'number') {
      goToSlide(data.slideIndex);
    }
  });

  // ==========================================================================
  // 7. MOTOR DO QUIZ MULTI-CENÁRIOS (SLIDE 7)
  // ==========================================================================
  let activeQuizIdx = 0;
  const quizSolved = [false, false, false];
  const quizSelectedOption = [null, null, null];

  const quizPromptEl = document.getElementById('quiz-question-prompt');
  const quizGridEl = document.getElementById('quiz-options-grid');
  const quizFeedbackEl = document.getElementById('quiz-feedback-banner');
  const quizProgressEl = document.getElementById('quiz-progress-label');
  const quizTabBtns = Array.from(document.querySelectorAll('.quiz-tab-btn'));
  const btnQuizNext = document.getElementById('btn-quiz-next');
  const btnQuizReset = document.getElementById('btn-quiz-reset');

  function renderQuizScenario(qIdx) {
    activeQuizIdx = qIdx;
    const qData = QUIZ_QUESTIONS[qIdx];
    if (!qData || !quizGridEl) return;

    const solvedCount = quizSolved.filter(Boolean).length;
    if (quizProgressEl) {
      quizProgressEl.textContent = `Questão ${qIdx + 1} de ${QUIZ_QUESTIONS.length} • ${solvedCount}/${QUIZ_QUESTIONS.length} concluídas com acerto`;
    }

    quizTabBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === qIdx);
      btn.classList.toggle('done-right', quizSolved[idx]);
      const baseLabels = ['1. Silos vs. LCC', '2. LCC vs. ACV', '3. Valor na ISO 55000'];
      btn.textContent = quizSolved[idx] ? `✓ ${baseLabels[idx]}` : baseLabels[idx];
    });

    if (quizPromptEl) {
      quizPromptEl.textContent = qData.prompt;
    }

    quizGridEl.innerHTML = '';
    qData.options.forEach((opt, optIdx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'quiz-option-card';

      if (quizSolved[qIdx] && opt.correct) {
        card.classList.add('is-correct');
      } else if (!quizSolved[qIdx] && quizSelectedOption[qIdx] === optIdx && !opt.correct) {
        card.classList.add('is-wrong');
      }

      card.innerHTML = `
        <span class="option-letter">${opt.letter}</span>
        <span class="option-text">${opt.text}</span>
      `;

      card.addEventListener('click', () => handleQuizAnswer(qIdx, optIdx));
      quizGridEl.appendChild(card);
    });

    if (quizFeedbackEl) {
      if (quizSolved[qIdx]) {
        const rightOpt = qData.options.find(o => o.correct);
        quizFeedbackEl.className = 'quiz-feedback-banner visible right';
        quizFeedbackEl.textContent = rightOpt ? rightOpt.feedback : '';
      } else if (quizSelectedOption[qIdx] !== null) {
        const chosen = qData.options[quizSelectedOption[qIdx]];
        quizFeedbackEl.className = 'quiz-feedback-banner visible wrong';
        quizFeedbackEl.textContent = chosen ? chosen.feedback : '';
      } else {
        quizFeedbackEl.className = 'quiz-feedback-banner';
        quizFeedbackEl.textContent = '';
      }
    }

    if (btnQuizNext) {
      btnQuizNext.textContent = qIdx < QUIZ_QUESTIONS.length - 1
        ? 'Próxima Questão →'
        : 'Voltar à Questão 1 ↺';
    }
  }

  function handleQuizAnswer(qIdx, optIdx) {
    const qData = QUIZ_QUESTIONS[qIdx];
    if (!qData) return;
    const chosen = qData.options[optIdx];
    if (!chosen) return;

    quizSelectedOption[qIdx] = optIdx;
    if (chosen.correct) {
      quizSolved[qIdx] = true;
    }
    renderQuizScenario(qIdx);
  }

  quizTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-qtab'), 10);
      renderQuizScenario(idx);
    });
  });

  if (btnQuizNext) {
    btnQuizNext.addEventListener('click', () => {
      const nextIdx = (activeQuizIdx + 1) % QUIZ_QUESTIONS.length;
      renderQuizScenario(nextIdx);
    });
  }

  if (btnQuizReset) {
    btnQuizReset.addEventListener('click', () => {
      for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
        quizSolved[i] = false;
        quizSelectedOption[i] = null;
      }
      renderQuizScenario(0);
    });
  }

  renderQuizScenario(0);

  // ==========================================================================
  // 8. INICIALIZAÇÃO POR QUERY (?slide=N) OU HASH (#slide-N) E PRIMEIRO SYNC
  // ==========================================================================
  let startSlideIdx = 0;
  const slideQuery = parseInt(urlParams.get('slide'), 10);
  if (!isNaN(slideQuery) && slideQuery >= 0 && slideQuery < totalSlides) {
    startSlideIdx = slideQuery;
  } else if (window.location.hash && window.location.hash.startsWith('#slide-')) {
    const parsed = parseInt(window.location.hash.replace('#slide-', ''), 10);
    if (!isNaN(parsed)) {
      if (isPreview && parsed >= 1 && parsed <= totalSlides) {
        startSlideIdx = parsed - 1;
      } else if (parsed >= 0 && parsed < totalSlides) {
        startSlideIdx = parsed;
      }
    }
  }

  const stepQuery = parseInt(urlParams.get('step'), 10);
  goToSlide(startSlideIdx, {
    instant: true,
    step: !isNaN(stepQuery) ? stepQuery : undefined
  });
});

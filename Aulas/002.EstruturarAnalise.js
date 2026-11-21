import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

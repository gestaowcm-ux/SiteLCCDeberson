import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { DEFAULTS, model, money, num } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
  initSlideEngine({
    lessonFile: '005.ComparacaoEconomica.html',
    maxSteps: [0, 0, 0, 0, 0, 3, 0, 0]
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
});

import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import {
  DEFAULTS,
  cloneParams,
  comparison,
  thresholdHours,
  sensitivityData,
  decisionCurvePoints,
  money,
  num,
  signedMoney
} from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

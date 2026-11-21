import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { DEFAULTS, cloneParams, comparison, thresholdHours, money, num } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

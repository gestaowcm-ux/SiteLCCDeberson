import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { money, num } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

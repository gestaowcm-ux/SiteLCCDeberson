import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { money, num } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

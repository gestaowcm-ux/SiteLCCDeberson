import { initSlideEngine, initQuiz } from '/js/lcc-slide-engine.js';
import { DEFAULTS, comparison, money } from '/js/lcc-model.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

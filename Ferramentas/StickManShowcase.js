/**
 * StickManShowcase.js
 * Catálogo Interativo e Estúdio de Personagens Stick Man Monocromáticos para Storytelling RCA
 * 4 Estilos × 5 Poses Narrativas = 20 Modelos Vetoriais Prontos para Uso
 */

(function() {
  'use strict';

  // Definição dos Dados dos Estilos e suas 5 Poses em SVG Vetorial Puro
  const stickmanLibrary = {
    engineer: {
      id: 'engineer',
      name: 'Engenheiro Técnico RCA',
      tag: 'Recomendado',
      description: 'Design técnico e corporativo com EPI (capacete de proteção), prancheta de auditoria, lupa de investigação e acessórios de engenharia.',
      poses: [
        {
          id: 'alarm',
          phase: '1. Incidente / Alarme',
          name: 'Choque & Alarme de Falha',
          desc: 'Diante de um disparo de alarme ou quebra de máquina. Mãos na cabeça com capacete e linhas de alerta.',
          storyEyebrow: 'FASE 1: IDENTIFICAÇÃO DO INCIDENTE',
          storyTitle: 'Disparo de Alarme Crítico no Sistema Hidráulico',
          storyCardTitle: 'O Alerta Inicial',
          storyText: '"Às 02:45h, a pressão caiu repentinamente e a sirene de sobrepressão disparou. O engenheiro no turno corre até o painel central para conter o vazamento antes do colapso total."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Efeito de Alerta / Sirene de Vibração -->
  <path d="M40 30L55 45M160 30L145 45M30 65L50 68M170 65L150 68" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <path d="M90 15L100 8L110 15" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Cabeça com Expressão de Choque -->
  <circle cx="100" cy="70" r="24" stroke="currentColor" stroke-width="4.5" fill="transparent"/>
  <!-- Olhos arregalados e Boca "O" -->
  <circle cx="92" cy="68" r="3" fill="currentColor"/>
  <circle cx="108" cy="68" r="3" fill="currentColor"/>
  <ellipse cx="100" cy="81" rx="4" ry="6" stroke="currentColor" stroke-width="2.5"/>

  <!-- Capacete de Proteção / EPI com Faixa Refletiva -->
  <path d="M72 64C74 44 85 38 100 38C115 38 126 44 128 64Z" stroke="currentColor" stroke-width="4.5" fill="none"/>
  <path d="M68 64H132" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="90" y1="44" x2="110" y2="44" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Tronco -->
  <line x1="100" y1="94" x2="100" y2="165" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>

  <!-- Braços em Desespero (Mãos segurando a cabeça/capacete) -->
  <path d="M100 110L72 90L76 68" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 110L128 90L124 68" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas em Postura de Sobressalto -->
  <path d="M100 165L75 198L62 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 165L125 198L138 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        },
        {
          id: 'investigate',
          phase: '2. Investigação / Coleta',
          name: 'Análise com Lupa & Prancheta',
          desc: 'Examinando evidências físicas no solo/máquina com prancheta de apontamento de dados e lupa.',
          storyEyebrow: 'FASE 2: PRESERVAÇÃO E COLETA DE DADOS',
          storyTitle: 'Inspeção Detalhada das Evidências de Fratura',
          storyCardTitle: 'Investigação em Campo',
          storyText: '"Com a prancheta de apontamento e a lupa de inspeção, o investigador examina as estrias de fadiga na haste rompida, registrando medições e histórico de torque."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cabeça Inclinada Focada -->
  <circle cx="85" cy="72" r="22" stroke="currentColor" stroke-width="4.5" fill="transparent"/>
  <!-- Olho focado para baixo -->
  <circle cx="80" cy="74" r="2.5" fill="currentColor"/>
  <line x1="72" y1="84" x2="88" y2="82" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Capacete de Proteção -->
  <path d="M58 66C60 48 71 42 85 42C99 42 110 48 112 66Z" stroke="currentColor" stroke-width="4" fill="none"/>
  <path d="M54 66H116" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Tronco Inclinado -->
  <line x1="85" y1="94" x2="105" y2="162" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>

  <!-- Braço Esquerdo Segurando a Prancheta -->
  <path d="M88 108L60 128L55 140" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Prancheta Técnica -->
  <rect x="36" y="125" width="28" height="38" rx="3" stroke="currentColor" stroke-width="3" fill="none"/>
  <path d="M44 121H56V126H44Z" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="42" y1="135" x2="58" y2="135" stroke="currentColor" stroke-width="2"/>
  <line x1="42" y1="143" x2="58" y2="143" stroke="currentColor" stroke-width="2"/>
  <line x1="42" y1="151" x2="52" y2="151" stroke="currentColor" stroke-width="2"/>

  <!-- Braço Direito Estendido com Lupa -->
  <path d="M92 110L125 125L145 142" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Lupa de Inspeção -->
  <circle cx="152" cy="148" r="14" stroke="currentColor" stroke-width="3.5" fill="none"/>
  <line x1="162" y1="158" x2="176" y2="172" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M146 148H158M152 142V154" stroke="currentColor" stroke-width="1.5"/>

  <!-- Pernas em Postura de Análise / Agachado Parcial -->
  <path d="M105 162L85 195L75 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M105 162L125 192L140 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        },
        {
          id: 'eureka',
          phase: '3. Análise / Descoberta',
          name: 'Eureka da Causa Raiz',
          desc: 'Momento da descoberta! Lâmpada acesa sobre o capacete e dedo indicador apontado para o topo.',
          storyEyebrow: 'FASE 3: DETERMINAÇÃO DA CAUSA RAIZ',
          storyTitle: 'Descoberta da Causa Latente Organizacional',
          storyCardTitle: 'O Momento da Revelação',
          storyText: '"Cruzando a árvore de falhas com os 5 Porquês, tudo se conecta: o procedimento de lubrificação não previa a compensação de temperatura no inverno."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Lâmpada de Eureka Iluminada -->
  <path d="M100 8C90 8 82 15 82 24C82 30 86 34 88 38H112C114 34 118 30 118 24C118 15 110 8 100 8Z" stroke="currentColor" stroke-width="3" fill="none"/>
  <path d="M92 41H108M95 44H105" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Raios de Brilho da Ideia -->
  <path d="M100 1V5M72 15L78 20M128 15L122 20M66 28H72M134 28H128" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Cabeça Sorridente / Confiante -->
  <circle cx="100" cy="85" r="22" stroke="currentColor" stroke-width="4.5" fill="transparent"/>
  <!-- Olhos Felizes e Sorriso Aberto -->
  <path d="M92 82C93 80 97 80 98 82" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M104 82C105 80 109 80 110 82" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M93 94C96 99 104 99 107 94" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Capacete de Proteção -->
  <path d="M74 78C76 60 87 54 100 54C113 54 124 60 126 78Z" stroke="currentColor" stroke-width="4" fill="none"/>
  <path d="M70 78H130" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Tronco -->
  <line x1="100" y1="107" x2="100" y2="170" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>

  <!-- Braço Esquerdo (Apontando para Cima / Ideia) -->
  <path d="M100 120L72 105L70 70" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="70" cy="65" r="4" fill="currentColor"/>

  <!-- Braço Direito na Cintura Confiante -->
  <path d="M100 120L125 135L118 155" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas Firmes -->
  <path d="M100 170L80 200L72 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 170L120 200L128 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        },
        {
          id: 'action',
          phase: '4. Plano de Ação',
          name: 'Apresentando o Plano 5W2H',
          desc: 'Em frente ao quadro com ponteiro técnico, demonstrando as contramedidas e prazos.',
          storyEyebrow: 'FASE 4: ELABORAÇÃO DO PLANO DE AÇÃO',
          storyTitle: 'Apresentação das Ações Corretivas e Prazos',
          storyCardTitle: 'Engajando os Gestores',
          storyText: '"Com clareza técnica e foco em barreiras físicas robustas, o engenheiro apresenta a matriz 5W2H para a liderança industrial, definindo donos e cronograma."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Quadro / Prancha de Fundo com Checklist -->
  <rect x="110" y="30" width="75" height="75" rx="5" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 2" fill="none"/>
  <line x1="120" y1="45" x2="175" y2="45" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="123" cy="60" r="3" fill="currentColor"/>
  <line x1="132" y1="60" x2="172" y2="60" stroke="currentColor" stroke-width="2"/>
  <circle cx="123" cy="75" r="3" fill="currentColor"/>
  <line x1="132" y1="75" x2="165" y2="75" stroke="currentColor" stroke-width="2"/>
  <circle cx="123" cy="90" r="3" fill="currentColor"/>
  <line x1="132" y1="90" x2="170" y2="90" stroke="currentColor" stroke-width="2"/>

  <!-- Cabeça Postura Profissional -->
  <circle cx="70" cy="72" r="22" stroke="currentColor" stroke-width="4.5" fill="transparent"/>
  <circle cx="76" cy="70" r="2.5" fill="currentColor"/>
  <line x1="68" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Capacete de Proteção -->
  <path d="M44 65C46 47 57 41 70 41C83 41 94 47 96 65Z" stroke="currentColor" stroke-width="4" fill="none"/>
  <path d="M40 65H100" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Tronco -->
  <line x1="70" y1="94" x2="70" y2="165" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>

  <!-- Braço Direito Apontando com Ponteiro Laser/Técnico -->
  <path d="M70 110L100 95L145 65" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <!-- Ponta de Destaque -->
  <circle cx="145" cy="65" r="4" fill="currentColor"/>

  <!-- Braço Esquerdo Segurando Documento / Prancheta -->
  <path d="M70 110L48 130L55 150" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <rect x="42" y="145" width="18" height="24" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>

  <!-- Pernas em Postura Firme de Oratória -->
  <path d="M70 165L55 198L48 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M70 165L88 198L95 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        },
        {
          id: 'success',
          phase: '5. Sucesso / Prevenção',
          name: 'Missão Cumprida & Barreira Ativa',
          desc: 'Gesto de aprovação com polegar para cima, processo estável e seguro.',
          storyEyebrow: 'FASE 5: EFICÁCIA E LIÇÕES APRENDIDAS',
          storyTitle: 'Processo Estabilizado e Retorno Zero de Falhas',
          storyCardTitle: 'Resultado Sustentável',
          storyText: '"Após 90 dias de monitoramento contínuo, a taxa de falhas caiu para zero e a nova barreira de engenharia foi homologada como padrão corporativo."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Escudo / Símbolo de Proteção de Fundo Sutil -->
  <path d="M100 25L135 40V75C135 100 100 115 100 115C100 115 65 100 65 75V40L100 25Z" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3" opacity="0.4" fill="none"/>
  
  <!-- Cabeça Feliz e Confiante -->
  <circle cx="100" cy="72" r="22" stroke="currentColor" stroke-width="4.5" fill="transparent"/>
  <!-- Olhos Piscando / Sorrindo -->
  <path d="M90 70C92 68 96 68 98 70" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M104 68L112 72L104 76" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M92 82C96 87 104 87 108 82" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Capacete de Proteção -->
  <path d="M74 65C76 47 87 41 100 41C113 41 124 47 126 65Z" stroke="currentColor" stroke-width="4" fill="none"/>
  <path d="M70 65H130" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Tronco -->
  <line x1="100" y1="94" x2="100" y2="165" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>

  <!-- Braço Direito: Polegar para Cima (Joinha!) -->
  <path d="M100 110L130 115L145 98" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Mão com Polegar Levanto -->
  <path d="M145 98V86M145 98H152" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braço Esquerdo Confiante na Cintura -->
  <path d="M100 110L72 125L80 148" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas Estáveis -->
  <path d="M100 165L78 198L70 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 165L122 198L130 232" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        }
      ]
    },

    minimal: {
      id: 'minimal',
      name: 'Minimalista Expressivo (Estilo xkcd)',
      tag: 'Tirinhas & Didática',
      description: 'Linguagem clássica de tirinhas cartunescas e storytelling dinâmico, focado em poses elásticas, alta expressividade e ritmo narrativo.',
      poses: [
        {
          id: 'alarm',
          phase: '1. Incidente / Alarme',
          name: 'Pânico Dinâmico',
          desc: 'Braços ao alto em espasmo e linhas cinéticas de susto.',
          storyEyebrow: 'FASE 1: O SUSTO DA FALHA',
          storyTitle: 'Parada Brusca da Produção!',
          storyCardTitle: 'Reação Imediata',
          storyText: '"Com a linha de envase parada e as luzes vermelhas piscando, o pânico toma conta da equipe até o início da contenção."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Ponto de Exclamação e Linhas de Choque -->
  <text x="140" y="55" font-size="34" font-weight="bold" fill="currentColor" font-family="sans-serif">!</text>
  <path d="M45 40L55 52M145 80L160 85M35 85L50 90" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>

  <!-- Cabeça Redonda Solta -->
  <circle cx="95" cy="75" r="24" stroke="currentColor" stroke-width="4" fill="transparent"/>
  <!-- Olhos em pontos e boca aberta de desespero -->
  <circle cx="88" cy="72" r="2.5" fill="currentColor"/>
  <circle cx="102" cy="72" r="2.5" fill="currentColor"/>
  <circle cx="95" cy="85" r="5" stroke="currentColor" stroke-width="2.5"/>

  <!-- Tronco Ondulado / Carga Cinética -->
  <path d="M95 99C95 125 105 140 100 168" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braços Jogados para Cima -->
  <path d="M95 112L65 85L50 55" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M95 112L125 85L138 52" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas em Movimento Desesperado -->
  <path d="M100 168L70 195L52 225" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M100 168L128 192L148 222" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        },
        {
          id: 'investigate',
          phase: '2. Investigação / Dúvida',
          name: 'Coçando o Queixo & Investigando',
          desc: 'Postura clássica de dúvida com ponto de interrogação flutuante.',
          storyEyebrow: 'FASE 2: QUESTIONAMENTO CRÍTICO',
          storyTitle: 'Por que o Sensor não Atuou a Tempo?',
          storyCardTitle: 'O Início das Perguntas',
          storyText: '"Olhando os registros de calibração, algo não bate. O protagonista começa a cruzar os relatórios de manutenção dos últimos 6 meses."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Ponto de Interrogação -->
  <text x="135" y="60" font-size="32" font-weight="bold" fill="currentColor" font-family="sans-serif">?</text>

  <!-- Cabeça Inclinada -->
  <circle cx="90" cy="72" r="23" stroke="currentColor" stroke-width="4" fill="transparent"/>
  <!-- Olhar Pensativo -->
  <circle cx="84" cy="69" r="2.5" fill="currentColor"/>
  <circle cx="96" cy="69" r="2.5" fill="currentColor"/>
  <path d="M85 83C90 81 96 82 98 83" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Tronco Inclinado para Frente -->
  <line x1="90" y1="95" x2="105" y2="165" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braço Direito Segurando o Queixo (Pensador) -->
  <path d="M92 115L120 115L95 86" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Braço Esquerdo Segurando a Base do Cotovelo -->
  <path d="M90 115L70 135L110 135" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas Cruzadas Pensativas -->
  <path d="M105 165L85 195L80 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M105 165L120 190L105 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'eureka',
          phase: '3. Análise / Descoberta',
          name: 'Eureka & Salto de Ideia',
          desc: 'Lâmpada acesa e postura alegre com salto de iluminação.',
          storyEyebrow: 'FASE 3: A REVELAÇÃO DA CAUSA',
          storyTitle: 'Achamos a Causa Raiz do Problema!',
          storyCardTitle: 'O Clique Mental',
          storyText: '"Não foi erro do operador! O firmware havia sido atualizado sem validação da curva de resposta térmica."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Lâmpada Minimalista -->
  <circle cx="100" cy="25" r="14" stroke="currentColor" stroke-width="3" fill="none"/>
  <path d="M94 39H106" stroke="currentColor" stroke-width="3"/>
  <path d="M80 15L74 10M120 15L126 10M100 7V2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Cabeça com Sorrisão -->
  <circle cx="100" cy="75" r="23" stroke="currentColor" stroke-width="4" fill="transparent"/>
  <circle cx="92" cy="72" r="2.5" fill="currentColor"/>
  <circle cx="108" cy="72" r="2.5" fill="currentColor"/>
  <path d="M90 85C95 93 105 93 110 85" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>

  <!-- Tronco Dinâmico -->
  <line x1="100" y1="98" x2="100" y2="160" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braços Abertos Triunfantes -->
  <path d="M100 115L65 95L52 65" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 115L135 95L148 65" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>

  <!-- Pernas em Pulo Leve -->
  <path d="M100 160L75 188L60 215" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M100 160L125 188L140 215" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'action',
          phase: '4. Plano de Ação',
          name: 'Desenrolando o Mapa de Ação',
          desc: 'Segurando um grande roteiro / fluxo com determinação.',
          storyEyebrow: 'FASE 4: ESTRUTURANDO O PLANO',
          storyTitle: 'Roteiro de Implementação das Novas Barreiras',
          storyCardTitle: 'Passo a Passo Visual',
          storyText: '"Aqui está o cronograma detalhado: revisão de código em 5 dias, teste em bancada em 10 dias e rollout geral em 15 dias."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Grande Folha de Roteiro / Mapa -->
  <path d="M115 50C130 45 155 45 170 50V125C155 120 130 120 115 125Z" stroke="currentColor" stroke-width="3" fill="none"/>
  <path d="M125 65H160M125 80H155M125 95H162M125 110H145" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>

  <!-- Cabeça Determinada -->
  <circle cx="75" cy="75" r="23" stroke="currentColor" stroke-width="4" fill="transparent"/>
  <circle cx="82" cy="73" r="2.5" fill="currentColor"/>
  <line x1="74" y1="84" x2="88" y2="84" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Tronco -->
  <line x1="75" y1="98" x2="80" y2="165" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braços Segurando o Mapa -->
  <path d="M76 112L115 90" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M76 112L115 120" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>

  <!-- Pernas Andando Confiante -->
  <path d="M80 165L60 195L45 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M80 165L105 195L125 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'success',
          phase: '5. Sucesso / Prevenção',
          name: 'Vitória & Paz Operacional',
          desc: 'Relaxado, comemoração e sorriso amplo de dever cumprido.',
          storyEyebrow: 'FASE 5: SUCESSO COMPROVADO',
          storyTitle: 'Operação Segura e Confiabilidade Restaurada',
          storyCardTitle: 'Paz de Espírito na Planta',
          storyText: '"Nenhum novo alarme falso registrado nos últimos 3 meses. A equipe trabalha com confiança e segurança."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Estrelas de Sucesso -->
  <path d="M45 45L48 53L56 56L48 59L45 67L42 59L34 56L42 53Z" fill="currentColor"/>
  <path d="M155 45L158 53L166 56L158 59L155 67L152 59L144 56L152 53Z" fill="currentColor"/>

  <!-- Cabeça Feliz de Olhos Fechados de Alívio -->
  <circle cx="100" cy="75" r="23" stroke="currentColor" stroke-width="4" fill="transparent"/>
  <path d="M88 72C91 70 95 70 98 72" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M102 72C105 70 109 70 112 72" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M92 84C97 92 103 92 108 84" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>

  <!-- Tronco -->
  <line x1="100" y1="98" x2="100" y2="165" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Braços em V de Vitória -->
  <path d="M100 115L65 95L45 70" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 115L135 95L155 70" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>

  <!-- Pernas Estáveis -->
  <path d="M100 165L75 198L65 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M100 165L125 198L135 230" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`
        }
      ]
    },

    modern: {
      id: 'modern',
      name: 'Modern Icon System',
      tag: 'Design System',
      description: 'Estilo corporativo premium com cabeça em círculo sólido preenchido, linhas grossas uniformes (5.5px) e formas geométricas limpas.',
      poses: [
        {
          id: 'alarm',
          phase: '1. Incidente / Alarme',
          name: 'Stop & Alerta de Perigo',
          desc: 'Braço espalmado sinalizando parada e triângulo de advertência.',
          storyEyebrow: 'FASE 1: PARADA DE EMERGÊNCIA',
          storyTitle: 'Acionamento do Protocolo de Segurança',
          storyCardTitle: 'Sinal Vermelho',
          storyText: '"O protocolo de segurança exige parada imediata da esteira para evitar danos estruturais adicionais."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Triângulo de Advertência Moderno -->
  <path d="M150 40L175 80H125L150 40Z" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round" fill="none"/>
  <line x1="150" y1="53" x2="150" y2="67" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="150" cy="74" r="2" fill="currentColor"/>

  <!-- Cabeça Sólida Moderna -->
  <circle cx="85" cy="65" r="20" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="85" y1="92" x2="85" y2="162" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>

  <!-- Braço Direito Espalmado (Sinal de PARE) -->
  <path d="M85 110L125 110" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
  <line x1="125" y1="98" x2="125" y2="122" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Braço Esquerdo Firme -->
  <path d="M85 110L58 135" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Pernas Postura Firme -->
  <path d="M85 162L65 225" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <path d="M85 162L105 225" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'investigate',
          phase: '2. Investigação / Auditoria',
          name: 'Auditoria de Dados & Prancheta',
          desc: 'Postura formal analisando métricas com caneta óptica.',
          storyEyebrow: 'FASE 2: ANÁLISE SISTÊMICA',
          storyTitle: 'Conferência dos Logs de Telemetria',
          storyCardTitle: 'Rastreabilidade Total',
          storyText: '"Todas as variáveis de processo são confrontadas com os limites operacionais pré-estabelecidos."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cabeça Sólida -->
  <circle cx="100" cy="60" r="20" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="100" y1="88" x2="100" y2="160" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>

  <!-- Prancheta Geométrica Central -->
  <rect x="75" y="105" width="50" height="42" rx="4" stroke="currentColor" stroke-width="3.5" fill="none"/>
  <line x1="84" y1="118" x2="116" y2="118" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="84" y1="128" x2="116" y2="128" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="84" y1="138" x2="106" y2="138" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Braços Segurando a Prancheta -->
  <path d="M100 102L68 118L75 128" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M100 102L132 118L125 128" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Pernas -->
  <path d="M100 160L78 225" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 160L122 225" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'eureka',
          phase: '3. Análise / Descoberta',
          name: 'Insight & Centelha Tecnológica',
          desc: 'Símbolo de centelha / estrela geométrica e postura ereta.',
          storyEyebrow: 'FASE 3: IDENTIFICAÇÃO DO FATOR CHAVE',
          storyTitle: 'Padrão de Falha Reconhecido',
          storyCardTitle: 'O Elo Perdido',
          storyText: '"A correlação entre o pico de carga elétrica e a falha mecânica revela o componente crítico defasado."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Centelha Geométrica / Spark -->
  <path d="M100 10L104 22L116 26L104 30L100 42L96 30L84 26L96 22Z" fill="currentColor"/>

  <!-- Cabeça Sólida -->
  <circle cx="100" cy="72" r="20" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="100" y1="100" x2="100" y2="165" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>

  <!-- Braço Apontando para o Alto em Linha Reta -->
  <path d="M100 115L65 85V55" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Braço Direito Flexionado -->
  <path d="M100 115L135 130L130 150" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Pernas -->
  <path d="M100 165L75 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 165L125 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'action',
          phase: '4. Plano de Ação',
          name: 'Apresentação de Métricas / KPI',
          desc: 'Apontando para gráfico em colunas ascendentes.',
          storyEyebrow: 'FASE 4: PROJEÇÃO DE IMPACTO',
          storyTitle: 'Metas Claras e Redução do MTTR',
          storyCardTitle: 'Direcionamento Estratégico',
          storyText: '"A nova estratégia de manutenção preditiva vai reduzir o MTTR em 65% já no primeiro semestre."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Gráfico de Barras Moderno -->
  <rect x="120" y="80" width="12" height="35" rx="2" fill="currentColor" opacity="0.3"/>
  <rect x="138" y="60" width="12" height="55" rx="2" fill="currentColor" opacity="0.6"/>
  <rect x="156" y="35" width="12" height="80" rx="2" fill="currentColor"/>
  <line x1="115" y1="118" x2="175" y2="118" stroke="currentColor" stroke-width="2.5"/>

  <!-- Cabeça Sólida -->
  <circle cx="70" cy="70" r="20" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="70" y1="98" x2="70" y2="165" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>

  <!-- Braço Apontando para o Gráfico -->
  <path d="M70 115L120 75" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Braço Esquerdo -->
  <path d="M70 115L45 140" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Pernas -->
  <path d="M70 165L50 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <path d="M70 165L90 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
</svg>`
        },
        {
          id: 'success',
          phase: '5. Sucesso / Eficácia',
          name: 'Checkmark & Validação',
          desc: 'Ícone de checkmark circular de conformidade 100%.',
          storyEyebrow: 'FASE 5: CONFORMIDADE ATINGIDA',
          storyTitle: 'Certificação e Bloqueio Definitivo',
          storyCardTitle: 'Excelência Operacional',
          storyText: '"Auditoria concluída com 100% de conformidade nas novas rotinas de inspeção."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Checkmark Badge -->
  <circle cx="150" cy="55" r="22" stroke="currentColor" stroke-width="3" fill="none"/>
  <path d="M140 55L147 62L162 47" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Cabeça Sólida -->
  <circle cx="85" cy="70" r="20" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="85" y1="98" x2="85" y2="165" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>

  <!-- Braço Direito em Conexão com o Checkmark -->
  <path d="M85 115L125 78" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Braço Esquerdo na Cintura -->
  <path d="M85 115L58 135L68 150" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>

  <!-- Pernas -->
  <path d="M85 165L62 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <path d="M85 165L108 228" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
</svg>`
        }
      ]
    },

    blueprint: {
      id: 'blueprint',
      name: 'Blueprint CAD Industrial',
      tag: 'Engenharia CAD',
      description: 'Estilo de diagrama técnico mecânico, com cruzetas nos nós de articulação, linhas de cota milimétricas e traços de desenho industrial.',
      poses: [
        {
          id: 'alarm',
          phase: '1. Incidente / Desvio',
          name: 'Nó Crítico em Sobrecarga',
          desc: 'Indicação de desvio angular e vetor de força excessivo.',
          storyEyebrow: 'FASE 1: ANOMALIA ESTRUTURAL',
          storyTitle: 'Tensão Dinâmica Acima do Limite de Escoamento',
          storyCardTitle: 'Desvio de Projeto',
          storyText: '"Os sensores de deformação acusaram deflexão de 4.2mm no mancal principal, ultrapassando a folga nominal."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Linhas de Grade e Cota Técnicas -->
  <path d="M30 40H170M30 230H170" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
  <path d="M40 30V235M160 30V235" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
  <line x1="140" y1="45" x2="160" y2="45" stroke="currentColor" stroke-width="1.5"/>
  <text x="142" y="40" font-size="9" fill="currentColor" font-family="monospace">ΔT > MAX</text>

  <!-- Cabeça Blueprint (Círculo com Cruzeta Central) -->
  <circle cx="100" cy="70" r="22" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 2" fill="none"/>
  <circle cx="100" cy="70" r="17" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="100" y1="45" x2="100" y2="95" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <line x1="75" y1="70" x2="125" y2="70" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>

  <!-- Tronco com Nós de Articulação -->
  <line x1="100" y1="92" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  <circle cx="100" cy="110" r="4" fill="currentColor"/>
  <circle cx="100" cy="165" r="4" fill="currentColor"/>

  <!-- Braços com Vetores de Força -->
  <path d="M100 110L65 85L50 55" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="65" cy="85" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="50" cy="55" r="3" fill="currentColor"/>

  <path d="M100 110L135 85L150 55" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="135" cy="85" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="150" cy="55" r="3" fill="currentColor"/>

  <!-- Pernas -->
  <path d="M100 165L70 195L55 230" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="70" cy="195" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  
  <path d="M100 165L130 195L145 230" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="130" cy="195" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>`
        },
        {
          id: 'investigate',
          phase: '2. Investigação / Metrologia',
          name: 'Medição & Tolerâncias CAD',
          desc: 'Uso de paquímetro e linhas de referência milimétricas.',
          storyEyebrow: 'FASE 2: METROLOGIA FORENSE',
          storyTitle: 'Medição Dimensional de Desgaste',
          storyCardTitle: 'Coleta Milimétrica',
          storyText: '"A medição com micrômetro revelou conicidade de 0.08mm no eixo, indicando desbalanceamento progressivo."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Paquímetro / Escala Metrológica -->
  <line x1="120" y1="80" x2="180" y2="80" stroke="currentColor" stroke-width="2.5"/>
  <line x1="125" y1="75" x2="125" y2="85" stroke="currentColor" stroke-width="1.5"/>
  <line x1="140" y1="77" x2="140" y2="83" stroke="currentColor" stroke-width="1"/>
  <line x1="155" y1="77" x2="155" y2="83" stroke="currentColor" stroke-width="1"/>
  <line x1="170" y1="75" x2="170" y2="85" stroke="currentColor" stroke-width="1.5"/>
  <text x="130" y="70" font-size="8" fill="currentColor" font-family="monospace">±0.02 mm</text>

  <!-- Cabeça CAD -->
  <circle cx="80" cy="70" r="20" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <line x1="80" y1="48" x2="80" y2="92" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="58" y1="70" x2="102" y2="70" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>

  <!-- Tronco -->
  <line x1="80" y1="90" x2="95" y2="165" stroke="currentColor" stroke-width="3"/>
  <circle cx="85" cy="110" r="4" fill="currentColor"/>
  <circle cx="95" cy="165" r="4" fill="currentColor"/>

  <!-- Braços Segurando Instrumento de Medição -->
  <path d="M85 110L125 80" stroke="currentColor" stroke-width="2.5"/>
  <path d="M85 110L100 135L145 95" stroke="currentColor" stroke-width="2.5"/>

  <!-- Pernas -->
  <path d="M95 165L75 195L65 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M95 165L115 195L130 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
        },
        {
          id: 'eureka',
          phase: '3. Análise / Síntese',
          name: 'Vetor Solução Convergente',
          desc: 'Nós de causa convergindo para um ponto focal ideal.',
          storyEyebrow: 'FASE 3: MODELAGEM MATEMÁTICA',
          storyTitle: 'Simulação Revela Ponto de Ressonância',
          storyCardTitle: 'Diagnóstico Exato',
          storyText: '"A frequência natural de vibração de 128Hz coincidia com a rotação nominal em 80% de carga."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Ponto Focal / Alvo de Causa Raiz -->
  <circle cx="100" cy="25" r="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  <circle cx="100" cy="25" r="4" fill="currentColor"/>
  <line x1="100" y1="5" x2="100" y2="45" stroke="currentColor" stroke-width="1"/>
  <line x1="80" y1="25" x2="120" y2="25" stroke="currentColor" stroke-width="1"/>

  <!-- Cabeça CAD -->
  <circle cx="100" cy="75" r="20" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <circle cx="100" cy="75" r="3" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="100" y1="95" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  <circle cx="100" cy="112" r="4" fill="currentColor"/>
  <circle cx="100" cy="165" r="4" fill="currentColor"/>

  <!-- Braços Apontando para o Ponto Focal -->
  <path d="M100 112L70 85L95 38" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 112L130 85L105 38" stroke="currentColor" stroke-width="2.5"/>

  <!-- Pernas -->
  <path d="M100 165L75 198L65 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L125 198L135 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
        },
        {
          id: 'action',
          phase: '4. Plano de Ação',
          name: 'Redesenho de Malha & Barreiras',
          desc: 'Diagrama de blocos lógicos e intertravamento eletromecânico.',
          storyEyebrow: 'FASE 4: PROJETO DE ENGENHARIA',
          storyTitle: 'Instalação de Amortecedor Viscoelástico',
          storyCardTitle: 'Modificação de Engenharia',
          storyText: '"O plano de ação substituiu a base rígida por coxins com amortecimento regulável, eliminando a ressonância."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Diagrama de Blocos / Malha -->
  <rect x="120" y="45" width="45" height="25" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="127" y="61" font-size="9" fill="currentColor" font-family="monospace">BLOCK A</text>
  <line x1="142" y1="70" x2="142" y2="90" stroke="currentColor" stroke-width="2"/>
  <rect x="120" y="90" width="45" height="25" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="127" y="106" font-size="9" fill="currentColor" font-family="monospace">BLOCK B</text>

  <!-- Cabeça CAD -->
  <circle cx="75" cy="70" r="20" stroke="currentColor" stroke-width="2.5" fill="none"/>

  <!-- Tronco -->
  <line x1="75" y1="90" x2="75" y2="165" stroke="currentColor" stroke-width="3"/>
  <circle cx="75" cy="110" r="4" fill="currentColor"/>
  <circle cx="75" cy="165" r="4" fill="currentColor"/>

  <!-- Braço Apontando para o Diagrama -->
  <path d="M75 110L115 80" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 110L50 135" stroke="currentColor" stroke-width="2.5"/>

  <!-- Pernas -->
  <path d="M75 165L55 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 165L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
        },
        {
          id: 'success',
          phase: '5. Sucesso / Tolerância Zero',
          name: 'Estabilidade Nominal 100%',
          desc: 'Sistema em equilíbrio perfeito de forças e confiabilidade.',
          storyEyebrow: 'FASE 5: HOMOLOGAÇÃO DO SISTEMA',
          storyTitle: 'Tolerâncias Nominais Asseguradas',
          storyCardTitle: 'Sistema Estável',
          storyText: '"Níveis de vibração reduzidos de 18mm/s para 1.2mm/s, garantindo 5 anos de vida útil sem paradas imprevistas."',
          svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Círculo de Tolerância Perfeita -->
  <circle cx="100" cy="120" r="85" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" fill="none"/>
  <text x="145" y="45" font-size="9" fill="currentColor" font-family="monospace">CPK = 1.85</text>

  <!-- Cabeça CAD -->
  <circle cx="100" cy="70" r="20" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <circle cx="100" cy="70" r="3" fill="currentColor"/>

  <!-- Tronco -->
  <line x1="100" y1="90" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  <circle cx="100" cy="110" r="4" fill="currentColor"/>
  <circle cx="100" cy="165" r="4" fill="currentColor"/>

  <!-- Braços em Postura de Estabilidade -->
  <path d="M100 110L60 110L50 90" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 110L140 110L150 90" stroke="currentColor" stroke-width="2.5"/>

  <!-- Pernas -->
  <path d="M100 165L75 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L125 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
        }
      ]
    }
  };

  // Variáveis de Estado da Interface
  let currentStyleId = 'engineer';
  let currentSimPoseIndex = 0;
  let viewMode = 'single'; // 'single' ou 'matrix'

  // Elementos DOM
  const singleViewContainer = document.getElementById('singleViewContainer');
  const matrixViewContainer = document.getElementById('matrixViewContainer');
  const posesGridContainer = document.getElementById('posesGridContainer');
  const currentStyleBadge = document.getElementById('currentStyleBadge');
  const currentStyleHeading = document.getElementById('currentStyleHeading');
  
  // Simulador DOM
  const simEyebrow = document.getElementById('simEyebrow');
  const simTitle = document.getElementById('simTitle');
  const simCardTitle = document.getElementById('simCardTitle');
  const simCardText = document.getElementById('simCardText');
  const simCharacterSlot = document.getElementById('simCharacterSlot');
  
  // Botões de Tema e Modo
  const themeButtons = document.querySelectorAll('[data-theme-set]');
  const styleCards = document.querySelectorAll('.style-card');
  const viewModeSingle = document.getElementById('viewModeSingle');
  const viewModeMatrix = document.getElementById('viewModeMatrix');
  const prevSimPoseBtn = document.getElementById('prevSimPose');
  const nextSimPoseBtn = document.getElementById('nextSimPose');
  const toastNotice = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');

  // Inicialização
  function init() {
    setupThemeSwitchers();
    setupStyleSelection();
    setupViewModeToggle();
    setupSimulatorNavigation();
    renderCurrentStyle();
    renderMatrixView();
  }

  // Alternador de Temas (Dark, Light, Blueprint)
  function setupThemeSwitchers() {
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.getAttribute('data-theme-set');
        document.body.setAttribute('data-theme', theme);
      });
    });
  }

  // Seleção de Estilo na Barra Lateral
  function setupStyleSelection() {
    styleCards.forEach(card => {
      card.addEventListener('click', () => {
        styleCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentStyleId = card.getAttribute('data-style-id');
        currentSimPoseIndex = 0;
        renderCurrentStyle();
        
        // Se estiver em modo matriz, voltar para single para ver os detalhes
        if (viewMode === 'matrix') {
          setViewMode('single');
        }
      });
    });
  }

  // Alternador entre Modo Estilo Único e Matriz de Comparação
  function setupViewModeToggle() {
    viewModeSingle.addEventListener('click', () => setViewMode('single'));
    viewModeMatrix.addEventListener('click', () => setViewMode('matrix'));
  }

  function setViewMode(mode) {
    viewMode = mode;
    if (mode === 'single') {
      viewModeSingle.classList.add('active');
      viewModeMatrix.classList.remove('active');
      singleViewContainer.classList.remove('hidden');
      matrixViewContainer.classList.remove('active');
    } else {
      viewModeSingle.classList.remove('active');
      viewModeMatrix.classList.add('active');
      singleViewContainer.classList.add('hidden');
      matrixViewContainer.classList.add('active');
    }
  }

  // Renderizar o Estilo Atual no Modo Único
  function renderCurrentStyle() {
    const styleData = stickmanLibrary[currentStyleId];
    if (!styleData) return;

    currentStyleBadge.textContent = styleData.tag.toUpperCase();
    currentStyleHeading.textContent = `${styleData.name} — 5 Poses Narrativas da Jornada`;

    // Renderizar Grid de Poses
    posesGridContainer.innerHTML = '';
    styleData.poses.forEach((pose, index) => {
      const card = document.createElement('div');
      card.className = 'pose-card';
      card.innerHTML = `
        <div class="pose-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${pose.phase}
        </div>
        <div class="pose-canvas">
          ${pose.svg}
        </div>
        <div class="pose-info">
          <div class="pose-name">${pose.name}</div>
          <div class="pose-role">${pose.desc}</div>
        </div>
        <div class="pose-actions">
          <button class="btn-pose-action btn-copy-svg" data-style="${styleData.id}" data-index="${index}">Copiar SVG</button>
          <button class="btn-pose-action btn-test-sim" data-index="${index}">Testar no Slide</button>
        </div>
      `;
      posesGridContainer.appendChild(card);
    });

    // Eventos dos botões de copiar e testar
    setupPoseCardButtons(posesGridContainer);

    // Atualizar Simulador
    updateSimulator();
  }

  // Renderizar a Matriz Comparativa (4 estilos × 5 poses)
  function renderMatrixView() {
    matrixViewContainer.innerHTML = '';
    
    Object.values(stickmanLibrary).forEach(styleData => {
      const row = document.createElement('div');
      row.className = 'matrix-row';
      row.innerHTML = `
        <div class="story-header">
          <div class="story-title">
            <span class="brand-badge">${styleData.tag.toUpperCase()}</span>
            <span>${styleData.name}</span>
          </div>
          <button class="btn-control btn-select-from-matrix" data-style-id="${styleData.id}">Focar neste Estilo</button>
        </div>
        <div class="poses-grid">
          ${styleData.poses.map((pose, idx) => `
            <div class="pose-card">
              <div class="pose-badge">${pose.phase}</div>
              <div class="pose-canvas">${pose.svg}</div>
              <div class="pose-info">
                <div class="pose-name">${pose.name}</div>
              </div>
              <div class="pose-actions">
                <button class="btn-pose-action btn-copy-svg" data-style="${styleData.id}" data-index="${idx}">Copiar SVG</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      matrixViewContainer.appendChild(row);
    });

    // Eventos na Matriz
    setupPoseCardButtons(matrixViewContainer);

    // Botões de foco
    matrixViewContainer.querySelectorAll('.btn-select-from-matrix').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-style-id');
        const targetCard = document.querySelector(`.style-card[data-style-id="${sid}"]`);
        if (targetCard) targetCard.click();
      });
    });
  }

  // Configurar Ações de Copiar e Testar
  function setupPoseCardButtons(container) {
    container.querySelectorAll('.btn-copy-svg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = btn.getAttribute('data-style');
        const pIdx = parseInt(btn.getAttribute('data-index'), 10);
        const svgContent = stickmanLibrary[sid].poses[pIdx].svg;
        
        navigator.clipboard.writeText(svgContent).then(() => {
          showToast(`SVG "${stickmanLibrary[sid].poses[pIdx].name}" copiado com sucesso!`);
        }).catch(() => {
          showToast('Erro ao copiar SVG para a área de transferência.');
        });
      });
    });

    container.querySelectorAll('.btn-test-sim').forEach(btn => {
      btn.addEventListener('click', () => {
        const pIdx = parseInt(btn.getAttribute('data-index'), 10);
        currentSimPoseIndex = pIdx;
        updateSimulator();
        document.querySelector('.slide-simulator-section').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // Navegação do Simulador de Slide
  function setupSimulatorNavigation() {
    prevSimPoseBtn.addEventListener('click', () => {
      const poses = stickmanLibrary[currentStyleId].poses;
      currentSimPoseIndex = (currentSimPoseIndex - 1 + poses.length) % poses.length;
      updateSimulator();
    });

    nextSimPoseBtn.addEventListener('click', () => {
      const poses = stickmanLibrary[currentStyleId].poses;
      currentSimPoseIndex = (currentSimPoseIndex + 1) % poses.length;
      updateSimulator();
    });
  }

  // Atualizar Conteúdo do Simulador de Slide
  function updateSimulator() {
    const styleData = stickmanLibrary[currentStyleId];
    if (!styleData) return;
    const pose = styleData.poses[currentSimPoseIndex];
    if (!pose) return;

    simEyebrow.textContent = pose.storyEyebrow || `FASE ${currentSimPoseIndex + 1}`;
    simTitle.textContent = pose.storyTitle || pose.name;
    simCardTitle.textContent = pose.storyCardTitle || 'Narrativa do Protagonista';
    simCardText.textContent = pose.storyText || pose.desc;
    simCharacterSlot.innerHTML = pose.svg;
  }

  // Feedback Visual (Toast)
  function showToast(message) {
    toastMsg.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

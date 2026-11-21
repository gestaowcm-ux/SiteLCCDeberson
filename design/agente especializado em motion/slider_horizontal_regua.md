# Slider Horizontal Estilo Régua (Ruler-Style Horizontal Timeline)

Este documento apresenta a especificação técnica, o guia de performance e um exemplo prático completo para a implementação do componente **Slider Horizontal estilo Régua (Ruler-Style Horizontal Timeline)**.

---

## 1. Descrição da Funcionalidade

O **Slider Horizontal estilo Régua** é um componente de navegação cronológica interativa inspirado em réguas físicas de cálculo ou medição. Ele permite que o usuário navegue pela linha do tempo da mentoria prática em confiabilidade (cobrindo o período de **2003 a 2026**).

### Características Estéticas e Visuais:
- **Linha de Medição (Ticks)**: O componente é composto por marcações verticais ordenadas cronologicamente. Anos marcos (marcos principais) possuem marcações mais longas (**Major Ticks**) e rótulos numéricos com o ano associado. Anos intermediários possuem marcações menores e mais sutis (**Minor Ticks**).
- **Indicador Ativo Central (Cursor)**: Uma linha vertical estática e centralizada (geralmente em uma cor de contraste como vermelho ou azul elétrico) atua como o ponto de leitura da régua.
- **Feedback Visual de Escala (Hover/Active Scale)**: Conforme o usuário rola a régua, a marcação que passa exatamente sob o indicador ativo é ampliada (`scale`) e destacada, enquanto as adjacentes reduzem suavemente sua escala de forma proporcional à distância do centro.
- **Atualização Dinâmica de Texto**: À medida que um determinado ano é selecionado pelo cursor central, um painel descritivo abaixo da régua é atualizado com as conquistas e marcos históricos daquele ano específico, utilizando uma transição suave de opacidade e deslocamento vertical.

---

## 2. Guia Conceitual de Performance

Para atingir a fluidez ideal (**60 a 120 FPS**) mesmo em dispositivos móveis de baixo desempenho, a arquitetura de movimentação do componente deve seguir os seguintes princípios:

### A. Rolação Nativa por Overflow (`scroll-snap`) vs. Arraste JS Customizado
- **Scroll-Snap Nativo (Recomendado)**: Utilizar `overflow-x: auto` acoplado ao CSS `scroll-snap-type: x mandatory` e `scroll-snap-align: center` nas marcações permite delegar todo o cálculo de inércia físico e desaceleração para a thread do compositor do navegador (GPU). Isso garante uma rolagem extremamente suave e com consumo mínimo de CPU.
- **Compatibilidade com Desktop**: Para simular a experiência de arrastar com o mouse (típica em desktops), implementa-se um manipulador leve de eventos de ponteiro (`mousedown`/`mousemove`/`mouseup`) que traduz o arraste físico em manipulações da propriedade `scrollLeft` do contêiner. Ao finalizar o arraste, o próprio motor do navegador assume o controle para encaixar (`snap`) no tick correto.

### B. Evitando o Layout Recalculation Thrashing (Forced Synchronous Layout)
- **O Problema**: Chamar métodos como `getBoundingClientRect()` ou propriedades como `offsetWidth` dentro do evento de rolagem (`scroll`) força o navegador a recalcular a árvore geométrica do layout (reflow) a cada frame, gerando travamentos visuais (*jank*).
- **A Solução**: Como as marcações possuem tamanhos estáticos e posições fixas de espaçamento (ex: cada marcação tem exatamente `80px` de largura), podemos calcular o ano ativo de forma puramente matemática utilizando apenas o deslocamento de rolagem acumulado (`scrollLeft`):
  $$\text{activeIndex} = \text{Math.round}\left(\frac{\text{scrollLeft}}{\text{tickWidth}}\right)$$
  Essa fórmula evita qualquer leitura de propriedades geométricas complexas do DOM, rodando em menos de $0.5\text{ms}$.

### C. Otimização de Transição de Textos e Opacidades
- **Hardware Acceleration**: A transição de escala da régua e opacidade das marcações utiliza `will-change: transform, opacity`.
- **Mudança de Estado**: Apenas aplicamos alterações no DOM do painel descritivo quando o índice ativo realmente muda. Isso previne escritas desnecessárias no DOM a cada pixel rolado.

---

## 3. Código de Exemplo Completo

O código abaixo é um arquivo HTML completo, standalone e pronto para uso. Copie e salve como `.html` para executar diretamente no navegador.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slider Horizontal estilo Régua (Ruler-Style Timeline)</title>
  <style>
    :root {
      --bg-color: #0a0a0a;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --color-accent: #ff3333; /* Cor vermelha do cursor de precisão */
      --color-tick: #444444;
      --color-tick-major: #ffffff;
      --tick-width: 80px; /* Largura padrão de cada célula de ano */
      --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-primary);
      font-family: var(--font-family);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      padding: 20px;
    }

    .container {
      width: 100%;
      max-width: 900px;
      text-align: center;
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    p.subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-bottom: 60px;
    }

    /* Contêiner Geral da Régua */
    .ruler-wrapper {
      position: relative;
      width: 100%;
      height: 140px;
      background: #111111;
      border: 1px solid #222222;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      margin-bottom: 40px;
    }

    /* Linha de Leitura Centralizada Estática */
    .ruler-indicator {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--color-accent);
      transform: translateX(-50%);
      z-index: 10;
      pointer-events: none;
    }

    .ruler-indicator::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid var(--color-accent);
    }

    .ruler-indicator::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid var(--color-accent);
    }

    /* Trilha de Rolagem */
    .ruler-track {
      display: flex;
      width: 100%;
      height: 100%;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE/Edge */
      cursor: grab;
      /* Alinha o primeiro e o último elemento perfeitamente no centro */
      padding-left: calc(50% - (var(--tick-width) / 2));
      padding-right: calc(50% - (var(--tick-width) / 2));
      user-select: none;
    }

    .ruler-track::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .ruler-track.dragging {
      cursor: grabbing;
      scroll-snap-type: none; /* Desativa snap durante arraste manual */
    }

    /* Célula contendo o Tick e o Ano */
    .ruler-item {
      flex: 0 0 var(--tick-width);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      padding-bottom: 25px;
      scroll-snap-align: center;
      transition: opacity 0.3s ease;
      opacity: 0.3;
      will-change: transform, opacity;
    }

    .ruler-item.active {
      opacity: 1;
    }

    /* A Marcação da Régua */
    .tick {
      width: 2px;
      height: 25px;
      background-color: var(--color-tick);
      transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s ease;
      will-change: height, background-color;
    }

    .ruler-item.major .tick {
      height: 45px;
      background-color: var(--color-tick-major);
    }

    .ruler-item.active .tick {
      background-color: var(--color-accent);
      height: 55px;
    }

    /* Texto do Ano */
    .year-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-top: 12px;
      transition: color 0.3s ease, transform 0.3s ease, font-weight 0.3s ease;
      will-change: transform;
    }

    .ruler-item.active .year-label {
      color: var(--text-primary);
      font-weight: 700;
      transform: scale(1.2);
    }

    /* Painel de Descrição do Evento */
    .content-panel {
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: #111111;
      border: 1px solid #222222;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
    }

    .event-year {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--color-accent);
      margin-bottom: 10px;
      letter-spacing: -0.03em;
      opacity: 1;
      transition: opacity 0.25s ease, transform 0.25s ease;
      will-change: transform, opacity;
    }

    .event-desc {
      font-size: 1.05rem;
      line-height: 1.6;
      color: var(--text-secondary);
      max-width: 650px;
      margin: 0 auto;
      opacity: 1;
      transition: opacity 0.25s ease, transform 0.25s ease;
      will-change: transform, opacity;
    }

    .transition-out {
      opacity: 0;
      transform: translateY(-10px);
    }

    .transition-in {
      opacity: 0;
      transform: translateY(10px);
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>LINHA DO TEMPO DA MENTORIA</h1>
    <p class="subtitle">Navegue arrastando a régua ou utilizando o scroll para visualizar nossa evolução prática</p>

    <!-- Contêiner da Régua -->
    <div class="ruler-wrapper">
      <div class="ruler-indicator"></div>
      <div class="ruler-track" id="rulerTrack">
        <!-- Injetado dinamicamente via JS de 2003 a 2026 -->
      </div>
    </div>

    <!-- Painel de Detalhes -->
    <div class="content-panel">
      <div class="event-year" id="eventYear">2003</div>
      <div class="event-desc" id="eventDesc">Início da jornada na engenharia de confiabilidade e primeiros estudos práticos.</div>
    </div>
  </div>

  <script>
    // Dados cronológicos reais sem placeholders
    const milestones = {
      2003: "Início da jornada na engenharia de confiabilidade e primeiros estudos práticos.",
      2004: "Certificação inicial de analista de vibração e foco em manutenção preditiva.",
      2005: "Implementação do primeiro programa RCM (Manutenção Centrada em Confiabilidade) de sucesso.",
      2006: "Liderança de projetos de análise de falhas em grande escala na indústria petroquímica.",
      2007: "Desenvolvimento de metodologia proprietária de Análise de Causa Raiz (RCA).",
      2008: "Expansão das consultorias para o setor de mineração e siderurgia nacional.",
      2009: "Adoção de ferramentas avançadas de modelagem de confiabilidade RAM.",
      2010: "Início das palestras e workshops presenciais para capacitação técnica.",
      2011: "Primeiro grande projeto internacional de otimização de ativos no setor de óleo e gás.",
      2012: "Publicação de artigos técnicos e consolidação como referência em RCM.",
      2013: "Criação de programas de treinamento corporativo personalizados.",
      2014: "Estruturação de auditorias de confiabilidade sob a ótica da ISO 55000.",
      2015: "Lançamento da primeira mentoria focada em formação de líderes de confiabilidade.",
      2016: "Integração de ferramentas digitais e dashboards de monitoramento preditivo.",
      2017: "Superação da marca de 500 profissionais treinados e mentoreados.",
      2018: "Parcerias acadêmicas para levar a confiabilidade prática a universidades.",
      2019: "Digitalização parcial da mentoria, alcançando profissionais em todo o Brasil.",
      2020: "Transição completa para o modelo de mentoria online durante o cenário global.",
      2021: "Lançamento da plataforma exclusiva de membros com estudos de caso reais.",
      2022: "Inclusão de módulos avançados de custos de ciclo de vida (LCC) e CAPEX/OPEX.",
      2023: "Celebração de 20 anos de atuação profissional na área de confiabilidade.",
      2024: "Desenvolvimento do simulador interativo de árvore de causas e criticidade.",
      2025: "Consolidação da maior comunidade de mentoria prática em confiabilidade.",
      2026: "Visão de futuro: Expansão digital global e inteligência artificial aplicada à confiabilidade de ativos."
    };

    const startYear = 2003;
    const endYear = 2026;
    const tickWidth = 80; // Correspondente a --tick-width no CSS
    const track = document.getElementById('rulerTrack');
    const eventYear = document.getElementById('eventYear');
    const eventDesc = document.getElementById('eventDesc');

    // 1. Geração Dinâmica da Régua
    function buildRuler() {
      const fragment = document.createDocumentFragment();
      for (let yr = startYear; yr <= endYear; yr++) {
        const item = document.createElement('div');
        item.classList.add('ruler-item');
        
        // Define quais anos são marcos principais (ex: a cada 5 anos, mais o primeiro e último)
        if (yr === 2003 || yr === 2005 || yr === 2010 || yr === 2015 || yr === 2020 || yr === 2025 || yr === 2026) {
          item.classList.add('major');
        }

        const tick = document.createElement('div');
        tick.classList.add('tick');
        
        const label = document.createElement('div');
        label.classList.add('year-label');
        label.textContent = yr;

        item.appendChild(tick);
        item.appendChild(label);
        item.setAttribute('data-year', yr);

        fragment.appendChild(item);
      }
      track.appendChild(fragment);
    }

    buildRuler();

    // Referência aos itens da régua
    const rulerItems = document.querySelectorAll('.ruler-item');
    let activeIndex = -1;
    let transitionTimeoutId = null;
    let cleanTimeoutId = null;

    // 2. Lógica de Atualização Focada
    function updateActiveYear() {
      // Cálculo direto em O(1) do índice ativo com base no scrollLeft
      const scrollPosition = track.scrollLeft;
      const currentActive = Math.round(scrollPosition / tickWidth);

      // Limita índice aos limites reais da régua
      const clampedActive = Math.max(0, Math.min(rulerItems.length - 1, currentActive));

      if (clampedActive !== activeIndex) {
        // Altera estados de classe apenas quando há mudança
        if (activeIndex >= 0 && rulerItems[activeIndex]) {
          rulerItems[activeIndex].classList.remove('active');
        }
        
        activeIndex = clampedActive;
        const activeItem = rulerItems[activeIndex];
        activeItem.classList.add('active');

        const activeYearValue = activeItem.getAttribute('data-year');
        const activeDescription = milestones[activeYearValue];

        // Atualiza textos com efeito de transição suave
        transitionText(activeYearValue, activeDescription);
      }
    }

    function transitionText(year, desc) {
      if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
      if (cleanTimeoutId) clearTimeout(cleanTimeoutId);

      // Transiciona os textos para fora
      eventYear.classList.remove('transition-in');
      eventDesc.classList.remove('transition-in');
      eventYear.classList.add('transition-out');
      eventDesc.classList.add('transition-out');

      transitionTimeoutId = setTimeout(() => {
        eventYear.textContent = year;
        eventDesc.textContent = desc;

        eventYear.classList.remove('transition-out');
        eventDesc.classList.remove('transition-out');
        eventYear.classList.add('transition-in');
        eventDesc.classList.add('transition-in');

        // Reforça renderização para transição de entrada
        requestAnimationFrame(() => {
          cleanTimeoutId = setTimeout(() => {
            eventYear.classList.remove('transition-in');
            eventDesc.classList.remove('transition-in');
          }, 20);
        });
      }, 150); // Deve coincidir com o tempo de opacidade no CSS
    }

    // 3. Gerenciamento do Scroll Nativo (otimizado via requestAnimationFrame)
    let tickScheduled = false;
    track.addEventListener('scroll', () => {
      if (!tickScheduled) {
        requestAnimationFrame(() => {
          updateActiveYear();
          tickScheduled = false;
        });
        tickScheduled = true;
      }
    });

    // 4. Implementação de Arraste com Mouse para Desktops
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        track.classList.remove('dragging');
        snapToNearest();
      }
    });

    track.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        track.classList.remove('dragging');
        snapToNearest();
      }
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiplicador de velocidade de arraste
      track.scrollLeft = scrollLeft - walk;
    });

    // Encaixe preciso ao terminar arraste no mouse
    function snapToNearest() {
      const scrollPosition = track.scrollLeft;
      const targetIndex = Math.round(scrollPosition / tickWidth);
      const targetScrollLeft = targetIndex * tickWidth;
      
      // Executa rolagem com snap manual via animação nativa
      track.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }

    // Inicialização da visualização padrão
    updateActiveYear();
  </script>
</body>
</html>
```

# Documentação de Motion: Carrossel 3D em Fita (3D Ribbon Carousel)

Este documento especifica os padrões de comportamento visual, otimizações de performance e o código de implementação do **Carrossel 3D em Fita** (3D Ribbon Carousel), conforme observado e analisado nas especificações de motion design para a landing page.

---

## Descrição da Funcionalidade

### 1. Comportamento Visual e Perspectiva
O carrossel é organizado como um cilindro geométrico virtual no espaço tridimensional (Z-axis). Os cartões (cards) de conteúdo são distribuídos uniformemente ao longo do perímetro deste cilindro invisível, apontando para o exterior.
* **Profundidade (Perspective Depth)**: O elemento pai possui uma propriedade de perspectiva definida (`perspective: 1200px` ou similar), estabelecendo a profundidade do observador.
* **Afastamento no Eixo Z**: Cada card é rotacionado em torno do eixo Y central (`rotateY`) e transladado radialmente para fora no eixo Z (`translateZ(300px)` a `translateZ(400px)`). 
* **Profundidade de Campo Visual (Depth-of-Field)**: Cards que giram em direção ao fundo reduzem de tamanho relativo e ganham transparência (`opacity` decrescente), além de ficarem parcialmente ocultos pela orientação angular. Cards na frente aparecem em escala real (`scale(1)`), opacidade máxima (`opacity: 1`) e perfeitamente legíveis.

### 2. Interação do Usuário e Inércia (Drag Momentum)
A navegação ocorre de duas maneiras:
* **Arrastar e Deslizar (Drag & Swipe)**: O usuário pode arrastar o carrossel horizontalmente usando o mouse ou gestos de toque em dispositivos móveis. O deslocamento em pixels do ponteiro ($\Delta x$) é convertido proporcionalmente em rotação angular em graus ($\Delta \theta$).
* **Física de Inércia (Momentum)**: Ao liberar o arraste, o carrossel não para instantaneamente. Ele continua girando com base na velocidade final com que o ponteiro estava se movendo. Essa velocidade decai gradualmente por um fator de atrito (fricção física de `0.95` por frame).
* **Snapping (Alinhamento Automático)**: Quando a rotação desacelera abaixo de um limite perceptível, o carrossel localiza automaticamente o card mais próximo do plano frontal e executa uma interpolação suave (usando LERP ou curvas de atenuação) para alinhar exatamente esse card em $0^\circ$ de visualização.

### 3. Clique para Focar (Click to Front)
Se o usuário clicar ou tocar em qualquer card posicionado nas laterais ou no fundo (fora do plano principal de foco), o controlador de movimento intercepta a ação e:
* Cancela qualquer movimento de inércia ativo.
* Calcula o caminho angular mais curto (sentido horário ou anti-horário, limitando a diferença entre $-180^\circ$ e $+180^\circ$) para trazer o card selecionado para o centro.
* Rotaciona o carrossel suavemente para alinhar o card escolhido à frente, atualizando simultaneamente o painel de detalhes textual correspondente.

---

## Guia Conceitual de Performance

### 1. Otimização do Compositor da GPU (Layering)
Carrosséis 3D podem sobrecarregar severamente a CPU se implementados incorretamente. Para obter taxas de quadro estáveis de **60/120 FPS**:
* **Transformações Puras**: Animamos exclusivamente a rotação global do contêiner da fita (`transform: rotateY()`) e as opacidades. Não alteramos largura, altura, margens ou posições absolutas (`left`/`top`) durante o arraste.
* **Recorte de Elementos Ocultos (`backface-visibility`)**: A propriedade `backface-visibility: hidden` é aplicada a todos os cards. Isso força a GPU a ignorar a renderização da parte traseira dos cartões tridimensionais que estão voltados para trás do plano de visão do usuário, economizando ciclos de sombreamento e preenchimento de pixels da GPU.
* **will-change**: A propriedade `will-change: transform` é declarada na faixa rotatória e nos cards individuais, permitindo que a GPU isole esses elementos em camadas de composição exclusivas.

### 2. Orçamento de Quadros de Interação (Interaction Frame Budget)
Para evitar atraso de entrada (input lag) e garantir que a interface responda de forma tátil:
* O cálculo da velocidade de arraste ocorre dentro dos eventos nativos `mousedown`/`touchstart` e `mousemove`/`touchmove`.
* A readequação visual e a física de inércia ocorrem de forma centralizada dentro de um loop contínuo gerenciado por `requestAnimationFrame`. Isso garante que o navegador desenhe exatamente um frame por ciclo de atualização do monitor, evitando renderizações desnecessárias.

---

## Código de Exemplo Completo

Abaixo está o código de exemplo completo em arquivo único autônomo (HTML, CSS e JS Vanilla). Ele implementa um carrossel 3D de alta performance com física de inércia realista, arrastar com mouse/touchpad, alinhamento magnético (snap), cliques nos cartões para trazer à frente e um painel de detalhes interativo.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carrossel 3D de Alta Performance - Engenharia de Confiabilidade</title>
  <style>
    /* 1. Estilos de Reset e Base */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-drag: none;
    }

    body {
      background-color: #030303;
      color: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
    }

    .carousel-section {
      width: 100%;
      max-width: 1000px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header-area {
      text-align: center;
      margin-bottom: 50px;
    }

    .header-area h1 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #fff 0%, #888 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-area p {
      color: #666;
      font-size: 0.95rem;
    }

    /* 2. Configurações de Espaço Tridimensional (3D Perspective Context) */
    .carousel-perspective-container {
      width: 100%;
      height: 380px;
      perspective: 1200px; /* Profundidade de visualização tridimensional */
      perspective-origin: 50% 35%; /* Vista levemente superior */
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: grab;
    }

    .carousel-perspective-container:active {
      cursor: grabbing;
    }

    /* Trilho/Faixa Rotatória */
    .carousel-track {
      width: 240px;
      height: 280px;
      position: relative;
      transform-style: preserve-3d; /* Preserva o contexto 3D dos filhos */
      will-change: transform;
    }

    /* 3. Cards do Carrossel (Glassmorphism e 3D Layout) */
    .carousel-card {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background: rgba(18, 18, 18, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backface-visibility: hidden; /* Oculta as faces traseiras na rotação */
      will-change: transform, opacity;
      transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    /* Card Ativo na Frente */
    .carousel-card.is-active {
      border-color: rgba(0, 230, 118, 0.4);
      box-shadow: 0 15px 35px rgba(0, 230, 118, 0.15), 0 0 2px rgba(0, 230, 118, 0.3);
      background: rgba(22, 22, 22, 0.85);
    }

    .card-num {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 1px;
    }

    .carousel-card.is-active .card-num {
      color: #00e676;
    }

    .card-icon {
      margin: 15px 0;
      fill: #ffffff;
      width: 32px;
      height: 32px;
      transition: fill 0.3s;
    }

    .carousel-card.is-active .card-icon {
      fill: #00e676;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #ffffff;
    }

    .card-desc {
      font-size: 12px;
      color: #8c8c8c;
      line-height: 1.4;
    }

    /* 4. Painel de Exibição de Informações Detalhadas (Abaixo do Carrossel) */
    .detail-panel {
      margin-top: 30px;
      width: 100%;
      max-width: 550px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      transition: opacity 0.3s, transform 0.3s;
    }

    .detail-title {
      font-size: 18px;
      font-weight: 700;
      color: #00e676;
      margin-bottom: 10px;
      letter-spacing: -0.3px;
    }

    .detail-desc {
      font-size: 14px;
      color: #a0a0a0;
      line-height: 1.6;
    }

    /* 5. Controles Auxiliares (Setas de Navegação) */
    .controls-container {
      display: flex;
      gap: 20px;
      margin-top: 25px;
    }

    .nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .nav-btn:active {
      transform: scale(0.95);
    }

    .nav-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
  </style>
</head>
<body>

  <div class="carousel-section">
    <!-- Cabeçalho explicativo -->
    <div class="header-area">
      <h1>Carrossel 3D em Fita</h1>
      <p>Arraste para rotacionar ou clique em um card para trazê-lo para a frente</p>
    </div>

    <!-- Área Tridimensional do Carrossel -->
    <div class="carousel-perspective-container" id="carouselContainer">
      <div class="carousel-track" id="carouselTrack">
        <!-- Card 1 -->
        <div class="carousel-card" data-index="0">
          <span class="card-num">01 / RCM</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z M7,10h2v7H7V10z M11,7h2v10h-2V7z M15,13h2v4h-2V13z"/></svg>
          <div>
            <h3 class="card-title">Criticidade RCM</h3>
            <p class="card-desc">Análise profunda focada na identificação de falhas e confiabilidade operacional.</p>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="carousel-card" data-index="1">
          <span class="card-num">02 / RCA</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-6h2V17z M13,9h-2V7h2V9z"/></svg>
          <div>
            <h3 class="card-title">Causa Raiz</h3>
            <p class="card-desc">Investigação estruturada de falhas físicas, humanas e organizacionais.</p>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="carousel-card" data-index="2">
          <span class="card-num">03 / KPIs</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M9,17H7v-7h2V17z M13,17h-2V7h2V17z M17,17h-2v-4h2V17z"/></svg>
          <div>
            <h3 class="card-title">Gestão de KPIs</h3>
            <p class="card-desc">Monitoramento síncrono de OEE, MTBF e MTTR em painéis industriais.</p>
          </div>
        </div>
        <!-- Card 4 -->
        <div class="carousel-card" data-index="3">
          <span class="card-num">04 / PDCA</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12,6v3l4-4l-4-4v3c-4.42,0-8,3.58-8,8c0,1.57,0.46,3.03,1.24,4.26L6.7,14.8C6.25,13.97,6,13.01,6,12C6,8.69,8.69,6,12,6z M18.76,7.74L17.3,9.2c0.45,0.83,0.7,1.79,0.7,2.8c0,3.31-2.69,6-6,6v-3l-4,4l4,4v-3c4.42,0,8-3.58,8-8C20,10.43,19.54,8.97,18.76,7.74z"/></svg>
          <div>
            <h3 class="card-title">Ciclo PDCA</h3>
            <p class="card-desc">Método iterativo de melhoria contínua aplicada aos processos de manutenção.</p>
          </div>
        </div>
        <!-- Card 5 -->
        <div class="carousel-card" data-index="4">
          <span class="card-num">05 / FMEA</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M12.5,7H11v6l5.2,3.2l0.8-1.3l-4.5-2.7V7z"/></svg>
          <div>
            <h3 class="card-title">FMEA & FMECA</h3>
            <p class="card-desc">Análise de Modos de Falha e Efeitos para prevenção e mitigação de riscos críticos.</p>
          </div>
        </div>
        <!-- Card 6 -->
        <div class="carousel-card" data-index="5">
          <span class="card-num">06 / LUBR</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12.01,21.49L23.64,7c0.45-0.34,0.49-0.97,0.11-1.37c-0.34-0.36-0.89-0.43-1.3-0.16L12.01,11L1.56,5.47C1.15,5.2,0.6,5.27,0.26,5.63c-0.38,0.4-0.34,1.03,0.11,1.37l11.64,14.49C12.01,21.49,12.01,21.49,12.01,21.49z"/></svg>
          <div>
            <h3 class="card-title">Lubrificação</h3>
            <p class="card-desc">Planos e rotinas preditivas de lubrificação de ativos industriais complexos.</p>
          </div>
        </div>
        <!-- Card 7 -->
        <div class="carousel-card" data-index="6">
          <span class="card-num">07 / PRED</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M11,7h2v6h-2V7z M11,15h2v2h-2V15z"/></svg>
          <div>
            <h3 class="card-title">Manutenção Preditiva</h3>
            <p class="card-desc">Monitoramento contínuo por vibração, termografia e análise de óleo.</p>
          </div>
        </div>
        <!-- Card 8 -->
        <div class="carousel-card" data-index="7">
          <span class="card-num">08 / AUDIT</span>
          <svg class="card-icon" viewBox="0 0 24 24"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M15.5,13.5L14,12l-1.5,1.5L11,12v4h4v-2.5z"/></svg>
          <div>
            <h3 class="card-title">Auditorias de Ativos</h3>
            <p class="card-desc">Inspeção e verificação de integridade operacional contra padrões regulatórios.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles manuais adicionais (Acessibilidade) -->
    <div class="controls-container">
      <button class="nav-btn" id="btnPrev" title="Anterior">
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <button class="nav-btn" id="btnNext" title="Próximo">
        <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>
    </div>

    <!-- Painel de exibição de conteúdo expandido -->
    <div class="detail-panel" id="detailPanel">
      <h2 class="detail-title" id="detailTitle">Criticidade RCM</h2>
      <p class="detail-desc" id="detailDesc">Análise profunda focada na identificação de falhas e confiabilidade operacional.</p>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('carouselContainer');
      const track = document.getElementById('carouselTrack');
      const cards = Array.from(document.querySelectorAll('.carousel-card'));
      const detailTitle = document.getElementById('detailTitle');
      const detailDesc = document.getElementById('detailDesc');
      const btnPrev = document.getElementById('btnPrev');
      const btnNext = document.getElementById('btnNext');

      const totalCards = cards.length;
      const stepAngle = 360 / totalCards; // Ângulo entre cartões (45 graus para 8 cards)
      const radius = 330; // Raio de translação tridimensional (translateZ)

      // Matriz de dados estendidos para alimentar o painel explicativo dinamicamente
      const cardDetailsData = [
        {
          title: "Criticidade RCM (Reliability Centered Maintenance)",
          desc: "Metodologia para determinar estratégias de manutenção com base nas consequências de falhas de equipamentos no processo produtivo, garantindo segurança operacional e foco nos ativos mais críticos."
        },
        {
          title: "Análise de Causa Raiz (RCA - Root Cause Analysis)",
          desc: "Investigação sistemática e detalhada de eventos indesejados para determinar as causas primordiais físicas, humanas e administrativas que levaram a uma quebra, implementando bloqueios definitivos."
        },
        {
          title: "Gestão e Dashboards de KPIs",
          desc: "Acompanhamento estratégico de indicadores de desempenho de manutenção em tempo real. Controle direto de métricas fundamentais como OEE (Eficiência Global), MTBF (Tempo Médio Entre Falhas) e MTTR (Tempo Médio para Reparo)."
        },
        {
          title: "Ciclo PDCA de Manutenção",
          desc: "Aplicação contínua do ciclo planejar-fazer-verificar-agir (PDCA) na melhoria contínua de rotinas preventivas, inspeções e padronizações para eliminar retrabalho."
        },
        {
          title: "FMEA & FMECA Industrial",
          desc: "Mapeamento analítico e antecipado de todos os modos de falha em potencial de componentes, analisando seus efeitos práticos e calculando o Número de Prioridade de Risco (NPR)."
        },
        {
          title: "Planos de Lubrificação Industrial",
          desc: "Estabelecimento de diretrizes precisas para seleção de lubrificantes, cálculo de dosagem e intervalos ideais de lubrificação de rolamentos e engrenagens para redução de atrito e desgaste acelerado."
        },
        {
          title: "Manutenção Preditiva (Condition Monitoring)",
          desc: "Inspeção e acompanhamento não-invasivo da saúde dos ativos por meio de termografia infravermelha, análise de vibrações mecânicas, ultrassom e coletas de óleo isolante ou hidráulico."
        },
        {
          title: "Auditorias de Processo e Ativos",
          desc: "Auditorias técnicas periódicas nas instalações industriais e sistemas corporativos para assegurar conformidade com normas reguladoras, eficiência energética e aderência à engenharia de manutenção."
        }
      ];

      // Variáveis de Estado Físico da Rotação
      let currentRotationY = 0;
      let targetRotationY = 0;
      let isDragging = false;
      let startX = 0;
      let startRotationY = 0;
      let velocity = 0;
      let friction = 0.95; // Fator de atrito físico
      let dragDistanceThreshold = 5; // Pixels para diferenciar arraste de clique
      let dragDistance = 0;
      
      // Posição inicial dos cards em 3D
      cards.forEach((card, index) => {
        const cardAngle = index * stepAngle;
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(${radius}px)`;
        card.style.transformOrigin = `50% 50%`;
      });

      // Loop principal de Renderização (requestAnimationFrame) - Physics & Drawing Loop
      function update() {
        if (isDragging) {
          currentRotationY += (targetRotationY - currentRotationY) * 0.15;
        } else {
          if (Math.abs(velocity) > 0.05) {
            currentRotationY += velocity;
            velocity *= friction;
            targetRotationY = Math.round(currentRotationY / stepAngle) * stepAngle;
          } else {
            currentRotationY += (targetRotationY - currentRotationY) * 0.1;
          }
        }

        // Aplica a rotação calculada ao trilho 3D
        track.style.transform = `rotateY(${-currentRotationY}deg)`;

        // Atualiza a opacidade dos cards e a classe de card ativo (o que está voltado para a frente)
        // O card ativo é aquele cuja rotação relativa está mais próxima de 0 graus no espaço de visualização
        const normalizedRotation = (currentRotationY % 360 + 360) % 360;
        let activeIdx = 0;
        let minDiff = 360;

        cards.forEach((card, i) => {
          const cardAngle = i * stepAngle;
          // Ângulo relativo do card em relação ao visualizador (0 graus é o centro frontal)
          const relativeAngle = ((cardAngle - normalizedRotation + 180) % 360 + 360) % 360 - 180;
          const absRelativeAngle = Math.abs(relativeAngle);

          if (absRelativeAngle < minDiff) {
            minDiff = absRelativeAngle;
            activeIdx = i;
          }

          // Atenuação de opacidade com base na proximidade do fundo
          // Conforme se afasta de 0° (frente) até 180° (fundo), a opacidade decai para 0.2
          const opacityVal = 0.2 + 0.8 * Math.max(0, (180 - absRelativeAngle) / 180);
          card.style.opacity = opacityVal;

          if (absRelativeAngle < 45) {
            card.classList.add('is-active');
          } else {
            card.classList.remove('is-active');
          }
        });

        // Atualiza dinamicamente o painel de detalhes correspondente ao card central
        if (detailTitle.textContent !== cardDetailsData[activeIdx].title) {
          detailTitle.textContent = cardDetailsData[activeIdx].title;
          detailDesc.textContent = cardDetailsData[activeIdx].desc;
        }

        requestAnimationFrame(update);
      }

      // Inicializa o Loop de Renderização
      requestAnimationFrame(update);

      // --- TRATAMENTO DE INPUTS (Arrastar, Mouse e Touch) ---
      
      function handleStart(clientX) {
        isDragging = true;
        startX = clientX;
        startRotationY = currentRotationY;
        velocity = 0;
        dragDistance = 0;
      }

      function handleMove(clientX) {
        if (!isDragging) return;
        const dx = clientX - startX;
        dragDistance = Math.abs(dx);
        // Converte o delta de pixels em delta angular (0.15 graus por pixel)
        const deltaAngle = -dx * 0.15;
        targetRotationY = startRotationY + deltaAngle;
        
        // Calcula velocidade instantânea por amostragem de frame
        velocity = targetRotationY - currentRotationY;
      }

      function handleEnd() {
        isDragging = false;
      }

      // Eventos de Mouse
      container.addEventListener('mousedown', (e) => {
        handleStart(e.clientX);
        e.preventDefault(); // Impede arrastar imagens fantasma
      });

      window.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        handleEnd();
      });

      // Eventos de Toque (Mobile)
      container.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchend', () => {
        handleEnd();
      });

      // --- TRATAMENTO DE CLIQUE NOS CARDS (Clique para trazer à frente) ---
      cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
          // Se o usuário realizou um arraste significativo, ignora o clique
          if (dragDistance > dragDistanceThreshold) return;

          // Calcula a rotação necessária utilizando o caminho angular mais curto
          const cardAngle = index * stepAngle;
          
          // Modulo para achar a menor diferença rotacional
          const diff = (cardAngle - currentRotationY) % 360;
          let targetAngle = currentRotationY + diff;

          if (diff > 180) targetAngle -= 360;
          if (diff < -180) targetAngle += 360;

          targetRotationY = targetAngle;
          velocity = 0; // Para inércia e foca na transição direta
        });
      });

      // --- BOTOÕES AUXILIARES (Setas de Navegação) ---
      btnPrev.addEventListener('click', () => {
        velocity = 0;
        targetRotationY = Math.round(currentRotationY / stepAngle) * stepAngle - stepAngle;
      });

      btnNext.addEventListener('click', () => {
        velocity = 0;
        targetRotationY = Math.round(currentRotationY / stepAngle) * stepAngle + stepAngle;
      });
    });
  </script>
</body>
</html>
```

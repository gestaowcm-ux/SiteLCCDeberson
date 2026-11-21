# Documentação de Motion: Carrossel de Cards em Arco (Arc Card Carousel)

Este documento especifica os padrões de comportamento visual, otimizações de performance e o código de implementação do **Carrossel de Cards em Arco** (Arc Card Carousel). Ele descreve a física de layout geométrico em arco convexo, as interações de foco/zoom 3D e as práticas de engenharia de performance necessárias para garantir taxas de renderização estáveis de **60/120 FPS**.

---

## Descrição da Funcionalidade

### 1. Disposição em Arco (Convex Dome / Inverted Cradle)
O carrossel organiza os cartões (cards) de conteúdo ao longo de uma trajetória em arco que simula um domo convexo ou um berço invertido tridimensional.
* **Geometria do Arco (Plano XY)**: O centro do carrossel representa o ápice do arco ($x = 0, y = 0, z = 0$). À medida que os cards se deslocam para os lados, suas coordenadas horizontais ($x$) aumentam/diminuem, enquanto suas coordenadas verticais ($y$) decrescem continuamente de forma parabólica ($y < 0$), criando uma curvatura descendente suave nas laterais.
* **Profundidade de Campo (Eixo Z)**: Para acentuar o relevo tridimensional, os cards nas laterais são empurrados para o fundo no eixo Z ($z < 0$), enquanto o card central (em foco) permanece no plano frontal ($z = 0$).
* **Inclinação Radial (Z-Rotation Tilt)**: Cada card sofre uma rotação tangente ao longo do eixo Z (`rotateZ`), proporcional ao seu deslocamento angular em relação ao centro. Isso faz com que os cartões fiquem levemente "tombados" para fora, acompanhando harmonicamente o contorno do arco.
* **Orientação de Convergência (Y-Rotation)**: Para simular que os cards estão focados no observador, aplica-se uma leve rotação de convergência no eixo Y (`rotateY`), rotacionando os cards da esquerda levemente para a direita e os da direita para a esquerda.

### 2. Rotação Contínua e Interação de Pausa (Hover/Click Pause)
* **Auto-Rotação Autônoma**: O carrossel translada os cards de maneira constante através de incrementos angulares automatizados em um ciclo contínuo gerenciado por `requestAnimationFrame`.
* **Pausa por Hover/Clique**: Quando o ponteiro do usuário entra na área do carrossel (`mouseenter`) ou quando um card é selecionado para zoom, o incremento automático de rotação é pausado imediatamente. Ao retirar o cursor (`mouseleave`) e nenhuma ampliação estiver ativa, a rotação autônoma é retomada sem saltos visuais.
* **Navegação Assistida (Setas)**: Controles manuais (setas esquerda/direita) permitem navegar pelos perfis. O deslocamento angular utiliza interpolação linear (LERP) no loop JS, fazendo com que o carrossel deslize e desacelere suavemente ao mudar de card de forma manual.

### 3. Foco, Nivelamento e Zoom Tridimensional
Ao clicar em qualquer card visível:
* **Congelamento do Movimento**: A rotação contínua do carrossel é travada.
* **Zoom e Centralização**: O card selecionado é reposicionado suavemente para o centro horizontal do contêiner ($x = 0$), elevado verticalmente para um plano de leitura limpo ($y = -20px$) e puxado em direção ao usuário no eixo Z ($z = 120px$).
* **Nivelamento Angular**: Todas as rotações angulares tridimensionais do card ativo (`rotateZ`, `rotateY`) são zeradas, nivelando o cartão horizontalmente para facilitar a leitura.
* **Revelação de Detalhes (CTA e Stats)**: Elementos secundários do card (estatísticas numéricas adicionais e botão de chamada para ação), previamente colapsados com altura zero e opacidade nula, expandem-se verticalmente e ganham opacidade total.

### 4. Efeito de Desfoque de Fundo (Backdrop Blur) e Restauração
* **Isolamento de Foco**: Uma camada de fundo escura e desfocada (`.carousel-backdrop` com `backdrop-filter: blur(12px)`) entra em cena através de transição de opacidade. Ela é posicionada no espaço 3D (Z = 40px) de forma a se situar atrás do card focado (Z = 120px), mas à frente de todos os outros cards do carrossel (Z <= 0px).
* **Ofuscamento Secundário**: Todos os outros cards (não focados) têm sua opacidade reduzida drasticamente para `0.08` e recebem um desfoque Gaussiano (`filter: blur(10px)`), eliminando qualquer distração visual.
* **Restauração Simétrica**: Clicando no botão fechar ($\times$) no canto do card ou em qualquer ponto livre do backdrop, as classes de foco são removidas. O card retorna à sua inclinação e posição original na curva do arco de maneira fluida. Após a conclusão física da animação ($800\text{ms}$), o loop do JS é reabilitado e a auto-rotação reinicia.

---

## Guia Conceitual de Performance

### 1. Aceleração de Hardware e GPU Compositing
Para garantir uma experiência visual fluida a **60/120 FPS**:
* **Transformações Compostadas**: Animamos exclusivamente propriedades processadas diretamente pelo compositor da GPU: `transform` (`translate3d`, `rotateZ`, `rotateY`, `scale`) e `opacity`. Nenhuma alteração geométrica de layout (como alterar `top`, `left`, `width` ou `height` dinamicamente) é permitida no loop de rotação.
* **will-change**: A propriedade `will-change: transform, opacity` é aplicada nos cards. Isso instrui o navegador a promover esses cartões para camadas gráficas dedicadas na memória de vídeo (VRAM), minimizando recálculos de textura em tempo de execução.

### 2. Redução de Reflows (Evitar Layout Thrashing)
* O loop de atualização do JavaScript lê e escreve exclusivamente atributos de estilo em linha relacionados a transformações tridimensionais. 
* As dimensões geométricas e bounding boxes dos elementos são cacheadas na inicialização do script, eliminando chamadas repetitivas a métodos como `getBoundingClientRect()` ou `offsetWidth` dentro da rotina de animação contínua (o que forçaria o motor de renderização a recalcular o layout da página a cada frame).

### 3. Gerenciamento de Visibilidade (Dynamic Culling)
* Em um carrossel em loop de $360^\circ$, metade dos cards está na parte traseira da trajetória tridimensional.
* Implementamos um descarte dinâmico de elementos (culling): calculamos o ângulo relativo de cada card no loop JavaScript. Se o card estiver posicionado na face traseira (ângulo absoluto superior a $90^\circ$), o script define seu estilo como `display: none` e zera sua opacidade. Isso remove o elemento da árvore de pintura do navegador, poupando recursos de rasterização e melhorando a taxa de preenchimento (pixel fill-rate).

### 4. Gerenciamento do Loop de Animação e Transições
* **Conflito Frame-a-Frame vs Transições CSS**: Se um elemento possuir uma propriedade `transition` ativa na propriedade `transform` enquanto o JavaScript atualiza suas coordenadas a cada frame (60/120 vezes por segundo), o navegador entrará em conflito tentando interpolar cada micro-movimento, resultando em travamentos severos (judder).
* **Solução**: Durante o estado de rotação contínua, as transições CSS são completamente desativadas nos cards (`transition: none`). As transições de interpolação angular e física de rotação ocorrem unicamente por LERP matemático programático no JS.
* No instante exato em que um card é clicado para zoom, o loop de frames é pausado e adiciona-se uma classe ao contêiner (`.has-zoomed-card`) que ativa as transições CSS suaves (`0.8s cubic-bezier(0.16, 1, 0.3, 1)`). O navegador assume o controle da animação de transição usando aceleração pura de hardware.
* Ao fechar, a classe `.is-returning` preserva a transição até o card restabelecer seu formato original. O script aguarda $800\text{ms}$ (timeout que coincide com a duração do efeito CSS) antes de revogar a classe de transição e reativar o loop de renderização do JS.

---

## Código de Exemplo Completo

O código a seguir apresenta uma aplicação autônoma de alta fidelidade visual e interativa. Ele é independente (zero dependências externas), utiliza SVGs embutidos para representação de perfis e roda diretamente em qualquer navegador moderno.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carrossel de Cards em Arco - Mentoria de Confiabilidade</title>
  <!-- Google Fonts Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --carousel-card-border: rgba(255, 255, 255, 0.08);
    }

    /* 1. Estilos Base e Reset */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-drag: none;
    }

    body {
      background-color: var(--color-primary, #000000);
      color: var(--color-on-dark, #ffffff);
      font-family: var(--font-family, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow-x: hidden;
      padding: var(--spacing-4xl) var(--spacing-xl);
    }

    .carousel-section {
      width: 100%;
      max-width: 1100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .header-area {
      text-align: center;
      margin-bottom: var(--spacing-5xl);
      z-index: 5;
    }

    .header-area h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: var(--spacing-md);
      color: var(--color-on-dark, #ffffff);
    }

    .header-area p {
      color: var(--color-mute, #afafaf);
      font-size: 1rem;
      max-width: 600px;
      line-height: 1.5;
    }

    /* 2. Contexto de Perspectiva 3D */
    .carousel-perspective-container {
      width: 100%;
      height: 520px;
      perspective: 1400px;
      perspective-origin: 50% 25%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    /* Trilho dos Cards */
    .carousel-track {
      position: relative;
      width: 300px;
      height: 400px;
      transform-style: preserve-3d;
      will-change: transform;
    }

    /* Camada Backdrop Blur */
    .carousel-backdrop {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(40px);
      width: 250vw;
      height: 250vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
    }

    .has-zoomed-card .carousel-backdrop {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }

    .is-returning-mode .carousel-backdrop {
      display: block;
      opacity: 0;
      pointer-events: none;
    }

    /* 3. Estrutura Visual dos Cards (Glassmorphism) */
    .carousel-card {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(40, 40, 40, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--carousel-card-border);
      border-radius: var(--rounded-xl, 16px);
      padding: var(--spacing-3xl);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1) inset;
      backface-visibility: hidden;
      will-change: transform, opacity;
      cursor: pointer;
      z-index: 10;
      overflow: hidden;
    }

    /* Detalhe Superior de Cor de Destaque */
    .carousel-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--color-on-dark, #ffffff);
      border-radius: var(--rounded-xl, 16px) var(--rounded-xl, 16px) 0 0;
      opacity: 0.7;
    }

    /* Efeito de Hover (Apenas quando não houver card em foco) */
    body:not(.has-zoomed-card) .carousel-card:hover {
      border-color: var(--color-on-dark, #ffffff);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
      transform: translate3d(var(--tx), var(--ty), var(--tz)) rotateZ(var(--rz)) rotateY(var(--ry)) scale(1.03) !important;
    }

    /* Estado Focado/Zoomed */
    .carousel-card.is-zoomed {
      transform: translate3d(0, -20px, 120px) rotateZ(0rad) rotateY(0rad) scale(1.15) !important;
      opacity: 1 !important;
      filter: blur(0px) !important;
      z-index: 100;
      cursor: default;
      border-color: var(--color-on-dark, #ffffff);
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.8);
    }

    /* Otimização dos Cards Secundários no Zoom */
    .has-zoomed-card .carousel-card:not(.is-zoomed) {
      opacity: 0.08 !important;
      filter: blur(10px) !important;
      pointer-events: none;
    }

    /* Habilitação das Transições no Estado de Zoom */
    .has-zoomed-card .carousel-card {
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.8s,
                  box-shadow 0.8s;
    }

    /* Classe Temporária para Retorno Suave (Evita Pop no Zoom-Out) */
    .carousel-card.is-returning,
    .is-returning-mode .carousel-card {
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.8s,
                  box-shadow 0.8s;
    }

    /* 4. Elementos Internos dos Cards */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      width: 100%;
    }

    .card-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: var(--spacing-xs) var(--spacing-md);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--rounded-pill, 999px);
      color: var(--color-on-dark, #ffffff);
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--rounded-pill, 999px);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      color: var(--color-mute, #afafaf);
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s, color 0.3s, background-color 0.3s;
    }

    .carousel-card.is-zoomed .close-btn {
      opacity: 1;
      pointer-events: auto;
    }

    .close-btn:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.15);
    }

    .card-profile {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .mentor-info h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-on-dark, #ffffff);
      margin-bottom: var(--spacing-xxs);
      letter-spacing: -0.3px;
    }

    .mentor-info p {
      font-size: 0.75rem;
      color: var(--color-mute, #afafaf);
    }

    .mentor-bio {
      font-size: 0.85rem;
      color: var(--color-mute, #afafaf);
      line-height: 1.5;
      margin-bottom: auto;
    }

    /* Estatísticas e CTA (Revelados somente sob Zoom) */
    .mentor-details {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: var(--spacing-xl);
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      margin-top: 0;
      transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  margin-top 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .carousel-card.is-zoomed .mentor-details {
      max-height: 80px;
      opacity: 1;
      margin-top: var(--spacing-xl);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-val {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--color-on-dark, #ffffff);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--color-mute, #afafaf);
    }

    .action-btn {
      width: 100%;
      border-radius: var(--rounded-pill, 999px);
      background: var(--color-on-dark, #ffffff);
      color: var(--color-primary, #000000);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      box-shadow: none;
      max-height: 0;
      opacity: 0;
      padding: 0;
      overflow: hidden;
      margin-top: 0;
      transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  padding 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  margin-top 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.2s;
    }

    .carousel-card.is-zoomed .action-btn {
      max-height: 48px;
      opacity: 1;
      padding: var(--spacing-md) var(--spacing-2xl);
      margin-top: var(--spacing-xl);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      background: var(--color-canvas-soft, #efefef);
      box-shadow: none;
    }

    .action-btn:active {
      transform: translateY(0);
    }

    /* 5. Controles do Carrossel */
    .controls-container {
      display: flex;
      gap: var(--spacing-2xl);
      margin-top: var(--spacing-3xl);
      z-index: 5;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      border-radius: var(--rounded-pill, 999px);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      color: var(--color-on-dark, #ffffff);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      transition: background-color 0.3s, border-color 0.3s, transform 0.2s;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--color-on-dark, #ffffff);
      transform: scale(1.05);
    }

    .nav-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* Mobile Responsiveness Media Queries */
    @media (max-width: 768px) {
      .carousel-perspective-container {
        height: 380px;
      }
      .carousel-track {
        width: 220px;
        height: 300px;
      }
      .carousel-card {
        padding: var(--spacing-lg);
      }
      .header-area h1 {
        font-size: 1.6rem;
      }
      .header-area p {
        font-size: 0.85rem;
      }
    }
  </style>
</head>
<body>

  <section class="carousel-section">
    <div class="header-area">
      <h1>Mentoria de Alto Impacto</h1>
      <p>Navegue em nossa rede de mentores de elite através do carrossel em arco convexo. Selecione um perfil para detalhes e agendamentos.</p>
    </div>

    <div class="carousel-perspective-container">
      <div class="carousel-track">
        
        <!-- Backdrop dentro do trilho para ordenação de profundidade 3D correta -->
        <div class="carousel-backdrop"></div>

        <!-- Cards de Mentores -->
        <!-- Mentor 1 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">Software Architecture</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Alex Rivera</h3>
              <p>Principal Architect @ TechCorp</p>
            </div>
          </div>
          <p class="mentor-bio">Especialista em microsserviços de alto desempenho, resiliência de sistemas e computação em nuvem em larga escala.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">15+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">140+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">4.9</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

        <!-- Mentor 2 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">Product Management</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Beatriz Santos</h3>
              <p>VP of Product @ FinGlobal</p>
            </div>
          </div>
          <p class="mentor-bio">Líder em estratégias de produto inovadoras, discovery ágil e crescimento exponencial baseado em dados analíticos.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">12+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">90+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">5.0</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

        <!-- Mentor 3 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">AI & Data Science</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Carlos Mendes</h3>
              <p>AI Research Lead @ DeepLabs</p>
            </div>
          </div>
          <p class="mentor-bio">Cientista especializado em redes neurais profundas, visão computacional e modelos LLM avançados de linguagem.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">8+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">110+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">4.8</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

        <!-- Mentor 4 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">UX/UI Design Systems</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Diana Prince</h3>
              <p>Design System Lead @ DesignStudio</p>
            </div>
          </div>
          <p class="mentor-bio">Focada na criação de ecossistemas de design escaláveis, consistência visual e padrões ergonômicos de usabilidade.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">10+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">85+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">4.9</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

        <!-- Mentor 5 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">DevOps & Cloud</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Eduardo Lima</h3>
              <p>Infrastructure Director @ CloudNine</p>
            </div>
          </div>
          <p class="mentor-bio">Especialista em pipelines de CI/CD automatizados, orquestração Kubernetes e resiliência de nuvens híbridas.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">14+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">130+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">4.9</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

        <!-- Mentor 6 -->
        <div class="carousel-card" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-badge">Data Engineering</span>
            <button class="close-btn" aria-label="Fechar" tabindex="-1">&times;</button>
          </div>
          <div class="card-profile">
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="8" r="4" fill="var(--color-on-dark, #ffffff)"/>
                <path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z" fill="var(--color-on-dark, #ffffff)" opacity="0.8"/>
              </svg>
            </div>
            <div class="mentor-info">
              <h3>Fernanda Rocha</h3>
              <p>Head of Data @ InfoSphere</p>
            </div>
          </div>
          <p class="mentor-bio">Modelagem de arquiteturas de dados resilientes, pipelines de streaming Spark e governança corporativa de dados.</p>
          <div class="mentor-details">
            <div class="stat">
              <span class="stat-val">11+</span>
              <span class="stat-label">Anos Exp</span>
            </div>
            <div class="stat">
              <span class="stat-val">95+</span>
              <span class="stat-label">Mentorados</span>
            </div>
            <div class="stat">
              <span class="stat-val">4.7</span>
              <span class="stat-label">Avaliação</span>
            </div>
          </div>
          <button class="action-btn">Agendar Sessão</button>
        </div>

      </div>
    </div>

    <!-- Navegação Manual -->
    <div class="controls-container">
      <button class="nav-btn prev" aria-label="Anterior">&larr;</button>
      <button class="nav-btn next" aria-label="Próximo">&rarr;</button>
    </div>
  </section>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('.carousel-perspective-container');
      const track = document.querySelector('.carousel-track');
      const cards = Array.from(document.querySelectorAll('.carousel-card'));
      const backdrop = document.querySelector('.carousel-backdrop');
      const prevBtn = document.querySelector('.nav-btn.prev');
      const nextBtn = document.querySelector('.nav-btn.next');
      
      const totalCards = cards.length;
      if (totalCards === 0) return; // Guard check
      
      // Configurações Geométricas do Arco (mutáveis para responsividade)
      let radiusX = 360;      // Raio horizontal do arco
      let radiusY = 65;       // Profundidade vertical da abóbada (curvatura do domo)
      let radiusZ = 180;      // Espaçamento de profundidade (Eixo Z)
      const tiltFactor = 0.35;  // Intensidade da inclinação radial Z
      const yRotFactor = 0.45;  // Intensidade da rotação Y convergente
      const scaleFactor = 0.15; // Redução de escala nas extremidades

      // Estados da Animação
      let rotationSpeed = 0.0025; // Velocidade de auto-rotação (rad por frame)
      let targetAngle = 0;        // Ângulo alvo de rotação
      let currentAngle = 0;       // Ângulo atual suavizado (LERP)
      let isHovered = false;
      let isZoomedMode = false;
      let zoomedCard = null;
      let isAnimatingState = false; // Trava contra cliques simultâneos
      let animationFrameId = null;

      // Utilitário de Módulo Seguro
      function safeModulo(val, max) {
        return ((val % max) + max) % max;
      }

      // Responsividade: Ajuste dinâmico dos raios baseados na largura da janela
      function updateDimensions() {
        const width = window.innerWidth;
        if (width < 480) {
          radiusX = 120;
          radiusY = 25;
          radiusZ = 60;
        } else if (width < 768) {
          radiusX = 200;
          radiusY = 40;
          radiusZ = 100;
        } else {
          radiusX = 360;
          radiusY = 65;
          radiusZ = 180;
        }
        if (!isZoomedMode) {
          positionCards();
        }
      }

      // Função de Posicionamento Matemático
      function positionCards() {
        cards.forEach((card, i) => {
          if (!card) return; // Guard check
          
          // Se o card estiver em zoom, o layout é governado pelas regras de CSS (.is-zoomed)
          if (card === zoomedCard) return;

          // Ângulo base da fatia circular para este card
          const baseAngle = (i / totalCards) * 2 * Math.PI;
          // Ângulo relativo somado à rotação global
          let theta = safeModulo(baseAngle + currentAngle, 2 * Math.PI);
          
          // Mapeia theta de [0, 2pi] para o intervalo [-pi, pi] para simetria central
          if (theta > Math.PI) {
            theta -= 2 * Math.PI;
          }

          const absTheta = Math.abs(theta);

          // Culling: Somente processa e exibe cards na metade frontal exposta (-pi/2 a pi/2)
          if (absTheta <= Math.PI / 2) {
            card.style.display = 'flex';
            
            // Coordenadas 3D (Arco de Domo Convexo / Inverted Cradle) - Trajetória corrigida
            const x = Math.sin(theta) * radiusX;
            const y = (1 - Math.cos(theta)) * radiusY; // Curva descendente nas laterais
            const z = (Math.cos(theta) - 1) * radiusZ; // Afastamento no eixo Z

            // Orientações
            const rz = theta * tiltFactor;  // Inclinação radial (Z-Rotation)
            const ry = -theta * yRotFactor; // Convergência para o centro (Y-Rotation)
            const scale = 1 + (Math.cos(theta) - 1) * scaleFactor;

            // Desvanecimento linear suave nas extremidades angulares
            let opacity = 1;
            const startFade = Math.PI / 4;  // Início do fade (45 graus)
            const endFade = Math.PI / 2;    // Fim do fade (90 graus)
            
            if (absTheta > startFade) {
              opacity = 1 - (absTheta - startFade) / (endFade - startFade);
            }

            // Injeção de estilos em linha acelerados por GPU
            card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rz}rad) rotateY(${ry}rad) scale(${scale})`;
            card.style.opacity = opacity;
            
            // Armazena as variáveis CSS customizadas para manter o contexto de hover intacto
            card.style.setProperty('--tx', `${x}px`);
            card.style.setProperty('--ty', `${y}px`);
            card.style.setProperty('--tz', `${z}px`);
            card.style.setProperty('--rz', `${rz}rad`);
            card.style.setProperty('--ry', `${ry}rad`);
          } else {
            // Desativa completamente elementos no arco traseiro invisível
            card.style.display = 'none';
            card.style.opacity = '0';
          }
        });
      }

      // Loop de Frames de Alta Performance
      function animate() {
        if (isZoomedMode) return; // Evita loop contínuo e leak de CPU/GPU em modo zoom

        if (!isHovered) {
          targetAngle += rotationSpeed;
        }
        
        // Easing Interpolation (LERP) para suavidade cinemática
        currentAngle += (targetAngle - currentAngle) * 0.1;
        
        positionCards();
        
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animate);
      }

      // Inicialização do Posicionamento, responsividade e loop
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(animate);

      // Garantir tabindex inicial correto para botões de fechar
      document.querySelectorAll('.close-btn').forEach((btn) => {
        if (btn) btn.setAttribute('tabindex', '-1');
      });

      // Eventos de Hover (Pausa Inteligente da Rotação)
      if (container) {
        container.addEventListener('mouseenter', () => {
          isHovered = true;
        });

        container.addEventListener('mouseleave', () => {
          isHovered = false;
        });
      }

      // Eventos dos Botões Auxiliares de Navegação
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (isZoomedMode || isAnimatingState) return;
          targetAngle -= (2 * Math.PI) / totalCards;
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (isZoomedMode || isAnimatingState) return;
          targetAngle += (2 * Math.PI) / totalCards;
        });
      }

      // Disparador de Foco e Zoom ao clicar ou interagir no Card
      cards.forEach((card) => {
        if (!card) return;
        
        card.addEventListener('click', (e) => {
          if (isZoomedMode || isAnimatingState) return;

          // Se clicou no botão interno de fechar, ignora a propagação de abertura
          if (e.target.closest('.close-btn')) return;

          zoomCard(card);
        });

        // Suporte de acessibilidade para teclado (Enter / Espaço)
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isZoomedMode || isAnimatingState) return;
            zoomCard(card);
          }
        });
      });

      // Rotina de Abertura do Zoom
      function zoomCard(card) {
        if (!card) return;
        isAnimatingState = true;
        isZoomedMode = true;
        zoomedCard = card;

        // Injeta as classes que ativam as transições no CSS
        if (document.body) document.body.classList.add('has-zoomed-card');
        if (track) track.classList.add('has-zoomed-card');
        card.classList.add('is-zoomed');

        // Habilita tabindex do botão fechar do card correspondente
        const closeBtn = card.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.setAttribute('tabindex', '0');
        }

        // Desativa botões de navegação lateral
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;

        // Libera bloqueio de clique após conclusão da transição
        setTimeout(() => {
          isAnimatingState = false;
        }, 800);
      }

      // Rotina de Fechamento e Restauração
      function closeZoom() {
        if (!zoomedCard || isAnimatingState) return;
        isAnimatingState = true;

        // Habilita classes temporárias para suavizar o retorno físico
        zoomedCard.classList.add('is-returning');
        if (document.body) {
          document.body.classList.add('is-returning-mode');
          document.body.classList.remove('has-zoomed-card');
        }
        if (container) container.classList.add('is-returning-mode');
        if (track) {
          track.classList.add('is-returning-mode');
          track.classList.remove('has-zoomed-card');
        }
        zoomedCard.classList.remove('is-zoomed');

        // Desabilita tabindex do botão fechar do card correspondente
        const closeBtn = zoomedCard.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.setAttribute('tabindex', '-1');
        }

        // Reativa botões de navegação lateral
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;

        // Restabelece o loop após a duração da transição CSS (800ms)
        setTimeout(() => {
          if (zoomedCard) {
            zoomedCard.classList.remove('is-returning');
          }
          if (document.body) document.body.classList.remove('is-returning-mode');
          if (container) container.classList.remove('is-returning-mode');
          if (track) track.classList.remove('is-returning-mode');
          
          zoomedCard = null;
          isZoomedMode = false;
          isAnimatingState = false;
          // Atualiza posições físicas instantaneamente para sincronizar com o ângulo corrente
          positionCards();
          // Reinicia o loop de animação requestAnimationFrame
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(animate);
        }, 800);
      }

      // Gatilhos de Fechamento (Backdrop e Botão Fechar)
      if (backdrop) {
        backdrop.addEventListener('click', closeZoom);
      }
      
      document.querySelectorAll('.close-btn').forEach((btn) => {
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeZoom();
          });
        }
      });
    });
  </script>
</body>
</html>
```

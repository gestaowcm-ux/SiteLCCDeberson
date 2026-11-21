# Menu Limelight (Limelight Navigation Menu)

## 1. Descrição da Funcionalidade
O **Menu Limelight** é uma barra de navegação interativa e minimalista que conta com um indicador flutuante inteligente e um feixe de luz difuso (efeito holofote) que acompanha o movimento do cursor ou a aba selecionada de forma contínua e orgânica.
- **Comportamento de Hover (Passagem do Mouse)**: Ao passar o cursor sobre qualquer ícone de navegação, o holofote desliza de forma fluida até o ícone alvo, mudando também a opacidade do ícone para 100% de forma suave.
- **Retorno ao Ativo (Mouse Leave)**: Caso o usuário retire o mouse do menu sem clicar, o holofote retorna automaticamente e de forma suave para a aba que está atualmente marcada como ativa.
- **Transição de Seleção (Clique)**: Ao clicar em uma aba, ela se torna o novo ponto "ativo" definitivo. O holofote se fixa na nova aba, e a interação é confirmada.
- **Identidade Visual e Efeito de Luz**: 
  - Uma fina barra de destaque horizontal no topo (ou base) do menu (`bg-primary` ou preto).
  - Um brilho difuso ao redor da barra usando sombras projetadas (`box-shadow`).
  - Um feixe de luz trapezoidal projetando-se verticalmente em gradiente linear até desaparecer (`clip-path: polygon(...)` com gradiente vertical), simulando a projeção real de um holofote iluminando o ícone.

---

## 2. Guia Conceitual de Performance
Para que o indicador flutuante atinja **60/120 FPS** de forma contínua em qualquer navegador e dispositivo:
- **Transformações Puras por Hardware (GPU)**: O movimento horizontal do holofote é animado puramente através da propriedade `transform: translateX()` (ou uso otimizado de `left` com aceleração de compositor `will-change: transform`). O uso de `transform` evita repinturas (repaints) ou recálculos de layout (reflows) que ocorreriam ao animar propriedades como `margin` ou `width`.
- **Cacheadora de Medidas (Layout Thrashing Prevention)**: Em vez de consultar propriedades como `.offsetLeft` ou `.offsetWidth` a cada milissegundo durante o evento `mousemove` ou `mouseenter` (o que força o navegador a recalcular a geometria da tela e causa travamentos), as posições e larguras das abas são medidas e cacheadas apenas **uma única vez** no carregamento inicial da página e em eventos de redimensionamento da janela (`resize`).
- **Otimização de Transições CSS**: A transição do holofote é definida com propriedades específicas (`transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s;`) garantindo curvas de atenuação naturais e de alta resposta.

---

## 3. Código de Exemplo Completo
Abaixo está o código HTML, CSS e JavaScript Vanilla completo, autônomo e fiel à identidade do projeto **SiteMentoria** (fundo limpo, fontes geométricas e tons pretos/cinzas com contraste refinado).

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu Limelight - Alta Performance</title>
  <!-- Fonte Inter para consistência de design -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
  
  <style>
    /* 1. Variáveis e Reset */
    :root {
      --color-primary: #000000;
      --color-primary-rgb: 0, 0, 0;
      --color-border: #e2e2e2;
      --color-canvas-soft: #f5f5f7;
      --color-ink: #000000;
      --font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-family);
      background-color: var(--color-canvas-soft);
      color: var(--color-ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .demo-container {
      text-align: center;
      margin-bottom: 40px;
    }

    .demo-container h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .demo-container p {
      color: #6e6e73;
      font-size: 0.9rem;
    }

    /* 2. Container da Barra de Navegação */
    .limelight-nav {
      position: relative;
      display: inline-flex;
      align-items: center;
      height: 64px;
      background-color: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 0 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      overflow: hidden; /* Garante que o feixe de luz não transborde lateralmente */
    }

    /* Itens de Navegação (Abas) */
    .nav-item {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 24px;
      color: var(--color-ink);
      text-decoration: none;
      cursor: pointer;
      background: none;
      border: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* Estilo dos Ícones e Transição de Opacidade */
    .nav-item svg {
      width: 24px;
      height: 24px;
      opacity: 0.4;
      transition: opacity 0.25s ease;
      stroke: currentColor;
    }

    /* Ícone ativo ou sob hover fica totalmente opaco */
    .nav-item.active svg,
    .nav-item.hovered svg {
      opacity: 1;
    }

    /* 3. Indicador de Destaque (Limelight) */
    .limelight-indicator {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      width: 44px; /* Largura padrão da barra de luz */
      height: 4px;
      background-color: var(--color-primary);
      border-radius: 0 0 4px 4px;
      transform: translateX(-100px); /* Posição inicial fora da tela */
      will-change: transform;
      /* Transição suave de movimento e opacidade */
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.4);
    }

    /* O Feixe de Luz Tridimensional (Spotlight Beam) */
    .limelight-beam {
      position: absolute;
      top: 4px;
      left: -30%; /* Ligeiramente mais largo que a barra superior para espalhamento */
      width: 160%;
      height: 60px;
      /* Gradiente vertical simulando atenuação da luz */
      background: linear-gradient(to bottom, rgba(var(--color-primary-rgb), 0.15) 0%, rgba(var(--color-primary-rgb), 0) 100%);
      /* Recorte poligonal simulando dispersão física de luz cônica */
      clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
      pointer-events: none;
    }
  </style>
</head>
<body>

  <div class="demo-container">
    <h1>Menu Limelight</h1>
    <p>Passe o cursor sobre os ícones e clique para selecionar.</p>
  </div>

  <!-- Componente de Navegação -->
  <nav class="limelight-nav" id="limelightNav">
    
    <button class="nav-item active" aria-label="Home">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </button>
    
    <button class="nav-item" aria-label="Favoritos">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
    </button>
    
    <button class="nav-item" aria-label="Adicionar">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
    </button>
    
    <button class="nav-item" aria-label="Perfil">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </button>
    
    <button class="nav-item" aria-label="Configurações">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>

    <!-- Indicador Limelight -->
    <div class="limelight-indicator" id="limelightIndicator">
      <div class="limelight-beam"></div>
    </div>

  </nav>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const nav = document.getElementById('limelightNav');
      const indicator = document.getElementById('limelightIndicator');
      const items = nav.querySelectorAll('.nav-item');
      
      let activeIndex = 0;
      let cachedPositions = [];

      // 1. Função para cachear as posições e larguras (Evita Layout Thrashing)
      function cachePositions() {
        cachedPositions = Array.from(items).map(item => {
          // Centralização: calcula o ponto de ancoragem esquerdo para centralizar o indicador
          const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
          const indicatorWidth = indicator.offsetWidth;
          const leftPosition = itemCenter - (indicatorWidth / 2);
          return {
            left: leftPosition
          };
        });
        
        // Atualiza a posição inicial sem atraso
        updateIndicatorPosition(activeIndex);
      }

      // 2. Move o indicador usando translação X de GPU
      function updateIndicatorPosition(index) {
        if (cachedPositions[index]) {
          indicator.style.transform = `translateX(${cachedPositions[index].left}px)`;
          indicator.style.opacity = '1';
        }
      }

      // 3. Registra os ouvintes de eventos para cada item
      items.forEach((item, index) => {
        // Ao passar o mouse por cima
        item.addEventListener('mouseenter', () => {
          items.forEach(i => i.classList.remove('hovered'));
          item.classList.add('hovered');
          updateIndicatorPosition(index);
        });

        // Ao clicar para selecionar
        item.addEventListener('click', () => {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          activeIndex = index;
          updateIndicatorPosition(index);
        });
      });

      // 4. Ao tirar o mouse do menu, retorna para a aba ativa
      nav.addEventListener('mouseleave', () => {
        items.forEach(i => i.classList.remove('hovered'));
        updateIndicatorPosition(activeIndex);
      });

      // 5. Inicialização e observação de Redimensionamento
      cachePositions();
      window.addEventListener('resize', cachePositions);
    });
  </script>
</body>
</html>
```

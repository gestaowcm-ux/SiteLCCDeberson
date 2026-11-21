# Documentação de Motion: Preloader Giratório (Infinite Text Ring)

Este documento especifica os padrões de comportamento visual, otimizações de performance e o código de implementação do **Preloader Giratório** (Infinite Text Ring), conforme observado e analisado nas especificações de motion design para a landing page.

---

## Descrição da Funcionalidade

### 1. Comportamento Visual em Vídeo
O preloader consiste em um anel tipográfico circular minimalista que gira continuamente a uma velocidade angular constante. No centro deste anel, reside um elemento gráfico estático (como o logotipo da marca ou um ícone estilizado que representa engenharia e confiabilidade) e um contador numérico de carregamento percentual (de `0%` a `100%`). A tipografia é inspirada no padrão corporativo moderno (estilo sans-serif geométrico de alta legibilidade, caixa alta e espaçamento entre letras acentuado), criando uma identidade técnica e sofisticada.

### 2. Gatilho de Transição (Transition Trigger)
O encerramento do estado de carregamento inicia automaticamente a transição de saída:
* **Escala**: O preloader aumenta suavemente de escala (efeito de "zoom in" de `scale(1)` para `scale(1.15)`) para dar a sensação de imersão.
* **Opacidade**: O preloader executa um fade-out gradual (`opacity` vai de `1` para `0`).
* **Visualização**: A propriedade `visibility` é definida para `hidden` (com atraso) para garantir que o contêiner do preloader seja totalmente removido da árvore de renderização interativa e não bloqueie cliques.
* **Revelação do Conteúdo**: O conteúdo principal da página, inicialmente oculto e deslocado ligeiramente para baixo (`translateY(20px)`), realiza um fade-in e desliza de volta para a posição original, gerando uma transição harmônica de continuidade.

### 3. Dimensões Recomendadas
* **Diâmetro do Anel**: `260px` a `300px` em telas desktop, reduzindo responsivamente para `200px` em dispositivos móveis.
* **Painel Central**: `120px` a `140px` de diâmetro, mantendo margens internas proporcionais para isolar o logotipo e o indicador de carregamento.
* **Largura do Traçado (Path)**: O diâmetro do caminho SVG invisível usado para a rotação de texto é definido em um raio exato (`r=80` em um viewBox de `200x200`), maximizando o uso do espaço sem cortes na tipografia.

### 4. Estilo de Movimento
* **Rotação Infinita**: Movimento estritamente linear (`animation-timing-function: linear`) sem aceleração ou desaceleração interna para evitar oscilações na percepção da velocidade física da rotação.
* **Transição de Entrada/Saída**: Curva de aceleração do tipo "co-seno" ou sigmoide acentuada (`cubic-bezier(0.77, 0, 0.175, 1)` ou `power4.out`), conferindo um aspecto tátil e de alto padrão (Premium Feel).

---

## Guia Conceitual de Performance

### 1. Otimização de Renderização (GPU vs CPU)
Animações tradicionais em navegadores que modificam propriedades de fluxo de layout (`top`, `left`, `width`, `height`) forçam o motor do browser a refazer todo o cálculo de geometria da página (etapa de **Layout/Reflow**) e a redesenhar os pixels na tela (etapa de **Paint**). 
Para manter a animação em constantes **60 FPS** ou **120 FPS** (em telas modernas), a rotação e a transição de revelação devem operar exclusivamente na camada de **Compositing** (Composição da GPU). Ao manipular apenas `transform` e `opacity`, evitamos as fases de layout e pintura nos frames intermediários da animação.

### 2. Aceleração de Hardware via Compositor
Utilizamos a propriedade `will-change: transform` na divisão que realiza a rotação contínua e no overlay de transição. Isto instrui o navegador a promover esses elementos para suas próprias camadas de composição independentes (layers de GPU) de forma antecipada.
* **Cuidado**: O uso indiscriminado de `will-change` consome memória VRAM preciosa. Ele deve ser aplicado pontualmente apenas nos elementos sob estresse de animação contínua (como o contêiner do anel de texto).

### 3. Prevenção de Layout Thrashing
O preenchimento dinâmico do contador de porcentagem (`0%` a `100%`) altera o DOM. Se essa alteração estivesse encadeada com leituras geométricas do layout em JavaScript (como `offsetHeight` ou `getBoundingClientRect` repetidos a cada frame), ocorreria o fenômeno de **Layout Thrashing** (leitura e escrita alternadas forçando reflows síncronos). 
No código implementado, o JavaScript apenas escreve o valor textual (`textContent`) de forma independente, sem nenhuma leitura ou readequação física de tamanhos, garantindo estabilidade na renderização.

### 4. Comparação de Técnicas: SVG `<textPath>` vs Caracteres Individuais em 3D
* **SVG `<textPath>` (Implementado)**: É a abordagem mais limpa e padrão para desenhar textos ao longo de caminhos geométricos complexos. Os motores modernos de navegadores otimizam a renderização de SVG vetorial de forma eficiente. O anel rotaciona como um elemento gráfico único acelerado por hardware.
* **Divisão de Caracteres em spans (CSS 3D/Transform)**: Consiste em quebrar o texto em letras individuais e rotacionar cada caractere no espaço 3D usando `transform: rotateY() translateZ()`. Embora ofereça controle tipográfico individual absoluto, introduz centenas de nós adicionais no DOM, aumentando a sobrecarga de memória em dispositivos móveis de baixo custo em comparação com a solução baseada em SVG único.

---

## Código de Exemplo Completo

O código abaixo é uma implementação autônoma, responsiva e pronta para uso (HTML, CSS e Vanilla JS em arquivo único) demonstrando a funcionalidade do preloader, a transição e um botão interativo para reiniciar a simulação e verificar a qualidade do movimento.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preloader Giratório - Engenharia de Confiabilidade</title>
  <style>
    /* 1. Reset de Estilos Base */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #050505;
      color: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* 2. Overlay do Preloader */
    .preloader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000000;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      /* Curva de transição suave baseada em cubic-bezier de alto padrão */
      transition: opacity 0.8s cubic-bezier(0.77, 0, 0.175, 1),
                  transform 0.8s cubic-bezier(0.77, 0, 0.175, 1),
                  visibility 0.8s;
      will-change: transform, opacity;
    }

    /* Classe ativada para iniciar a transição de revelação */
    .preloader-overlay.fade-out {
      opacity: 0;
      transform: scale(1.15);
      visibility: hidden;
      pointer-events: none;
    }

    /* 3. Contêiner Principal do Movimento */
    .preloader-wrapper {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Rotação Infinita do Anel Tipográfico */
    .text-ring-container {
      position: absolute;
      width: 100%;
      height: 100%;
      animation: rotate-clockwise 18s linear infinite;
      will-change: transform;
    }

    @keyframes rotate-clockwise {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .ring-svg {
      width: 100%;
      height: 100%;
    }

    .ring-svg text {
      font-family: 'Inter', 'Courier New', monospace;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 3.8px;
      fill: #ffffff;
      text-transform: uppercase;
      opacity: 0.9;
    }

    /* 4. Painel Central Estático (Logo e Indicador de Progresso) */
    .center-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: rgba(10, 10, 10, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.03);
      z-index: 10;
    }

    /* Logotipo da Confiabilidade (Engrenagem Geométrica Interativa) */
    .center-logo-svg {
      width: 42px;
      height: 42px;
      fill: #ffffff;
      margin-bottom: 10px;
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .preloader-wrapper:hover .center-logo-svg {
      transform: scale(1.12) rotate(45deg);
    }

    /* Contador Numérico de Carregamento */
    .counter-display {
      font-size: 15px;
      font-weight: 600;
      color: #00e676; /* Tom verde brilhante de status/confiabilidade */
      font-variant-numeric: tabular-nums; /* Evita trepidação na largura do texto */
      letter-spacing: 0.5px;
      transition: color 0.3s ease;
    }

    .counter-display.loaded {
      color: #ffffff;
    }

    /* 5. Área de Conteúdo Principal (Escondida Inicialmente) */
    .main-content {
      opacity: 0;
      transform: translateY(25px);
      transition: opacity 1s cubic-bezier(0.25, 1, 0.5, 1) 0.4s,
                  transform 1s cubic-bezier(0.25, 1, 0.5, 1) 0.4s;
      max-width: 600px;
      width: 90%;
      text-align: center;
      padding: 40px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
      z-index: 1;
    }

    /* Ativado no body após o preloader desaparecer */
    body.content-loaded .main-content {
      opacity: 1;
      transform: translateY(0);
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -0.8px;
      background: linear-gradient(90deg, #ffffff, #999999);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: #8c8c8c;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .btn-replay {
      padding: 12px 28px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      background-color: #ffffff;
      color: #000000;
      border: 1px solid #ffffff;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s, transform 0.2s;
    }

    .btn-replay:hover {
      background-color: transparent;
      color: #ffffff;
      transform: translateY(-2px);
    }

    .btn-replay:active {
      transform: translateY(0);
    }

    /* Responsividade */
    @media (max-width: 480px) {
      .preloader-wrapper {
        width: 220px;
        height: 220px;
      }
      .center-content {
        width: 105px;
        height: 105px;
      }
      .ring-svg text {
        font-size: 11px;
        letter-spacing: 3.2px;
      }
      h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>

  <!-- Overlay do Preloader -->
  <div class="preloader-overlay" id="preloaderOverlay">
    <div class="preloader-wrapper">
      <!-- Elemento Circular com Rotação Infinita -->
      <div class="text-ring-container">
        <svg viewBox="0 0 200 200" class="ring-svg">
          <!-- Caminho circular invisível com raio 80, centralizado no ponto (100, 100) -->
          <path id="ringPath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
          <text>
            <!-- Associação do texto ao caminho SVG -->
            <textPath href="#ringPath" startOffset="0%">
              • CONFIABILIDADE • MENTORIA PRÁTICA • DEBERSON LUIS • PERFORMANCE
            </textPath>
          </text>
        </svg>
      </div>
      
      <!-- Miolo Estático da Marca -->
      <div class="center-content">
        <!-- Ícone Vetorial de Engrenagem (Confiabilidade Industrial) -->
        <svg class="center-logo-svg" viewBox="0 0 24 24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
        <!-- Contador de Porcentagem Dinâmico -->
        <span class="counter-display" id="loaderCounter">0%</span>
      </div>
    </div>
  </div>

  <!-- Estrutura do Site Principal (Exibida pós-carregamento) -->
  <div class="main-content">
    <h1>Mentoria em Confiabilidade</h1>
    <p>
      Onde a precisão da engenharia e a excelência operacional encontram interfaces fluidas e de alto desempenho. A simulação foi concluída com sucesso!
    </p>
    <button class="btn-replay" id="btnReplay">Reiniciar Simulação</button>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const overlay = document.getElementById('preloaderOverlay');
      const counter = document.getElementById('loaderCounter');
      const btnReplay = document.getElementById('btnReplay');
      let progress = 0;
      let intervalId = null;
      let fadeTimeoutId = null;

      // Executa o carregamento simulado
      function initLoader() {
        // Redefine estados
        progress = 0;
        counter.textContent = '0%';
        counter.classList.remove('loaded');
        overlay.classList.remove('fade-out');
        document.body.classList.remove('content-loaded');
        
        // Simulação com incrementos irregulares para parecer orgânico
        intervalId = setInterval(() => {
          progress += Math.floor(Math.random() * 4) + 1; // Incrementos entre 1% e 4%
          
          if (progress >= 100) {
            progress = 100;
            clearInterval(intervalId);
            counter.textContent = '100%';
            counter.classList.add('loaded');
            
            // Pausa sutil no 100% para satisfação cognitiva antes da transição de saída
            fadeTimeoutId = setTimeout(() => {
              overlay.classList.add('fade-out');
              document.body.classList.add('content-loaded');
            }, 350);
          } else {
            counter.textContent = `${progress}%`;
          }
        }, 25);
      }

      // Dispara o preloader no carregamento inicial da página
      initLoader();

      // Evento de clique para reiniciar e testar novamente a transição
      btnReplay.addEventListener('click', () => {
        if (intervalId) clearInterval(intervalId);
        if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
        initLoader();
      });
    });
  </script>
</body>
</html>
```

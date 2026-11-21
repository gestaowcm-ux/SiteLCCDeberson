# Documentação de Interação: Linha do Tempo e Simulador P-F (Reliability Pathway & P-F Curve)

Este documento especifica os padrões de comportamento interativo, animações de curva SVG e técnicas de otimização para a página **Caminho da Confiabilidade e Curva P-F**, com base nos arquivos analisados do projeto SiteMentoria.

---

## Descrição da Funcionalidade

### 1. Fluxo de Fases do Ciclo de Vida do Ativo
O fluxo representa a jornada de confiabilidade de um ativo, desde sua concepção até sua desativação. Ele é composto por duas partes principais:
* **Lista Interativa de Passos (Timeline Nodes)**: Cada nó na linha do tempo representa uma fase do ativo (Conceito, Compra, Instalação, Comissionamento, Operação, Manutenção, Descarte). 
  * O clique em um nó altera a fase ativa no estado geral da página.
  * O nó selecionado recebe classes CSS de destaque (`active` / `selected`), com transições suaves de cor de fundo e borda (`transition: all 0.3s ease`).
* **Painel Dinâmico de Detalhes**:
  * Ao alternar de fase, o painel central exibe a descrição detalhada, a lista de atividades recomendadas e as responsabilidades dos principais envolvidos.
  * O conteúdo é atualizado injetando novos elementos no DOM com uma leve micro-animação de opacidade (fade-in) para evitar atualizações visuais abruptas.

### 2. Simulador Interativo de Intervalo P-F (Curva P-F SVG)
Esta funcionalidade permite que o usuário manipule o intervalo P-F (tempo decorrido entre a detecção do sintoma de falha potencial $P$ e a falha funcional real $F$):
* **Controle Deslizante (Range Slider)**: Um slider HTML permite ajustar o intervalo P-F de 14 a 365 dias.
* **Curva SVG Dinâmica**: A curva de degradação é desenhada usando um elemento de caminho SVG cúbico (`<path d="...">`).
  * Conforme o slider é arrastado, o ponto $P$ (início do sintoma) se desloca horizontalmente.
  * A coordenada do ponto $P$ ($pX$) varia linearmente entre limites geométricos predefinidos (ex: $140px$ a $295px$), enquanto o ponto da falha funcional $F$ permanece ancorado em $310px$.
  * O preenchimento da área sob a curva (área de intervalo P-F) é recalculado e redesenhado dinamicamente no atributo `d` do SVG para representar a "zona de oportunidade de intervenção".
* **Reatividade Textual**: Um algoritmo de decisão simples atualiza o texto de recomendação de monitoramento com base nos dias selecionados (ex: vibração semanal para intervalos curtos vs. inspeções semestrais para intervalos longos).

---

## Guia Conceitual de Performance

### 1. Manipulação do Atributo `d` do SVG (Path Morphing)
* Para animar a curva sob arraste sem engasgos (preservando os 60 FPS):
  * Não recrie ou remova elementos SVG do DOM durante a interação.
  * Mantenha referências estáticas em cache aos elementos do SVG (como `<line>` e `<path>`).
  * Atualize exclusivamente o atributo `d` (no caso do caminho preenchido) e os atributos `x1`/`x2` (no caso da linha de indicação vertical) usando `setAttribute()`.

### 2. Transições CSS com Otimização de Layout
* As transições nos cartões e painéis de fases devem utilizar prioritariamente propriedades que não forçam o recálculo do fluxo geométrico (layout reflow), como `opacity` e `transform: scale()`, garantindo transições fluidas mesmo em dispositivos móveis.

---

## Código de Exemplo Completo

Abaixo está o código autônomo completo de uma página contendo o seletor de ciclo de vida e a Curva P-F animada em tempo real com slider reativo.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador de Confiabilidade e Curva P-F</title>
  <style>
    :root {
      --color-canvas: #09090b;
      --color-panel: #18181b;
      --color-border: #27272a;
      --color-text-primary: #ffffff;
      --color-text-secondary: #a1a1aa;
      --color-accent: #3f83f8;
      --color-danger: #f05252;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-canvas);
      color: var(--color-text-primary);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    h1 { font-size: 24px; text-align: center; margin-bottom: 10px; }

    /* Timeline Styling */
    .timeline {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid var(--color-border);
      padding-bottom: 10px;
      position: relative;
    }

    .timeline-node {
      color: var(--color-text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }
    .timeline-node:hover {
      color: var(--color-text-primary);
      background-color: rgba(255, 255, 255, 0.05);
    }
    .timeline-node.active {
      color: var(--color-accent);
      background-color: rgba(63, 131, 248, 0.15);
    }

    /* Info Panel */
    .panel {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      min-height: 180px;
      transition: opacity 0.3s ease;
    }
    .panel h2 { font-size: 18px; margin-bottom: 10px; color: var(--color-accent); }
    .panel p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }

    /* P-F Simulator Styling */
    .simulator-card {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    input[type="range"] {
      width: 100%;
      cursor: pointer;
    }

    .rec-box {
      background: rgba(255, 255, 255, 0.02);
      border-left: 4px solid var(--color-accent);
      padding: 12px;
      border-radius: 4px;
      font-size: 14px;
    }

    .rec-box strong { color: var(--color-accent); }

    /* SVG Curve */
    .curve-svg {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      width: 100%;
      height: 200px;
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>Lifecycle de Confiabilidade & Simulador P-F</h1>

    <!-- Phase Selector Timeline -->
    <div class="timeline" id="timeline">
      <div class="timeline-node active" data-phase="conceito">1. Conceito</div>
      <div class="timeline-node" data-phase="compra">2. Compra</div>
      <div class="timeline-node" data-phase="instalacao">3. Instalação</div>
      <div class="timeline-node" data-phase="operacao">4. Operação</div>
    </div>

    <!-- Phase Detail Panel -->
    <div class="panel" id="phase-panel">
      <h2 id="phase-title">Conceito, Desenho & Especificação</h2>
      <p id="phase-desc">A fase de concepção define a estratégia de manutenção para toda a vida útil do ativo. Decisões tomadas nesta etapa determinam mais de 80% do custo total de propriedade.</p>
    </div>

    <!-- P-F Curve Simulator -->
    <div class="simulator-card">
      <h3>Simulador de Intervalo P-F</h3>
      
      <div class="slider-container">
        <div class="slider-header">
          <span>Ajustar Intervalo P-F:</span>
          <span id="pf-days-display" style="font-weight:700; color:var(--color-danger)">180 dias</span>
        </div>
        <input type="range" id="pf-slider" min="14" max="365" value="180">
      </div>

      <div class="rec-box">
        <strong>Estratégia Recomendada:</strong>
        <span id="pf-recommendation">monitoramento trimestral com análise de vibração</span>
      </div>

      <!-- Curve Graphic -->
      <svg class="curve-svg" viewBox="0 0 400 240">
        <!-- Axes -->
        <line x1="40" y1="210" x2="380" y2="210" stroke="#4b5563" stroke-width="2"/>
        <line x1="40" y1="30" x2="40" y2="210" stroke="#4b5563" stroke-width="2"/>
        <text x="35" y="25" fill="#9ca3af" font-size="10" text-anchor="end">Saúde do Ativo</text>
        <text x="380" y="225" fill="#9ca3af" font-size="10" text-anchor="end">Tempo</text>

        <!-- Shaded Area (Opportunity Zone) -->
        <path id="opportunity-area" d="M 220,66 C 250,85 280,120 310,160 L 310,210 L 220,210 Z" fill="rgba(240, 82, 82, 0.15)" stroke="none"/>

        <!-- The P-F Curve -->
        <path d="M 40,40 C 140,40 180,50 310,160" fill="none" stroke="#9ca3af" stroke-width="3"/>
        <path d="M 310,160 C 320,170 330,195 340,210" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4"/>

        <!-- P Point indicator -->
        <line id="p-line" x1="220" y1="66" x2="220" y2="210" stroke="#3f83f8" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle id="p-circle" cx="220" cy="66" r="5" fill="#3f83f8"/>
        <text id="p-label" x="220" y="52" fill="#3f83f8" font-size="11" font-weight="700" text-anchor="middle">P (Falha Potencial)</text>

        <!-- F Point indicator -->
        <line x1="310" y1="160" x2="310" y2="210" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle cx="310" cy="160" r="5" fill="#ef4444"/>
        <text x="310" y="146" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">F (Falha Funcional)</text>
      </svg>
    </div>
  </div>

  <script>
    // 1. Timeline logic
    const PHASES = {
      conceito: {
        title: 'Conceito, Desenho & Especificação',
        desc: 'A fase de concepção define a estratégia de manutenção para toda a vida útil do ativo. Decisões tomadas nesta etapa determinam mais de 80% do custo total de propriedade.'
      },
      compra: {
        title: 'Aquisição e TCO',
        desc: 'A compra avalia o Custo Total de Propriedade (TCO) incluindo manutenção, insumos e descarte final, indo além do preço nominal do fornecedor.'
      },
      instalacao: {
        title: 'Instalação & Mortalidade Infantil',
        desc: 'Erros de alinhamento e balanceamento na instalação originam a maior parte das falhas prematuras. O rigor nesta fase zera o risco na curva da banheira.'
      },
      operacao: {
        title: 'Operação e Rastreabilidade',
        desc: 'Operar dentro dos limites de projeto e coletar dados operacionais limpos são chaves para prever degradações e alimentar os algoritmos de manutenção.'
      }
    };

    const timeline = document.getElementById('timeline');
    const titleEl = document.getElementById('phase-title');
    const descEl = document.getElementById('phase-desc');
    const panelEl = document.getElementById('phase-panel');

    timeline.addEventListener('click', (e) => {
      const node = e.target.closest('.timeline-node');
      if (!node) return;

      document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const key = node.dataset.phase;
      panelEl.style.opacity = 0;
      setTimeout(() => {
        titleEl.textContent = PHASES[key].title;
        descEl.textContent = PHASES[key].desc;
        panelEl.style.opacity = 1;
      }, 150);
    });

    // 2. P-F Curve Slider logic
    const slider = document.getElementById('pf-slider');
    const display = document.getElementById('pf-days-display');
    const recommendation = document.getElementById('pf-recommendation');
    const pLine = document.getElementById('p-line');
    const pCircle = document.getElementById('p-circle');
    const pLabel = document.getElementById('p-label');
    const oppArea = document.getElementById('opportunity-area');

    const BASE_F_X = 310;

    function getRecommendation(days) {
      if (days <= 30) return 'monitoramento semanal de vibração e termografia contínua';
      if (days <= 90) return 'monitoramento mensal com análise de vibração e óleo';
      if (days <= 180) return 'monitoramento trimestral com análise de vibração';
      return 'inspeção semestral com revisão do plano de manutenção preventiva';
    }

    slider.addEventListener('input', () => {
      const days = parseInt(slider.value, 10);
      display.textContent = `${days} dias`;
      recommendation.textContent = getRecommendation(days);

      // Calculations for P position on path (approximated curve coordinates)
      const minDays = 14, maxDays = 365;
      const minPx = 140, maxPx = 295;
      const pX = maxPx - ((days - minDays) / (maxDays - minDays)) * (maxPx - minPx);

      // Math for Y of P based on curve segment
      // Curve starts at (40,40) and bends to (310,160)
      // Interpolating Y geometrically
      const progress = (pX - 40) / (310 - 40);
      const pY = 40 + (progress * progress) * (160 - 40); // quadratic ease-in bend

      // Update SVG coordinates
      pLine.setAttribute('x1', pX);
      pLine.setAttribute('x2', pX);
      pLine.setAttribute('y1', pY);

      pCircle.setAttribute('cx', pX);
      pCircle.setAttribute('cy', pY);

      pLabel.setAttribute('x', pX);
      pLabel.setAttribute('y', pY - 14);

      oppArea.setAttribute('d', `M ${pX},${pY} C ${pX + 25},${pY + (160-pY)/2} 280,120 ${BASE_F_X},160 L ${BASE_F_X},210 L ${pX},210 Z`);
    });
  </script>
</body>
</html>
```

# Diretrizes de Design e Padronização de Slides (Curso LCC — Life Cycle Costing)

Este documento define o padrão técnico e visual para o desenvolvimento de todas as aulas de slides do **Curso LCC (Life Cycle Costing — Custo do Ciclo de Vida)**. Todo agente AI ou desenvolvedor deve consultar este arquivo antes de criar ou modificar slides para garantir consistência visual, minimalismo e alto dinamismo interativo.

---

## 1. Princípios Visuais: Minimalismo em Preto e Branco

1. **Predominância do Fundo Branco (Light-First)**:
   * O padrão absoluto da plataforma é o **fundo branco (`--color-canvas: #ffffff`)** com tipografia preta (`--color-ink: #000000`) e superfícies neutras suaves (`--color-canvas-soft: #efefef`, `--color-canvas-softer: #f7f7f7`).
   * **Slides escuros (`--color-primary: #000000`) são exceções pontuais**, reservados apenas para capas, viradas de módulo ou momentos de alto contraste dramático — **não** há obrigatoriedade de alternar claro/escuro a cada slide.
2. **Vermelho Sutil Apenas em Realces e Destaques**:
   * O vermelho (`--color-danger: #dc2626` ou `--color-accent-soft: rgba(220, 38, 38, 0.08)`) deve ser usado **com moderação e precisão cirúrgica**:
     * Linhas finas de destaque, bordas sutis (`2px–3px`), indicadores de estado ativo, pontos de atenção em gráficos (ex.: ponto de equilíbrio, custo oculto, limiar crítico) e micro-badges.
     * **Evite** grandes blocos vermelhos saturados, fundos vermelhos chapados ou excesso de texto vermelho que poluam a leitura.
3. **Menos Texto, Fontes Maiores e Respiro Generoso**:
   * **Regra do Minimalismo**: Cada slide deve comunicar **uma ideia central clara**. Corte parágrafos longos, redundâncias e textos explicativos extensos — o detalhe aprofundado pertence às **Notas do Orador (`.speaker-notes`)**, não à tela.
   * **Densidade recomendada**: Títulos curtos (até 6–8 palavras), cards com 1 frase curta ou 1 métrica + legenda enxuta, e uso generoso de espaço em branco (*whitespace*) para descanso visual.
   * **Tipografia Ampla para Sala de Aula**: Fontes grandes e legíveis à distância, escalando proporcionalmente sem esmagar o layout.

---

## 2. Estrutura HTML Padrão (Skeleton)

Cada arquivo de aula (ex: `Aulas/001.DecisaoLCC.html`) deve possuir a seguinte estrutura de seções dentro de `.slides-wrapper`:

```html
<!-- Exemplo de Slide Individual -->
<section class="slide-section" id="slide-N">
  <!-- Notas do Orador (Invisíveis no slide, capturadas via JS) -->
  <div class="speaker-notes" style="display: none;">
    <h3>Título das Notas</h3>
    <p>Script de fala, analogias, perguntas para a turma e aprofundamento técnico.</p>
  </div>

  <!-- Cabeçalho do Slide (Opcional em slides 100% focados em simulação/capa) -->
  <div class="slide-header">
    <span class="body-sm-strong animate-item">EYEBROW DO MÓDULO</span>
    <h2 class="display-xl animate-item delay-1">Título Curto e Direto</h2>
  </div>

  <!-- Corpo do Slide (Espaço limpo para simulação, diagrama ou cards minimalistas) -->
  <div class="slide-body">
    <div class="content-wrapper animate-item delay-2">
      <!-- Conteúdo minimalista ou simulador interativo -->
    </div>
  </div>
</section>
```

> [!NOTE]
> Elementos decorativos de grade técnica (`.technical-grid`, `.technical-corner-tick`) são opcionais e devem permanecer extremamente discretos para não competir com gráficos e simulações.

---

## 3. Proporção, Margens e Tipografia Fluida (16:9 Widescreen)

* **Slide Section (`.slide-section`)**:
  * `height: 100vh; width: 100vw; display: flex; flex-direction: column; overflow: hidden;`
  * Fundo padrão `background-color: var(--color-canvas);`.
  * **Margens e Respiro**:
    * Topo: `clamp(18px, 2.8vh, 34px)` dentro do portal (`index.html`). Quando aberto diretamente fora do portal (`body:has(.presentation-overlay-container > .presentation-toolbar)`), aplica-se `padding-top: clamp(68px, 8vh, 86px) !important` para acomodar a barra flutuante.
    * Esquerda: `clamp(28px, 2.8vw, 48px)`.
    * Direita: `clamp(54px, 4vw, 72px)` (protege os pontos verticais `.slide-nav-indicators`).
    * Base: `clamp(18px, 2.4vh, 30px)`.
* **Slide Header (`.slide-header`)**:
  * Centralizado por padrão (`align-items: center; text-align: center;`), com suporte a `.align-left` e `.align-right` quando o layout exigir (ex.: cabeçalho ao lado de um simulador).
  * `flex: 0 0 auto;` sem divisão rígida de altura.
* **Slide Body (`.slide-body`)**:
  * `flex: 1 1 auto; min-height: 0;` ocupando a largura útil sem travas estreitas desnecessárias, mantendo `scrollHeight <= clientHeight` (zero overflow/rolagem).
* **Escala Tipográfica Minimalista (Legibilidade em Projeção)**:
  * **Títulos Principais (`.display-xl`)**: `clamp(38px, min(4.2vw, 6.2vh), 74px)` — peso `800`, `line-height: 1.08`.
  * **Subtítulos / Títulos de Bloco (`.display-md` / `.display-lg`)**: `clamp(24px, min(2.4vw, 3.6vh), 42px)` — peso `700`.
  * **Texto de Cards e Controles**: `clamp(18px, min(1.55vw, 2.5vh), 28px)` — frases curtas, peso `400/500`, cor `var(--color-body)` ou `var(--color-ink)`.
  * **Eyebrows (`.body-sm-strong`)**: `clamp(13px, 0.4vw + 10px, 17px)` — caixa alta com espaçamento sutil.
  * **Métricas / KPIs de Destaque**: `clamp(36px, min(4vw, 6vh), 68px)` — `font-variant-numeric: tabular-nums;` para evitar tremores durante animações numéricas em simulações.

---

## 4. Dinamismo, Interatividade e Simulações (Padrão LCC)

O diferencial do **Curso LCC** é transformar conceitos financeiros e de engenharia de ativos em **simulações vivas em tempo real** durante a aula. Sempre que um conceito envolver variáveis, trade-offs ou evolução temporal, priorize uma tela interativa em vez de texto estático.

### 4.1. Padrões de Simulação Recomendados
1. **Sliders e Controles Diretos**:
   * Controles táteis limpos (sliders de range com valor atual em destaque, botões em *pill* `999px` para seleção de cenários como *Baixo CAPEX vs. Alto CAPEX*, toggles de taxa de desconto, vida útil, custo de energia ou frequência de falha).
   * Toda alteração de controle deve atualizar **instantaneamente** os KPIs e os gráficos da tela (sem botão "Calcular").
2. **Gráficos e Diagramas Reativos (SVG / Canvas)**:
   * Curvas de custo acumulado ao longo do tempo (Payback / Ponto de Cruzamento entre alternativa A e B).
   * Decomposição visual CAPEX vs. OPEX vs. Descarte (Iceberg de Custos ou barras proporcionais animadas).
   * Simulação de VPL (Valor Presente Líquido), Curva da Banheira ou ponto ótimo de substituição de ativo.
   * Use **preto, branco e tons de cinza** para a base do gráfico e **vermelho sutil (`var(--color-danger)`)** exclusivamente para a linha de risco, custo oculto, ponto de cruzamento ou cenário crítico.
3. **Estabilidade Numérica e Feedback Visual**:
   * Use `font-variant-numeric: tabular-nums;` em todos os valores monetários, percentuais e contadores dinâmicos.
   * Prefira layouts **2 colunas** (Controles compactos à esquerda + Visualização/Gráfico amplo à direita) ou **Painel Superior de KPIs + Palco Visual Central**, mantendo a tela limpa e sem rolagem.

### 4.2. Padrão de Imagens e Mídias
* Imagens e fotos seguem estética limpa em **escala de cinza por padrão** (`filter: grayscale(100%) contrast(1.1);`), podendo revelar cor ou realce sutil no foco/interação.
* Evite usar imagens apenas como decoração quando um diagrama interativo ou gráfico SVG comunicar melhor o conceito de LCC.

---

## 5. Idioma, Cópia e Acentuação

* **Português do Brasil Obrigatório**: Todo conteúdo textual (títulos, eyebrows, labels de simuladores, tooltips, botões e notas do orador) deve seguir ortografia, concordância e acentuação corretas do Português BR (`á`, `é`, `í`, `ó`, `ú`, `â`, `ê`, `ô`, `ã`, `õ`, `ç`).
* **Títulos Limpos no Menu e Indicadores**: Os itens em `index.html` (`.sub-menu-item`), os atributos `data-title` dos pontos de navegação (`.slide-indicator-dot`) e os cabeçalhos das notas do orador devem conter **apenas o título descritivo do slide** (ex.: `Decisão CAPEX vs. OPEX`, `Simulador de TCO`), sem prefixar com `"Slide 1:"`, `"Slide 2:"`, etc.
* **Proibição de Texto Corrompido**: Nunca entregar caracteres quebrados de encoding (`Ã§`, `Ã£`, `Ã©`, `â€”`).

---

## 6. Framework de Integração Técnica

1. **Notas do Orador (`.speaker-notes`)**:
   * Estruturadas com `<h3>` para o título e `<p>` para as falas e orientações de condução da simulação, sempre com `style="display: none;"`.
2. **Live Preview (`?preview=true`)**:
   * O JavaScript da aula deve escutar a query string. Em modo preview, desativa a navegação lateral (`#slide-nav-indicators`), remove controles externos e trava a rolagem.
3. **Animações de Entrada (`.animate-item`)**:
   * Disparadas pela classe `.active-slide` na `<section>` ativa, com atrasos graduais (`.delay-1` a `.delay-4`).
   * Use `overflow: clip` ou `overflow: hidden` nos containers de slide para evitar saltos de scroll ao interagir com botões e sliders.
4. **Responsividade**:
   * Grades e painéis de simulação devem empilhar em coluna única (`1fr`) abaixo de `992px` sem colisão ou sobreposição de textos e controles.

---

## 7. Padrão Oficial de Slides de Quiz Interativo

Slides de **Quiz / Fixação de Conceito** devem seguir o mesmo princípio **minimalista, fundo branco e realce sutil**:

1. **Cabeçalho Horizontal Limpo**:
   * Esquerda: `QUIZ` em caixa alta (`clamp(44px, 6.5vh, 72px)`, peso `850`, cor `var(--color-ink)`).
   * Direita: Abas em *pill* dos cenários com `.tab-status-dot` (discreto; verde `#16a34a` ao acertar).
2. **Enunciado Direto**:
   * Card em `var(--color-canvas-soft)` com borda esquerda sutil em vermelho (`4px solid var(--color-danger)`), tag curta em caixa alta e pergunta objetiva com fonte ampla (`clamp(20px, 2.3vh + 3px, 28px)`).
3. **Grid 2x2 de Alternativas Minimalistas**:
   * 4 cards limpos com badge circular (`A`, `B`, `C`, `D`), texto principal curto e direto (`clamp(18px, 2vh + 2px, 24px)`) e subtítulo opcional conciso.
   * Ao acertar: destaque verde sutil (`#16a34a` na borda/badge, fundo `#f0fdf4`) e atenuação das demais opções.
   * Ao errar: borda sutil em `var(--color-danger)`, animação leve de *shake* e feedback técnico curto.
4. **Rodapé Compacto**:
   * Indicador de progresso (`X/Y`) e botões em *pill* (`Próximo Cenário`, `Reiniciar`).

### Template HTML do Quiz
```html
<section class="slide-section quiz-slide" id="slide-N">
  <div class="speaker-notes" style="display: none;">
    <h3>Notas do Orador — Quiz: [Título]</h3>
    <p>[Orientações para o apresentador conduzir a discussão com a turma]</p>
  </div>

  <header class="quiz-header animate-item">
    <h2 class="quiz-title-giant">QUIZ</h2>
    <div class="quiz-tabs-nav">
      <button class="quiz-tab-btn active" id="quizTab1" data-scenario="1">
        <span class="tab-status-dot"></span>
        Cenário 1: Fundamentos
      </button>
      <button class="quiz-tab-btn" id="quizTab2" data-scenario="2">
        <span class="tab-status-dot"></span>
        Cenário 2: Decisão LCC
      </button>
    </div>
  </header>

  <div class="quiz-stage-container animate-item delay-1">
    <div class="quiz-scenario-panel active" id="scenarioPanel1">
      <div class="quiz-context-card">
        <span class="quiz-context-tag">CENÁRIO DE DECISÃO</span>
        <h3 class="quiz-context-title">[Pergunta curta e direta do Cenário 1]</h3>
      </div>

      <div class="quiz-options-grid" id="optionsGrid1">
        <div class="quiz-option-card" data-correct="true" data-option="A" tabindex="0">
          <div class="option-letter-badge">A</div>
          <div class="option-text-group">
            <p class="option-main-text">[Opção A (Correta) — texto curto]</p>
            <p class="option-sub-text">[Complemento breve]</p>
          </div>
        </div>
        <div class="quiz-option-card" data-correct="false" data-option="B" tabindex="0">
          <div class="option-letter-badge">B</div>
          <div class="option-text-group">
            <p class="option-main-text">[Opção B — texto curto]</p>
            <p class="option-sub-text">[Complemento breve]</p>
          </div>
        </div>
        <div class="quiz-option-card" data-correct="false" data-option="C" tabindex="0">
          <div class="option-letter-badge">C</div>
          <div class="option-text-group">
            <p class="option-main-text">[Opção C — texto curto]</p>
            <p class="option-sub-text">[Complemento breve]</p>
          </div>
        </div>
        <div class="quiz-option-card" data-correct="false" data-option="D" tabindex="0">
          <div class="option-letter-badge">D</div>
          <div class="option-text-group">
            <p class="option-main-text">[Opção D — texto curto]</p>
            <p class="option-sub-text">[Complemento breve]</p>
          </div>
        </div>
      </div>

      <div class="quiz-feedback-banner" id="feedbackBanner1"></div>
    </div>
  </div>

  <div class="quiz-footer animate-item delay-2">
    <span>CURSO LCC • FIXAÇÃO</span>
    <div class="quiz-footer-actions">
      <span id="quizScoreText">Progresso: 0/2</span>
      <button class="btn-quiz-next" id="btnNextScenario">Próximo Cenário</button>
      <button class="btn-quiz-reset" id="btnResetQuiz">Reiniciar</button>
    </div>
  </div>
</section>
```

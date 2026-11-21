---
name: lcc-slide-builder
description: Converts PDF presentations, image decks, or content outlines into standardized, responsive HTML/JS slide files in the Aulas/ directory for the Curso LCC (Life Cycle Costing) web platform, adhering strictly to SLIDES_DESIGN.md.
---

# LCC Slide Builder Specialist

This skill provides step-by-step instructions for converting presentations (from PDFs, images, or raw text outlines) into structured, beautiful, responsive slide pages within the Curso LCC project.

## Context & Architecture

The Curso LCC slide platform is a Single Page Application (SPA) shell (`index.html`) that hosts interactive slide lessons inside an iframe (`#view-frame`).
Each lesson is composed of two files in the `Aulas/` directory:
1. `Aulas/<LessonName>.html`: The HTML skeleton containing slide sections, local style rules, and layout structures.
2. `Aulas/<LessonName>.js`: The JS controller managing slide transitions, keyboard events, and synchronization with the presenter panel using postMessage API.

---

## Step-by-Step Workflow

### 1. Extract Presentation Content & Case Upload Pattern

#### Standard Slide Generation (Custom HTML/CSS Layouts):
If the input is a PDF presentation file intended for full HTML component reconstruction:
- Execute the helper extraction script from the workspace terminal:
  `python .agents/skills/lcc-slide-builder/scripts/extract_pdf.py <caminho_do_pdf>`
- This script generates `<caminho_do_pdf>_content.json` in the same directory.

#### Padrão de Upload de Cases (PDF / Telas em Imagem):
Quando o usuário solicitar o upload de um Case a partir de um PDF (onde cada página do PDF deve ser um slide em imagem dentro da seção de Cases):
1. Execute o script automatizado de upload de case:
   `python .agents/skills/lcc-slide-builder/scripts/upload_case_pdf.py <caminho_do_pdf> <NomeDoCase> "<TituloDeExibicao>"`
   *Exemplo*: `python .agents/skills/lcc-slide-builder/scripts/upload_case_pdf.py C:\caminho\arquivo.pdf CaseColhedora "Case Colhedora"`
2. O script irá:
   - Converter todas as páginas do PDF em imagens PNG de alta resolução (`150-200 DPI`) salvas em `/assets/cases/<slug>/slide_XX.png`.
   - Criar a página HTML responsiva do case (`Aulas/<NomeDoCase>.html`).
   - Criar o controller JavaScript com navegação completa (`Aulas/<NomeDoCase>.js`).
   - Registrar o novo case e todos os seus sub-items de slide na seção **Cases** do menu lateral no `index.html`.
   - **Padronização de Títulos (Sem Prefixo de Numeração)**: Todos os sub-itens do menu (`.sub-menu-item`), títulos de notas e indicadores laterais (`data-title`, `.slide-preview-text`) devem exibir **apenas** `[Nome do Slide]`, **sem** prefixos como `Slide 1:`, `Slide 2:`, `Slide XX:`, `Mód [Romano] -` ou `Módulo [Romano] —`.

If the input is a folder of images:
- Use `view_file` on individual image paths to read their content visually and transcribe titles/layouts.

---

### 2. Scaffold files (HTML & JS)
Create `Aulas/<LessonName>.html` and `Aulas/<LessonName>.js` based on the templates below.

#### HTML Template (`Aulas/<LessonName>.html`):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nome da Aula - Curso LCC</title>
  <link rel="stylesheet" href="/css/style.css">
  <style>
    html, body {
      height: 100%;
      overflow: hidden;
      overflow: clip;
      margin: 0;
      padding: 0;
      background-color: var(--color-canvas);
    }
    .slides-container {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      overflow: clip;
      position: relative;
    }
    .slides-wrapper {
      height: 300vh; /* Ajustar dinamicamente para N * 100vh */
      width: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .slide-section {
      height: 100vh;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      position: relative;
      background-color: var(--color-canvas);
      padding: clamp(18px, 2.8vh, 34px) clamp(52px, 3.8vw, 72px) clamp(16px, 2.4vh, 30px) clamp(26px, 2.6vw, 46px);
      overflow: hidden;
      overflow: clip;
    }
    /* Folga extra no topo APENAS quando aberto fora do shell index.html (toolbar flutuante interna) */
    body:has(.presentation-overlay-container > .presentation-toolbar) .slide-section {
      padding-top: clamp(68px, 8vh, 86px) !important;
    }
    .slide-header {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      text-align: left;
      width: 100%;
      max-width: none;
      margin-bottom: clamp(10px, 1.8vh, 22px);
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .slide-header h1.display-xl,
    .slide-header h2.display-xl {
      font-size: clamp(24px, min(2.85vw, 4.7vh), 50px) !important;
      font-weight: 800 !important;
      line-height: 1.08 !important;
      letter-spacing: -0.025em !important;
    }
    .slide-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      z-index: 5;
      position: relative;
      overflow: hidden;
      width: 100%;
      max-width: none;
    }
    .dark-theme {
      background-color: var(--color-primary) !important;
      color: var(--color-on-dark) !important;
    }
    .dark-theme h1, .dark-theme h2, .dark-theme h3, .dark-theme h4 {
      color: var(--color-on-dark) !important;
    }
  </style>
</head>
<body>
  <div class="slides-container">
    <div class="slides-wrapper" id="slides-wrapper">
      
      <!-- Slide 1: Capa (Escuro por padrão para impacto inicial) -->
      <main class="slide-section active-slide cover-slide" id="slide-1" style="background-color: var(--color-primary);">
        <div class="speaker-notes" style="display: none;">
          <h3>Título das Notas</h3>
          <p>Instruções para o orador.</p>
        </div>
        <div class="cover-technical-grid"></div>
        <div class="cover-content">
          <span class="cover-badge animate-item">MÓDULO X</span>
          <h1 class="cover-title animate-item delay-1" style="color: var(--color-on-dark);">Título Principal</h1>
          <div class="cover-divider animate-item delay-2"></div>
          <p class="cover-subtitle animate-item delay-3" style="color: var(--color-on-dark);">Breve subtítulo explicativo.</p>
        </div>
        <div class="cover-footer animate-item delay-4" style="color: rgba(255,255,255,0.4);">
          <span>CURSO LCC — MENTORIA EM GESTÃO DE ATIVOS E CONFIABILIDADE</span>
          <span>CONFIDENCIAL</span>
        </div>
      </main>

      <!-- Slide 2: Exemplo de Slide de Conteúdo Claro -->
      <section class="slide-section" id="slide-2" style="background-color: var(--color-canvas);">
        <div class="speaker-notes" style="display: none;">
          <h3>Notas Slide 2</h3>
          <p>Conteúdo da explicação técnica.</p>
        </div>
        <div class="slide-header">
          <span class="body-sm-strong animate-item">EYEBROW DO CONTEÚDO</span>
          <h2 class="display-xl animate-item delay-1">Título do Slide 2</h2>
        </div>
        <div class="slide-body">
          <div class="content-wrapper animate-item delay-2">
             <!-- Grades, Cards ou Elementos Customizados -->
          </div>
        </div>
      </section>

    </div>
  </div>
  <script type="module" src="./<LessonName>.js"></script>
  <script type="module" src="/js/laser-pointer.js"></script>
</body>
</html>
```

#### JS Template (`Aulas/<LessonName>.js`):
```javascript
function init() {
  const slidesWrapper = document.getElementById('slides-wrapper');
  let currentSlide = 0;
  const totalSlides = 3; // Ajustar dinamicamente para o total de slides

  const urlParams = new URLSearchParams(window.location.search);
  const startSlide = parseInt(urlParams.get('slide'), 10);
  if (!isNaN(startSlide) && startSlide >= 0 && startSlide < totalSlides) {
    currentSlide = startSlide;
    updateSlidePosition();
  }

  function updateSlidePosition() {
    slidesWrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;
    notifyParent();
  }

  function navigate(dir) {
    if (dir === 'next' && currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlidePosition();
    } else if (dir === 'prev' && currentSlide > 0) {
      currentSlide--;
      updateSlidePosition();
    }
  }

  function notifyParent() {
    const activeSlideEl = document.getElementById(`slide-${currentSlide + 1}`);
    const notesEl = activeSlideEl ? activeSlideEl.querySelector('.speaker-notes') : null;
    const speakerNote = notesEl ? notesEl.innerHTML : '';

    window.parent.postMessage({
      type: 'SLIDE_CHANGED',
      slideIndex: currentSlide,
      notes: speakerNote,
      totalSlides: totalSlides
    }, '*');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      navigate('next');
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      navigate('prev');
    }
  });

  window.addEventListener('message', (event) => {
    const { type, slideIndex } = event.data;
    if (type === 'GOTO_SLIDE') {
      if (slideIndex >= 0 && slideIndex < totalSlides) {
        currentSlide = slideIndex;
        updateSlidePosition();
      }
    }
  });

  notifyParent();
}

document.addEventListener('DOMContentLoaded', init);
```

---

## 3. Strict Design Standards (SLIDES_DESIGN.md Rules)

- **Light-First Polarity (Fundo Branco Predominante)**: Use Light slides (`--color-canvas: #ffffff` background, `--color-ink: #000000` text) as the default for almost all slides. Reserve Dark slides (`--color-primary: #000000`, `--color-on-dark: #ffffff`) only for punctual high-impact moments (e.g., covers or major module transitions) — never force 50/50 alternation.
- **Dark Theme Heading Visibility**:
  When using `.dark-theme` (black background), headings must be explicitly forced to be white to prevent them inheriting default black colors and becoming invisible:
  ```css
  .dark-theme h1, .dark-theme h2, .dark-theme h3, .dark-theme h4 {
    color: var(--color-on-dark) !important;
  }
  ```
- **Minimalism, Subtle Red Accents & Interactive LCC Simulations**:
  - **Low Text Density & Larger Fonts**: Keep slides minimalist. One central idea per slide, short headlines, concise card copy (1–2 short lines), and generous whitespace. Put detailed explanations in `.speaker-notes`, not on screen.
  - **Subtle Red Accents**: Use `--color-danger` (`#dc2626`) sparingly for thin accent borders, active indicators, critical thresholds, or key numbers — avoid large saturated red blocks.
  - **Interactive Simulations**: For LCC concepts (CAPEX vs. OPEX, TCO, VPL, payback crossover, bathtub curve, replacement timing), prefer live interactive controls (sliders, pill scenario toggles) paired with reactive SVG/Canvas charts and `tabular-nums` KPIs over static text.
  - **Grayscale Media**: Photos and illustrations should use grayscale by default (`filter: grayscale(100%) contrast(1.1);`), revealing focus/color subtly on hover or active state.
- **Proportion & Balanced Breathing Room ("Respiro" Equilibrado)**:
  - Para aproveitar bem a tela sem esmagar o conteúdo nem deixar grandes áreas ociosas:
    - O container `.slide-section` usa margens externas moderadas de respiro (`clamp(18px, 2.8vh, 34px)` topo, `clamp(16px, 2.4vh, 30px)` base, `clamp(28px, 2.8vw, 48px)` esquerda e `clamp(54px, 4vw, 72px)` direita para proteger os dots laterais).
    - **Não** adicione `padding-top: 80px+` em `body.presentation-active .slide-section` — dentro do `index.html`, a barra de controles fica no `.viewport-header` externo ao iframe. Aplique folga extra no topo apenas em `body:has(.presentation-overlay-container > .presentation-toolbar) .slide-section`.
    - Use `overflow: clip` em `html, body`, `.slides-container` e `.slide-section` para impedir deslocamentos acidentais de `scrollIntoView` ao clicar em abas/botões interativos.
- **Proportional Classroom Typography (`min(vw, vh)`)**:
  - **MANDATO DE LEGIBILIDADE**: Priorize textos curtos com fontes grandes e confortáveis para projeção em sala de aula; nunca compense excesso de texto diminuindo a fonte.
  - Remova travas estreitas de `max-width` nos containers de conteúdo (`max-width: none; width: 100%`).
  - Use escalas proporcionais combinando largura e altura (`clamp(minCompactoPx, min(Xvw, Yvh), maxProjetorPx)`):
    - Corpo de cards / listas / controles: `clamp(18px, min(1.55vw, 2.5vh), 28px)`
    - Títulos de cards: `clamp(22px, min(2.1vw, 3.3vh), 38px)`
    - Títulos principais de slide: `clamp(36px, min(4vw, 6vh), 70px)`
  - Assim, a fonte cresce generosamente em telas Full HD (`1920x1080`) e se ajusta sem qualquer corte (`scrollHeight <= clientHeight`) em janelas compactas (`1366x680` com menu lateral aberto).
- **Responsive Layout**:
  - Ensure columns collapse into a vertical stack below `992px` or `576px`.

---

## 4. Register Slide in index.html

Modify `index.html` to register the new slide file under the correct section in the navigation menu sidebar:
1. Locate the correct `<ul>` menu element based on the module type (Aulas, Cases, Opcionais, etc.).
2. Add a new `<li>` entry with the correct data attributes:
   ```html
   <li class="menu-item" data-src="./Aulas/<LessonName>.html" data-title="Nome do Tópico" data-progression="true">
     <button class="menu-item-btn">
       <svg>...</svg> <!-- Use a descriptive svg icon -->
       Nome do Tópico
     </button>
      <ul class="sub-menu-list">
        <li class="sub-menu-item" data-slide="0">Capa</li>
        <li class="sub-menu-item" data-slide="1">Nome do Slide 2</li>
        <!-- Adicione sub-menu-items adicionais para cada slide (sem prefixo "Slide X:") -->
      </ul>
    </li>
    ```

---

## 5. Padrão Oficial de Slides de Quiz Interativo (Multi-Cenários)

Sempre que uma aula exigir um **Quiz de Fixação**, siga o template minimalista definido na Seção 7 do `SLIDES_DESIGN.md`:
1. **Cabeçalho**: Título `QUIZ` à esquerda (`clamp(44px, 6.5vh, 72px)`, peso 850) e botões de cenários em *pill* com status dot (`.tab-status-dot`) alinhados à direita.
2. **Fundo Branco & Widescreen**: Fundo branco (`--color-canvas`), `width: 100%; max-width: none;`, card de enunciado em `var(--color-canvas-soft)` com borda esquerda sutil vermelha (`4px solid var(--color-danger)`).
3. **Grid 2x2 de Cards Limpos**: Badges circulares de letras (A–D), título principal curto e legível (`clamp(18px, 2vh + 2px, 24px)`) e subtítulo opcional conciso.
4. **Feedback Imediato**: Realce sutil verde/vermelho, animação leve de *shake* em erro e atenuação das opções não selecionadas.
5. **Rodapé Compacto**: Placar de progresso, botão "Próximo Cenário" e botão "Reiniciar".

---

## 6. Quality Checklist & Verification

Before finalizing, verify:
- [ ] No layout overlapping or text clipping occurs at `1024x768`, `1280x800`, or ultra-wide screens.
- [ ] Transition animations work correctly when `.active-slide` is toggled.
- [ ] Speaker notes are present on each slide.
- [ ] Local dev server (`npm run dev` or equivalent) runs smoothly, and the page can be loaded inside the shell viewport.

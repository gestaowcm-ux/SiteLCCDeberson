---
name: importarpptx
description: Converte apresentações do PowerPoint (.pptx ou .ppt) em aulas HTML/JS responsivas e padronizadas no diretório Aulas/ para a plataforma Curso LCC, extraindo textos, mídias e notas do orador e registrando automaticamente no index.html.
---

# Skill: importarpptx (PPTX para Curso LCC)

Esta skill fornece instruções passo a passo para importar e converter qualquer apresentação do PowerPoint (`.pptx` ou `.ppt`) em páginas de slides interativas, responsivas e padronizadas no projeto **Curso LCC**, combinando os princípios visuais do repositório [frontend-slides](https://github.com/zarazhangrui/frontend-slides) com os padrões de arquitetura do [`SLIDES_DESIGN.md`](../../SLIDES_DESIGN.md).

---

## Arquitetura da Plataforma

A plataforma Curso LCC opera como uma **Single Page Application (SPA)** (`index.html`) que carrega cada aula interativa dentro de um `<iframe>` (`#view-frame`).

Cada aula convertida é composta por dois arquivos no diretório `Aulas/`:
1. `Aulas/<NomeDaAula>.html`: Esqueleto HTML com as seções de slides, estilos locais e elementos visuais.
2. `Aulas/<NomeDaAula>.js`: Controller JS para transições verticais (100vh), navegação via teclado (`ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`, `Space`) e sincronização via `postMessage` com o painel do apresentador.

---

## Fluxo de Execução Passo a Passo

### 1. Extração do Conteúdo da Apresentação PowerPoint (`.pptx`)

1. Execute o script de extração a partir do terminal do workspace:
   ```bash
   python .agents/skills/importarpptx/scripts/extract_pptx.py <caminho_do_arquivo.pptx>
   ```
2. O script criará um arquivo `<caminho_do_arquivo>_content.json` com toda a estrutura de textos, títulos, marcadores e notas do orador, além de salvar as imagens do PowerPoint no diretório `assets/`.
3. Abra e leia o JSON gerado com `view_file` para analisar o conteúdo de cada slide.

---

### 2. Padrões de Design e Identidade Visual (SLIDES_DESIGN.md & Frontend Slides)

Ao construir a apresentação em HTML, siga estritamente estas diretrizes estéticas:

- **Predominância de Fundo Branco (Light-First)**:
  - Use **fundo branco (`background: var(--color-canvas); color: var(--color-ink);`)** como padrão na grande maioria dos slides. Reserve slides **Escuros** (`background: var(--color-primary); color: var(--color-on-dark);`) apenas para capas ou quebras pontuais de módulo.
- **Garantia de Contraste em Temas Escuros**:
  - Em telas com classe `.dark-theme` (fundo preto), **force** a cor dos títulos para branco para evitar que herdem a cor preta padrão:
    ```css
    .dark-theme h1, .dark-theme h2, .dark-theme h3, .dark-theme h4 {
      color: var(--color-on-dark) !important;
    }
    ```
- **Minimalismo, Vermelho Sutil & Simulações Interativas**:
  - **Menos texto, mais clareza**: sintetize o conteúdo do PPTX em títulos diretos e tópicos curtos (mova explicações extensas para `.speaker-notes`).
  - **Vermelho sutil**: use `var(--color-danger)` apenas em traços finos, indicadores ativos, números-chave ou alertas pontuais — nunca em blocos grandes e saturados.
  - **Simulações LCC**: sempre que o slide tratar de comparação financeira, curva de custos ou análise de sensibilidade, transforme-o em simulação interativa (sliders/toggles + gráfico SVG reativo) em vez de texto estático.
  - Imagens devem usar filtro em escala de cinza por padrão (`filter: grayscale(100%) contrast(1.1);`).
- **Recuo Seguro Lateral (Evita colisão com controles)**:
  - No cabeçalho `.slide-header` e no corpo `.slide-body`, utilize `padding-left: 48px;` e `padding-right: 88px;` para proteger a área contra os botões de navegação lateral.
- **Proporções Verticais sem Rolagem (`vh` & `clamp`)**:
  - O container de cada slide (`.slide-section`) tem altura fixa `100vh` e `overflow: hidden`.
  - Títulos principais e corpo/cards devem usar tipografia fluida padronizada e ampla:
    - **Títulos principais (`.display-xl`)**: `font-size: clamp(36px, min(4vw, 6vh), 70px) !important; font-weight: 800 !important; line-height: 1.08 !important;`
    - **Texto de Corpo e Cards**: `font-size: clamp(18px, min(1.55vw, 2.5vh), 28px) !important;`

---

### 3. Esqueleto de Arquivos (`HTML` e `JS`)

Crie os arquivos `Aulas/<NomeDaAula>.html` e `Aulas/<NomeDaAula>.js` na pasta `Aulas/`.

#### Esqueleto HTML (`Aulas/<NomeDaAula>.html`):
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
      margin: 0;
      padding: 0;
      background-color: var(--color-canvas);
    }
    .slides-container {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
    .slides-wrapper {
      height: 300vh; /* N * 100vh onde N é a quantidade total de slides */
      width: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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
      padding: var(--spacing-md) 0;
      overflow: hidden;
    }
    .slide-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      padding-left: 48px;
      padding-right: 88px;
      margin-top: 3vh;
      margin-bottom: clamp(10px, 1.5vh, 24px);
      box-sizing: border-box;
    }
    .slide-header h1.display-xl,
    .slide-header h2.display-xl {
      font-size: clamp(48px, 6.5vh + 16px, 90px) !important;
      font-weight: 850 !important;
      line-height: 1.15 !important;
      margin: 0;
    }
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2vh 88px 4vh 48px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      width: 100%;
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
      
      <!-- Slide 1: Capa ou Conteúdo -->
      <section class="slide-section active-slide dark-theme" id="slide-1">
        <div class="speaker-notes" style="display: none;">
          <h3>Notas do Orador</h3>
          <p>Notas extraídas do PowerPoint para este slide.</p>
        </div>
        <div class="slide-header">
          <h1 class="display-xl">Título do Slide 1</h1>
        </div>
        <div class="slide-body">
          <!-- Conteúdo extraído do JSON -->
        </div>
      </section>

    </div>
  </div>
  <script type="module" src="./<NomeDaAula>.js"></script>
  <script type="module" src="/js/laser-pointer.js"></script>
</body>
</html>
```

#### Esqueleto JS (`Aulas/<NomeDaAula>.js`):
```javascript
function init() {
  const slidesWrapper = document.getElementById('slides-wrapper');
  let currentSlide = 0;
  const totalSlides = 3; // Atualize com o total exato de slides

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

### 4. Registro no Menu Lateral (`index.html`)

Após criar os arquivos em `Aulas/`, adicione a nova aula ao arquivo `index.html` dentro da seção de menu desejada (`Aulas`, `Cases` ou `Opcionais`):

```html
<li class="menu-item" data-src="./Aulas/<NomeDaAula>.html" data-title="Título Amigável" data-progression="true">
  <button class="menu-item-btn">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Ícone SVG descritivo -->
    </svg>
    Título Amigável
  </button>
  <ul class="sub-menu-list">
    <li class="sub-menu-item" data-slide="0">Título do Slide 1</li>
    <li class="sub-menu-item" data-slide="1">Título do Slide 2</li>
  </ul>
</li>
```
> **Importante**: Nunca adicione prefixos redundantes como `"Slide 1:"` ou `"Slide 2:"` nos itens `.sub-menu-item`, nos atributos `data-title` dos indicadores ou nos títulos de notas do orador. Exiba apenas o título limpo do conteúdo.

---

### 5. Check de Qualidade e Verificação Final

- [ ] Execute a extração sem erros via `python .agents/skills/importarpptx/scripts/extract_pptx.py`.
- [ ] Verifique se o conteúdo extraído (textos, bullets e notas) foi refletido nos elementos HTML.
- [ ] Certifique-se de que não ocorrem barras de rolagem verticais em resoluções `1920x1080`, `1366x768` ou `1280x800`.
- [ ] Teste a navegação pelas setas do teclado e pela barra lateral do `index.html`.
- [ ] Verifique se as notas do orador (`speaker-notes`) são sincronizadas via `postMessage`.

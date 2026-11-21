# -*- coding: utf-8 -*-
"""
upload_case_pdf.py - Converte apresentações em PDF/Telas para o padrão de Cases do Curso LCC.
Cada página do PDF é recortada de margens mortas e convertida em um slide de imagem de alta resolução responsivo,
preenchendo 100% da tela sem bordas pretas, gerando HTML, JS e registrando no index.html.
"""

import sys
import os
import json
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def sanitize_slug(name):
    clean = re.sub(r'[^a-zA-Z0-9]', '', name)
    return clean

def main():
    if len(sys.argv) < 3:
        print("Uso: python upload_case_pdf.py <caminho_pdf> <NomeDoCase> [TituloExibicao]")
        print("Exemplo: python upload_case_pdf.py meucase.pdf CaseColhedora \"Case Colhedora de Cana\"")
        sys.exit(1)

    pdf_path = os.path.abspath(sys.argv[1])
    case_name = sanitize_slug(sys.argv[2])
    display_title = sys.argv[3] if len(sys.argv) >= 4 else sys.argv[2]

    if not os.path.exists(pdf_path):
        print(f"Erro: PDF não encontrado em {pdf_path}")
        sys.exit(1)

    try:
        import fitz
    except ImportError:
        print("Instalando PyMuPDF (fitz)...")
        os.system(f"{sys.executable} -m pip install pymupdf")
        import fitz

    try:
        from PIL import Image, ImageChops
    except ImportError:
        print("Instalando Pillow...")
        os.system(f"{sys.executable} -m pip install Pillow")
        from PIL import Image, ImageChops

    # Encontra raiz do projeto
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = current_dir
    while base_dir and not os.path.exists(os.path.join(base_dir, "index.html")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent
    
    if not os.path.exists(os.path.join(base_dir, "index.html")):
        base_dir = os.getcwd()

    slug_dir = case_name.replace("Case", "").lower() if case_name.startswith("Case") else case_name.lower()
    assets_dir = os.path.join(base_dir, "assets", "cases", slug_dir)
    os.makedirs(assets_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"Processando '{pdf_path}' ({total_pages} páginas com Autocrop)...")

    slides_meta = []
    for i, page in enumerate(doc):
        # 3x matrix = 300 DPI Ultra-HD resolution
        pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))
        img_filename = f"slide_{i+1:02d}.png"
        img_path = os.path.join(assets_dir, img_filename)
        pix.save(img_path)

        # Autocrop de margens brancas/cinzas vazias do PDF com margem de segurança de 36px
        try:
            im = Image.open(img_path)
            bg_color = im.getpixel((0, 0))
            bg = Image.new(im.mode, im.size, bg_color)
            diff = ImageChops.difference(im, bg)
            bbox = diff.getbbox()
            if bbox:
                left = max(0, bbox[0] - 36)
                top = max(0, bbox[1] - 36)
                right = min(im.width, bbox[2] + 36)
                bottom = min(im.height, bbox[3] + 36)
                cropped = im.crop((left, top, right, bottom))
                cropped.save(img_path)
        except Exception as crop_err:
            print(f"Aviso autocrop slide {i+1}: {crop_err}")

        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        page_title = lines[0] if lines else f"{display_title} {i+1}"
        page_title = re.sub(r'^Mód(?:ulo)?\s+[IVXLCDM]+\s*[\-\—:]\s*', '', page_title, flags=re.IGNORECASE).strip()
        page_title = re.sub(r'^Slide\s*\d+\s*[\-\—:]\s*', '', page_title, flags=re.IGNORECASE).strip()
        
        slides_meta.append({
            "index": i,
            "number": i + 1,
            "img_rel_path": f"/assets/cases/{slug_dir}/{img_filename}",
            "title": page_title,
            "lines": lines
        })
        print(f" -> Renderizado & Recortado Slide {i+1:02d}: {img_filename}")

    # 1. Gerar HTML
    html_file = os.path.join(base_dir, "Aulas", f"{case_name}.html")
    html_content = generate_html(case_name, display_title, slides_meta)
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML gerado em: {html_file}")

    # 2. Gerar JS
    js_file = os.path.join(base_dir, "Aulas", f"{case_name}.js")
    js_content = generate_js(case_name, total_pages)
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"JS gerado em: {js_file}")

    # 3. Atualizar index.html
    index_file = os.path.join(base_dir, "index.html")
    update_index_html(index_file, case_name, display_title, slides_meta)

    print("\n✅ Concluído com sucesso! Case registrado na plataforma Curso LCC.")

def generate_html(case_name, display_title, slides):
    total = len(slides)
    sections = []
    nav_dots = []

    for s in slides:
        idx = s["number"]
        rel_img = s["img_rel_path"]
        stitle = s["title"]
        active_class = " active-slide" if idx == 1 else ""
        dot_active = " active" if idx == 1 else ""
        loading = "eager" if idx == 1 else "lazy"
        
        text_summary = " ".join(s["lines"][:4]) if s["lines"] else stitle

        sections.append(f"""      <!-- {stitle} -->
      <section class="slide-section{active_class}" id="slide-{idx}">
        <div class="speaker-notes" style="display: none;">
          <h3>{stitle}</h3>
          <p>{text_summary}</p>
        </div>
        <div class="pdf-slide-frame">
          <img src="{rel_img}" alt="{stitle}" class="pdf-slide-img" loading="{loading}" />
        </div>
      </section>""")

        nav_dots.append(f"""    <div class="slide-indicator-dot{dot_active}" data-slide="{idx-1}" data-title="{stitle}">
      <div class="slide-preview-tooltip">
        <div class="iframe-wrapper" id="preview-wrapper-{idx-1}"></div>
        <div class="slide-preview-text">{stitle}</div>
      </div>
    </div>""")

    sections_html = "\n\n".join(sections)
    nav_dots_html = "\n".join(nav_dots)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{display_title} — Curso LCC</title>
  <link rel="stylesheet" href="/css/style.css">
  <style>
    html, body {{
      height: 100%;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
    }}
    .slides-container {{
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }}
    .slides-wrapper {{
      height: {total * 100}vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .slide-section {{
      height: 100vh;
      width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      background-color: #ffffff;
      padding: 16px 28px;
      overflow: hidden;
    }}
    .pdf-slide-frame {{
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 3px;
      padding-bottom: 7px;
      padding-left: 14px;
      padding-right: 50px;
      box-sizing: border-box;
      background-color: #ffffff;
    }}
    .pdf-slide-img {{
      max-width: calc(100vw - 64px);
      max-height: calc(100vh - 10px);
      width: auto;
      height: auto;
      object-fit: contain;
      position: relative;
      top: -4px;
      margin-top: 3px;
      margin-bottom: 7px;
      box-shadow: none;
      border: none;
      border-radius: 0;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .slide-section.active-slide .pdf-slide-img {{
      animation: zoomInSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }}
    @keyframes zoomInSlide {{
      from {{ opacity: 0.92; transform: translateY(-4px) scale(0.995); }}
      to {{ opacity: 1; transform: translateY(-4px) scale(1); }}
    }}
    .slide-nav-indicators {{
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1005;
    }}
    .slide-indicator-dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 2px solid transparent;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
      position: relative;
    }}
    .slide-indicator-dot.active {{
      background-color: #000000;
      transform: scale(1.4);
      border-color: #ffffff;
      box-shadow: 0 0 0 2px #000000;
    }}
    .slide-indicator-dot:hover {{
      background-color: rgba(0, 0, 0, 0.7);
      transform: scale(1.2);
    }}
  </style>
</head>
<body>

  <!-- Indicadores de Seleção de Slide na Lateral Direita -->
  <div class="slide-nav-indicators" id="slide-nav-indicators">
{nav_dots_html}
  </div>

  <div class="slides-container">
    <div class="slides-wrapper" id="slides-wrapper">
{sections_html}
    </div>
  </div>
  <script type="module" src="./{case_name}.js"></script>
  <script type="module" src="/js/laser-pointer.js"></script>
</body>
</html>
"""

def generate_js(case_name, total_slides):
    return f"""// {case_name}.js - Controller logic for Case presentation with dots & previews
function init() {{
  const slidesWrapper = document.getElementById('slides-wrapper');
  let currentSlide = 0;
  const totalSlides = {total_slides};

  if (!window.location.search.includes("preview=true")) {{
    for (let i = 0; i < totalSlides; i++) {{
      const wrapper = document.getElementById(`preview-wrapper-${{i}}`);
      if (wrapper) {{
        const iframe = document.createElement("iframe");
        iframe.src = `{case_name}.html?preview=true#slide-${{i + 1}}`;
        iframe.className = "slide-preview-iframe";
        iframe.setAttribute("scrolling", "no");
        wrapper.appendChild(iframe);
      }}
    }}
  }}

  if (window.location.search.includes("preview=true")) {{
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const indicators = document.getElementById("slide-nav-indicators");
    if (indicators) indicators.remove();

    const hash = window.location.hash;
    if (slidesWrapper) {{
      slidesWrapper.style.transition = 'none';
      const targetNum = hash ? parseInt(hash.replace('#slide-', ''), 10) : 1;
      if (!isNaN(targetNum) && targetNum > 0) {{
        slidesWrapper.style.transform = `translateY(-${{(targetNum - 1) * 100}}vh)`;
        const slideEl = document.getElementById(`slide-${{targetNum}}`);
        if (slideEl) slideEl.classList.add("active-slide");
      }}
    }}
    return;
  }}

  const urlParams = new URLSearchParams(window.location.search);
  const startSlide = parseInt(urlParams.get('slide'), 10);
  if (!isNaN(startSlide) && startSlide >= 0 && startSlide < totalSlides) {{
    currentSlide = startSlide;
  }}

  const dots = document.querySelectorAll('.slide-indicator-dot');

  function updateDots(index) {{
    dots.forEach((dot, idx) => {{
      if (idx === index) {{
        dot.classList.add('active');
      }} else {{
        dot.classList.remove('active');
      }}
    }});
  }}

  function updateSlidePosition() {{
    if (slidesWrapper) {{
      slidesWrapper.style.transform = `translateY(-${{currentSlide * 100}}vh)`;
    }}

    for (let i = 1; i <= totalSlides; i++) {{
      const el = document.getElementById(`slide-${{i}}`);
      if (el) {{
        if (i - 1 === currentSlide) {{
          el.classList.add('active-slide');
        }} else {{
          el.classList.remove('active-slide');
        }}
      }}
    }}

    updateDots(currentSlide);
    notifyParent();
  }}

  function navigate(dir) {{
    if (dir === 'next' && currentSlide < totalSlides - 1) {{
      currentSlide++;
      updateSlidePosition();
    }} else if (dir === 'prev' && currentSlide > 0) {{
      currentSlide--;
      updateSlidePosition();
    }}
  }}

  function notifyParent() {{
    const activeSlideEl = document.getElementById(`slide-${{currentSlide + 1}}`);
    const notesEl = activeSlideEl ? activeSlideEl.querySelector('.speaker-notes') : null;
    const speakerNote = notesEl ? notesEl.innerHTML : '';

    window.parent.postMessage({{
      type: 'SLIDE_CHANGED',
      slideIndex: currentSlide,
      notes: speakerNote,
      totalSlides: totalSlides
    }}, '*');
  }}

  dots.forEach(dot => {{
    dot.addEventListener('click', () => {{
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      if (!isNaN(idx) && idx !== currentSlide) {{
        currentSlide = idx;
        updateSlidePosition();
      }}
    }});
  }});

  document.addEventListener('keydown', (e) => {{
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {{
      e.preventDefault();
      navigate('next');
    }} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {{
      e.preventDefault();
      navigate('prev');
    }}
  }});

  let wheelCooldown = false;
  document.addEventListener('wheel', (e) => {{
    if (wheelCooldown) return;
    wheelCooldown = true;
    setTimeout(() => {{ wheelCooldown = false; }}, 350);

    if (e.deltaY > 0) {{
      navigate('next');
    }} else if (e.deltaY < 0) {{
      navigate('prev');
    }}
  }}, {{ passive: true }});

  let startY = 0;
  document.addEventListener("touchstart", (e) => {{
    startY = e.touches[0].clientY;
  }}, {{ passive: true }});

  document.addEventListener("touchend", (e) => {{
    const endY = e.changedTouches[0].clientY;
    const diffY = startY - endY;
    if (Math.abs(diffY) > 40) {{
      if (diffY > 0) navigate('next');
      else navigate('prev');
    }}
  }}, {{ passive: true }});

  window.addEventListener('message', (event) => {{
    const {{ type, slideIndex }} = event.data;
    if (type === 'GOTO_SLIDE') {{
      if (slideIndex >= 0 && slideIndex < totalSlides) {{
        currentSlide = slideIndex;
        updateSlidePosition();
      }}
    }}
  }});

  updateSlidePosition();
}}

document.addEventListener('DOMContentLoaded', init);
"""

def update_index_html(index_path, case_name, display_title, slides):
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    if f'./Aulas/{case_name}.html' in content:
        print(f"Item ./Aulas/{case_name}.html já registrado em index.html")
        return

    sub_items = []
    for s in slides:
        num = s["number"]
        t = s["title"] if s["title"] else f"{display_title} {num}"
        sub_items.append(f'              <li class="sub-menu-item" data-slide="{num-1}">{t}</li>')
    sub_items_html = "\n".join(sub_items)

    new_item = f"""          <li class="menu-item" data-src="./Aulas/{case_name}.html" data-title="{display_title}">
            <button class="menu-item-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              {display_title}
            </button>
            <ul class="sub-menu-list">
{sub_items_html}
            </ul>
          </li>"""

    pattern = r'(data-section="cases"[\s\S]*?<ul class="menu-list">)'
    if re.search(pattern, content):
        content = re.sub(pattern, r'\1\n' + new_item, content, count=1)
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Novo case inserido no index.html sob a seção 'Cases'")
    else:
        print("Aviso: Seção 'Cases' não encontrada no index.html")

if __name__ == "__main__":
    main()

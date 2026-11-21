# -*- coding: utf-8 -*-
"""
batch_export_all_cases.py - Converte todas as 64 seções da MasterClass Abraman em Cases para o Curso RCA.
Exporta slides via PowerPoint COM a 300 DPI (2526x1482), faz autocrop de margens, gera HTML/JS com Laser Pointer,
indicadores na lateral direita, tooltips de preview e registra tudo no index.html sob o grupo 'Cases'.
"""

import sys
import os
import re
import zipfile
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def sanitize_slug(name):
    # Transliterate and keep alphanumeric
    clean = name.replace("Case", "").replace("Dinâmica", "Dinamica").replace("|", "").replace("-", " ")
    clean = re.sub(r'[^a-zA-Z0-9\s]', '', clean)
    words = clean.strip().split()
    camel = "".join(w.capitalize() for w in words)
    if not camel.startswith("Case"):
        camel = "Case" + camel
    return camel

def main():
    base_dir = r'c:\Users\Juliana\antigravity\Slides\CursoRCA'
    pptx_path = r'C:\Users\Juliana\Deberson - OneDrive\OneDrive\Gestão WCM\Cursos\RCA\Abraman\MasterClass Abraman.pptx'

    if not os.path.exists(pptx_path):
        print(f"Erro: Arquivo PPTX não encontrado em {pptx_path}")
        sys.exit(1)

    try:
        from PIL import Image, ImageChops
    except ImportError:
        os.system(f"{sys.executable} -m pip install Pillow")
        from PIL import Image, ImageChops

    try:
        import win32com.client
    except ImportError:
        os.system(f"{sys.executable} -m pip install pywin32")
        import win32com.client

    print("Iniciando PowerPoint COM para leitura e exportação em alta resolução (300 DPI)...")
    ppt = win32com.client.Dispatch('PowerPoint.Application')
    ppt.Visible = True

    # Copiar arquivo para pasta temporária para evitar bloqueio de leitura
    temp_pptx = os.path.join(base_dir, "scratch", "MasterClass_batch_temp.pptx")
    os.makedirs(os.path.dirname(temp_pptx), exist_ok=True)
    
    import shutil
    shutil.copy2(pptx_path, temp_pptx)
    print(f"Cópia de trabalho criada em: {temp_pptx}")

    prs = ppt.Presentations.Open(temp_pptx, True, True, False)

    sec_count = prs.SectionProperties.Count
    print(f"Total de seções encontradas no PowerPoint: {sec_count}")

    # Lista de cases para pular se já tiverem sido customizados manualmente
    # 13: Case Colhedora, 17: Esteira de Bagaço, 25: Rompimento de Junta
    skip_sec_indexes = [13, 17, 25]

    generated_cases = []

    for i in range(1, sec_count + 1):
        raw_sec_name = prs.SectionProperties.Name(i)
        first_slide_idx = prs.SectionProperties.FirstSlide(i)
        count_slides = prs.SectionProperties.SlidesCount(i)
        last_slide_idx = first_slide_idx + count_slides - 1

        case_slug = sanitize_slug(raw_sec_name)
        display_title = raw_sec_name.strip()

        print(f"\n==========================================")
        print(f"Processando Seção {i:02d}/{sec_count:02d}: '{raw_sec_name}' -> Slug: '{case_slug}'")
        print(f"Slides {first_slide_idx} até {last_slide_idx} (Total: {count_slides})")

        if i in skip_sec_indexes:
            print(f" -> Seção {i} já convertida e customizada anteriormente. Mantendo versão existente.")
            continue

        slug_dir = case_slug.replace("Case", "").lower() if case_slug.startswith("Case") else case_slug.lower()
        assets_dir = os.path.join(base_dir, "assets", "cases", slug_dir)
        os.makedirs(assets_dir, exist_ok=True)

        slides_meta = []
        for s_offset in range(count_slides):
            slide_num_in_ppt = first_slide_idx + s_offset
            slide_obj = prs.Slides(slide_num_in_ppt)

            img_filename = f"slide_{s_offset+1:02d}.png"
            img_path = os.path.join(assets_dir, img_filename)

            # Exporta slide do PowerPoint em 2526 x 1482 (300 DPI Ultra-HD)
            slide_obj.Export(img_path, "PNG", 2526, 1482)

            # Autocrop de margens mortas com 36px de segurança
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
                print(f"   Aviso autocrop slide {s_offset+1}: {crop_err}")

            # Tentar extrair título do slide
            stitle = f"{display_title} {s_offset+1}"
            try:
                if slide_obj.Shapes.HasTitle and slide_obj.Shapes.Title.TextFrame.HasText:
                    stitle = slide_obj.Shapes.Title.TextFrame.TextRange.Text.strip().split('\n')[0]
                    stitle = re.sub(r'^Mód(?:ulo)?\s+[IVXLCDM]+\s*[\-\—:]\s*', '', stitle, flags=re.IGNORECASE).strip()
                    stitle = re.sub(r'^Slide\s*\d+\s*[\-\—:]\s*', '', stitle, flags=re.IGNORECASE).strip()
            except:
                pass

            slides_meta.append({
                "index": s_offset,
                "number": s_offset + 1,
                "img_rel_path": f"/assets/cases/{slug_dir}/{img_filename}",
                "title": stitle
            })
            print(f" -> Slide {s_offset+1:02d}/{count_slides:02d} gerado: {img_filename}")

        # 1. Gerar HTML
        html_file = os.path.join(base_dir, "Aulas", f"{case_slug}.html")
        html_content = generate_html(case_slug, display_title, slides_meta)
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        # 2. Gerar JS
        js_file = os.path.join(base_dir, "Aulas", f"{case_slug}.js")
        js_content = generate_js(case_slug, len(slides_meta))
        with open(js_file, "w", encoding="utf-8") as f:
            f.write(js_content)

        generated_cases.append({
            "slug": case_slug,
            "title": display_title,
            "slides": slides_meta
        })

    prs.Close()
    ppt.Quit()

    if os.path.exists(temp_pptx):
        try:
            os.remove(temp_pptx)
        except:
            pass

    # 3. Atualizar index.html
    index_file = os.path.join(base_dir, "index.html")
    update_index_html(index_file, generated_cases)

    print("\n✅ Concluída a conversão e upload de TODAS as seções da MasterClass Abraman!")

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

        sections.append(f"""      <!-- {stitle} -->
      <section class="slide-section{active_class}" id="slide-{idx}">
        <div class="speaker-notes" style="display: none;">
          <h3>{stitle}</h3>
          <p>{display_title}</p>
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
  <title>{display_title} — Curso RCA</title>
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
      padding: 0;
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

  <!-- Indicadores de Seleção de Slide na Lateral Direita com Preview -->
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

def update_index_html(index_path, cases):
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_items_html = []
    for c in cases:
        case_name = c["slug"]
        display_title = c["title"]
        slides = c["slides"]
        
        if f'./Aulas/{case_name}.html' in content:
            continue

        sub_items = []
        for s in slides:
            num = s["number"]
            t = s["title"] if s["title"] else f"{display_title} {num}"
            sub_items.append(f'              <li class="sub-menu-item" data-slide="{num-1}">{t}</li>')
        sub_items_html = "\n".join(sub_items)

        new_item = f"""          <li class="menu-item sub-collapsed" data-src="./Aulas/{case_name}.html" data-title="{display_title}">
            <button class="menu-item-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              {display_title}
            </button>
            <ul class="sub-menu-list">
{sub_items_html}
            </ul>
          </li>"""
        new_items_html.append(new_item)

    if not new_items_html:
        print("Nenhum novo item a adicionar no index.html")
        return

    all_new = "\n".join(new_items_html)

    pattern = r'(<div class="menu-group[^"]*" data-section="cases">[\s\S]*?<ul class="menu-list">)'
    if re.search(pattern, content):
        content = re.sub(pattern, r'\1\n' + all_new, content, count=1)
        
        # Atualizar a contagem total de cases
        count_match = re.findall(r'<li class="menu-item[^"]*" data-src="\./Aulas/Case', content)
        total_cases_count = len(set(count_match)) + len(cases)
        
        content = re.sub(r'(<div class="menu-group[^"]*" data-section="cases">[\s\S]*?<span class="menu-group-count">)(\d+)(</span>)', f'\\1{total_cases_count}\\3', content)

        with open(index_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"index.html atualizado com {len(cases)} novos cases no grupo 'Cases'")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Extract all content (text, titles, subtitles, bullets, images, speaker notes) from a PowerPoint file (.pptx).
Generates a structured JSON file and saves extracted images to the assets directory.

Usage:
    python extract_pptx.py <caminho_do_pptx> [diretorio_saida]

Requires:
    pip install python-pptx
"""

import os
import sys
import json

try:
    from pptx import Presentation
    from pptx.enum.shapes import MSO_SHAPE_TYPE
except ImportError:
    print("ERRO: A biblioteca 'python-pptx' não está instalada.")
    print("Instale executando: pip install python-pptx")
    sys.exit(1)


def extract_pptx(pptx_path, output_dir=None):
    if not os.path.exists(pptx_path):
        print(f"Erro: O arquivo '{pptx_path}' não foi encontrado.")
        sys.exit(1)

    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(pptx_path)) or "."

    assets_dir = os.path.join(output_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(pptx_path))[0]
    json_output_path = os.path.join(output_dir, f"{base_name}_content.json")

    with open(pptx_path, "rb") as f:
        prs = Presentation(f)

    slides_extracted = []

    print(f"Lendo '{pptx_path}' ({len(prs.slides)} slides)...")

    for slide_idx, slide in enumerate(prs.slides, start=1):
        slide_info = {
            "slide_number": slide_idx,
            "title": "",
            "subtitles": [],
            "paragraphs": [],
            "bullets": [],
            "images": [],
            "notes": ""
        }

        # 1. Extrair notas do orador
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes_text = slide.notes_slide.notes_text_frame.text.strip()
            if notes_text:
                slide_info["notes"] = notes_text

        # 2. Iterar sobre as formas do slide
        image_count = 0
        for shape in slide.shapes:
            # Extração de texto
            if shape.has_text_frame:
                text_frame = shape.text_frame
                for paragraph in text_frame.paragraphs:
                    txt = paragraph.text.strip()
                    if not txt:
                        continue
                    
                    # Checar se é o título do slide
                    if shape == slide.shapes.title and not slide_info["title"]:
                        slide_info["title"] = txt
                    elif paragraph.level > 0:
                        slide_info["bullets"].append(txt)
                    else:
                        slide_info["paragraphs"].append(txt)

            # Extração de imagens
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE or hasattr(shape, "image"):
                image_count += 1
                try:
                    image = shape.image
                    image_bytes = image.blob
                    ext = image.ext or "png"
                    img_filename = f"{base_name}_slide_{slide_idx}_img_{image_count}.{ext}"
                    img_path = os.path.join(assets_dir, img_filename)
                    
                    with open(img_path, "wb") as f:
                        f.write(image_bytes)
                    
                    slide_info["images"].append(os.path.relpath(img_path, output_dir))
                except Exception as e:
                    print(f"  [Aviso] Falha ao extrair imagem {image_count} do slide {slide_idx}: {e}")

        # Se nenhum título explícito foi definido, tenta usar o primeiro parágrafo
        if not slide_info["title"] and slide_info["paragraphs"]:
            slide_info["title"] = slide_info["paragraphs"].pop(0)

        slides_extracted.append(slide_info)

    result = {
        "filename": os.path.basename(pptx_path),
        "total_slides": len(slides_extracted),
        "slides": slides_extracted
    }

    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Sucesso! Conteúdo extraído salvo em: '{json_output_path}'")
    print(f"Imagens salvas em: '{assets_dir}'")
    return json_output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python extract_pptx.py <caminho_do_pptx> [diretorio_saida]")
        sys.exit(1)

    target_pptx = sys.argv[1]
    target_out = sys.argv[2] if len(sys.argv) > 2 else None
    extract_pptx(target_pptx, target_out)

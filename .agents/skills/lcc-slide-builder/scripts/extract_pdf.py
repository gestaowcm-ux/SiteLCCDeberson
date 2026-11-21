# -*- coding: utf-8 -*-
"""
extract_pdf.py - Extrator estruturado de conteúdo de apresentações em PDF para o Curso RCA.
Este script lê um arquivo PDF e extrai o conteúdo slide a slide, estruturando em formato JSON.
"""

import sys
import os
import json
import re

# Garantir codificação UTF-8 na saída do console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text):
    if not text:
        return ""
    # Remove espaços duplos e quebras estranhas
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def parse_pdf(pdf_path):
    import pdfplumber
    
    slides = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for idx, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text:
                continue
                
            lines = [clean_text(line) for line in text.split('\n') if clean_text(line)]
            
            if not lines:
                continue
                
            # Estruturação heurística do Slide
            # 1. Título do Slide: Geralmente a primeira linha
            title = lines[0]
            
            # 2. Subtítulo (opcional): Geralmente a segunda linha se for curta
            subtitle = ""
            start_content_idx = 1
            if len(lines) > 1 and len(lines[1]) < 80 and not lines[1].startswith(('-', '•', '*')):
                subtitle = lines[1]
                start_content_idx = 2
                
            # 3. Corpo e bullet points
            bullets = []
            paragraphs = []
            
            for line in lines[start_content_idx:]:
                # Detecta marcadores comuns
                if line.startswith(('-', '•', '*', 'o ', '1.', '2.', '3.')):
                    # Limpa o marcador
                    cleaned_bullet = re.sub(r'^[\-•\*o\s\d\.]+', '', line).strip()
                    bullets.append(cleaned_bullet)
                else:
                    paragraphs.append(line)
            
            slides.append({
                "slide_number": idx + 1,
                "title": title,
                "subtitle": subtitle,
                "paragraphs": paragraphs,
                "bullets": bullets,
                "raw_text": text
            })
            
    return slides

def main():
    if len(sys.argv) < 2:
        print("Uso: python extract_pdf.py <caminho_do_pdf> [caminho_saida_json]")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(f"Erro: Arquivo não encontrado: {pdf_path}")
        sys.exit(1)
        
    try:
        import pdfplumber
    except ImportError:
        print("Instalando dependência pdfplumber...")
        os.system(f"{sys.executable} -m pip install pdfplumber")
        
    try:
        print(f"Extraindo conteúdo do PDF: {pdf_path} ...")
        slides_data = parse_pdf(pdf_path)
        
        if len(sys.argv) >= 3:
            output_path = sys.argv[2]
        else:
            output_path = os.path.splitext(pdf_path)[0] + "_content.json"
            
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(slides_data, f, ensure_ascii=False, indent=2)
            
        print(f"Sucesso! {len(slides_data)} slides extraídos e salvos em: {output_path}")
        
        # Imprime sumário simplificado no terminal
        for s in slides_data[:3]:
            print(f"\n[Slide {s['slide_number']}] Título: {s['title']}")
            if s['subtitle']:
                print(f"  Subtítulo: {s['subtitle']}")
            if s['bullets']:
                print(f"  Marcadores: {len(s['bullets'])} itens")
            if s['paragraphs']:
                print(f"  Parágrafos: {len(s['paragraphs'])} parágrafos")
                
        if len(slides_data) > 3:
            print(f"\n... e mais {len(slides_data) - 3} slides.")
            
    except Exception as e:
        print(f"Erro ao processar o PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

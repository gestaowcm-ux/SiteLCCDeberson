# Guia de Prompts para Ilustrações Técnicas (P&B + Vermelho)

Este documento define o padrão visual, regras de estilo e templates de prompts para a geração de ilustrações técnicas consistentes com o design system do **Site Mentoria**. Este guia deve ser utilizado por agentes e sistemas de IA para gerar novos recursos gráficos que combinem com a página de Fatores Organizacionais.

---

## 🎨 1. Padrão Estético (Design Paradigm)

As imagens devem seguir a estética de um **esboço esquemático de engenharia industrial/química**, combinando o minimalismo técnico com a sinalização dramática de riscos em vermelho.

*   **Paleta de Cores Estrita**:
    *   **Fundo**: Branco puro (`#FFFFFF`). Sem degradês, texturas ou fundos complexos.
    *   **Linhas e Estruturas**: Tons de cinza escuro, preto e branco para sombreamento hachurado (sketch/line art).
    *   **Destaques (Red Accents)**: Vermelho vibrante (`#FF0000` / `#DC2626`) usado **apenas** para indicar pontos de ignição, calor, fluxos de energia, falhas estruturais, perigo ou reações químicas ativas.
*   **Estilo do Traço**: Desenho à mão livre limpo (sketch style) com linhas finas e precisas, estilo patente industrial ou diagrama de livro técnico.
*   **Foco e Isolamento**: O objeto ou cena principal deve estar centralizado e completamente isolado contra o fundo branco. Sem molduras embutidas ou bordas de imagem.

---

## 📝 2. Regras de Composição do Prompt

Para manter a consistência, todo prompt enviado ao gerador de imagens deve conter as seguintes palavras-chave estruturais:

1.  **Declaração de Estilo (Início)**:
    `Minimalist black and white sketch style illustration with red accent details showing...`
2.  **Descrição da Cena (Meio)**:
    `[Descrever o objeto, maquinário ou cenário de forma clara e direta]`
3.  **Configurações de Isolamento e Render (Fim)**:
    `...clean design, isolated on white background, engineering style schematic drawing`

### ❌ O que EVITAR nos Prompts:
*   Não use palavras como: *photo, realistic, 3D, render, volumetric lighting, colorful, highly detailed background, hyperrealistic*.
*   Não permita cores além de preto, branco, cinza e vermelho.
*   Não peça texto embutido na imagem (ex: rótulos, datas, nomes). O texto deve ser renderizado via HTML na página.

---

## 🛠️ 3. Prompt Template (Modelo Base)

```text
Minimalist black and white sketch style illustration with red accent details showing [INSERIR CENA AQUI], clean design, isolated on white background, engineering style schematic drawing
```

---

## 📚 4. Biblioteca de Prompts Utilizados (Casos de Sucesso)

Use estes exemplos reais como referência de calibração para novas criações:

### Porto de Beirute (Fases da Explosão)
*   **Fase 1: Ignição e Incêndio**
    > *`Minimalist black and white sketch style illustration with red accent details showing a port warehouse on fire with a towering plume of smoke rising, clean design, isolated on white background, engineering style schematic drawing`*
*   **Fase 2: Detonação e Gases**
    > *`Minimalist black and white sketch style illustration with red accent details showing a violent chemical explosion with a giant mushroom cloud detonating at a port, clean design, isolated on white background, engineering style schematic drawing`*
*   **Fase 3: Onda de Choque**
    > *`Minimalist black and white sketch style illustration with red accent details showing a colossal explosion with a giant expanding spherical condensation shockwave dome engulfing a harbor area, clean design, isolated on white background, engineering style schematic drawing`*

### Catástrofe de Oppau (1921)
*   **Destruição da Fábrica**
    > *`Minimalist black and white sketch style illustration with red accent details showing industrial wreckage and collapsed steel frames of a chemical factory after an explosion, clean design, isolated on white background, engineering style schematic drawing`*
*   **Cratera no Solo**
    > *`Minimalist black and white sketch style illustration with red accent details showing a massive crater in the ground with debris and small ruined houses on the edge, clean design, isolated on white background, engineering style schematic drawing`*

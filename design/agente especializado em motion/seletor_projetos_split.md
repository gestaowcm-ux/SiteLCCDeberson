# Seletor de Projetos Split (Split Interactive Showcase)

## Descrição da Funcionalidade
O **Seletor de Projetos Split** (ou *Split Interactive Showcase*) é um componente de interface de alta fidelidade visual composto por uma divisão vertical simétrica da tela (layout split 50/50).
- **Lado Esquerdo (Scroll Ativo)**: Contém uma lista vertical de cartões de projeto detalhados (descrições, escopos, KPIs, CTAs). O usuário navega por esses cartões rolando a página naturalmente.
- **Lado Direito (Painel Sticky Fixo)**: Contém uma área persistente que ocupa toda a altura da viewport (`100vh`) e permanece travada em tela (`position: sticky`). Dentro desta área, encontram-se empilhados de forma absoluta os painéis visuais que correspondem a cada projeto do lado esquerdo.
- **Transição de Estados e Foco**: Conforme o cartão do lado esquerdo desliza e atinge a zona de foco central (calculada com precisão pelo `IntersectionObserver`), o respectivo painel visual no lado direito surge com uma transição fluida de opacidade (`opacity`) e escala tridimensional (`transform: scale() translate3d()`). Os outros painéis inativos desaparecem suavemente.
- **Interatividade Bidirecional**:
  - Rolar a página atualiza instantaneamente o painel visual ativo.
  - Clicar em qualquer cartão do lado esquerdo ou nos indicadores de navegação (dots) dispara um deslocamento suave (`scrollIntoView` suave) que centraliza o conteúdo desejado no viewport.

---

## Guia Conceitual de Performance

Para atingir e manter uma taxa de renderização de **60 a 120 FPS** (frames por segundo), o desenvolvimento desta funcionalidade deve seguir regras rígidas que otimizam os processos internos do motor de renderização do navegador (V8/Blink/Gecko):

### 1. Composição de Camadas (Position Sticky & GPU Layout)
- O contêiner lateral direito utiliza a propriedade `position: sticky`. Diferente de implementações baseadas em escuta de eventos de rolagem para atualizar a propriedade `top` via JavaScript (que geram atrasos perceptíveis e sobrecarregam a thread principal do navegador), o `position: sticky` nativo permite que o navegador realize o cálculo posicional diretamente no loop de renderização do compositor.
- Promovemos os painéis visuais inativos e ativos para suas próprias camadas no compositor usando `will-change: transform, opacity`. Isso instrui a GPU a reservar memória de textura dedicada para os painéis, permitindo que a opacidade e a escala sejam modificadas sem re-computação de pixels na CPU.

### 2. Otimização de Transições (Transitions & CSS Transforms)
- **Propriedades Animadas**: Animamos estritamente `opacity` e `transform`. Modificações nesses dois parâmetros não alteram a geometria física da página. Portanto, o navegador **não** executa os estágios de **Reflow** (recalculo de posições e tamanhos) e nem de **Repaint** (redesenho de pixels nas telas). A GPU realiza apenas o estágio de **Compositing** (composição final das texturas já prontas).
- Evite a todo custo animar propriedades que alterem dimensões de layout, tais como `width`, `height`, `margin`, `padding` ou `top`. Fazer isso forçaria o recálculo do documento inteiro em tempo de execução a cada frame de animação, quebrando o frame budget de 16.6ms (para 60Hz) ou 8.3ms (para 120Hz).

### 3. DOM Swaps vs. Mudança de Visibilidade (Opacity/Visibility)
- **Inserção e Remoção de Nós do DOM (Swapping)**: Mudar elementos dinamicamente destruindo e criando novos nós HTML via JavaScript é extremamente ineficiente para animações contínuas de scroll. Cada inserção aciona recálculos pesados no DOM Tree e no Style Tree do navegador.
- **Pilha Absoluta com Visibilidade Controlada**: O padrão de alta performance preceitua pré-renderizar todos os painéis no carregamento da página empilhados com `position: absolute`. A alteração do estado ativo é controlada pela adição e remoção de uma classe CSS (ex: `.is-active`), a qual manipula apenas opacidade, escala e a diretiva `pointer-events: none` (para evitar cliques fantasmas em painéis ocultos).
- **Throttling e Eventos Passivos**: O uso do `IntersectionObserver` remove a necessidade de adicionar ouvintes de rolagem direta (`window.addEventListener('scroll')`). O IntersectionObserver é disparado em uma thread separada pelo próprio navegador e notifica o JavaScript de maneira assíncrona somente quando o limiar de visibilidade (ex: 55%) é cruzado.

---

## Código de Exemplo Completo

O código abaixo é uma implementação independente em formato HTML. Copie, salve com a extensão `.html` e abra em qualquer navegador para testar a experiência de forma imediata.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seletor de Projetos Split - Mentoria de Confiabilidade</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Variáveis de estilo fundamentais */
        :root {
            --bg-color: #0b0c10;
            --text-color: #f5f5f7;
            --text-muted: #86868b;
            --primary-color: #0071e3;
            --accent-color: #64ffda;
            --card-bg: #16161d;
            --nav-height: 80px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            overflow-x: hidden;
        }

        header {
            height: var(--nav-height);
            padding: 0 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            position: fixed;
            top: 0;
            width: 100%;
            background-color: rgba(11, 12, 16, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 100;
        }

        .logo {
            font-weight: 700;
            font-size: 1.2rem;
            letter-spacing: 1px;
            color: var(--text-color);
        }

        .split-container {
            display: flex;
            margin-top: var(--nav-height);
            min-height: calc(100vh - var(--nav-height));
            position: relative;
        }

        .split-scroll-side {
            width: 50%;
            padding: 100px 50px;
            display: flex;
            flex-direction: column;
            gap: 20vh; /* Espaçamento intencional para forçar a rolagem das seções */
        }

        .project-card {
            background-color: var(--card-bg);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: border-color 0.4s ease, box-shadow 0.4s ease;
            cursor: pointer;
            scroll-margin-top: calc(var(--nav-height) + 60px);
        }

        .project-card.is-active-card {
            border-color: var(--primary-color);
            box-shadow: 0 10px 30px rgba(0, 113, 227, 0.15);
        }

        .project-badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: rgba(0, 113, 227, 0.15);
            color: var(--primary-color);
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 20px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .project-card h2 {
            font-size: 2rem;
            margin-bottom: 15px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }

        .project-card p {
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 1rem;
        }

        .project-cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--accent-color);
            font-weight: 500;
            text-decoration: none;
            transition: transform 0.2s ease;
            font-size: 0.95rem;
        }

        .project-card:hover .project-cta {
            transform: translateX(5px);
        }

        .split-sticky-side {
            width: 50%;
            position: sticky;
            top: var(--nav-height);
            height: calc(100vh - var(--nav-height));
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0d0e15;
            border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        .visual-panel {
            position: absolute;
            width: 80%;
            height: 70%;
            border-radius: 20px;
            padding: 30px;
            background: linear-gradient(135deg, #181922 0%, #0e0f14 100%);
            border: 1px solid rgba(255, 255, 255, 0.06);
            opacity: 0;
            transform: scale(0.92) translate3d(0, 30px, 0);
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
                        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            will-change: transform, opacity;
        }

        .visual-panel.is-active {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
            pointer-events: auto;
        }

        /* Elementos Simulados dentro das Telas Visuais */
        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 15px;
        }

        .panel-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-color);
            letter-spacing: 0.5px;
        }

        .panel-status {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: var(--accent-color);
            box-shadow: 0 0 10px var(--accent-color);
        }

        .panel-body {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 0;
        }

        .panel-footer {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 15px;
        }

        /* Painel 1: Matriz de Criticidade RCM */
        .matrix-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
            max-width: 280px;
        }

        .matrix-cell {
            aspect-ratio: 1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            transition: transform 0.3s ease;
        }

        .matrix-cell:hover {
            transform: scale(1.08);
        }

        .cell-low { background-color: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
        .cell-med { background-color: rgba(241, 196, 15, 0.15); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
        .cell-high { background-color: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); }

        /* Painel 2: Diagrama de Árvore RCA */
        .rca-tree {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            width: 100%;
        }

        .tree-node {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 0.85rem;
            position: relative;
            text-align: center;
        }

        .tree-node::after {
            content: '';
            position: absolute;
            bottom: -24px;
            left: 50%;
            width: 2px;
            height: 24px;
            background-color: rgba(255, 255, 255, 0.15);
        }

        .tree-node.last::after {
            display: none;
        }

        .tree-branches {
            display: flex;
            gap: 25px;
        }

        /* Painel 3: Dashboard de Indicadores */
        .gauge-container {
            display: flex;
            gap: 30px;
            align-items: center;
            justify-content: center;
        }

        .circle-gauge {
            position: relative;
            width: 110px;
            height: 110px;
        }

        .circle-gauge svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .circle-bg {
            fill: none;
            stroke: rgba(255, 255, 255, 0.05);
            stroke-width: 8;
        }

        .circle-progress {
            fill: none;
            stroke: var(--primary-color);
            stroke-width: 8;
            stroke-dasharray: 251.2;
            stroke-dashoffset: 50.2; /* Percentual simulado */
            stroke-linecap: round;
            transition: stroke-dashoffset 1s ease-out;
        }

        .gauge-val {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.2rem;
            color: var(--text-color);
        }

        .indicator-info-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .indicator-item {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .indicator-item span {
            font-weight: 600;
            color: var(--text-color);
        }

        /* Indicadores Flutuantes da Seção (Dots) */
        .section-indicators {
            position: fixed;
            right: 25px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 16px;
            z-index: 101;
        }

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            border: 2px solid transparent;
            cursor: pointer;
            transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
        }

        .dot.is-active-dot {
            background-color: var(--primary-color);
            border-color: var(--text-color);
            transform: scale(1.35);
        }

        /* Layout Responsivo para Mobile e Tablet */
        @media (max-width: 900px) {
            .split-container {
                flex-direction: column;
            }
            .split-scroll-side {
                width: 100%;
                padding: 50px 24px;
                gap: 10vh;
            }
            .split-scroll-side {
                padding-bottom: 50vh; /* Libera espaço físico para o painel flutuante fixado abaixo */
            }
            .split-sticky-side {
                width: 100%;
                position: fixed;
                bottom: 0;
                top: auto;
                height: 40vh;
                z-index: 90;
                background-color: #0b0c10;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-left: none;
                box-shadow: 0 -15px 30px rgba(0, 0, 0, 0.6);
            }
            .visual-panel {
                height: 85%;
                width: 90%;
            }
            .section-indicators {
                display: none; /* Oculta em mobile */
            }
        }
    </style>
</head>
<body>

    <header>
        <div class="logo">M-DIAGNOSTICS</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Módulo C: Painel Split</div>
    </header>

    <div class="split-container">
        <!-- Lado Esquerdo: Lista Rolável de Cartões -->
        <div class="split-scroll-side">
            
            <div class="project-card is-active-card" data-project="proj-1" id="card-proj-1">
                <span class="project-badge">Risco e Confiabilidade</span>
                <h2>Criticidade e Matriz RCM</h2>
                <p>
                    A base de um plano de manutenção robusto é a correta priorização dos ativos da planta. 
                    Neste módulo conceitual, você aprenderá a aplicar os critérios da metodologia RCM (Reliability Centered Maintenance) 
                    para qualificar riscos operacionais, medir impactos financeiros de quebras imprevistas e configurar uma matriz de criticidade funcional.
                </p>
                <a href="#card-proj-1" class="project-cta" onclick="scrollToProject(event, 'card-proj-1')">
                    Revisar módulo 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>

            <div class="project-card" data-project="proj-2" id="card-proj-2">
                <span class="project-badge">Análise de Falhas</span>
                <h2>Árvore de Causas e RCA</h2>
                <p>
                    Quando uma falha crítica paralisa as operações, é vital identificar as causas raiz sistêmicas, físicas e humanas. 
                    O processo de Root Cause Analysis (RCA) fornece uma rota lógica para rastrear o comportamento anômalo de componentes, 
                    estruturando hipóteses claras através do diagrama de causa e efeito e do método dos 5 Porquês.
                </p>
                <a href="#card-proj-2" class="project-cta" onclick="scrollToProject(event, 'card-proj-2')">
                    Revisar módulo 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>

            <div class="project-card" data-project="proj-3" id="card-proj-3">
                <span class="project-badge">Gestão de PCM</span>
                <h2>Auditoria e Indicadores</h2>
                <p>
                    Para garantir a aderência aos padrões mundiais de classe mundial (World Class Maintenance), estabelecemos 
                    auditorias completas nos processos de PCM. Analisamos KPIs estruturais como MTBF, MTTR, Backlog e Custos de Manutenção, 
                    proporcionando uma rota de maturidade clara e autoajustável no tempo.
                </p>
                <a href="#card-proj-3" class="project-cta" onclick="scrollToProject(event, 'card-proj-3')">
                    Revisar módulo 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>

        </div>

        <!-- Lado Direito: Container Sticky com Telas de Pré-visualização -->
        <div class="split-sticky-side">
            
            <!-- Painel Visual 1: Matriz de Risco RCM -->
            <div class="visual-panel is-active" id="proj-1-visual">
                <div class="panel-header">
                    <span class="panel-title">Matriz de Criticidade 3x3</span>
                    <span class="panel-status"></span>
                </div>
                <div class="panel-body">
                    <div class="matrix-grid">
                        <div class="matrix-cell cell-low">Baixa</div>
                        <div class="matrix-cell cell-med">Média</div>
                        <div class="matrix-cell cell-high" style="box-shadow: 0 0 15px rgba(231, 76, 60, 0.35);">Crítica</div>
                        
                        <div class="matrix-cell cell-low">Baixa</div>
                        <div class="matrix-cell cell-med">Média</div>
                        <div class="matrix-cell cell-med">Média</div>
                        
                        <div class="matrix-cell cell-low">Baixa</div>
                        <div class="matrix-cell cell-low">Baixa</div>
                        <div class="matrix-cell cell-low">Baixa</div>
                    </div>
                </div>
                <div class="panel-footer">
                    <span>Impacto: Financeiro/SMS</span>
                    <span>Classificação: Crítico (1-A)</span>
                </div>
            </div>

            <!-- Painel Visual 2: Diagrama de Árvore RCA -->
            <div class="visual-panel" id="proj-2-visual">
                <div class="panel-header">
                    <span class="panel-title">Estrutura de Falhas RCA</span>
                    <span class="panel-status" style="background-color: #ff9f43; box-shadow: 0 0 10px #ff9f43;"></span>
                </div>
                <div class="panel-body">
                    <div class="rca-tree">
                        <div class="tree-node">Vazamento Crítico Selo Mecânico</div>
                        <div class="tree-branches">
                            <div class="rca-tree" style="gap:12px;">
                                <div class="tree-node">Desgaste Prematuro</div>
                                <div class="tree-node last" style="background-color: rgba(231, 76, 60, 0.1); border-color: #e74c3c; color: #ff6b6b;">Falta de Lubrificação</div>
                            </div>
                            <div class="rca-tree" style="gap:12px;">
                                <div class="tree-node">Pulsação no Eixo</div>
                                <div class="tree-node last" style="background-color: rgba(241, 196, 15, 0.1); border-color: #f1c40f; color: #f5cd79;">Desalinhamento Angular</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel-footer">
                    <span>Método Rastreável</span>
                    <span>Raiz Física Encontrada</span>
                </div>
            </div>

            <!-- Painel Visual 3: Gráfico de Indicadores / KPI -->
            <div class="visual-panel" id="proj-3-visual">
                <div class="panel-header">
                    <span class="panel-title">Painel de Métricas PCM</span>
                    <span class="panel-status" style="background-color: #0071e3; box-shadow: 0 0 10px #0071e3;"></span>
                </div>
                <div class="panel-body">
                    <div class="gauge-container">
                        <div class="circle-gauge">
                            <svg viewBox="0 0 100 100">
                                <circle class="circle-bg" cx="50" cy="50" r="40"></circle>
                                <circle class="circle-progress" cx="50" cy="50" r="40" style="stroke-dashoffset: 75.3px; stroke: var(--accent-color);"></circle>
                            </svg>
                            <div class="gauge-val">80%</div>
                        </div>
                        <div class="indicator-info-list">
                            <div class="indicator-item">Meta Global: <span>85%</span></div>
                            <div class="indicator-item">Disponibilidade: <span style="color:var(--accent-color)">92.4%</span></div>
                            <div class="indicator-item">Cumprimento Plano: <span style="color:var(--primary-color)">88.1%</span></div>
                        </div>
                    </div>
                </div>
                <div class="panel-footer">
                    <span>Indicador Trimestral</span>
                    <span>Status: Ótimo</span>
                </div>
            </div>

        </div>
    </div>

    <!-- Indicadores Laterais de Navegação Rápida -->
    <div class="section-indicators">
        <div class="dot is-active-dot" onclick="scrollToProjectDirect('card-proj-1')" title="Criticidade"></div>
        <div class="dot" onclick="scrollToProjectDirect('card-proj-2')" title="Árvore de Causas"></div>
        <div class="dot" onclick="scrollToProjectDirect('card-proj-3')" title="Auditoria"></div>
    </div>

    <script>
        const projectCards = document.querySelectorAll('.project-card');
        const visualPanels = document.querySelectorAll('.visual-panel');
        const dots = document.querySelectorAll('.dot');

        // Navegação suave no clique do link do cartão
        function scrollToProject(event, cardId) {
            event.preventDefault();
            const element = document.getElementById(cardId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Navegação suave no clique dos dots
        function scrollToProjectDirect(cardId) {
            const element = document.getElementById(cardId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Configurações do Intersection Observer
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -40% 0px', // Aciona quando a seção cruza o foco central do viewport
            threshold: 0.45
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const projectId = entry.target.getAttribute('data-project');
                    
                    // 1. Destaca o cartão atualmente ativo
                    projectCards.forEach(c => c.classList.remove('is-active-card'));
                    entry.target.classList.add('is-active-card');

                    // 2. Comuta a visibilidade das visualizações do lado direito
                    visualPanels.forEach(p => {
                        if (p.id === `${projectId}-visual`) {
                            p.classList.add('is-active');
                        } else {
                            p.classList.remove('is-active');
                        }
                    });

                    // 3. Atualiza os dots indicadores laterais
                    const targetIndex = Array.from(projectCards).indexOf(entry.target);
                    dots.forEach((dot, index) => {
                        if (index === targetIndex) {
                            dot.classList.add('is-active-dot');
                        } else {
                            dot.classList.remove('is-active-dot');
                        }
                    });
                }
            });
        }, observerOptions);

        // Ativa a observação para cada seção de conteúdo rolável
        projectCards.forEach(card => observer.observe(card));
    </script>
</body>
</html>
```

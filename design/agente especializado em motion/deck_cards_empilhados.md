# Deck de Cards Empilhados (Stacked Card Scatter Grid)

## Descrição da Funcionalidade
O **Deck de Cards Empilhados** (ou *Stacked Card Scatter Grid*) é uma estrutura visual tridimensional e altamente interativa baseada em um empilhamento centralizado de cartões (cards).
- **Layout de Pilha (Stacked Layout)**: Os cards são renderizados no centro da viewport, sobrepostos de maneira absoluta uns sobre os outros. Pequenos deslocamentos e rotações angulares randômicas são aplicados a cada camada para dar uma aparência tátil e orgânica de "pilha de cartas físicas".
- **Dispersão por Scroll (Scroll-Triggered Scatter)**: À medida que o usuário rola a página para baixo e entra na seção dedicada, o viewport é "pinado" (bloqueado na posição vertical). Conforme a rolagem prossegue, os cards se dispersam radialmente para fora, deslizando e girando até ocupar posições estruturadas em forma de grid aberto. Rolar a página no sentido reverso empilha as cartas de volta na pilha central.
- **Gesto de Descarte por Deslizamento (Tactile Swipe)**: Quando os cards estão empilhados na tela (sem rolagem ativa), o usuário pode arrastar (drag) o card superior horizontalmente. Se o card for arrastado além de um limiar limite (threshold) ou arremessado com alta velocidade, ele é "descartado" da pilha voando para fora da tela com inércia física, revelando o card subsequente.

---

## Guia Conceitual de Performance

A fluidez do movimento de dispersão e descarte de cartões exige taxas de renderização constantes de **60 a 120 FPS**. Abaixo estão as diretrizes de otimização de baixo nível aplicadas para evitar lentidões e quebras de quadros:

### 1. Performance de Pinning (Scroll-Pinning)
- Bloquear a rolagem física enquanto a página continua rolando conceitualmente (pinning) é realizado fixando o contêiner via `position: fixed` ou aplicando transformações de matriz 3D dinâmicas no elemento pai (`pin-spacer`). 
- Isso permite que a rolagem do usuário atualize apenas o progresso relativo ($0\%$ a $100\%$) da animação, evitando recálculos da árvore geométrica geral da página (Reflow). O GSAP `ScrollTrigger` gerencia esse cálculo criando um wrapper otimizado que isola o fluxo do documento principal.

### 2. Matemática das Coordenadas de Scroll
- O progresso de rolagem é mapeado linearmente para valores de deslocamento tridimensional ($x, y$) e rotação angular ($r$). A interpolação de sub-pixel é essencial: em vez de valores inteiros de pixels (`px`), as posições são mapeadas em pontos flutuantes computados diretamente no motor de física do GSAP, aplicando funções de atenuação (*easing*) que suavizam a aceleração inicial e a desaceleração final.

### 3. Aceleração de Hardware (GPU Compositing)
- Todos os cards do deck são promovidos a camadas exclusivas da GPU através de:
  - `will-change: transform, opacity`
  - Utilização estrita de `translate3d(x, y, z)` ou matrizes de transformação 3D nas atualizações do GSAP.
- Isso impede que os cartões ativem o motor de rasterização da CPU durante as fases de movimentação rápida. O navegador apenas move as texturas geradas na memória de vídeo, o que é um processo quase instantâneo.

### 4. Sobrecarga de Memória e Coleta de Lixo (Garbage Collection)
- A escuta constante de eventos de toque e rolagem pode causar alocações pesadas de memória no heap JavaScript se novos objetos de coordenadas forem criados a cada frame. 
- Para evitar interrupções de travamento causadas por ciclos do Garbage Collector (Coleta de Lixo) do navegador:
  - Reutilizamos as instâncias dos animadores.
  - Implementamos *caching* estruturado das dimensões e limites das caixas usando o método `invalidateOnRefresh` do ScrollTrigger.
  - Otimizamos a quantidade total de cards na tela (limite ideal de 4 a 6 cartões complexos por deck) para conter a sobrecarga gráfica geral.

---

## Código de Exemplo Completo

O código abaixo fornece uma demonstração completa e independente contendo as duas experiências: o **Deck de Cards Empilhado com Descarte via Gesto Swipe** e a **Dispersão Radial no Scroll**. Ele utiliza as bibliotecas GSAP, ScrollTrigger e Draggable via CDN.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deck de Cards Empilhados - Mentoria de Confiabilidade</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CDNs do GSAP, ScrollTrigger e Draggable -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js"></script>

    <style>
        :root {
            --bg-color: #0d0e15;
            --text-color: #f5f5f7;
            --text-muted: #86868b;
            --primary-color: #0071e3;
            --accent-color: #64ffda;
            --card-width: 320px;
            --card-height: 400px;
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

        /* Hero Header section */
        .hero-section {
            height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 20px;
            background: radial-gradient(circle at center, #1b1c2b 0%, #0d0e15 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hero-section h1 {
            font-size: 2.8rem;
            font-weight: 700;
            letter-spacing: -1px;
            margin-bottom: 15px;
        }

        .hero-section p {
            color: var(--text-muted);
            max-width: 600px;
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .section-title-tag {
            background-color: rgba(0, 113, 227, 0.15);
            color: var(--primary-color);
            padding: 6px 16px;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 20px;
            display: inline-block;
        }

        /* --- SEÇÃO 1: SWIPE DECK --- */
        .swipe-section {
            padding: 80px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #0b0c10;
            position: relative;
            min-height: 100vh;
        }

        .deck-container-swipe {
            position: relative;
            width: var(--card-width);
            height: var(--card-height);
            margin: 40px auto;
        }

        .card {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            background: linear-gradient(135deg, #1b1c2b 0%, #11121b 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
            cursor: grab;
            user-select: none;
            touch-action: none;
            will-change: transform, opacity;
        }

        .card:active {
            cursor: grabbing;
        }

        /* Estilo dos Cards */
        .card-number {
            font-size: 1.8rem;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.1);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-body h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }

        .card-body p {
            color: var(--text-muted);
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.75rem;
        }

        .badge-active { background-color: rgba(100, 255, 218, 0.1); color: var(--accent-color); }
        .badge-pending { background-color: rgba(241, 196, 15, 0.15); color: #f1c40f; }

        /* Botão de reset */
        .reset-btn-container {
            position: absolute;
            z-index: 10;
            opacity: 0;
            pointer-events: none;
            transform: scale(0.9);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .reset-btn-container.is-visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1);
        }

        .reset-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 0.95rem;
            font-weight: 600;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0, 113, 227, 0.3);
            transition: background-color 0.2s, transform 0.2s;
        }

        .reset-btn:hover {
            background-color: #007dd6;
            transform: translateY(-2px);
        }

        /* --- SEÇÃO 2: SCROLL SCATTER --- */
        .scroll-scatter-section {
            height: 250vh; /* Altura estendida para suportar a rolagem com scrub */
            background-color: #07080c;
            position: relative;
        }

        .pin-container {
            height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .deck-container-scatter {
            position: relative;
            width: var(--card-width);
            height: var(--card-height);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .scatter-card {
            position: absolute;
            width: var(--card-width);
            height: var(--card-height);
            border-radius: 20px;
            padding: 30px;
            background: linear-gradient(135deg, #1b1c2b 0%, #11121b 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            will-change: transform;
        }

        /* Cores de borda para destacar os cards no grid espalhado */
        .sc-1 { border-top: 3px solid #ff7675; }
        .sc-2 { border-top: 3px solid #74b9ff; }
        .sc-3 { border-top: 3px solid #a29bfe; }
        .sc-4 { border-top: 3px solid #55efc4; }

        .spacer-bottom {
            height: 50vh;
            background-color: #0d0e15;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

    <!-- Intro Header -->
    <section class="hero-section">
        <span class="section-title-tag">Módulo C: Deck Dinâmico</span>
        <h1>Deck de Cards Interativo</h1>
        <p>
            Explore o comportamento cinético das informações. Esta demonstração apresenta duas abordagens: 
            um baralho interativo que responde a gestos táteis e um layout que se dispersa em grade com a rolagem.
        </p>
        <div style="margin-top: 30px; font-size: 0.9rem; color: var(--accent-color);">
            Desça para iniciar ↓
        </div>
    </section>

    <!-- SEÇÃO 1: Gesto de Arraste (Swipe Stack) -->
    <section class="swipe-section">
        <span class="section-title-tag">Abordagem 1: Gesto Swipe</span>
        <h2 style="margin-bottom: 10px;">Descarte de Cartas Interativo</h2>
        <p style="color: var(--text-muted); max-width: 500px; text-align: center; font-size: 0.9rem;">
            Pressione e arraste horizontalmente o card do topo. Arremesse-o rápido ou puxe além do limite lateral para removê-lo da pilha.
        </p>

        <div class="deck-container-swipe">
            
            <!-- Card 4 (Fundo) -->
            <div class="card swipe-card">
                <div class="card-header">
                    <span class="status-badge badge-pending">Nível Bronze</span>
                    <span class="card-number">04</span>
                </div>
                <div class="card-body">
                    <h3>Gestão de KPIs</h3>
                    <p>Mapeamento de indicadores-chave de desempenho como OEE, MTTR e MTBF em tempo real para tomada de decisões.</p>
                </div>
                <div class="card-footer">
                    <span>Módulo IV</span>
                    <span>Progresso: 0%</span>
                </div>
            </div>

            <!-- Card 3 -->
            <div class="card swipe-card">
                <div class="card-header">
                    <span class="status-badge badge-pending">Nível Prata</span>
                    <span class="card-number">03</span>
                </div>
                <div class="card-body">
                    <h3>Auditoria de Processos</h3>
                    <p>Auditorias sistemáticas de PCM e de rotinas operacionais para validar a conformidade com as metas corporativas.</p>
                </div>
                <div class="card-footer">
                    <span>Módulo III</span>
                    <span>Progresso: 25%</span>
                </div>
            </div>

            <!-- Card 2 -->
            <div class="card swipe-card">
                <div class="card-header">
                    <span class="status-badge badge-active">Nível Ouro</span>
                    <span class="card-number">02</span>
                </div>
                <div class="card-body">
                    <h3>Root Cause Analysis</h3>
                    <p>Investigação e rastreamento de falhas catastróficas por meio da metodologia de Árvore de Causas e RCA estruturada.</p>
                </div>
                <div class="card-footer">
                    <span>Módulo II</span>
                    <span>Progresso: 50%</span>
                </div>
            </div>

            <!-- Card 1 (Topo Inicial) -->
            <div class="card swipe-card">
                <div class="card-header">
                    <span class="status-badge badge-active">Nível Diamante</span>
                    <span class="card-number">01</span>
                </div>
                <div class="card-body">
                    <h3>Criticidade & RCM</h3>
                    <p>Configuração das prioridades operacionais usando matrizes de criticidade alinhadas à Manutenção Centrada em Confiabilidade.</p>
                </div>
                <div class="card-footer">
                    <span>Módulo I</span>
                    <span>Progresso: 75%</span>
                </div>
            </div>

            <!-- Botão que aparece quando todos os cards são deslizados -->
            <div class="reset-btn-container">
                <button class="reset-btn" onclick="resetSwipeDeck()">Restaurar Deck</button>
            </div>

        </div>
    </section>

    <!-- SEÇÃO 2: Dispersão Radial no Scroll (Scroll Scatter) -->
    <section class="scroll-scatter-section">
        <div class="pin-container">
            
            <div style="position: absolute; top: 8%; text-align: center; width: 100%; padding: 0 20px; z-index: 2;">
                <span class="section-title-tag">Abordagem 2: Scroll Scatter</span>
                <h2 style="font-size: 2rem; margin-bottom: 5px;">Dispersão Tridimensional por Rotação</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 500px; margin: 0 auto;">
                    Role a página lentamente. Veja os cards se desempilharem e se espalharem em uma grade geométrica flutuante.
                </p>
            </div>

            <div class="deck-container-scatter">
                <!-- Card 1 (Fundo da Pilha) -->
                <div class="scatter-card sc-1">
                    <div class="card-header">
                        <span class="card-number" style="color: #ff7675;">M1</span>
                    </div>
                    <div class="card-body">
                        <h3>Análise FMEA</h3>
                        <p>Documentação sistêmica dos modos de falha críticos, efeitos e severidade.</p>
                    </div>
                    <div class="card-footer">
                        <span>Criticidade</span>
                        <span>Alta Severidade</span>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="scatter-card sc-2">
                    <div class="card-header">
                        <span class="card-number" style="color: #74b9ff;">M2</span>
                    </div>
                    <div class="card-body">
                        <h3>Espinha de Peixe</h3>
                        <p>Diagramação estruturada baseada no método Ishikawa (Mão de obra, Máquina, Material...).</p>
                    </div>
                    <div class="card-footer">
                        <span>Causa Raiz</span>
                        <span>Investigação</span>
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="scatter-card sc-3">
                    <div class="card-header">
                        <span class="card-number" style="color: #a29bfe;">M3</span>
                    </div>
                    <div class="card-body">
                        <h3>Auditoria de Campo</h3>
                        <p>Checagem de campo dos checklists de 5S e padrões de conformidade técnica.</p>
                    </div>
                    <div class="card-footer">
                        <span>Padrões</span>
                        <span>Maturidade</span>
                    </div>
                </div>

                <!-- Card 4 (Topo da Pilha) -->
                <div class="scatter-card sc-4">
                    <div class="card-header">
                        <span class="card-number" style="color: #55efc4;">M4</span>
                    </div>
                    <div class="card-body">
                        <h3>Backlog de Ordens</h3>
                        <p>Acompanhamento e balanceamento dinâmico da carga horária de planejamento.</p>
                    </div>
                    <div class="card-footer">
                        <span>PCM</span>
                        <span>Gestão</span>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- Rodapé simples de espaçamento -->
    <div class="spacer-bottom">
        <span>Fim da demonstração conceitual de motion design.</span>
    </div>

    <script>
        // Inicializa as bibliotecas GSAP
        gsap.registerPlugin(ScrollTrigger, Draggable);

        // Inicializa ambas as abordagens
        window.addEventListener('DOMContentLoaded', () => {
            initSwipeDeck();
            initScrollScatter();
        });

        /* --- LÓGICA DA ABORDAGEM 1: GESTO DE SWIPE --- */
        let activeCardIndex;
        let swipeCards;

        function initSwipeDeck() {
            swipeCards = gsap.utils.toArray('.swipe-card');
            activeCardIndex = swipeCards.length - 1;

            swipeCards.forEach((card, index) => {
                const depth = swipeCards.length - 1 - index;
                
                // Configurações físicas iniciais da pilha
                gsap.set(card, {
                    zIndex: index,
                    y: depth * -10,
                    scale: 1 - (depth * 0.035),
                    rotation: (index % 2 === 0 ? -1 : 1) * (depth * 1.5),
                    transformOrigin: "bottom center"
                });

                // Cria o manipulador arrastável para o card
                Draggable.create(card, {
                    type: "x,y",
                    edgeResistance: 0.6,
                    onDrag: function() {
                        // Aplica uma rotação leve proporcional à distância do arrasto horizontal
                        const rotateAmt = this.x * 0.06;
                        gsap.set(this.target, { 
                            rotate: rotateAmt,
                            cursor: "grabbing"
                        });
                    },
                    onDragEnd: function() {
                        const threshold = 120;
                        const velocityX = this.velocityX;
                        
                        // Executa o descarte se ultrapassar a distância ou velocidade limite
                        if (Math.abs(this.x) > threshold || Math.abs(velocityX) > 400) {
                            const direction = this.x > 0 ? 1 : -1;
                            const flyX = direction * (window.innerWidth + 200);
                            const flyY = this.y + (this.velocityY * 0.15); // arco balístico
                            
                            gsap.to(this.target, {
                                x: flyX,
                                y: flyY,
                                rotate: direction * 35,
                                opacity: 0,
                                duration: 0.6,
                                ease: "power2.out",
                                onComplete: () => {
                                    this.target.style.display = "none";
                                    activeCardIndex--;
                                    if (activeCardIndex < 0) {
                                        // Exibe o botão de redefinição
                                        document.querySelector('.reset-btn-container').classList.add('is-visible');
                                    }
                                }
                            });
                        } else {
                            // Retorna o cartão para a posição original na pilha
                            gsap.to(this.target, {
                                x: 0,
                                y: (swipeCards.length - 1 - index) * -10,
                                rotate: (index % 2 === 0 ? -1 : 1) * ((swipeCards.length - 1 - index) * 1.5),
                                duration: 0.5,
                                ease: "elastic.out(1.1, 0.6)"
                            });
                        }
                    }
                });
            });
        }

        // Restaura as cartas originais para a pilha com uma animação cascata
        function resetSwipeDeck() {
            document.querySelector('.reset-btn-container').classList.remove('is-visible');
            activeCardIndex = swipeCards.length - 1;

            swipeCards.forEach((card, index) => {
                card.style.display = "flex";
                const depth = swipeCards.length - 1 - index;
                
                gsap.fromTo(card, 
                    { 
                        x: 0, 
                        y: -window.innerHeight - 80, 
                        rotate: index % 2 === 0 ? -12 : 12, 
                        opacity: 0 
                    },
                    {
                        x: 0,
                        y: depth * -10,
                        rotate: (index % 2 === 0 ? -1 : 1) * (depth * 1.5),
                        opacity: 1,
                        scale: 1 - (depth * 0.035),
                        duration: 0.75,
                        delay: (swipeCards.length - 1 - index) * 0.12,
                        ease: "back.out(1.3)"
                    }
                );
            });
        }

        /* --- LÓGICA DA ABORDAGEM 2: DISPERSÃO NO SCROLL --- */
        function initScrollScatter() {
            const scatterCards = gsap.utils.toArray('.scatter-card');
            
            // Configurações angulares e ordenamento inicial
            scatterCards.forEach((card, index) => {
                const rotationAngles = [-3, 2, -1, 4];
                gsap.set(card, {
                    zIndex: index,
                    rotate: rotationAngles[index % rotationAngles.length]
                });
            });

            // Cria uma linha do tempo vinculada ao scroll da página (Timeline Scrub)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-scatter-section",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.8, // Adiciona uma suavidade no scrub físico
                    pin: true,
                    invalidateOnRefresh: true
                }
            });

            // Função responsiva para calcular os offsets dependendo da resolução de tela
            const isMobile = () => window.innerWidth < 768;

            // Dispersa os cartões para os quatro cantos coordenadamente
            tl.to(scatterCards[3], { // Card de cima (M4) -> Canto inferior direito
                x: () => isMobile() ? 15 : 330,
                y: () => isMobile() ? 190 : 200,
                rotate: 8,
                duration: 1
            }, 0)
            .to(scatterCards[2], { // Card (M3) -> Canto inferior esquerdo
                x: () => isMobile() ? -15 : -330,
                y: () => isMobile() ? 90 : 200,
                rotate: -10,
                duration: 1
            }, 0)
            .to(scatterCards[1], { // Card (M2) -> Canto superior direito
                x: () => isMobile() ? 15 : 330,
                y: () => isMobile() ? -90 : -200,
                rotate: 12,
                duration: 1
            }, 0)
            .to(scatterCards[0], { // Card de baixo (M1) -> Canto superior esquerdo
                x: () => isMobile() ? -15 : -330,
                y: () => isMobile() ? -190 : -200,
                rotate: -14,
                duration: 1
            }, 0);
        }
    </script>
</body>
</html>
```

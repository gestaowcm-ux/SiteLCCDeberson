# Grid de Cards Dispersos com Parallax (Scattered Gallery Grid)

## 1. Descrição da Funcionalidade
O **Grid de Cards Dispersos com Parallax** é um padrão de layout do tipo "colagem editorial" (asymmetrical collage grid). Nele, os elementos (cards contendo imagens, projetos ou descrições) são dispostos de forma desalinhada, quebrando a rigidez das linhas e colunas tradicionais.
- **Comportamento Visual**: Durante o ato de rolar a página, os cards se deslocam verticalmente com velocidades independentes e ligeiramente variadas.
- **Efeito Parallax Asférico**: O dinamismo é obtido ao associar a cada card um coeficiente de velocidade próprio (`data-speed`). Alguns cards sobem mais rapidamente, enquanto outros movem-se mais devagar, criando uma percepção nítida de profundidade espacial (Z-axis).
- **Camadas de Sobreposição (Overlap Layering)**: O desalinhamento inicial das posições, combinado com as velocidades diferentes, faz com que os cards passem uns pelos outros ou se sobreponham levemente durante a rolagem, reforçando o caráter tridimensional e orgânico da composição.

## 2. Guia Conceitual de Performance
Animações contínuas baseadas na rolagem da página podem degradar a fluidez (causando jank/quedas de frame) caso exijam cálculos excessivos na thread principal do navegador. As seguintes estratégias garantem 60 FPS ou superior:
- **Promoção de Camadas via GPU (`will-change`)**: Adicione `will-change: transform` nos estilos CSS dos cards animados. Isso sinaliza ao navegador para alocar recursos de renderização exclusivos e colocar o elemento em sua própria camada de composição (compositor layer) antes que a animação inicie, permitindo que a GPU processe a transformação diretamente.
- **Eventos de Scroll Passivos**: Se a rolagem for monitorada via JavaScript nativo, configure o evento com a opção `{ passive: true }`. Isso desativa a capacidade de invocar `preventDefault()`, permitindo que o navegador realize o scroll instantaneamente em uma thread separada sem aguardar a conclusão do código JS.
- **Otimização de Frequência (Throttling / requestAnimationFrame)**: Evite alterar elementos do DOM diretamente no disparador do scroll. Utilize `requestAnimationFrame` para agrupar as leituras e escritas geométricas, sincronizando-as com a taxa de atualização do monitor. A utilização de bibliotecas robustas e testadas, como o GSAP ScrollTrigger, resolve isso de forma otimizada por padrão.
- **Descarte Fora da Tela (Off-Screen Culling)**: Pare de processar os cálculos e transformações de elementos posicionados fora do campo visual (viewport). O ScrollTrigger gerencia isso ligando e desligando os cálculos com base nas posições de entrada e saída (`start` e `end` do gatilho).

## 3. Código de Exemplo Completo
Abaixo está o código HTML completo, autossuficiente e pronto para execução. Ele utiliza o GSAP ScrollTrigger para gerenciar o parallax assimétrico de forma ideal.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grid de Cards Dispersos com Parallax - Exemplo Completo</title>
    <!-- Fonte Inter para tipografia de alto padrão -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    
    <!-- GSAP & ScrollTrigger via CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

    <style>
        :root {
            --bg-color: #0b0c10;
            --text-color: #ffffff;
            --accent-color: #66fcf1;
            --card-border: rgba(255, 255, 255, 0.1);
            --font-main: 'Inter', sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-main);
            background-color: var(--bg-color);
            color: var(--text-color);
            overflow-x: hidden;
        }

        /* Seção introdutória para criar área de rolagem */
        .intro-section {
            height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid var(--card-border);
        }

        .intro-section h1 {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.04em;
            margin-bottom: 15px;
        }

        .intro-section p {
            font-size: 1.2rem;
            color: #8f9aa6;
            max-width: 600px;
            line-height: 1.6;
        }

        .scroll-indicator {
            margin-top: 40px;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--accent-color);
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        /* Área do Grid de Cards Dispersos */
        .grid-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 120px 24px;
            position: relative;
        }

        .scattered-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            row-gap: 150px;
            column-gap: 20px;
        }

        /* Definição de cards individuais com posições e larguras customizadas (assimetria) */
        .parallax-card {
            grid-column: span 5;
            position: relative;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            will-change: transform; /* Hardware Acceleration */
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .parallax-card:hover {
            border-color: var(--accent-color);
            box-shadow: 0 10px 30px rgba(102, 252, 241, 0.1);
        }

        /* Configurações de alinhamento das colunas para criar o efeito colagem */
        .card-left-1 {
            grid-column: 1 / 7;
        }

        .card-right-1 {
            grid-column: 7 / 13;
            margin-top: 100px; /* Deslocamento inicial para acentuar assimetria */
        }

        .card-left-2 {
            grid-column: 2 / 7;
        }

        .card-right-2 {
            grid-column: 8 / 13;
            margin-top: -50px;
        }

        .card-center {
            grid-column: 4 / 10;
            text-align: center;
        }

        /* Imagens Mockup */
        .card-image-placeholder {
            width: 100%;
            height: 300px;
            border-radius: 8px;
            background: linear-gradient(135deg, #1f2833 0%, #0b0c10 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: rgba(255, 255, 255, 0.1);
            font-weight: 800;
            overflow: hidden;
            position: relative;
        }

        .card-image-placeholder::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 30%, rgba(102, 252, 241, 0.1) 0%, transparent 60%);
        }

        .parallax-card h3 {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .parallax-card p {
            color: #8f9aa6;
            line-height: 1.6;
        }

        .card-tag {
            align-self: flex-start;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--accent-color);
            background: rgba(102, 252, 241, 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
        }

        .card-center .card-tag {
            align-self: center;
        }

        /* Rodapé para gerar espaço no final da rolagem */
        .footer-spacer {
            height: 80vh;
            display: flex;
            justify-content: center;
            align-items: center;
            border-top: 1px solid var(--card-border);
            color: #8f9aa6;
        }

        /* Fallbacks de Acessibilidade */
        @media (prefers-reduced-motion: reduce) {
            .parallax-card {
                transform: none !important;
                will-change: auto !important;
            }
        }

        /* Responsividade para telas menores: Grid vira coluna única simples */
        @media (max-width: 768px) {
            .scattered-grid {
                display: flex;
                flex-direction: column;
                gap: 60px;
            }
            .parallax-card {
                margin-top: 0 !important;
                grid-column: span 12 !important;
            }
            .intro-section h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>

    <!-- Intro -->
    <div class="intro-section">
        <h1>Galeria Asférica Parallax</h1>
        <p>Experimente rolar a página para baixo. Observe que os cards se deslocam com velocidades verticais ligeiramente diferentes, criando uma sensação de camadas tridimensionais.</p>
        <div class="scroll-indicator">Role para baixo</div>
    </div>

    <!-- Grid de Exposição de Projetos -->
    <div class="grid-container">
        <main class="scattered-grid">
            
            <!-- Card 1: Esquerda - Lento (data-speed="0.1") -->
            <article class="parallax-card card-left-1" data-speed="0.1">
                <div class="card-image-placeholder">01</div>
                <span class="card-tag">RCM / Criticidade</span>
                <h3>Análise de confiabilidade</h3>
                <p>Mapeamento de ativos críticos e aplicação sistemática da manutenção centrada em confiabilidade (RCM).</p>
            </article>

            <!-- Card 2: Direita - Rápido (data-speed="0.25") -->
            <article class="parallax-card card-right-1" data-speed="0.25">
                <div class="card-image-placeholder">02</div>
                <span class="card-tag">Causa raiz</span>
                <h3>Árvore de causas</h3>
                <p>Investigação e estruturação lógica das sequências de fatos que levam a falhas complexas.</p>
            </article>

            <!-- Card 3: Centralizado - Profundo / Lento Reverso (data-speed="-0.08") -->
            <article class="parallax-card card-center" data-speed="-0.08">
                <div class="card-image-placeholder" style="height: 400px;">03</div>
                <span class="card-tag">FMEA / FMECA</span>
                <h3>Modos de falha e efeitos</h3>
                <p>Análise quantitativa e qualitativa dos potenciais modos de falhas para prevenção de catástrofes operacionais.</p>
            </article>

            <!-- Card 4: Esquerda - Médio (data-speed="0.15") -->
            <article class="parallax-card card-left-2" data-speed="0.15">
                <div class="card-image-placeholder">04</div>
                <span class="card-tag">Auditoria industrial</span>
                <h3>Avaliação de maturidade</h3>
                <p>Metodologias de conformidade com normas técnicas nacionais e internacionais de integridade estrutural.</p>
            </article>

            <!-- Card 5: Direita - Muito Rápido (data-speed="0.3") -->
            <article class="parallax-card card-right-2" data-speed="0.3">
                <div class="card-image-placeholder">05</div>
                <span class="card-tag">Treinamento</span>
                <h3>Mentoria de engenharia</h3>
                <p>Capacitação avançada e compartilhamento de conhecimento em engenharia mecânica e metalúrgica.</p>
            </article>

        </main>
    </div>

    <!-- Rodapé spacer -->
    <div class="footer-spacer">
        <p>Fim da demonstração. Os elementos retornam ao alinhamento original ao rolar para o topo.</p>
    </div>

    <script>
        // Registrar o plugin ScrollTrigger no GSAP
        gsap.registerPlugin(ScrollTrigger);

        // Inicializar o efeito parallax em cada card
        // Apenas executa a lógica se o usuário não preferir movimento reduzido
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            gsap.utils.toArray('.parallax-card').forEach(card => {
                // Recupera a velocidade definida no atributo customizado data-speed (padrão 0.1)
                const speed = parseFloat(card.getAttribute('data-speed')) || 0.1;
                
                // Converte a velocidade em percentual de deslocamento vertical
                const yTranslation = speed * 150; 

                gsap.fromTo(card, 
                    { 
                        y: -yTranslation 
                    }, 
                    {
                        y: yTranslation,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom', // Quando o topo do card entra na base da tela
                            end: 'bottom top',   // Quando a base do card sai pelo topo da tela
                            scrub: true,         // Vincula a animação diretamente ao progresso do scroll
                            invalidateOnRefresh: true // Recalcula valores em caso de redimensionamento da janela
                        }
                    }
                );
            });
        }
    </script>
</body>
</html>
```

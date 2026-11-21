# Documentação de Interação: Grafo de Conectividade Canvas (Interactive Knowledge Graph)

Este documento especifica os padrões de comportamento interativo, motor físico de forças (Force-Directed Graph) renderizado em HTML5 Canvas e técnicas de performance para o **Mapa de Conhecimento e Conectividade**, com base nos arquivos analisados do projeto SiteMentoria.

---

## Descrição da Funcionalidade

### 1. Grafo de Conexão no Canvas HTML5
O mapa é renderizado em um elemento `<canvas>` que se expande para ocupar a tela inteira. Ele exibe tópicos interconectados de engenharia de confiabilidade e RCA, permitindo navegação fluida:
* **Representação dos Nós (Nodes)**: Círculos com cores que representam sua categoria de assunto. Cada nó possui coordenadas de posição $(x, y)$, velocidade $(vx, vy)$ e raio físico proporcional à sua importância ou número de conexões.
* **Arestas de Conexão (Edges)**: Linhas desenhadas ligando nós que possuem relacionamento de dependência intelectual ou processual.

### 2. Motor de Física de Forças (Force-Directed Simulation)
Para auto-organizar o grafo espacialmente de forma orgânica e esteticamente balanceada, um laço de física é executado a cada frame aplicando três forças primárias:
* **Repulsão Eletrostática (Coulomb)**: Nós empurram uns aos outros para evitar sobreposição:
  $$F_{repulsao} = \frac{k_{rep}}{d^2}$$
* **Atração Elástica de Aresta (Hooke/Spring)**: Nós conectados por linhas são puxados de volta para manter uma distância de repouso confortável ($d_{ideal} = 120px$):
  $$F_{atracao} = k_{spring} \times (d - d_{ideal})$$
* **Fricção e Gravidade Central**: Um amortecimento suave (fricção) reduz a velocidade para estabilizar o movimento, e uma leve força gravitacional puxa os nós isolados em direção ao centro do Canvas $(Centro_X, Centro_Y)$ para evitar que se percam para fora da tela.

### 3. Navegação Espacial e Câmera (Pan & Zoom)
A navegação pelo grafo utiliza um sistema matricial de câmera em 2D:
* **Arrastar de Workspace (Pan)**: Segurar e arrastar o mouse/toque no fundo move o ponto central de renderização aplicando translação bidimensional (`ctx.translate`).
* **Zoom no Cursor**: Rolar a roda do mouse ajusta a escala (`ctx.scale`), tendo o cursor do mouse como ponto de ancoragem para que o zoom pareça focado no local de interesse do usuário.

### 4. Seleção e Destaque Local
Ao clicar em um nó:
* O script executa um cálculo de colisão baseado em distância radial (`hitNode`) para identificar qual nó foi selecionado.
* **Isolamento de Vizinhança**: O nó selecionado e seus vizinhos imediatos mantêm 100% de opacidade e cores vivas, enquanto todos os outros nós e conexões do grafo ganham opacidade decrescente (`ctx.globalAlpha = 0.15`), limpando a poluição visual.
* **Painel de Detalhes**: Um painel lateral de metadados exibe o título do nó e sua descrição operacional estendida.

---

## Guia Conceitual de Performance

### 1. Renderização Direta em Canvas vs. DOM
* Renderizar centenas de nós interconectados em SVG ou DOM geraria sobrecarga crítica de layout no navegador (reflow). O uso do Canvas 2D reduz o consumo a operações puras de desenho de pixels, permitindo taxas de **60 FPS** constantes com centenas de nós em movimento.

### 2. Otimização de Coordenadas de Colisão e Loop Físico
* Para economizar ciclos de processamento de forças em diagramas muito grandes:
  * Desative os cálculos de física quando as velocidades acumuladas dos nós caírem abaixo de um limite de tolerância (estado "Adormecido" ou *sleeping*), religando o motor somente quando o usuário arrasta ou clica em algum nó.
  * O loop de renderização (`loop`) utiliza `requestAnimationFrame` para sincronizar os desenhos de Canvas com a taxa de atualização do monitor do cliente.

---

## Código de Exemplo Completo

Abaixo está o código de exemplo completo em arquivo único de um Grafo Direcionado por Forças interativo e dinâmico, renderizado em Canvas com seleção de nós e painel de informações lateral.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grafo de Conhecimento Interativo (Canvas)</title>
  <style>
    :root {
      --color-bg: #0b0f19;
      --color-panel: #111827;
      --color-border: #1f2937;
      --color-text: #f9fafb;
      --color-accent: #3b82f6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
      display: flex;
      width: 100vw;
      height: 100vh;
    }

    #sidebar {
      width: 320px;
      background: var(--color-panel);
      border-right: 1px solid var(--color-border);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 10;
    }
    #sidebar h2 { font-size: 18px; color: var(--color-accent); }
    #sidebar p { font-size: 14px; line-height: 1.6; color: #9ca3af; }

    #canvas-wrap {
      flex: 1;
      position: relative;
      height: 100%;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    canvas:active { cursor: grabbing; }

    .hint {
      position: absolute;
      bottom: 20px;
      left: 20px;
      font-size: 11px;
      color: #6b7280;
      pointer-events: none;
    }
  </style>
</head>
<body>

  <!-- Node detail sidebar -->
  <div id="sidebar">
    <h2 id="node-title">Grafo de Confiabilidade</h2>
    <p id="node-desc">Clique em qualquer nó na rede para visualizar seus detalhes e mapear as interdependências técnicas.</p>
  </div>

  <div id="canvas-wrap">
    <canvas id="graph-canvas"></canvas>
    <div class="hint">Arraste nós para mover • Clique para inspecionar • Arraste o fundo para mover a tela</div>
  </div>

  <script>
    // 1. Graph Data
    const NODES = [
      { id: 'rca', label: 'RCA', desc: 'Análise de Causa Raiz. Metodologia estruturada para identificação e bloqueio da origem das falhas físicas e humanas.', color: '#3b82f6', x: 200, y: 200, vx: 0, vy: 0, r: 25 },
      { id: 'fmea', label: 'FMEA', desc: 'Análise de Modo e Efeitos de Falha. Ferramenta preventiva para analisar riscos e definir tarefas de manutenção preventivas.', color: '#10b981', x: 300, y: 150, vx: 0, vy: 0, r: 20 },
      { id: 'criticidade', label: 'Criticidade', desc: 'Matriz de risco para priorizar ativos e direcionar recursos baseados em segurança, meio ambiente e custo.', color: '#f59e0b', x: 250, y: 300, vx: 0, vy: 0, r: 20 },
      { id: 'mtbf', label: 'MTBF', desc: 'Período Médio entre Falhas. Indicador estatístico de confiabilidade física dos ativos.', color: '#ef4444', x: 100, y: 180, vx: 0, vy: 0, r: 18 }
    ];

    const EDGES = [
      { source: 'rca', target: 'fmea' },
      { source: 'rca', target: 'criticidade' },
      { source: 'criticidade', target: 'fmea' },
      { source: 'rca', target: 'mtbf' }
    ];

    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    const sidebarTitle = document.getElementById('node-title');
    const sidebarDesc = document.getElementById('node-desc');

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    
    let scale = 1.0;
    let panX = 0;
    let panY = 0;

    let selectedNode = null;
    let draggedNode = null;

    let isDraggingBackground = false;
    let dragStartX = 0, dragStartY = 0;

    // Forces Settings
    const kRepulsion = 1500;
    const kSpring = 0.05;
    const lRest = 140;
    const damping = 0.85;

    function resize() {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Physics Engine
    function applyForces() {
      // Repulsion between all nodes
      for(let i=0; i<NODES.length; i++) {
        const n1 = NODES[i];
        for(let j=i+1; j<NODES.length; j++) {
          const n2 = NODES[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx*dx + dy*dy + 0.1; // avoid divide by zero
          const dist = Math.sqrt(distSq);

          if (dist < 300) {
            const force = kRepulsion / distSq;
            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            if (n1 !== draggedNode) { n1.vx -= fx; n1.vy -= fy; }
            if (n2 !== draggedNode) { n2.vx += fx; n2.vy += fy; }
          }
        }
      }

      // Attraction along connected edges
      EDGES.forEach(edge => {
        const n1 = NODES.find(n => n.id === edge.source);
        const n2 = NODES.find(n => n.id === edge.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
        const delta = dist - lRest;
        const force = kSpring * delta;

        const fx = force * (dx / dist);
        const fy = force * (dy / dist);

        if (n1 !== draggedNode) { n1.vx += fx; n1.vy += fy; }
        if (n2 !== draggedNode) { n2.vx -= fx; n2.vy -= fy; }
      });

      // Update positions and apply friction / gravity to center
      NODES.forEach(n => {
        if (n === draggedNode) return;

        // Pull to center slightly
        n.vx += (width/2 - n.x) * 0.005;
        n.vy += (height/2 - n.y) * 0.005;

        n.vx *= damping;
        n.vy *= damping;

        n.x += n.vx;
        n.y += n.vy;
      });
    }

    // Draw graph to Canvas
    function draw() {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      // Determine highlights based on selection
      const activeNeighborIds = new Set();
      if (selectedNode) {
        activeNeighborIds.add(selectedNode.id);
        EDGES.forEach(edge => {
          if (edge.source === selectedNode.id) activeNeighborIds.add(edge.target);
          if (edge.target === selectedNode.id) activeNeighborIds.add(edge.source);
        });
      }

      // Draw Edges
      EDGES.forEach(edge => {
        const n1 = NODES.find(n => n.id === edge.source);
        const n2 = NODES.find(n => n.id === edge.target);
        if (!n1 || !n2) return;

        ctx.save();
        if (selectedNode && (!activeNeighborIds.has(n1.id) || !activeNeighborIds.has(n2.id))) {
          ctx.globalAlpha = 0.1;
        } else {
          ctx.globalAlpha = 0.4;
        }
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Draw Nodes
      NODES.forEach(n => {
        ctx.save();
        if (selectedNode && !activeNeighborIds.has(n.id)) {
          ctx.globalAlpha = 0.2;
        }

        // Outer border highlight
        if (selectedNode === n) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw core node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Text label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);

        ctx.restore();
      });

      ctx.restore();
    }

    // Interaction Handlers
    function getMouseCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // map to virtual coordinate system (considering pan and scale)
      const gx = (mx - panX) / scale;
      const gy = (my - panY) / scale;
      return { gx, gy, mx, my };
    }

    canvas.addEventListener('mousedown', (e) => {
      const { gx, gy, mx, my } = getMouseCoords(e);

      // Hit test node
      let hit = null;
      for (let i = NODES.length - 1; i >= 0; i--) {
        const n = NODES[i];
        const dist = Math.hypot(n.x - gx, n.y - gy);
        if (dist <= n.r) {
          hit = n;
          break;
        }
      }

      if (hit) {
        draggedNode = hit;
        selectedNode = hit;
        sidebarTitle.textContent = hit.label;
        sidebarDesc.textContent = hit.desc;
      } else {
        isDraggingBackground = true;
        dragStartX = mx - panX;
        dragStartY = my - panY;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const { gx, gy, mx, my } = getMouseCoords(e);

      if (draggedNode) {
        draggedNode.x = gx;
        draggedNode.y = gy;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
      } else if (isDraggingBackground) {
        panX = mx - dragStartX;
        panY = my - dragStartY;
      }
    });

    window.addEventListener('mouseup', () => {
      draggedNode = null;
      isDraggingBackground = false;
    });

    // Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleFactor = 1.1;
      let newScale = scale;
      if (e.deltaY < 0) {
        newScale *= scaleFactor;
      } else {
        newScale /= scaleFactor;
      }

      // bound zoom
      newScale = Math.max(0.5, Math.min(newScale, 3.0));

      // Zoom towards mouse pointer
      panX = mouseX - (mouseX - panX) * (newScale / scale);
      panY = mouseY - (mouseY - panY) * (newScale / scale);
      scale = newScale;
    });

    // Loop
    function loop() {
      applyForces();
      draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>
```

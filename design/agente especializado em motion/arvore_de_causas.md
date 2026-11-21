# Documentação de Interação: Árvore de Causas Lógica (Interactive Cause Tree)

Este documento especifica os padrões de comportamento visual, lógica de diagramação ortogonal dinâmica e técnicas de performance para a **Árvore de Causas Interativa** (RCA Logical Cause Tree), com base nos arquivos analisados do projeto SiteMentoria.

---

## Descrição da Funcionalidade

### 1. Estrutura Lógica e Nós
A árvore representa a quebra de uma falha em suas causas físicas, humanas e organizacionais. Cada nó (card) possui:
* **Identificador Único (`id`)**: Chave primária.
* **Descrição da Causa**: Texto editável diretamente em campo de texto dinâmico (`textarea`).
* **Status**: Indicação visual de confirmação da causa ("Confirmado", "Hipótese", "Excluído").
* **Porta Lógica (Gate)**: Tipo de relacionamento com os filhos:
  * **OU (OR)**: Qualquer uma das causas filhas basta para disparar a causa pai (desenhado com um badge contendo "OU" entre o pai e os filhos).
  * **E (AND)**: Todas as causas filhas devem ocorrer juntas para disparar a causa pai (desenhado com badge "E").
  * **Sem Porta (—)**: Conexão direta dos filhos sem badge centralizado.
* **Conexão Direta (`directConnect`)**: Se verdadeiro, o nó filho conecta-se diretamente ao centro-inferior do pai por uma linha pontilhada, contornando a porta lógica compartilhada. Uma única causa filha sempre conecta-se de forma direta.

### 2. Algoritmo de Auto-Layout Recursivo
Para evitar sobreposição e manter a clareza visual:
* O layout calcula recursivamente a largura total necessária para cada subárvore (`getSubtreeWidth`) considerando as lacunas horizontais (`H_GAP = 56px`) entre subárvores irmãs.
* Os nós são posicionados hierarquicamente (`layoutNode`) no eixo Y com base em seu nível na árvore (`V_LEVEL = 250px` por nível).
* O alinhamento horizontal centraliza o nó pai exatamente acima do baricentro horizontal ocupado pelo conjunto de seus nós filhos.

### 3. Conexões SVG Ortogonais Dinâmicas
As linhas de conexão são desenhadas como caminhos SVG no plano traseiro (`#tree-svg`) e recalculadas a cada frame de movimentação:
* **Conexões com Porta Lógica**: Uma linha sólida desce do centro-inferior do pai até a entrada superior do badge da porta lógica. Da saída inferior da porta, saem linhas que se dividem horizontalmente e descem ortogonalmente (`drawOrtho`) até o topo-centro de cada nó filho correspondente.
* **Conexões Diretas**: Linhas tracejadas conectam o centro-inferior do pai diretamente ao topo-centro do filho por trajetos ortogonais sem passar por badges de portas.
* **Realce de Estado Ativo**: Se uma causa for marcada como ativa ou confirmada, sua linha de conexão associada ganha espessura (`stroke-width: 3px`) e cor vermelha vibrante (`var(--color-danger)`), indicando o caminho crítico da falha.

### 4. Movimentação de Subárvores (Subtree Dragging)
Para reorganizar o diagrama:
* O usuário pode arrastar qualquer nó pelo cabeçalho.
* Ao iniciar o arraste, o script calcula recursivamente todos os IDs que pertencem à subárvore (`getSubtreeIds`) daquele nó.
* Durante o movimento do mouse, o nó arrastado e todos os nós de sua subárvore são deslocados simultaneamente mantendo a distância relativa, enquanto as conexões SVG são redesenhadas em tempo real.

### 5. Zoom e Panorâmica (Pan & Zoom Workspace)
* **Navegação de Área (Panning)**: Ao ativar o modo pan (ou segurando o botão do meio/barra de espaço), o usuário pode clicar e arrastar o fundo do workspace para rolar e navegar por árvores massivas.
* **Zoom Suave**: Controles de zoom aplicam transformações de escala CSS (`transform: scale()`) ao contêiner de nós de forma centralizada.

---

## Guia Conceitual de Performance

### 1. Isolamento de Camadas (GPU Composing)
* A renderização dos nós do DOM é separada fisicamente da renderização das linhas de conexão. Os nós utilizam posicionamento absoluto (`left`/`top`) com `will-change: transform` durante o arraste da subárvore para evitar o recalculo de layout global do navegador (reflow).
* A renderização do SVG é re-desenhada limpando o SVG interno (`svg.innerHTML = ''`) e adicionando caminhos simples. Para diagramas muito grandes, os caminhos SVG são atualizados alterando diretamente o atributo `d` dos elementos `<path>` existentes em vez de recriar elementos DOM.

### 2. Recálculo Otimizado de Coordenadas
* Em vez de ler as coordenadas físicas dos nós chamando repetidamente `getBoundingClientRect()` (o que causa invalidação de layout), o script mantém um cache das posições lógicas de `X` e `Y` de cada nó no estado e usa esses valores virtuais escalados para traçar as conexões.

---

## Código de Exemplo Completo

Abaixo está uma versão autônoma de um editor de árvore lógica simplificado com auto-layout, desenho de conexões ortogonais dinâmicas via SVG e manipulação de estado.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Editor de Árvore de Causas RCA - Interativo</title>
  <style>
    :root {
      --color-bg: #f8fafc;
      --color-card: #ffffff;
      --color-border: #cbd5e1;
      --color-text: #0f172a;
      --color-danger: #ef4444;
      --color-mute: #64748b;
      --color-badge: #1e293b;
      --color-badge-text: #ffffff;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
    }

    #workspace {
      width: 100vw;
      height: 100vh;
      overflow: auto;
      position: relative;
      cursor: grab;
    }
    #workspace:active { cursor: grabbing; }

    #tree-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 1;
    }

    #tree-nodes {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      pointer-events: none;
    }

    .node-card {
      position: absolute;
      width: 200px;
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      pointer-events: auto;
      cursor: default;
    }

    .node-card.active {
      border-color: var(--color-danger);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    .node-header {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-mute);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }

    .node-title {
      font-size: 13px;
      font-weight: 600;
      width: 100%;
      border: none;
      outline: none;
      resize: none;
      height: 48px;
    }

    .node-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .node-btn {
      font-size: 10px;
      padding: 3px 6px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: #f1f5f9;
      cursor: pointer;
    }
    .node-btn:hover { background: #e2e8f0; }

    .gate-badge {
      position: absolute;
      background: var(--color-badge);
      color: var(--color-badge-text);
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 999px;
      z-index: 3;
      transform: translate(-50%, -50%);
      pointer-events: auto;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div id="workspace">
    <svg id="tree-svg"></svg>
    <div id="tree-nodes"></div>
  </div>

  <script>
    const NODE_W = 200;
    const H_GAP = 40;
    const V_LEVEL = 200;

    let treeState = {
      "root": { id: "root", parentId: null, x: 0, y: 0, desc: "Incidente Principal", active: true, gate: "OU" },
      "child-1": { id: "child-1", parentId: "root", x: 0, y: 0, desc: "Falha de Equipamento", active: true, gate: "—" },
      "child-2": { id: "child-2", parentId: "root", x: 0, y: 0, desc: "Erro Operacional", active: false, gate: "—" }
    };

    const workspace = document.getElementById('workspace');
    const treeSvg = document.getElementById('tree-svg');
    const treeNodes = document.getElementById('tree-nodes');

    // Basic Pan
    let isPanning = false;
    let startX, startY, scrollLeft, scrollTop;

    workspace.addEventListener('mousedown', (e) => {
      if (e.target === workspace) {
        isPanning = true;
        startX = e.pageX - workspace.offsetLeft;
        startY = e.pageY - workspace.offsetTop;
        scrollLeft = workspace.scrollLeft;
        scrollTop = workspace.scrollTop;
      }
    });
    workspace.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const x = e.pageX - workspace.offsetLeft;
      const y = e.pageY - workspace.offsetTop;
      const walkX = (x - startX);
      const walkY = (y - startY);
      workspace.scrollLeft = scrollLeft - walkX;
      workspace.scrollTop = scrollTop - walkY;
    });
    workspace.addEventListener('mouseup', () => isPanning = false);
    workspace.addEventListener('mouseleave', () => isPanning = false);

    // Layout
    function getChildren(parentId) {
      return Object.values(treeState).filter(n => n.parentId === parentId);
    }

    function getSubtreeWidth(nodeId) {
      const children = getChildren(nodeId);
      if (children.length === 0) return NODE_W;
      let totalW = 0;
      children.forEach(c => {
        totalW += getSubtreeWidth(c.id);
      });
      totalW += (children.length - 1) * H_GAP;
      return Math.max(NODE_W, totalW);
    }

    function layoutNode(nodeId, centerX, topY) {
      const node = treeState[nodeId];
      node.x = centerX - NODE_W / 2;
      node.y = topY;

      const children = getChildren(nodeId);
      if (children.length === 0) return;

      const totalW = getSubtreeWidth(nodeId);
      let leftBound = centerX - totalW / 2;

      children.forEach(c => {
        const childW = getSubtreeWidth(c.id);
        const childCenterX = leftBound + childW / 2;
        layoutNode(c.id, childCenterX, topY + V_LEVEL);
        leftBound += childW + H_GAP;
      });
    }

    function runAutoLayout() {
      layoutNode("root", 800, 50);
      render();
    }

    // Render Nodes & Connectors
    function render() {
      // Clear
      treeNodes.innerHTML = '';
      treeSvg.innerHTML = '';

      const nodes = Object.values(treeState);
      let maxX = 1600, maxY = 800;

      nodes.forEach(node => {
        maxX = Math.max(maxX, node.x + NODE_W + 100);
        maxY = Math.max(maxY, node.y + 300);

        // Node DOM
        const card = document.createElement('div');
        card.className = `node-card ${node.active ? 'active' : ''}`;
        card.style.left = `${node.x}px`;
        card.style.top = `${node.y}px`;
        card.id = `card-${node.id}`;

        card.innerHTML = `
          <div class="node-header" id="hdr-${node.id}">
            <span>${node.id.toUpperCase()}</span>
            <span style="color:${node.active ? 'red' : 'gray'}">●</span>
          </div>
          <textarea class="node-title">${node.desc}</textarea>
          <div class="node-actions">
            <button class="node-btn" onclick="addChild('${node.id}')">+ Causa</button>
            <button class="node-btn" onclick="toggleActive('${node.id}')">Status</button>
          </div>
        `;
        treeNodes.appendChild(card);

        // Text binding
        card.querySelector('textarea').addEventListener('input', (e) => {
          node.desc = e.target.value;
        });

        // Gate badge if children >= 2
        const children = getChildren(node.id);
        if (children.length >= 2) {
          const badge = document.createElement('div');
          badge.className = 'gate-badge';
          badge.innerText = node.gate;
          badge.style.left = `${node.x + NODE_W / 2}px`;
          badge.style.top = `${node.y + 120}px`;
          badge.addEventListener('click', () => {
            node.gate = node.gate === 'OU' ? 'E' : 'OU';
            render();
          });
          treeNodes.appendChild(badge);
        }
      });

      treeSvg.setAttribute('width', maxX);
      treeSvg.setAttribute('height', maxY);
      treeNodes.style.width = `${maxX}px`;
      treeNodes.style.height = `${maxY}px`;

      // Draw SVG connections
      nodes.forEach(node => {
        const children = getChildren(node.id);
        if (children.length === 0) return;

        const px = node.x + NODE_W / 2;
        const py = node.y + 75; // card height bottom

        if (children.length === 1) {
          // Direct connection
          const child = children[0];
          const cx = child.x + NODE_W / 2;
          const cy = child.y;
          drawOrthoDashed(px, py, cx, cy, child.active ? 'var(--color-danger)' : 'var(--color-mute)');
        } else {
          // Connections via Gate
          const gateY = node.y + 120;
          drawOrtho(px, py, px, gateY, node.active ? 'var(--color-danger)' : 'var(--color-mute)');
          
          children.forEach(child => {
            const cx = child.x + NODE_W / 2;
            const cy = child.y;
            drawOrtho(px, gateY, cx, cy, child.active ? 'var(--color-danger)' : 'var(--color-mute)');
          });
        }
      });
    }

    function drawOrtho(x1, y1, x2, y2, color) {
      const midY = y1 + (y2 - y1) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      treeSvg.appendChild(path);
    }

    function drawOrthoDashed(x1, y1, x2, y2, color) {
      const midY = y1 + (y2 - y1) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-dasharray', '5,5');
      path.setAttribute('fill', 'none');
      treeSvg.appendChild(path);
    }

    // Handlers
    window.addChild = function(parentId) {
      const id = `child-${Date.now().toString().slice(-4)}`;
      treeState[id] = {
        id: id,
        parentId: parentId,
        x: 0, y: 0,
        desc: "Nova Causa Identificada",
        active: false,
        gate: "—"
      };
      runAutoLayout();
    };

    window.toggleActive = function(nodeId) {
      treeState[nodeId].active = !treeState[nodeId].active;
      render();
    };

    // Init
    runAutoLayout();
  </script>
</body>
</html>

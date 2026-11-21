const http = require('http');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('SIGINT', () => {
  console.log('RECEIVED SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('RECEIVED SIGTERM');
  process.exit(0);
});
process.on('exit', (code) => {
  console.log('PROCESS EXIT WITH CODE:', code);
});

const PORT = 5173;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  const urlPath = req.url.split('?')[0];

  // --- Endpoint: Listar Conceitos do Obsidian ---
  if (req.method === 'GET' && urlPath === '/api/obsidian-concepts') {
    const targetDir = path.join(__dirname, 'Ferramentas', 'ConceitosObsidian');
    
    // Garantir que a pasta existe e está populada
    if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Inicia a pasta com os 11 conceitos padrão de LCC
      const initialConcepts = {
        'LCC (Life Cycle Costing)': `---\ncategory: Geral\n---\nO **Custeio do Ciclo de Vida (LCC - Life Cycle Costing)** é a metodologia de engenharia econômica e gestão de ativos dedicada a quantificar todos os custos incorridos por um ativo físico desde sua concepção e aquisição até sua operação, manutenção e descarte final.\n\nAlinhado à [[ISO 55000]] e à [[ISO 15663]], o LCC equilibra:\n1. [[CAPEX (Aquisição e Instalação)]]\n2. [[OPEX (Operação e Manutenção)]]\n3. [[Custo de Indisponibilidade (Downtime)]] modelado via [[Confiabilidade e RAM]]\n4. [[Descomissionamento e Descarte]]\n\nTodos os fluxos futuros são trazidos a valor presente por meio do [[VPL e Taxa de Desconto]] para fundamentar decisões de seleção e [[Vida Econômica Ótima]].`,
        'CAPEX (Aquisição e Instalação)': `---\ncategory: Etapa\n---\nO **CAPEX (Capital Expenditure)** compreende todos os investimentos iniciais necessários para colocar o ativo em condição operacional.\n\nInclui:\n- Pesquisa, engenharia conceitual e projeto detalhado.\n- Preço de compra do equipamento principal e sobressalentes iniciais.\n- Transporte, obras civis, montagem eletromecânica e comissionamento.\n- Treinamento inicial da operação e manutenção.\n\nNa visão de [[LCC (Life Cycle Costing)]], o CAPEX frequentemente representa apenas a "ponta do iceberg" (10% a 30% do custo total), influenciando diretamente o futuro [[OPEX (Operação e Manutenção)]].`,
        'OPEX (Operação e Manutenção)': `---\ncategory: Etapa\n---\nO **OPEX (Operational Expenditure)** abrange todos os dispêndios recorrentes necessários para operar e manter o ativo ao longo de sua vida útil.\n\nPrincipais componentes:\n- Consumo energético (eletricidade, combustível, vapor) e insumos.\n- Mão de obra operacional e de manutenção.\n- Manutenção preventiva, preditiva e corretiva (peças, serviços, lubrificantes).\n- Grandes paradas e *overhauls*.\n\nO OPEX cresce com o envelhecimento físico do ativo, sendo decisivo no cálculo da [[Vida Econômica Ótima]].`,
        'Custo de Indisponibilidade (Downtime)': `---\ncategory: Causa\n---\nO **Custo de Indisponibilidade (Penalidade por Falha / Downtime)** mensura as perdas financeiras decorrentes de paradas não programadas ou perda de performance operacional.\n\nEnvolve:\n- Lucro cessante / perda de margem de contribuição por produção perdida.\n- Multas contratuais, retrabalho, refugo e perdas de qualidade.\n- Riscos de segurança, meio ambiente e imagem.\n\nSua estimativa depende diretamente da modelagem de [[Confiabilidade e RAM]] (MTBF e MTTR) integrada ao [[LCC (Life Cycle Costing)]].`,
        'Confiabilidade e RAM': `---\ncategory: Análise\n---\nA **Engenharia de Confiabilidade e Análise RAM (Reliability, Availability, Maintainability)** conecta o comportamento probabilístico de falhas ao impacto econômico do ativo.\n\nIndicadores-chave:\n- **MTBF / Taxa de Falhas (Weibull)**: Frequência esperada de eventos corretivos.\n- **MTTR**: Tempo médio para reparo e retorno à operação.\n- **Disponibilidade Inerente e Operacional**: Fração do tempo em que o ativo gera valor.\n\nProjetos com maior confiabilidade intrínseca podem exigir maior [[CAPEX (Aquisição e Instalação)]], mas reduzem drasticamente o [[Custo de Indisponibilidade (Downtime)]] e o [[OPEX (Operação e Manutenção)]].`,
        'VPL e Taxa de Desconto': `---\ncategory: Técnica\n---\nO **Valor Presente Líquido (VPL / NPV)** e a **Taxa de Desconto (TMA / WACC)** permitem comparar desembolsos que ocorrem em diferentes momentos do horizonte de vida do ativo.\n\nConceitos essenciais:\n- Valor do dinheiro no tempo e custo de oportunidade do capital.\n- Taxa real vs. taxa nominal (efeito da inflação).\n- **Custo Anual Uniforme Equivalente (CAUE / EAC)**: Fundamental para comparar ativos com vidas úteis diferentes e determinar a [[Vida Econômica Ótima]].`,
        'Vida Econômica Ótima': `---\ncategory: Solução\n---\nA **Vida Econômica Ótima (Economic Life)** é o ponto no tempo em que o Custo Anual Uniforme Equivalente (CAUE) de possuir, operar e manter um ativo atinge seu valor mínimo.\n\nEla resulta do equilíbrio entre duas forças opostas:\n- Diluição do [[CAPEX (Aquisição e Instalação)]] ao longo dos anos (curva decrescente).\n- Aumento progressivo do [[OPEX (Operação e Manutenção)]] e do [[Custo de Indisponibilidade (Downtime)]] pelo desgaste (curva crescente).\n\nUltrapassar a vida econômica significa operar na zona antieconômica, orientando a [[Análise de Substituição de Ativos]].`,
        'Análise de Substituição de Ativos': `---\ncategory: Solução\n---\nA **Análise de Substituição (Defensor vs. Desafiante)** avalia tecnicamente quando reformar (*retrofit/overhaul*) ou substituir um ativo em operação (**Defensor**) por uma nova alternativa tecnológica (**Desafiante**).\n\nCompara o custo marginal de manter o ativo atual por mais um período contra o CAUE mínimo do novo equipamento na [[Vida Econômica Ótima]], usando [[VPL e Taxa de Desconto]].`,
        'Descomissionamento e Descarte': `---\ncategory: Etapa\n---\nO **Descomissionamento, Desmobilização e Descarte** corresponde à fase final do ciclo de vida do ativo.\n\nPode gerar:\n- **Valor Residual Positivo**: Revenda do equipamento usado ou sucata metálica.\n- **Custo de Saída (Passivo)**: Desmontagem, descontaminação ambiental, logística reversa e restauração do site (crítico em óleo & gás, mineração e químico, conforme [[ISO 15663]]).`,
        'ISO 55000': `---\ncategory: Geral\n---\nA série **ABNT NBR ISO 55000 (Gestão de Ativos)** estabelece os princípios para extrair valor máximo dos ativos ao longo de todo o seu ciclo de vida, equilibrando **Custo, Risco e Desempenho**.\n\nO [[LCC (Life Cycle Costing)]] é a principal ferramenta quantitativa para materializar esse equilíbrio na tomada de decisão executiva.`,
        'ISO 15663': `---\ncategory: Técnica\n---\nA norma **ISO 15663 (Life Cycle Costing)** fornece a estrutura metodológica internacional para aplicação sistemática do [[LCC (Life Cycle Costing)]] em ativos industriais e de energia.\n\nDefine escopo, estrutura de decomposição de custos (CBS - Cost Breakdown Structure), tratamento de incertezas e análise de sensibilidade sobre [[CAPEX (Aquisição e Instalação)]], [[OPEX (Operação e Manutenção)]] e [[Custo de Indisponibilidade (Downtime)]].`
      };

      for (const [name, content] of Object.entries(initialConcepts)) {
        fs.writeFileSync(path.join(targetDir, `${name}.md`), content, 'utf8');
      }
    }

    // Ler arquivos do diretório
    fs.readdir(targetDir, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Failed to read directory' }));
      }

      const mdFiles = files.filter(f => f.endsWith('.md'));
      const concepts = [];

      let completedCount = 0;
      if (mdFiles.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify([]));
      }

      mdFiles.forEach(file => {
        const filePath = path.join(targetDir, file);
        fs.readFile(filePath, 'utf8', (readErr, content) => {
          if (!readErr) {
            concepts.push({
              name: file.replace(/\.md$/, ''),
              content: content
            });
          }
          completedCount++;
          if (completedCount === mdFiles.length) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(concepts));
          }
        });
      });
    });
    return;
  }

  // --- Endpoint: Salvar/Deletar Conceito do Obsidian ---
  if (req.method === 'POST' && urlPath === '/api/obsidian-save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { name, content, action } = payload;
        
        if (!name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing name' }));
        }

        const targetDir = path.join(__dirname, 'Ferramentas', 'ConceitosObsidian');
        const targetPath = path.resolve(targetDir, `${name}.md`);

        // Segurança: impedir travessia de diretório
        if (!targetPath.startsWith(targetDir)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Forbidden' }));
        }

        if (action === 'delete') {
          if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true }));
        } else {
          fs.writeFileSync(targetPath, content || '', 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true }));
        }
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      }
    });
    return;
  }

  // --- Endpoint para Salvar Notas do Orador ---
  if (req.method === 'POST' && urlPath === '/save-notes') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let { file, slideIndex, notes } = payload;
        
        if (!file || slideIndex === undefined || notes === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing required parameters: file, slideIndex, notes' }));
        }

        // Resolva o caminho com segurança para evitar travessia de diretório
        const cleanFile = file.replace(/^(\.\/|\/)/, '');
        const targetPath = path.resolve(__dirname, cleanFile);
        
        if (!targetPath.startsWith(__dirname)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Forbidden: Access denied' }));
        }

        fs.readFile(targetPath, 'utf8', (err, htmlContent) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: `Failed to read file: ${err.message}` }));
          }

          try {
            const slideId = `slide-${slideIndex + 1}`;
            const slideRegex = new RegExp(`(<(?:main|section)[^>]*id=["']${slideId}["'][^>]*>)`, 'i');
            const slideMatch = htmlContent.match(slideRegex);
            if (!slideMatch) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: `Slide section with id "${slideId}" not found in file` }));
            }

            const startIndex = slideMatch.index + slideMatch[0].length;
            const nextSlideRegex = /<(?:main|section)[^>]*id=["']slide-\d+["'][^>]*>/gi;
            nextSlideRegex.lastIndex = startIndex;
            const nextSlideMatch = nextSlideRegex.exec(htmlContent);
            const endIndex = nextSlideMatch ? nextSlideMatch.index : htmlContent.length;

            const slideSegment = htmlContent.substring(slideMatch.index, endIndex);
            
            const notesRegex = /(<div\s+class=["']speaker-notes["'][^>]*>)([\s\S]*?)(<\/div>)/i;
            const notesMatch = slideSegment.match(notesRegex);
            
            let updatedSegment = '';
            if (notesMatch) {
              updatedSegment = slideSegment.replace(notesRegex, `$1\n          ${notes}\n        $3`);
            } else {
              const insertIndex = slideMatch[0].length;
              updatedSegment = slideSegment.substring(0, insertIndex) + 
                `\n        <div class="speaker-notes" style="display: none;">\n          ${notes}\n        </div>` + 
                slideSegment.substring(insertIndex);
            }

            const updatedHtmlContent = htmlContent.substring(0, slideMatch.index) + updatedSegment + htmlContent.substring(endIndex);

            fs.writeFile(targetPath, updatedHtmlContent, 'utf8', (writeErr) => {
              if (writeErr) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: `Failed to write file: ${writeErr.message}` }));
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            });
          } catch (processErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Failed to process HTML: ${processErr.message}` }));
          }
        });
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Ignora query strings nas requisições de arquivos
  let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Tenta escutar na porta, se estiver ocupada, tenta a próxima
function startServer(port) {
  const serverListener = () => {
    console.log(`Server running at http://localhost:${port}/`);
  };
  
  const errorListener = (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      server.removeListener('listening', serverListener);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  };

  server.once('listening', serverListener);
  server.once('error', errorListener);
  server.listen(port);
}

startServer(PORT);

const heartbeat = setInterval(() => {
  console.log(`[Heartbeat] Server is active - ${new Date().toISOString()}`);
}, 5000);
heartbeat.unref();

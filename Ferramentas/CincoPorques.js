/**
 * Ferramenta RCA — Análise dos 5 Porquês
 * Single Page Application dedicada para sala de aula e projeção 16:9.
 */

const state = {
  caseName: 'Case 1: Compressor C-01',
  problemText: 'Superaquecimento e Desarme no Compressor C-01',
  whys: [
    { level: 1, question: 'Por que o compressor C-01 desarmou repentinamente?', cause: 'O óleo lubrificante atingiu 115°C durante operação contínua.', evidence: 'Registro de temperatura no supervisório SCADA às 14:15h' },
    { level: 2, question: 'Por que o óleo lubrificante atingiu 115°C?', cause: 'O trocador de calor de placas não conseguiu resfriar o circuito de óleo.', evidence: 'Diferencial de temperatura IN/OUT menor que 3°C' },
    { level: 3, question: 'Por que a troca térmica do radiador ficou ineficiente?', cause: 'As aletas do trocador estavam colmatadas por poeira industrial e película de óleo.', evidence: 'Inspeção visual direta no radiador posterior' },
    { level: 4, question: 'Por que o radiador acumulou sujeira pesada sem ser limpo?', cause: 'A limpeza e inspeção do radiador não constavam no plano quinzenal.', evidence: 'Checklist de rotina da equipe de manutenção' },
    { level: 5, question: 'Por que o plano de manutenção estava incompleto?', cause: 'Falha no comissionamento: o manual do fabricante (OEM) não foi revisado pela Engenharia para cadastro no CMMS.', evidence: 'Relatório de entrega técnica do ativo em 2021' }
  ]
};

const presets = {
  compressor: {
    caseName: 'Case 1: Compressor C-01',
    problem: 'Superaquecimento e Desarme no Compressor C-01',
    whys: [
      { level: 1, question: 'Por que o compressor C-01 desarmou por sobretemperatura?', cause: 'A temperatura do circuito de óleo atingiu 115°C durante a operação.', evidence: 'Alarme no painel CLP e supervisório às 14:15h' },
      { level: 2, question: 'Por que a temperatura do óleo subiu além do limite de segurança?', cause: 'O trocador de calor a ar não conseguiu efetuar a troca térmica necessária.', evidence: 'Diferencial de temperatura no radiador abaixo de 3°C' },
      { level: 3, question: 'Por que a troca térmica do radiador foi ineficiente?', cause: 'As aletas metálicas estavam colmatadas por poeira abrasiva e película de óleo.', evidence: 'Inspeção visual direta no radiador' },
      { level: 4, question: 'Por que o radiador acumulou impregnação sem limpeza prévia?', cause: 'A inspeção periódica de radiadores não constava na ordem preventiva quinzenal.', evidence: 'Checklist do plano no sistema de manutenção' },
      { level: 5, question: 'Por que o procedimento preventivo omitiu essa tarefa essencial?', cause: 'Falha na etapa de comissionamento: recomendações do OEM não foram cadastradas no CMMS.', evidence: 'Manual do OEM vs. Plano cadastrado' }
    ]
  },
  prensa: {
    caseName: 'Case 2: Prensa Hidráulica L-02',
    problem: 'Vazamento Crítico de Fluido Hidráulico na Prensa Principal',
    whys: [
      { level: 1, question: 'Por que houve vazamento de óleo hidráulico na prensa?', cause: 'O anel de vedação O-ring do cilindro principal rompeu durante o ciclo.', evidence: 'Óleo acumulado na bacia de contenção' },
      { level: 2, question: 'Por que o anel de vedação rompeu prematuramente?', cause: 'O elastômero sofreu degradação térmica severa e endurecimento.', evidence: 'Anel ressecado e trincado' },
      { level: 3, question: 'Por que a vedação sofreu degradação por temperatura?', cause: 'Foi instalado um anel de Nitrila (NBR) em vez do anel de Fluorcarbono (Viton).', evidence: 'Código do item aplicado no almoxarifado' },
      { level: 4, question: 'Por que foi utilizado o componente com material incorreto?', cause: 'O código de almoxarifado do O-ring Viton estava vinculado ao item de Nitrila.', evidence: 'Cadastro duplicado no sistema ERP' },
      { level: 5, question: 'Por que o cadastro no ERP continha ambiguidade de especificação?', cause: 'Falta de governança na criação de cadastros de sobressalentes críticos.', evidence: 'Auditoria de cadastro de materiais' }
    ]
  },
  qualidade: {
    caseName: 'Case 3: Linha de Laminação 02',
    problem: 'Desvio de Espessura e Defeito Superficial nas Chapas',
    whys: [
      { level: 1, question: 'Por que a espessura da chapa ficou fora da tolerância?', cause: 'A folga entre os rolos laminadores variou durante a produção.', evidence: 'Relatório do sensor de espessura a laser' },
      { level: 2, question: 'Por que a folga entre rolos laminadores variou?', cause: 'O sistema hidráulico de posicionamento dos rolos oscilou em pressão.', evidence: 'Gráfico de pressão hidráulica de posicionamento' },
      { level: 3, question: 'Por que a pressão de posicionamento oscilou?', cause: 'Havia presença de bolhas de ar no bloco servovalvula.', evidence: 'Presença de espuma no reservatório' },
      { level: 4, question: 'Por que entrou ar no sistema hidráulico de controle?', cause: 'O nível de óleo no tanque caiu abaixo do mínimo, aspirando ar na sucção.', evidence: 'Visor de nível do reservatório hidráulico' },
      { level: 5, question: 'Por que o nível baixo do reservatório não foi identificado a tempo?', cause: 'O alarme sonoro de nível mínimo do tanque estava desativado.', evidence: 'Jumper elétrico encontrado no painel' }
    ]
  },
  bomba: {
    caseName: 'Case 4: Bomba B-102',
    problem: 'Trava Repentina do Eixo por Cavitação na Bomba B-102',
    whys: [
      { level: 1, question: 'Por que o eixo da bomba B-102 travou durante operação?', cause: 'Os rolamentos de apoio sofreram colapso por carga axial excessiva.', evidence: 'Esferas do rolamento deformadas e azuladas' },
      { level: 2, question: 'Por que ocorreu carga axial destrutiva sobre o rolamento?', cause: 'O rotor da bomba entrou em desbalanceamento dinâmico severo por erosão.', evidence: 'Vibração triaxial acima de 12 mm/s RMS' },
      { level: 3, question: 'Por que o rotor sofreu erosão intensa e localizada?', cause: 'A bomba operou continuamente em regime de cavitação severa.', evidence: 'Ruído característico de "brita" e micro-cavidades no rotor' },
      { level: 4, question: 'Por que ocorreu cavitação contínua na sucção da bomba?', cause: 'A válvula borboleta de sucção ficou parcialmente fechada a 30%.', evidence: 'Indicador de posição mecânico da válvula' },
      { level: 5, question: 'Por que a válvula de sucção permaneceu parcialmente fechada?', cause: 'Falta de travamento físico LOTO e sinalização visual na tubulação.', evidence: 'Válvula sem lacre ou cadeado de bloqueio' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadPreset('compressor');
});

function renderWhys() {
  updateCaseName(state.caseName);
  updateProblemText(state.problemText);

  const container = document.getElementById('whys-chain-list');
  if (!container) return;

  container.innerHTML = '';

  state.whys.forEach((item, idx) => {
    const isRoot = (idx === state.whys.length - 1);
    const card = document.createElement('div');
    card.className = `why-step-card${isRoot ? ' root-cause' : ''}`;

    card.innerHTML = `
      <div class="why-number-badge">${item.level}°</div>
      <div class="why-content-group">
        <div class="why-question-label">${escapeHTML(item.question)}</div>
        <input type="text" class="why-input-field" value="${escapeHTML(item.cause)}" placeholder="Descreva a causa encontrada neste nível..." onchange="updateWhyCause(${idx}, this.value)">
        <input type="text" class="why-evidence-field" value="${escapeHTML(item.evidence)}" placeholder="🔎 Evidência / Fato comprovado (ex: relatório, foto, medição)..." onchange="updateWhyEvidence(${idx}, this.value)">
      </div>
    `;

    container.appendChild(card);

    if (idx < state.whys.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'why-step-arrow';
      arrow.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
      container.appendChild(arrow);
    }
  });
}

function updateCaseName(val) {
  state.caseName = val;
  const el = document.getElementById('case-name-input');
  if (el && el.value !== val) el.value = val;
}

function updateProblemText(val) {
  state.problemText = val;
  const el = document.getElementById('problem-input');
  if (el && el.value !== val) el.value = val;
  if (state.whys[0]) {
    state.whys[0].question = `Por que ocorreu: ${val}?`;
  }
}

function updateWhyCause(idx, val) {
  if (state.whys[idx]) state.whys[idx].cause = val;
}

function updateWhyEvidence(idx, val) {
  if (state.whys[idx]) state.whys[idx].evidence = val;
}

function loadPreset(key) {
  if (!presets[key]) return;
  const data = presets[key];

  state.caseName = data.caseName || 'Novo Case RCA';
  state.problemText = data.problem || 'Descrição do problema';
  state.whys = JSON.parse(JSON.stringify(data.whys));

  renderWhys();
  showToast('Caso prático carregado!');
}

function clearBoard() {
  if (confirm('Tem certeza que deseja reiniciar a análise dos 5 Porquês?')) {
    state.caseName = 'Novo Case de Análise';
    state.problemText = 'Problema de Investigação RCA';
    state.whys = [
      { level: 1, question: 'Por que o evento ocorreu?', cause: '', evidence: '' },
      { level: 2, question: 'Por que...', cause: '', evidence: '' },
      { level: 3, question: 'Por que...', cause: '', evidence: '' },
      { level: 4, question: 'Por que...', cause: '', evidence: '' },
      { level: 5, question: 'Por que...', cause: '', evidence: '' }
    ];
    renderWhys();
    showToast('Quadro reiniciado!');
  }
}

async function exportJSON() {
  const defaultFilename = (state.caseName || '5_Porques').replace(/[^a-z0-9_-]/gi, '_') + '.json';
  const jsonContent = JSON.stringify(state, null, 2);

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [{
          description: 'Arquivo JSON dos 5 Porquês',
          accept: { 'application/json': ['.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      showToast('Arquivo JSON salvo!');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const userChosenName = prompt('Escolha o nome do arquivo JSON:', defaultFilename);
  if (!userChosenName) return;

  const finalName = userChosenName.endsWith('.json') ? userChosenName : `${userChosenName}.json`;
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = finalName;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Arquivo JSON salvo!');
}

function triggerImportJSON() {
  const fileInput = document.getElementById('json-file-input');
  if (fileInput) fileInput.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.whys) {
        state.caseName = data.caseName || 'Case Importado';
        state.problemText = data.problemText || 'Descrição do Problema';
        state.whys = data.whys;

        renderWhys();
        showToast('Análise dos 5 Porquês importada!');
      } else {
        alert('Arquivo JSON inválido para a análise dos 5 Porquês.');
      }
    } catch (err) {
      alert('Erro ao processar o arquivo JSON.');
    }
  };
  reader.readAsText(file);
}

function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (toast) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

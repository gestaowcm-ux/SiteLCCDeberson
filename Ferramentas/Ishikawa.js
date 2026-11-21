/**
 * Ferramenta RCA — Diagrama de Ishikawa (6M / Espinha de Peixe)
 * Single Page Application dedicada para sala de aula e projeção 16:9.
 */

const state = {
  caseName: 'Case 1: Compressor C-01',
  problemText: 'Superaquecimento e Desarme no Compressor C-01',
  fishHeadText: 'Superaquecimento Compressor',
  causes: {
    metodo: [],
    maquina: [],
    material: [],
    maodeobra: [],
    medida: [],
    meioambiente: []
  }
};

const presets = {
  compressor: {
    caseName: 'Case 1: Compressor C-01',
    problem: 'Superaquecimento e Desarme no Compressor C-01',
    fishHead: 'Superaquecimento Compressor',
    causes: {
      metodo: [{ id: 'm1', text: 'Ausência de rotina quinzenal de drenagem de radiadores', subcauses: ['POP de manutenção desatualizado'] }],
      maquina: [
        { id: 'mq1', text: 'Trocador de calor colmatado por poeira acumulada', subcauses: ['Filtro de sucção com rasgo lateral'] },
        { id: 'mq2', text: 'Válvula termostática com travamento parcial', subcauses: [] }
      ],
      material: [{ id: 'mt1', text: 'Óleo sintético com viscosidade alterada por contaminação', subcauses: ['Lote recebido sem laudo'] }],
      maodeobra: [{ id: 'mo1', text: 'Técnico de inspeção sem treinamento específico no modelo', subcauses: ['Matriz pendente'] }],
      medida: [{ id: 'md1', text: 'Sensor de temperatura do cabeçote com desvio de +8°C', subcauses: ['Calibração vencida'] }],
      meioambiente: [{ id: 'ma1', text: 'Temperatura ambiente na sala acima de 40°C', subcauses: ['Exaustor inoperante'] }]
    }
  },
  prensa: {
    caseName: 'Case 2: Prensa Hidráulica L-02',
    problem: 'Vazamento Crítico de Fluido Hidráulico na Prensa Principal',
    fishHead: 'Vazamento Óleo Prensa',
    causes: {
      metodo: [{ id: 'm1', text: 'Aperto de conexões flangeadas sem uso de torquímetro aferido', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Vibração excessiva na tubulação de alta pressão', subcauses: ['Abraçadeira quebrada'] }],
      material: [{ id: 'mt1', text: 'Vedação O-ring de nitrílica em local de alta temperatura', subcauses: ['Especificação exigia Viton'] }],
      maodeobra: [{ id: 'mo1', text: 'Montagem executada sob pressão de tempo na parada', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Manômetro com ponteiro travado no valor nominal', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Poeira metálica em suspensão danificando vedações', subcauses: [] }]
    }
  },
  qualidade: {
    caseName: 'Case 3: Linha de Laminação 02',
    problem: 'Desvio de Espessura e Defeito Superficial nas Chapas',
    fishHead: 'Desvio Espessura Chapas',
    causes: {
      metodo: [{ id: 'm1', text: 'Velocidade de laminação ajustada manualmente sem receita padrão', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Desgaste assimétrico nos cilindros laminadores', subcauses: [] }],
      material: [{ id: 'mt1', text: 'Bobina de matéria-prima com variação de dureza Rockwell', subcauses: [] }],
      maodeobra: [{ id: 'mo1', text: 'Operador não realizou medição de controle no início do turno', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Micrômetro digital descalibrado', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Variação térmica brusca no galpão durante a noite', subcauses: [] }]
    }
  },
  bomba: {
    caseName: 'Case 4: Bomba B-102',
    problem: 'Trava Repentina do Eixo por Cavitação na Bomba B-102',
    fishHead: 'Trava Eixo Bomba B-102',
    causes: {
      metodo: [{ id: 'm1', text: 'Partida da bomba com válvula de sucção parcialmente estrangulada', subcauses: [] }],
      maquina: [{ id: 'mq1', text: 'Rotor da bomba com erosão severa nas pás', subcauses: [] }],
      material: [{ id: 'mt1', text: 'Fluido com viscosidade e temperatura fora do ponto de projeto', subcauses: [] }],
      maodeobra: [{ id: 'mo1', text: 'Manobra de alinhamento executada por equipe sem supervisão', subcauses: [] }],
      medida: [{ id: 'md1', text: 'Manovacuômetro de sucção quebrado', subcauses: [] }],
      meioambiente: [{ id: 'ma1', text: 'Pressão de sucção NPSH disponível menor que NPSH requerido', subcauses: [] }]
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadPreset('compressor');
});

function renderIshikawa() {
  updateCaseName(state.caseName);
  updateProblemText(state.problemText);
  updateFishHeadText(state.fishHeadText);

  const categories = ['metodo', 'maquina', 'material', 'maodeobra', 'medida', 'meioambiente'];

  categories.forEach(cat => {
    const listEl  = document.getElementById(`list-${cat}`);
    const countEl = document.getElementById(`count-${cat}`);
    if (!listEl) return;

    listEl.innerHTML = '';
    const causeItems = state.causes[cat] || [];
    if (countEl) countEl.textContent = causeItems.length;

    causeItems.forEach((causeObj, idx) => {
      const li = document.createElement('li');
      li.className = 'cause-card';

      let subHtml = '';
      if (causeObj.subcauses && causeObj.subcauses.length > 0) {
        subHtml = `<ul class="sub-causes-list">
          ${causeObj.subcauses.map((sub, sIdx) => `
            <li class="sub-cause-item">
              <span>${escapeHTML(sub)}</span>
              <button class="btn-icon-sub" title="Excluir sub-causa" onclick="removeSubCause('${cat}', ${idx}, ${sIdx})">&times;</button>
            </li>
          `).join('')}
        </ul>`;
      }

      li.innerHTML = `
        <div class="cause-main-row">
          <span class="cause-text">${escapeHTML(causeObj.text)}</span>
          <div class="cause-actions">
            <button class="btn-icon-sub" title="Adicionar Sub-causa" onclick="openAddSubCausePrompt('${cat}', ${idx})">↳ +Sub</button>
            <button class="btn-icon-sub" title="Excluir Causa" onclick="removeCause('${cat}', ${idx})">&times;</button>
          </div>
        </div>
        ${subHtml}
      `;

      listEl.appendChild(li);
    });
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
}

function updateFishHeadText(val) {
  state.fishHeadText = val;
  const bannerInput = document.getElementById('fish-head-banner-input');
  const inlineInput = document.getElementById('fish-head-text-inline');
  if (bannerInput && bannerInput.value !== val) bannerInput.value = val;
  if (inlineInput && inlineInput.value !== val) inlineInput.value = val;
}

function loadPreset(key) {
  if (!presets[key]) return;
  const data = presets[key];

  state.caseName = data.caseName || 'Novo Case RCA';
  state.problemText = data.problem || 'Descrição do problema';
  state.fishHeadText = data.fishHead || 'Causa Raiz / Efeito';
  state.causes = JSON.parse(JSON.stringify(data.causes));

  renderIshikawa();
  showToast('Caso prático carregado!');
}

function openAddCauseModal(category = 'metodo') {
  document.getElementById('modal-cause-category').value = category;
  document.getElementById('modal-cause-text').value = '';
  document.getElementById('modal-subcause-text').value = '';
  document.getElementById('modal-cause').classList.add('active');
}

function closeCauseModal() {
  document.getElementById('modal-cause').classList.remove('active');
}

function saveCauseFromModal() {
  const cat = document.getElementById('modal-cause-category').value;
  const text = document.getElementById('modal-cause-text').value.trim();
  const subtext = document.getElementById('modal-subcause-text').value.trim();

  if (!text) {
    alert('Por favor, informe a descrição da causa.');
    return;
  }

  const newCause = {
    id: 'c_' + Date.now(),
    text: text,
    subcauses: subtext ? [subtext] : []
  };

  if (!state.causes[cat]) state.causes[cat] = [];
  state.causes[cat].push(newCause);

  closeCauseModal();
  renderIshikawa();
  showToast('Causa adicionada ao Diagrama de Ishikawa!');
}

function openAddSubCausePrompt(cat, causeIdx) {
  const subText = prompt('Digite a sub-causa / detalhe adicional:');
  if (subText && subText.trim()) {
    if (!state.causes[cat][causeIdx].subcauses) {
      state.causes[cat][causeIdx].subcauses = [];
    }
    state.causes[cat][causeIdx].subcauses.push(subText.trim());
    renderIshikawa();
    showToast('Sub-causa vinculada!');
  }
}

function removeCause(cat, causeIdx) {
  state.causes[cat].splice(causeIdx, 1);
  renderIshikawa();
}

function removeSubCause(cat, causeIdx, subIdx) {
  state.causes[cat][causeIdx].subcauses.splice(subIdx, 1);
  renderIshikawa();
}

function clearBoard() {
  if (confirm('Tem certeza que deseja limpar todo o Diagrama de Ishikawa?')) {
    state.caseName = 'Novo Case de Análise';
    state.problemText = 'Problema de Investigação RCA';
    state.fishHeadText = 'Efeito Principal';

    Object.keys(state.causes).forEach(cat => {
      state.causes[cat] = [];
    });

    renderIshikawa();
    showToast('Diagrama reiniciado!');
  }
}

async function exportJSON() {
  const defaultFilename = (state.caseName || 'Ishikawa_6M').replace(/[^a-z0-9_-]/gi, '_') + '.json';
  const jsonContent = JSON.stringify(state, null, 2);

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [{
          description: 'Arquivo JSON de Ishikawa (6M)',
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
      if (data.causes) {
        state.caseName = data.caseName || 'Case Importado';
        state.problemText = data.problemText || 'Descrição do Problema';
        state.fishHeadText = data.fishHeadText || 'Cabeça do Peixe';
        state.causes = data.causes;

        renderIshikawa();
        showToast('Diagrama de Ishikawa importado!');
      } else {
        alert('Arquivo JSON inválido para o Diagrama de Ishikawa.');
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

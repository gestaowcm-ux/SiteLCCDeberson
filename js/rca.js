// rca.js - Lógica do Dashboard de Metodologia RCA Redesenhado

// Banco de dados para a aba de Evidências (4Ps)
const evidenceData = {
  pessoas: `
    <h5 style="font-size:15px; font-weight:700; margin-bottom: 6px; color:var(--color-ink);">Pessoas (People)</h5>
    <p style="font-size:13px; color:var(--color-body); line-height:1.4;">
      <strong>O que coletar:</strong> Evidências Humanas. Relatos, depoimentos e conhecimento tácito da operação.
    </p>
    <ul style="font-size:13px; color:var(--color-ink); margin-left:20px; margin-top:6px; display:flex; flex-direction:column; gap:4px;">
      <li>Entrevistas individuais estruturadas (sem tom punitivo) com operadores e técnicos.</li>
      <li>Percepção de anomalias (ex: ruídos agudos ou vibrações registradas nos dias anteriores).</li>
      <li>Verificação de turnos de trabalho e histórico de treinamento da equipe técnica.</li>
    </ul>
  `,
  passado: `
    <h5 style="font-size:15px; font-weight:700; margin-bottom: 6px; color:var(--color-ink);">Passado (Past)</h5>
    <p style="font-size:13px; color:var(--color-body); line-height:1.4;">
      <strong>O que coletar:</strong> Evidências Estatísticas. Análise de tendências de parâmetros e histórico do ativo (Agudo vs. Crônico).
    </p>
    <ul style="font-size:13px; color:var(--color-ink); margin-left:20px; margin-top:6px; display:flex; flex-direction:column; gap:4px;">
      <li>Registros de telemetria (temperatura e vibração) no supervisório SCADA para análise de tendência.</li>
      <li>Histórico de ordens de serviço anteriores e falhas repetitivas do mesmo ativo.</li>
      <li>Frequência e severidade de eventos similares ocorridos no passado.</li>
    </ul>
  `,
  posicao: `
    <h5 style="font-size:15px; font-weight:700; margin-bottom: 6px; color:var(--color-ink);">Posição (Position)</h5>
    <p style="font-size:13px; color:var(--color-body); line-height:1.4;">
      <strong>O que coletar:</strong> Evidências Físicas. O registro fotográfico do Gemba e posição espacial dos componentes.
    </p>
    <ul style="font-size:13px; color:var(--color-ink); margin-left:20px; margin-top:6px; display:flex; flex-direction:column; gap:4px;">
      <li>Registro fotográfico do local no exato instante do evento ou abertura do mancal.</li>
      <li>Medição geométrica de desalinhamento dinâmico entre motor e bomba.</li>
      <li>Estado físico e posicionamento das partes fraturadas ou danificadas.</li>
    </ul>
  `,
  papel: `
    <h5 style="font-size:15px; font-weight:700; margin-bottom: 6px; color:var(--color-ink);">Papel (Paper)</h5>
    <p style="font-size:13px; color:var(--color-body); line-height:1.4;">
      <strong>O que coletar:</strong> Evidências Documentais. O como deveria ser feito vs. como foi feito (Manuais, OMs, projetos).
    </p>
    <ul style="font-size:13px; color:var(--color-ink); margin-left:20px; margin-top:6px; display:flex; flex-direction:column; gap:4px;">
      <li>Planos preventivos, procedimentos operacionais padrão e manuais técnicos do fabricante.</li>
      <li>Ordens de manutenção (OMs) anteriores preenchidas e registros de liberação.</li>
      <li>Cadastro e especificação técnica dos materiais no sistema ERP do Almoxarifado.</li>
    </ul>
  `
};

// Banco de dados para a aba de Análise (Método)
const methodDiagrams = {
  whys: `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-mute);">Estrutura Linear dos 5 Porquês</div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
        <div style="background:#f3f3f3; padding:6px; border-radius:4px; border-left:4px solid var(--color-danger);">
          <strong>Sintoma:</strong> Eixo da Bomba P-302 quebrou catastróficamente.
        </div>
        <div style="text-align:center; color:var(--color-mute); font-size:10px;">↓ (Por quê?)</div>
        <div style="background:#ffffff; padding:6px; border-radius:4px; border:1px solid var(--color-border);">
          <strong>1.</strong> Eixo exposto a estresse de flexão cíclica excessivo.
        </div>
        <div style="text-align:center; color:var(--color-mute); font-size:10px;">↓ (Por quê?)</div>
        <div style="background:#ffffff; padding:6px; border-radius:4px; border:1px solid var(--color-border);">
          <strong>2.</strong> Desalinhamento angular severo dinâmico no acoplamento.
        </div>
        <div style="text-align:center; color:var(--color-mute); font-size:10px;">↓ (Por quê?)</div>
        <div style="background:#ffffff; padding:6px; border-radius:4px; border:1px solid var(--color-border);">
          <strong>3.</strong> Alinhamento manual executado com régua visual na última preventiva.
        </div>
        <div style="text-align:center; color:var(--color-mute); font-size:10px;">↓ (Por quê?)</div>
        <div style="background:#ffffff; padding:6px; border-radius:4px; border:1px solid var(--color-border);">
          <strong>4.</strong> Alinhador a laser indisponível (calibração vencida) e sem reserva.
        </div>
        <div style="text-align:center; color:var(--color-mute); font-size:10px;">↓ (Por quê?)</div>
        <div style="background:#e6f4ea; padding:6px; border-radius:4px; border-left:4px solid var(--color-success);">
          <strong>5. (Causa Raiz):</strong> Falta de rotina de auditoria e contingência de ferramentas críticas no PCM.
        </div>
      </div>
    </div>
  `,
  ishikawa: `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-mute);">Ishikawa (Espinha de Peixe 6M)</div>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; font-size:11px;">
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Máquina:</strong> Alinhador laser quebrado; alta vibração mecânica na base metálica.
        </div>
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Método:</strong> Procedimento manual de régua visual permitido sem dupla assinatura.
        </div>
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Mão de Obra:</strong> Pressão para liberação rápida do ativo; falta de reciclagem no laser.
        </div>
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Material:</strong> Acoplamento de elastômero flexível montado com desgaste prévio.
        </div>
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Medição:</strong> Rota de vibração apenas mensal (incapaz de pegar variações rápidas).
        </div>
        <div style="background:#ffffff; padding:6px; border:1px solid var(--color-border); border-radius:4px;">
          <strong>Meio Ambiente:</strong> Espaço confinado do galpão de utilidades dificultando o acesso.
        </div>
      </div>
    </div>
  `,
  fta: `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-mute);">Árvore de Falhas (FTA) - Estrutura Lógica</div>
      <div style="font-size:11px; display:flex; flex-direction:column; gap:6px;">
        <div style="background:#fef2f2; border:1px solid #fee2e2; padding:6px; border-radius:4px; text-align:center; font-weight:700;">
          [T] Falha Funcional: Eixo Quebrado P-302
        </div>
        <div style="text-align:center; font-weight:bold; font-size:14px; margin:-4px 0; color:var(--color-primary);">[ PORTA OU ]</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
          <div style="background:#ffffff; border:1px solid var(--color-border); padding:4px; text-align:center; border-radius:4px;">
            [G1] Fadiga por Flexão
          </div>
          <div style="background:#f5f5f5; border:1px solid var(--color-border); padding:4px; text-align:center; border-radius:4px; color:var(--color-mute); text-decoration:line-through;">
            [G2] Sobrecarga Torque
          </div>
          <div style="background:#f5f5f5; border:1px solid var(--color-border); padding:4px; text-align:center; border-radius:4px; color:var(--color-mute); text-decoration:line-through;">
            [G3] Defeito Aço
          </div>
        </div>
        <div style="text-align:center; font-weight:bold; font-size:14px; margin:-4px 0; color:var(--color-primary);">[ PORTA E ]</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:4px; margin-left:15px; border-left: 2px dashed var(--color-mute); padding-left: 5px;">
          <div style="background:#e8f5e9; border:1.5px solid var(--color-success); padding:4px; text-align:center; border-radius:4px; font-weight:600;">
            [C1] Desalinhamento (Régua)
          </div>
          <div style="background:#ffffff; border:1px solid var(--color-border); padding:4px; text-align:center; border-radius:4px;">
            [C2] Esforço Cíclico Dinâmico
          </div>
        </div>
      </div>
    </div>
  `
};

// Estado da aplicação
let appState = {
  currentTab: 'problema',
  p1KeywordsChecked: {
    what: false,
    when: false,
    where: false,
    how: false
  },
  p2Selections: {
    custo: null,
    freq: null,
    seg: null
  },
  p3ActiveFolder: 'pessoas',
  p4ActiveMethod: 'whys',
  p5Actions: [], // { what, who, how, isRoot }
  p6FmeaRevised: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initRcaTabs();
  initP1ProblemEvaluator();
  initP2TriggerMatrix();
  initP3Folders();
  initP4Methods();
  initP5Planner();
  initP6Fmea();
});

// Controle Geral de Abas
function initRcaTabs() {
  const tabButtons = document.querySelectorAll('.investigator-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  const advanceButtons = document.querySelectorAll('.btn-advance-step');
  advanceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTab = btn.dataset.next;
      switchTab(nextTab);
    });
  });
}

function switchTab(tabId) {
  appState.currentTab = tabId;

  // Atualizar botões de aba
  document.querySelectorAll('.investigator-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Atualizar painéis de conteúdo
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `tab-content-${tabId}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Scroll suave para o painel
  const container = document.querySelector('.investigator-card');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Aba 1: Problema (5W2H Validator)
function initP1ProblemEvaluator() {
  const input = document.getElementById('p1-problem-input');
  const btnBad = document.getElementById('p1-preset-bad');
  const btnGood = document.getElementById('p1-preset-good');

  if (!input) return;

  const validateText = () => {
    const text = input.value.toLowerCase();
    
    // Análise simples de presença de palavras-chave
    appState.p1KeywordsChecked.what = /(bomba|eixo|compressor|mancal|motor|válvula)/.test(text);
    appState.p1KeywordsChecked.when = /(dia|às|10h|09\/07|horas|instante|histórico)/.test(text);
    appState.p1KeywordsChecked.where = /(utilidades|área|bombeamento|planta|almoxarifado|sala)/.test(text);
    appState.p1KeywordsChecked.how = /(uptime|interrompendo|reduzindo|perda|parada|desarme|%)/.test(text);

    // Calcular pontuação (0 a 100)
    let checksCount = 0;
    if (appState.p1KeywordsChecked.what) checksCount++;
    if (appState.p1KeywordsChecked.when) checksCount++;
    if (appState.p1KeywordsChecked.where) checksCount++;
    if (appState.p1KeywordsChecked.how) checksCount++;

    const pct = checksCount * 25;

    // Atualizar UI dos itens validados
    updateCheckState('p1-eval-what', appState.p1KeywordsChecked.what);
    updateCheckState('p1-eval-when', appState.p1KeywordsChecked.when);
    updateCheckState('p1-eval-where', appState.p1KeywordsChecked.where);
    updateCheckState('p1-eval-how', appState.p1KeywordsChecked.how);

    // Atualizar medidor de score
    const fill = document.getElementById('p1-score-fill');
    const label = document.getElementById('p1-score-label');

    if (fill && label) {
      fill.style.width = `${pct}%`;
      if (pct === 0) {
        label.textContent = 'Insuficiente';
        label.style.color = 'var(--color-danger)';
        fill.style.backgroundColor = 'var(--color-danger)';
      } else if (pct < 75) {
        label.textContent = 'Fraco';
        label.style.color = 'var(--color-warning)';
        fill.style.backgroundColor = 'var(--color-warning)';
      } else if (pct < 100) {
        label.textContent = 'Bom (Quase lá)';
        label.style.color = 'var(--color-success)';
        fill.style.backgroundColor = 'var(--color-success)';
      } else {
        label.textContent = 'Robusto (Excelente)';
        label.style.color = 'var(--color-success)';
        fill.style.backgroundColor = 'var(--color-success)';
      }
    }
  };

  input.addEventListener('input', validateText);

  // Botões rápidos
  if (btnBad) {
    btnBad.addEventListener('click', () => {
      input.value = "A máquina quebrou de novo de manhã.";
      validateText();
    });
  }

  if (btnGood) {
    btnGood.addEventListener('click', () => {
      input.value = "O eixo da Bomba Centrifuga P-302 quebrou no dia 09/07 às 10h na Área de Utilidades, interrompendo o bombeamento e reduzindo o Uptime da linha de água gelada em 40%.";
      validateText();
    });
  }
}

function updateCheckState(elementId, isChecked) {
  const el = document.getElementById(elementId);
  if (el) {
    if (isChecked) {
      el.classList.add('checked');
    } else {
      el.classList.remove('checked');
    }
  }
}

// Aba 2: Gatilhos (Trigger Grid)
function initP2TriggerMatrix() {
  const cells = document.querySelectorAll('.matrix-cell');
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const axis = cell.dataset.axis; // custo, freq, seg
      const val = cell.dataset.val; // baixo, medio, alto

      // Desmarcar outras células do mesmo eixo
      document.querySelectorAll(`.matrix-cell[data-axis="${axis}"]`).forEach(c => {
        c.classList.remove('selected', 'opt', 'man');
      });

      // Marcar célula atual
      cell.classList.add('selected');
      if (val === 'medio') cell.classList.add('opt');
      if (val === 'alto') cell.classList.add('man');

      // Guardar estado
      appState.p2Selections[axis] = val;

      calculateTriggerDecision();
    });
  });
}

function calculateTriggerDecision() {
  const s = appState.p2Selections;
  const statusEl = document.getElementById('p2-trigger-status');
  if (!statusEl) return;

  // Se algum eixo não foi selecionado ainda
  if (!s.custo || !s.freq || !s.seg) {
    statusEl.textContent = 'Selecione os parâmetros acima';
    statusEl.style.color = 'var(--color-mute)';
    return;
  }

  // Lógica de Gatilho
  // Se algum é alto -> RCA Mandatório
  if (s.custo === 'alto' || s.freq === 'alto' || s.seg === 'alto') {
    statusEl.textContent = 'RCA MANDATÓRIO (Abertura Imediata)';
    statusEl.style.color = 'var(--color-danger)';
  }
  // Caso contrário, se algum é médio -> RCA Opcional
  else if (s.custo === 'medio' || s.freq === 'medio' || s.seg === 'medio') {
    statusEl.textContent = 'RCA OPCIONAL (Revisar via PCM)';
    statusEl.style.color = 'var(--color-warning)';
  }
  // Se todos baixos -> Registro Simples
  else {
    statusEl.textContent = 'REGISTRO SIMPLES (Apenas OS corretiva)';
    statusEl.style.color = 'var(--color-body)';
  }
}

// Aba 3: Evidências (4Ps Folders)
function initP3Folders() {
  const cards = document.querySelectorAll('.folder-card');
  const box = document.getElementById('p3-folder-description-box');

  // Renderizar inicial
  if (box) {
    box.innerHTML = evidenceData[appState.p3ActiveFolder];
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const p = card.dataset.p;
      appState.p3ActiveFolder = p;

      // Atualizar classes ativas
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Atualizar caixa de texto
      if (box) {
        box.innerHTML = evidenceData[p];
      }
    });
  });
}

// Aba 4: Análise (Method Switcher)
function initP4Methods() {
  const buttons = document.querySelectorAll('.btn-method-tab');
  const canvas = document.getElementById('p4-diagram-canvas');

  // Inicial
  if (canvas) {
    canvas.innerHTML = methodDiagrams[appState.p4ActiveMethod];
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.method;
      appState.p4ActiveMethod = m;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (canvas) {
        canvas.innerHTML = methodDiagrams[m];
      }
    });
  });
}

// Aba 5: Plano de Ação (5W3H)
function initP5Planner() {
  const selectWhat = document.getElementById('p5-action-what');
  const selectWho = document.getElementById('p5-action-who');
  const selectHow = document.getElementById('p5-action-how');
  const btnAdd = document.getElementById('btn-p5-add-action');
  const btnClear = document.getElementById('btn-p5-clear');

  if (!btnAdd) return;

  btnAdd.addEventListener('click', () => {
    const whatText = selectWhat.options[selectWhat.selectedIndex].text;
    const whatVal = selectWhat.value;
    const whoText = selectWho.options[selectWho.selectedIndex].text;
    const howText = selectHow.options[selectHow.selectedIndex].text;

    // Verificar se é bloqueio de causa raiz (cadastro ou laser)
    const isRoot = (whatVal === 'viton' || whatVal === 'laser');

    // Evitar duplicados
    if (appState.p5Actions.some(a => a.what === whatText)) {
      return;
    }

    appState.p5Actions.push({
      what: whatText,
      who: whoText,
      how: howText,
      isRoot: isRoot
    });

    renderActionsTable();
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      appState.p5Actions = [];
      renderActionsTable();
    });
  }
}

function renderActionsTable() {
  const tbody = document.getElementById('p5-actions-table-body');
  const status = document.getElementById('p5-block-status');
  const count = document.getElementById('p5-action-count');

  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (appState.p5Actions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:var(--color-mute); font-style:italic;">Nenhuma ação inserida no plano de ação.</td>
      </tr>
    `;
    if (status) {
      status.textContent = 'Sintomático (Sem bloqueio da Causa Raiz)';
      status.style.color = 'var(--color-danger)';
    }
    if (count) count.textContent = '0 ações';
    return;
  }

  appState.p5Actions.forEach(act => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${act.what}</strong></td>
      <td>${act.who}</td>
      <td>${act.how}</td>
    `;
    tbody.appendChild(tr);
  });

  if (count) count.textContent = `${appState.p5Actions.length} ações`;

  // Calcular eficácia
  const hasRoot = appState.p5Actions.some(a => a.isRoot);
  if (status) {
    if (hasRoot) {
      status.textContent = 'Causa Raiz Bloqueada (Sucesso!)';
      status.style.color = 'var(--color-success)';
    } else {
      status.textContent = 'Sintomático (Sem bloqueio da Causa Raiz)';
      status.style.color = 'var(--color-danger)';
    }
  }
}

// Aba 6: Sustentabilidade (FMEA Loop)
function initP6Fmea() {
  const toggle = document.getElementById('p6-fmea-toggle');
  const controlCell = document.getElementById('p6-control-cell');
  const occCell = document.getElementById('p6-occ-cell');
  const detCell = document.getElementById('p6-det-cell');
  const rpnCell = document.getElementById('p6-rpn-cell');
  const descCell = document.getElementById('p6-fmea-status-desc');
  const banner = document.getElementById('p6-finish-banner');

  if (!toggle) return;

  toggle.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    appState.p6FmeaRevised = isChecked;

    if (isChecked) {
      // Valores pós-RCA aplicados
      if (controlCell) controlCell.textContent = 'Alinhador laser digital + Procedimento de Auditoria de Ferramental';
      if (occCell) occCell.textContent = '2 (Raro)';
      if (detCell) detCell.textContent = '3 (Alto Controle)';
      if (rpnCell) {
        rpnCell.textContent = '48';
        rpnCell.className = 'fmea-badge-rpn safe';
      }
      if (descCell) {
        descCell.innerHTML = '<strong>FMEA Atualizado!</strong> Ações preventivas de causa raiz registradas. Risco Prioritário RPN reduzido em <strong>87.5%</strong>. Loop de Confiabilidade Sustentável fechado.';
      }
      if (banner) {
        banner.style.display = 'flex';
        // Scroll suave até o banner
        setTimeout(() => {
          banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    } else {
      // Valores originais
      if (controlCell) controlCell.textContent = 'Alinhamento manual com régua visual';
      if (occCell) occCell.textContent = '8 (Alta)';
      if (detCell) detCell.textContent = '6 (Médio-Baixo)';
      if (rpnCell) {
        rpnCell.textContent = '384';
        rpnCell.className = 'fmea-badge-rpn critical';
      }
      if (descCell) {
        descCell.textContent = 'Ações recomendadas pendentes de inserção no FMEA. Risco crítico alto ativo na planta.';
      }
      if (banner) {
        banner.style.display = 'none';
      }
    }
  });
}

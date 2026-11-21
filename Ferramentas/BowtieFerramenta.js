// BowtieFerramenta.js — Gerenciador da Ferramenta Bowtie (Mindmap Interativo RCA)
// Suporta SOD FMEA (1-10), Tonalidades de Status de Barreiras, Escala de Impacto (1-5) e Traçado de Arestas SVG

export const DEFAULT_TEMPLATES = [
  {
    id: 'gas-leak-petrochemical',
    title: 'Vazamento de Gás Inflamável em Vaso de Pressão',
    description: 'Análise de Segurança de Processos para contenção de GLP e risco de explosão (BLEVE).',
    industry: 'Petroquímica / Óleo & Gás',
    diagram: {
      id: 'diag-01',
      title: 'Vazamento de Gás Inflamável (GLP) em Vaso V-102',
      centralEvent: {
        id: 'ce-01',
        code: 'EV-01',
        title: 'PERDA DE CONTENÇÃO DE GÁS GLP (FALHA CENTRAL)',
        hazard: 'Presença de hidrocarbonetos sob alta pressão (28 bar)',
        description: 'Liberação não controlada de gás inflamável para a atmosfera da planta através de trinca ou falha de vedação no vaso V-102.',
        location: 'Vaso V-102 / Setor de Armazenamento A-04',
        system: 'Sistema de Estocagem Pressurizada'
      },
      threats: [
        { id: 'th-01', code: 'AM-01', title: 'Sobrepressão interna no vaso V-102', description: 'Surto de pressão acima do PMTA (32 bar).', sod: { severity: 8, occurrence: 5, detection: 3, rpn: 120 }, barrierIds: ['bp-01', 'bp-02'] },
        { id: 'th-02', code: 'AM-02', title: 'Corrosão severa por H2S em solda', description: 'Desgaste metálico acentuado ao longo de 5 anos.', sod: { severity: 9, occurrence: 4, detection: 6, rpn: 216 }, barrierIds: ['bp-03', 'bp-04'] },
        { id: 'th-03', code: 'AM-03', title: 'Impacto mecânico por empilhadeira', description: 'Aproximação indevida de veículo pesado.', sod: { severity: 7, occurrence: 3, detection: 2, rpn: 42 }, barrierIds: ['bp-05'] }
      ],
      preventiveBarriers: [
        { id: 'bp-01', code: 'BP-01', title: 'Válvula de Segurança PSV-102', description: 'Abertura mecânica automática a 30 bar.', status: 'IMPLEMENTED', responsible: 'Manutenção Mecânica' },
        { id: 'bp-02', code: 'BP-02', title: 'Intertrava PSHH-102 (Trip Auto)', description: 'Corte automático com redundância SIL-2.', status: 'IMPLEMENTED', responsible: 'Automação' },
        { id: 'bp-03', code: 'BP-03', title: 'Inspeção por Ultrassom NR-13', description: 'Medição periódica de espessura de parede.', status: 'IMPLEMENTED', responsible: 'Inspeção' },
        { id: 'bp-04', code: 'BP-04', title: 'Injeção de Inibidor de Corrosão', description: 'Dosagem contínua para mitigar H2S.', status: 'NOT_IMPLEMENTED', responsible: 'Eng. Química' },
        { id: 'bp-05', code: 'BP-05', title: 'Guard-Rails de Concreto Reforçado', description: 'Proteção perimetral rígida contra choques.', status: 'IMPLEMENTED', responsible: 'Facilities' }
      ],
      mitigationBarriers: [
        { id: 'bm-01', code: 'BM-01', title: 'Detectores de Gás & Alarme Sonoro', description: 'Sensores catalíticos disparando sirene.', status: 'IMPLEMENTED', responsible: 'Operação' },
        { id: 'bm-02', code: 'BM-02', title: 'Sistema Delúgio (Cortina D\'Água)', description: 'Aspersão automática para diluição de nuvem.', status: 'IMPLEMENTED', responsible: 'Brigada / SMS' },
        { id: 'bm-03', code: 'BM-03', title: 'Válvula de Bloqueio Remoto SDV-102', description: 'Isolamento pneumático acionado da sala de controle.', status: 'NOT_IMPLEMENTED', responsible: 'Instrumentação' },
        { id: 'bm-04', code: 'BM-04', title: 'Plano de Emergência (PAE) & Brigada', description: 'Procedimento de evacuação e resposta.', status: 'IMPLEMENTED', responsible: 'SMS' }
      ],
      consequences: [
        { id: 'cs-01', code: 'CQ-01', title: 'Incêndio em Nuvem / Explosão VCE', description: 'Ignição causando onda de choque.', severityImpact: 5, mitigationBarrierIds: ['bm-01', 'bm-02', 'bm-03'] },
        { id: 'cs-02', code: 'CQ-02', title: 'Intoxicação de Operadores', description: 'Exposição de pessoal no raio próximo.', severityImpact: 4, mitigationBarrierIds: ['bm-01', 'bm-04'] },
        { id: 'cs-03', code: 'CQ-03', title: 'Paralisação Total da Unidade', description: 'Interrupção por mais de 15 dias.', severityImpact: 3, mitigationBarrierIds: ['bm-03'] },
        { id: 'cs-04', code: 'CQ-04', title: 'Interdição do Órgão Ambiental', description: 'Autuação por emissão não autorizada.', severityImpact: 2, mitigationBarrierIds: ['bm-02', 'bm-04'] }
      ]
    }
  },
  {
    id: 'electrical-substation',
    title: 'Sobrecarga e Arco Elétrico em Subestação Principal',
    description: 'Análise RCA para prevenção de incêndios elétricos e blackouts industriais.',
    industry: 'Energia / Siderurgia',
    diagram: {
      id: 'diag-02',
      title: 'Sobrecarga e Arco Elétrico em Painel MT 13.8kV',
      centralEvent: {
        id: 'ce-02',
        code: 'EV-02',
        title: 'EXPLOSÃO POR ARCO ELÉTRICO EM PAINEL MT',
        hazard: 'Tensão nominal 13.8 kV e alta corrente de curto (25 kA)',
        description: 'Desenvolvimento de arco elétrico no cubículo do disjuntor de entrada.',
        location: 'Sala SE-01',
        system: 'Distribuição Elétrica'
      },
      threats: [
        { id: 'th-21', code: 'AM-01', title: 'Infiltração de umidade no teto da sala', description: 'Degradação da manta asfáltica da cobertura.', sod: { severity: 9, occurrence: 6, detection: 4, rpn: 216 }, barrierIds: ['bp-21', 'bp-22'] },
        { id: 'th-22', code: 'AM-02', title: 'Surto de tensão por raio na linha', description: 'Sobretensão sem desvio adequado no para-raios.', sod: { severity: 8, occurrence: 4, detection: 2, rpn: 64 }, barrierIds: ['bp-23'] },
        { id: 'th-23', code: 'AM-03', title: 'Aperto inadequado em conexões elétricas', description: 'Torque insuficiente causando ponto quente.', sod: { severity: 9, occurrence: 5, detection: 7, rpn: 315 }, barrierIds: ['bp-24'] }
      ],
      preventiveBarriers: [
        { id: 'bp-21', code: 'BP-01', title: 'Impermeabilização com Calha Externa', description: 'Drenagem fora do prédio elétrico.', status: 'NOT_IMPLEMENTED', responsible: 'Obras Civil' },
        { id: 'bp-22', code: 'BP-02', title: 'Sensores Infrarevermelhos de Temp', description: 'Monitoramento contínuo em tempo real.', status: 'IMPLEMENTED', responsible: 'Automação' },
        { id: 'bp-23', code: 'BP-03', title: 'Para-raios de Óxido de Zinco', description: 'Desvio automático de surtos de tensão.', status: 'IMPLEMENTED', responsible: 'Manutenção' },
        { id: 'bp-24', code: 'BP-04', title: 'Termografia Preditiva Mensal', description: 'Mapeamento infravermelho prévio.', status: 'IMPLEMENTED', responsible: 'Preditiva' }
      ],
      mitigationBarriers: [
        { id: 'bm-21', code: 'BM-01', title: 'Proteção Óptica Arc-Flash Ultra-Rápida', description: 'Desarme em menos de 40ms.', status: 'IMPLEMENTED', responsible: 'Proteção Elétrica' },
        { id: 'bm-22', code: 'BM-02', title: 'Supressão por Gás Extintor Novec 1230', description: 'Extinção sem resíduos condutivos.', status: 'NOT_IMPLEMENTED', responsible: 'Eng. Incêndio' },
        { id: 'bm-23', code: 'BM-03', title: 'Vestimenta Arc-Flash Risco 4 (40 cal/cm²)', description: 'EPI contra queimaduras térmicas.', status: 'IMPLEMENTED', responsible: 'SMS' }
      ],
      consequences: [
        { id: 'cs-21', code: 'CQ-01', title: 'Queimadura Grave / Óbito de Eletricista', description: 'Efeito térmico severo do arco.', severityImpact: 5, mitigationBarrierIds: ['bm-21', 'bm-23'] },
        { id: 'cs-22', code: 'CQ-02', title: 'Destruição do Painel MT & Blackout', description: 'Perda total do cubículo de MT.', severityImpact: 4, mitigationBarrierIds: ['bm-21', 'bm-22'] }
      ]
    }
  }
];

export const SOD_SEVERITY_DESCRIPTIONS = {
  1: { title: 'Mínimo', desc: 'Insignificante. Sem lesões ou impacto perceptível na operação.' },
  2: { title: 'Muito Leve', desc: 'Impacto menor. Primeiros socorros sem afastamento, parada pontual < 15 min.' },
  3: { title: 'Leve', desc: 'Pequenos danos materiais, tratamento médico simples sem afastamento.' },
  4: { title: 'Moderado Baixo', desc: 'Lesão leve com afastamento temporário ou parada parcial da unidade.' },
  5: { title: 'Moderado', desc: 'Dano moderado ao patrimônio ou lesão moderada reversível.' },
  6: { title: 'Significativo', desc: 'Afastamento prolongado, danos significativos a equipamentos críticos.' },
  7: { title: 'Alto', desc: 'Lesão grave incapacitante, vazamento contido dentro do limite da planta.' },
  8: { title: 'Muito Alto', desc: 'Potencial de fatalidade individual, vazamento externo com impacto ambiental.' },
  9: { title: 'Grave / Crítico', desc: 'Múltiplas fatalidades potenciais ou destruição de ativos principais.' },
  10: { title: 'Catastrófico', desc: 'Múltiplas fatalidades reais, vazamento de grande porte externo sem contenção.' }
};

export const SOD_OCCURRENCE_DESCRIPTIONS = {
  1: { title: 'Extremamente Remoto', desc: 'Nunca registrado na indústria ou probabilidade < 1 em 1.000.000 horas.' },
  2: { title: 'Muito Remoto', desc: 'Ocorrência hipotética raríssima (< 1 vez a cada 10 anos na planta).' },
  3: { title: 'Remoto', desc: 'Pouco provável. Ocorreu poucas vezes na história do setor.' },
  4: { title: 'Baixa', desc: 'Ocorrência isolada registrada uma vez a cada 3 a 5 anos.' },
  5: { title: 'Ocasional', desc: 'Pode ocorrer cerca de 1 vez ao ano na unidade operacional.' },
  6: { title: 'Moderada', desc: 'Ocorrências repetidas. Registrado de 2 a 5 vezes por ano.' },
  7: { title: 'Frequente Baixa', desc: 'Ocorre com frequência regular (mensalmente sob certas condições).' },
  8: { title: 'Frequente', desc: 'Alta probabilidade de falha, ocorrendo várias vezes no ano.' },
  9: { title: 'Muito Frequente', desc: 'Quase certo de ocorrer sob condições rotineiras de operação.' },
  10: { title: 'Contínua / Inevitável', desc: 'Falha sistemática ou recorrente semanalmente sem controle.' }
};

export const SOD_DETECTION_DESCRIPTIONS = {
  1: { title: 'Detecção Certa (100%)', desc: 'Sistema automático redundante com intertravamento e parada imediata.' },
  2: { title: 'Muito Alta', desc: 'Sensores automáticos triplicados com alarme audível e visual na sala de controle.' },
  3: { title: 'Alta', desc: 'Sensores duplos confiáveis com alarme contínuo para operadores.' },
  4: { title: 'Moderada Alta', desc: 'Instrumentação dedicada com verificação automática e rotina de teste.' },
  5: { title: 'Moderada', desc: 'Medição manual frequente ou alarme simples em painel local.' },
  6: { title: 'Baixa Moderada', desc: 'Detecção por inspeção de rotina visual do operador durante o turno.' },
  7: { title: 'Baixa', desc: 'Depende exclusivamente de percepção sensorial humana (ruído, cheiro, fumaça).' },
  8: { title: 'Muito Baixa', desc: 'Dificuldade alta de detecção, exige testes de laboratório ou amostragem.' },
  9: { title: 'Extremamente Remota', desc: 'Detecção quase impossível até que o evento principal já tenha ocorrido.' },
  10: { title: 'Sem Detecção (0%)', desc: 'Não há qualquer meio ou instrumento capaz de detectar a anomalia.' }
};

export class BowtieMindmapManager {
  constructor() {
    this.scenarios = [];
    this.currentDiagram = null;
    this.hoveredNodeId = null;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.renderTemplateOptions();
    this.render();
  }

  loadFromStorage() {
    try {
      const savedScenarios = localStorage.getItem('bowtie_mindmap_all_scenarios');
      if (savedScenarios) {
        const parsed = JSON.parse(savedScenarios);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.scenarios = parsed;
        }
      }

      if (!this.scenarios || this.scenarios.length === 0) {
        this.scenarios = DEFAULT_TEMPLATES.map(t => ({
          id: t.id,
          title: t.title,
          diagram: JSON.parse(JSON.stringify(t.diagram))
        }));
      }

      const activeId = localStorage.getItem('bowtie_mindmap_active_id');
      let activeItem = this.scenarios.find(s => s.id === activeId);
      if (!activeItem) activeItem = this.scenarios[0];

      this.currentDiagram = JSON.parse(JSON.stringify(activeItem.diagram || activeItem));
    } catch (e) {
      console.warn('Erro ao carregar localStorage:', e);
      this.scenarios = DEFAULT_TEMPLATES.map(t => ({
        id: t.id,
        title: t.title,
        diagram: JSON.parse(JSON.stringify(t.diagram))
      }));
      this.currentDiagram = JSON.parse(JSON.stringify(this.scenarios[0].diagram));
    }
  }

  saveToStorage() {
    try {
      if (!this.currentDiagram) return;

      const idx = this.scenarios.findIndex(s => s.id === this.currentDiagram.id);
      const scenarioObj = {
        id: this.currentDiagram.id,
        title: this.currentDiagram.title || 'Cenário',
        diagram: this.currentDiagram
      };

      if (idx >= 0) {
        this.scenarios[idx] = scenarioObj;
      } else {
        this.scenarios.push(scenarioObj);
      }

      localStorage.setItem('bowtie_mindmap_all_scenarios', JSON.stringify(this.scenarios));
      localStorage.setItem('bowtie_mindmap_active_id', this.currentDiagram.id);
    } catch (e) {
      console.warn('Erro ao salvar localStorage:', e);
    }
  }

  bindEvents() {
    const select = document.getElementById('template-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const selectedScen = this.scenarios.find(s => s.id === e.target.value);
        if (selectedScen) {
          this.currentDiagram = JSON.parse(JSON.stringify(selectedScen.diagram || selectedScen));
          this.saveToStorage();
          this.render();
        }
      });
    }

    document.getElementById('btn-add-scenario')?.addEventListener('click', () => this.addNewScenario());
    document.getElementById('btn-add-node')?.addEventListener('click', () => this.openNodeEditor());
    document.getElementById('btn-sod-matrix')?.addEventListener('click', () => this.openSodMatrix());
    document.getElementById('btn-rca-summary')?.addEventListener('click', () => this.openRcaSummary());
    document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJson());
    document.getElementById('btn-edit-central')?.addEventListener('click', () => this.openNodeEditor('CENTRAL_EVENT', this.currentDiagram.centralEvent.id));

    const btnImp = document.getElementById('btn-import-json');
    const inputImp = document.getElementById('input-import-file');
    if (btnImp && inputImp) {
      btnImp.addEventListener('click', () => inputImp.click());
      inputImp.addEventListener('change', (e) => this.importJson(e));
    }

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-close');
        document.getElementById(modalId)?.classList.remove('active');
      });
    });

    document.getElementById('node-edit-type')?.addEventListener('change', (e) => {
      const type = e.target.value;
      const isThreat = type === 'THREAT';
      const isBarrier = type === 'PREVENTIVE' || type === 'PREVENTIVE_BARRIER' || type === 'MITIGATION' || type === 'MITIGATION_BARRIER';
      const isConsequence = type === 'CONSEQUENCE';

      const groupSodThreat = document.getElementById('group-sod-threat');
      if (groupSodThreat) groupSodThreat.style.display = isThreat ? 'flex' : 'none';

      const groupLinkPrev = document.getElementById('group-link-preventive');
      if (groupLinkPrev) groupLinkPrev.style.display = isThreat ? 'block' : 'none';

      const groupLinkMit = document.getElementById('group-link-mitigation');
      if (groupLinkMit) groupLinkMit.style.display = isConsequence ? 'block' : 'none';

      const groupBarrierStatus = document.getElementById('group-barrier-status');
      if (groupBarrierStatus) groupBarrierStatus.style.display = isBarrier ? 'block' : 'none';
    });

    document.getElementById('btn-edit-scenario')?.addEventListener('click', () => this.renameScenario());
    document.getElementById('btn-save-node')?.addEventListener('click', () => this.handleSaveNode());
    document.getElementById('btn-clear-diagram')?.addEventListener('click', () => this.clearDiagram());

    window.addEventListener('resize', () => this.drawConnections());

    const container = document.getElementById('mindmap-container');
    if (container) {
      container.addEventListener('scroll', () => this.drawConnections());
    }
  }

  addNewScenario() {
    const rawTitle = prompt('Informe o nome do novo Cenário de Análise:', 'Novo Cenário Bowtie');
    if (!rawTitle || rawTitle.trim() === '') return;
    const title = rawTitle.trim();

    const newId = `diag-${Date.now()}`;
    const newDiagram = {
      id: newId,
      title: title,
      centralEvent: {
        id: `ce-${Date.now()}`,
        code: 'EV-01',
        title: 'EVENTO CENTRAL / FALHA FOCO',
        hazard: 'Descreva o perigo associado ao cenário',
        description: 'Clique em Editar para personalizar o evento central da análise.',
        location: 'Geral',
        system: 'Sistema Principal'
      },
      threats: [],
      preventiveBarriers: [],
      mitigationBarriers: [],
      consequences: []
    };

    this.scenarios.push({
      id: newId,
      title: title,
      diagram: newDiagram
    });

    this.currentDiagram = newDiagram;
    this.saveToStorage();
    this.renderTemplateOptions();
    this.render();
    alert(`Novo cenário "${title}" adicionado e salvo com sucesso!`);
  }

  renderTemplateOptions() {
    const select = document.getElementById('template-select');
    if (!select) return;

    select.innerHTML = this.scenarios.map(s => {
      const title = s.title || s.diagram?.title || 'Cenário Sem Título';
      return `<option value="${s.id}">${title}</option>`;
    }).join('');

    if (this.currentDiagram && this.currentDiagram.id) {
      select.value = this.currentDiagram.id;
    }
  }

  render() {
    const d = this.currentDiagram;
    if (!d) return;

    // Header central
    document.getElementById('display-event-title').innerText = `⚠ ${d.centralEvent.title}`;
    document.getElementById('display-event-desc').innerText = d.centralEvent.description;
    document.getElementById('display-event-system').innerText = `Sistema: ${d.centralEvent.system || 'N/A'}`;
    document.getElementById('display-event-location').innerText = `Local: ${d.centralEvent.location || 'N/A'}`;
    document.getElementById('central-card-title').innerText = d.centralEvent.title;

    // Coluna 1: Ameaças
    const colThreats = document.getElementById('col-threats');
    if (colThreats) {
      colThreats.innerHTML = `
        <div class="column-header">
          <div class="header-label-group">
            <span class="header-icon">🛡</span>
            <span>1. AMEAÇAS (CAUSAS)</span>
          </div>
          <button class="btn-col-quick-add-dark" data-type="THREAT" title="Adicionar Nova Ameaça">+</button>
        </div>
      ` + d.threats.map(t => {
        const sod = t.sod || { rpn: 125 };
        return `
          <div class="mindmap-node-card" id="node-${t.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="node-code-badge">${t.code || 'AM'}</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                <button class="btn-pill btn-open-sod-single" data-threat-id="${t.id}" style="font-size: 10px; padding: 2px 6px;">
                  RPN: ${sod.rpn}
                </button>
                <button class="btn-pill btn-edit-node-card" data-type="THREAT" data-node-id="${t.id}" style="font-size: 10px; padding: 2px 6px;">
                  ✏️ Editar
                </button>
              </div>
            </div>
            <h4 class="node-title">${t.title}</h4>
            <p class="node-desc">${t.description}</p>
            <div style="font-size: 10px; color: var(--color-body); margin-top: 2px;">
              🔗 ${t.barrierIds?.length || 0} barreira(s) vinculada(s)
            </div>
          </div>
        `;
      }).join('');
    }

    // Coluna 2: Barreiras Preventivas
    const colPrev = document.getElementById('col-prev-barriers');
    if (colPrev) {
      colPrev.innerHTML = `
        <div class="column-header">
          <div class="header-label-group">
            <span class="header-icon">🛡</span>
            <span>2. BARREIRAS PREVENTIVAS</span>
          </div>
          <button class="btn-col-quick-add-dark" data-type="PREVENTIVE_BARRIER" title="Adicionar Barreira Preventiva">+</button>
        </div>
      ` + d.preventiveBarriers.map(b => {
        const st = b.status || 'IMPLEMENTED';
        const cardClass = st === 'IMPLEMENTED' ? 'barrier-card-implemented' : (st === 'DEGRADED' ? 'barrier-card-degraded' : 'barrier-card-not-implemented');
        return `
          <div class="mindmap-node-card ${cardClass}" id="node-${b.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="node-code-badge">${b.code || 'BP'}</span>
              <button class="btn-pill btn-edit-node-card" data-type="PREVENTIVE_BARRIER" data-node-id="${b.id}" style="font-size: 10px; padding: 2px 6px;">
                ✏️ Editar
              </button>
            </div>
            <h4 class="node-title">${b.title}</h4>
            <p class="node-desc">${b.description}</p>
            <div class="barrier-status-toggle">
              <button class="btn-status-toggle ${st === 'IMPLEMENTED' ? 'active-implemented' : ''}" data-barrier-id="${b.id}" data-type="PREVENTIVE" data-status="IMPLEMENTED">
                Implementada
              </button>
              <button class="btn-status-toggle ${st === 'DEGRADED' ? 'active-degraded' : ''}" data-barrier-id="${b.id}" data-type="PREVENTIVE" data-status="DEGRADED">
                Degradada
              </button>
              <button class="btn-status-toggle ${st === 'NOT_IMPLEMENTED' ? 'active-not-implemented' : ''}" data-barrier-id="${b.id}" data-type="PREVENTIVE" data-status="NOT_IMPLEMENTED">
                Não Implementada
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Coluna 3: Evento Central (Falha) Header
    const colCentral = document.getElementById('col-central-event');
    if (colCentral) {
      const centralHeader = colCentral.querySelector('.column-header');
      if (centralHeader) {
        centralHeader.innerHTML = `
          <div class="header-label-group">
            <span class="header-icon">💥</span>
            <span>3. EVENTO CENTRAL (FALHA)</span>
          </div>
        `;
      }
    }

    // Coluna 4: Barreiras Mitigadoras
    const colMit = document.getElementById('col-mit-barriers');
    if (colMit) {
      colMit.innerHTML = `
        <div class="column-header">
          <div class="header-label-group">
            <span class="header-icon">🛡</span>
            <span>4. BARREIRAS MITIGADORAS</span>
          </div>
          <button class="btn-col-quick-add-dark" data-type="MITIGATION_BARRIER" title="Adicionar Barreira Mitigadora">+</button>
        </div>
      ` + d.mitigationBarriers.map(b => {
        const st = b.status || 'IMPLEMENTED';
        const cardClass = st === 'IMPLEMENTED' ? 'barrier-card-implemented' : (st === 'DEGRADED' ? 'barrier-card-degraded' : 'barrier-card-not-implemented');
        return `
          <div class="mindmap-node-card ${cardClass}" id="node-${b.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="node-code-badge">${b.code || 'BM'}</span>
              <button class="btn-pill btn-edit-node-card" data-type="MITIGATION_BARRIER" data-node-id="${b.id}" style="font-size: 10px; padding: 2px 6px;">
                ✏️ Editar
              </button>
            </div>
            <h4 class="node-title">${b.title}</h4>
            <p class="node-desc">${b.description}</p>
            <div class="barrier-status-toggle">
              <button class="btn-status-toggle ${st === 'IMPLEMENTED' ? 'active-implemented' : ''}" data-barrier-id="${b.id}" data-type="MITIGATION" data-status="IMPLEMENTED">
                Implementada
              </button>
              <button class="btn-status-toggle ${st === 'DEGRADED' ? 'active-degraded' : ''}" data-barrier-id="${b.id}" data-type="MITIGATION" data-status="DEGRADED">
                Degradada
              </button>
              <button class="btn-status-toggle ${st === 'NOT_IMPLEMENTED' ? 'active-not-implemented' : ''}" data-barrier-id="${b.id}" data-type="MITIGATION" data-status="NOT_IMPLEMENTED">
                Não Implementada
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Coluna 5: Consequências
    const colCq = document.getElementById('col-consequences');
    if (colCq) {
      colCq.innerHTML = `
        <div class="column-header">
          <div class="header-label-group">
            <span class="header-icon">⚠</span>
            <span>5. CONSEQUÊNCIAS</span>
          </div>
          <button class="btn-col-quick-add-dark" data-type="CONSEQUENCE" title="Adicionar Consequência">+</button>
        </div>
      ` + d.consequences.map(c => {
        const sev = c.severityImpact || 3;
        const cardClass = `consequence-severity-${sev}`;
        return `
          <div class="mindmap-node-card ${cardClass}" id="node-${c.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="node-code-badge">${c.code || 'CQ'}</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                <span style="font-size: 10px; font-weight: 800;">Impacto ${sev}/5</span>
                <button class="btn-pill btn-edit-node-card" data-type="CONSEQUENCE" data-node-id="${c.id}" style="font-size: 10px; padding: 2px 6px;">
                  ✏️ Editar
                </button>
              </div>
            </div>
            <h4 class="node-title">${c.title}</h4>
            <p class="node-desc">${c.description}</p>

            <!-- Escala de Gravidade 1 a 5 -->
            <div style="font-size: 10px; font-weight: 700; margin-top: 2px;">Nível de Gravidade:</div>
            <div class="severity-scale-container">
              ${[1,2,3,4,5].map(step => `
                <button class="btn-severity-step" data-consequence-id="${c.id}" data-step="${step}" style="${step === sev ? 'background: var(--color-primary); color: #fff; border-color: var(--color-primary);' : ''}">
                  ${step}
                </button>
              `).join('')}
            </div>

            <div style="font-size: 10px; color: var(--color-body); margin-top: 2px;">
              🛡 ${c.mitigationBarrierIds?.length || 0} mitigadora(s) vinculada(s)
            </div>
          </div>
        `;
      }).join('');
    }

    this.bindCardEvents();
    setTimeout(() => this.drawConnections(), 100);
  }

  bindCardEvents() {
    // Botões rápidos de adição direta no topo de cada coluna
    document.querySelectorAll('.btn-col-quick-add-dark, .btn-col-quick-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-type');
        this.openNodeEditor(type, null);
      });
    });

    // Botões de edição direta em qualquer caixa
    document.querySelectorAll('.btn-edit-node-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-type');
        const id = e.currentTarget.getAttribute('data-node-id');
        this.openNodeEditor(type, id);
      });
    });
    // Buttons de toggle de status da barreira
    document.querySelectorAll('.btn-status-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-barrier-id');
        const type = e.currentTarget.getAttribute('data-type');
        const status = e.currentTarget.getAttribute('data-status');

        if (type === 'PREVENTIVE') {
          const b = this.currentDiagram.preventiveBarriers.find(item => item.id === id);
          if (b) b.status = status;
        } else {
          const b = this.currentDiagram.mitigationBarriers.find(item => item.id === id);
          if (b) b.status = status;
        }

        this.saveToStorage();
        this.render();
      });
    });

    // Buttons de escala de gravidade 1-5
    document.querySelectorAll('.btn-severity-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-consequence-id');
        const step = parseInt(e.currentTarget.getAttribute('data-step'), 10);

        const cq = this.currentDiagram.consequences.find(item => item.id === id);
        if (cq) cq.severityImpact = step;

        this.saveToStorage();
        this.render();
      });
    });

    // Button individual de SOD por Ameaça
    document.querySelectorAll('.btn-open-sod-single').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSodMatrix();
      });
    });
  }

  drawConnections() {
    const container = document.getElementById('mindmap-container');
    const svg = document.getElementById('mindmap-svg-overlay');
    if (!container || !svg) return;

    svg.setAttribute('width', `${Math.max(container.scrollWidth, container.clientWidth)}px`);
    svg.setAttribute('height', `${Math.max(container.scrollHeight, container.clientHeight)}px`);

    const cRect = container.getBoundingClientRect();
    const d = this.currentDiagram;
    let pathsHtml = `
      <defs>
        <marker id="arrow-mindmap-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#64748b" />
        </marker>
        <marker id="arrow-mindmap-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#dc2626" />
        </marker>
      </defs>
    `;

    const getAnchor = (id, side) => {
      const el = document.getElementById(`node-${id}`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      let x = side === 'LEFT' ? r.left - cRect.left : (side === 'RIGHT' ? r.right - cRect.left : r.left + r.width / 2 - cRect.left);
      let y = r.top + r.height / 2 - cRect.top;
      return { x, y };
    };

    const centralId = d.centralEvent.id;
    const centralLeft = getAnchor('central-event', 'LEFT') || getAnchor(centralId, 'LEFT');
    const centralRight = getAnchor('central-event', 'RIGHT') || getAnchor(centralId, 'RIGHT');

    // 1. Ameaças -> Barreiras Preventivas
    d.threats.forEach(t => {
      const tAnchor = getAnchor(t.id, 'RIGHT');
      if (!tAnchor) return;

      const linked = d.preventiveBarriers.filter(pb => (t.barrierIds || []).includes(pb.id));
      linked.forEach(pb => {
        const pbAnchor = getAnchor(pb.id, 'LEFT');
        if (pbAnchor) {
          const dx = (pbAnchor.x - tAnchor.x) / 2;
          const isCracked = pb.status === 'NOT_IMPLEMENTED';
          const stroke = isCracked ? '#dc2626' : '#64748b';
          const marker = isCracked ? 'url(#arrow-mindmap-red)' : 'url(#arrow-mindmap-gray)';
          pathsHtml += `<path d="M ${tAnchor.x},${tAnchor.y} C ${tAnchor.x + dx},${tAnchor.y} ${pbAnchor.x - dx},${pbAnchor.y} ${pbAnchor.x},${pbAnchor.y}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-dasharray="${isCracked ? '5 4' : 'none'}" marker-end="${marker}" />`;
        }
      });
    });

    // 2. Barreiras Preventivas -> Evento Central
    d.preventiveBarriers.forEach(pb => {
      const pbRight = getAnchor(pb.id, 'RIGHT');
      if (pbRight && centralLeft) {
        const dx = (centralLeft.x - pbRight.x) / 2;
        const isCracked = pb.status === 'NOT_IMPLEMENTED';
        const stroke = isCracked ? '#dc2626' : '#64748b';
        const marker = isCracked ? 'url(#arrow-mindmap-red)' : 'url(#arrow-mindmap-gray)';
        pathsHtml += `<path d="M ${pbRight.x},${pbRight.y} C ${pbRight.x + dx},${pbRight.y} ${centralLeft.x - dx},${centralLeft.y} ${centralLeft.x},${centralLeft.y}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-dasharray="${isCracked ? '5 4' : 'none'}" marker-end="${marker}" />`;
      }
    });

    // 3. Evento Central -> Barreiras Mitigadoras
    d.mitigationBarriers.forEach(bm => {
      const bmLeft = getAnchor(bm.id, 'LEFT');
      if (bmLeft && centralRight) {
        const dx = (bmLeft.x - centralRight.x) / 2;
        const isCracked = bm.status === 'NOT_IMPLEMENTED';
        const stroke = isCracked ? '#dc2626' : '#64748b';
        const marker = isCracked ? 'url(#arrow-mindmap-red)' : 'url(#arrow-mindmap-gray)';
        pathsHtml += `<path d="M ${centralRight.x},${centralRight.y} C ${centralRight.x + dx},${centralRight.y} ${bmLeft.x - dx},${bmLeft.y} ${bmLeft.x},${bmLeft.y}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-dasharray="${isCracked ? '5 4' : 'none'}" marker-end="${marker}" />`;
      }
    });

    // 4. Barreiras Mitigadoras -> Consequências
    d.consequences.forEach(cq => {
      const cqLeft = getAnchor(cq.id, 'LEFT');
      if (!cqLeft) return;

      const linked = d.mitigationBarriers.filter(bm => (cq.mitigationBarrierIds || []).includes(bm.id));
      linked.forEach(bm => {
        const bmRight = getAnchor(bm.id, 'RIGHT');
        if (bmRight) {
          const dx = (cqLeft.x - bmRight.x) / 2;
          const isCracked = bm.status === 'NOT_IMPLEMENTED';
          const stroke = isCracked ? '#dc2626' : '#64748b';
          const marker = isCracked ? 'url(#arrow-mindmap-red)' : 'url(#arrow-mindmap-gray)';
          pathsHtml += `<path d="M ${bmRight.x},${bmRight.y} C ${bmRight.x + dx},${bmRight.y} ${cqLeft.x - dx},${cqLeft.y} ${cqLeft.x},${cqLeft.y}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-dasharray="${isCracked ? '5 4' : 'none'}" marker-end="${marker}" />`;
        }
      });
    });

    svg.innerHTML = pathsHtml;
  }

  openSodMatrix() {
    const modal = document.getElementById('modal-sod');
    const tbody = document.getElementById('sod-table-body');
    if (!modal || !tbody) return;

    tbody.innerHTML = this.currentDiagram.threats.map(t => {
      const sod = t.sod || { severity: 5, occurrence: 5, detection: 5, rpn: 125 };
      return `
        <tr>
          <td><strong>${t.code || 'AM'}</strong>: ${t.title}</td>
          <td><input type="number" min="1" max="10" value="${sod.severity}" data-sod-type="s" data-id="${t.id}" class="form-control" style="width: 60px;"></td>
          <td><input type="number" min="1" max="10" value="${sod.occurrence}" data-sod-type="o" data-id="${t.id}" class="form-control" style="width: 60px;"></td>
          <td><input type="number" min="1" max="10" value="${sod.detection}" data-sod-type="d" data-id="${t.id}" class="form-control" style="width: 60px;"></td>
          <td>
            <span class="sod-badge" style="background: ${sod.rpn > 200 ? '#fee2e2; color: #dc2626;' : '#f1f5f9; color: #334155;'}">
              ${sod.rpn}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const sodType = e.target.getAttribute('data-sod-type');
        const val = parseInt(e.target.value, 10) || 1;

        const threat = this.currentDiagram.threats.find(t => t.id === id);
        if (threat) {
          if (!threat.sod) threat.sod = { severity: 5, occurrence: 5, detection: 5, rpn: 125 };
          if (sodType === 's') threat.sod.severity = val;
          if (sodType === 'o') threat.sod.occurrence = val;
          if (sodType === 'd') threat.sod.detection = val;
          threat.sod.rpn = threat.sod.severity * threat.sod.occurrence * threat.sod.detection;

          this.saveToStorage();
          this.openSodMatrix();
          this.render();
        }
      });
    });

    modal.classList.add('active');
  }

  openNodeEditor(type = 'THREAT', id = null) {
    const modal = document.getElementById('modal-node-editor');
    if (!modal) return;

    let normType = type;
    if (type === 'PREVENTIVE') normType = 'PREVENTIVE_BARRIER';
    if (type === 'MITIGATION') normType = 'MITIGATION_BARRIER';

    document.getElementById('node-edit-id').value = id || '';
    
    const typeSelect = document.getElementById('node-edit-type');
    if (typeSelect) {
      typeSelect.value = normType;
      typeSelect.dispatchEvent(new Event('change'));
    }

    const groupLinkPrev = document.getElementById('group-link-preventive');
    const containerLinkPrev = document.getElementById('container-link-preventive');
    const groupLinkMit = document.getElementById('group-link-mitigation');
    const containerLinkMit = document.getElementById('container-link-mitigation');
    const groupSodThreat = document.getElementById('group-sod-threat');

    const isBarrier = type === 'PREVENTIVE' || type === 'PREVENTIVE_BARRIER' || type === 'MITIGATION' || type === 'MITIGATION_BARRIER';
    const groupBarrierStatus = document.getElementById('group-barrier-status');
    if (groupBarrierStatus) groupBarrierStatus.style.display = isBarrier ? 'block' : 'none';

    groupLinkPrev.style.display = type === 'THREAT' ? 'block' : 'none';
    groupLinkMit.style.display = type === 'CONSEQUENCE' ? 'block' : 'none';
    if (groupSodThreat) groupSodThreat.style.display = type === 'THREAT' ? 'flex' : 'none';

    let item = null;
    if (id) {
      if (type === 'THREAT') item = this.currentDiagram.threats.find(t => t.id === id);
      else if (type === 'PREVENTIVE' || type === 'PREVENTIVE_BARRIER') item = this.currentDiagram.preventiveBarriers.find(b => b.id === id);
      else if (type === 'MITIGATION' || type === 'MITIGATION_BARRIER') item = this.currentDiagram.mitigationBarriers.find(b => b.id === id);
      else if (type === 'CONSEQUENCE') item = this.currentDiagram.consequences.find(c => c.id === id);
      else if (type === 'CENTRAL_EVENT') item = this.currentDiagram.centralEvent;
    }

    document.getElementById('node-edit-title').value = item ? (item.title || '') : '';
    document.getElementById('node-edit-desc').value = item ? (item.description || '') : '';

    if (isBarrier && item) {
      const selectStatus = document.getElementById('node-edit-barrier-status');
      if (selectStatus) selectStatus.value = item.status || 'IMPLEMENTED';
    }

    // Inicializa os seletores SOD 1-10 para Ameaças
    if (type === 'THREAT') {
      const sod = item?.sod || { severity: 5, occurrence: 5, detection: 5, rpn: 125 };
      this.activeEditingSod = { ...sod };

      const updateSodDisplay = () => {
        const s = this.activeEditingSod.severity || 5;
        const o = this.activeEditingSod.occurrence || 5;
        const d = this.activeEditingSod.detection || 5;
        const rpn = Math.min(1000, Math.max(1, s * o * d));
        this.activeEditingSod.rpn = rpn;

        const formulaEl = document.getElementById('sod-formula-text');
        if (formulaEl) formulaEl.innerText = `S (${s}) × O (${o}) × D (${d})`;

        const rpnEl = document.getElementById('editor-rpn-display');
        if (rpnEl) rpnEl.innerText = rpn;

        let riskText = 'Risco Controlado';
        let levelText = 'RISCO BAIXO';
        if (rpn > 600) { riskText = 'Requer Ação Imediata'; levelText = 'RISCO CRÍTICO'; }
        else if (rpn > 300) { riskText = 'Atenção Elevada'; levelText = 'RISCO ALTO'; }
        else if (rpn > 100) { riskText = 'Monitoramento Regular'; levelText = 'RISCO MÉDIO'; }

        const prioEl = document.getElementById('editor-priority-text');
        if (prioEl) prioEl.innerText = riskText;

        const badgeEl = document.getElementById('editor-risk-badge');
        if (badgeEl) badgeEl.innerText = levelText;

        const factors = [
          { f: 's', val: s, dict: SOD_SEVERITY_DESCRIPTIONS },
          { f: 'o', val: o, dict: SOD_OCCURRENCE_DESCRIPTIONS },
          { f: 'd', val: d, dict: SOD_DETECTION_DESCRIPTIONS }
        ];

        factors.forEach(({ f, val, dict }) => {
          const valBadge = document.getElementById(`val-badge-${f}`);
          if (valBadge) valBadge.innerText = val;

          const slider = document.getElementById(`sod-slider-${f}`);
          if (slider) slider.value = val;

          const titleEl = document.getElementById(`title-${f}`);
          const descEl = document.getElementById(`desc-${f}`);
          if (titleEl && dict[val]) titleEl.innerText = dict[val].title;
          if (descEl && dict[val]) descEl.innerText = dict[val].desc;

          const container = document.getElementById(`sod-selector-${f}`);
          if (container) {
            container.innerHTML = [1,2,3,4,5,6,7,8,9,10].map(v => `
              <button type="button" class="btn-sod-step ${v === val ? 'active' : ''}" data-factor="${f}" data-val="${v}">${v}</button>
            `).join('');
          }
        });

        ['s', 'o', 'd'].forEach(f => {
          const slider = document.getElementById(`sod-slider-${f}`);
          if (slider) {
            slider.oninput = (e) => {
              const val = parseInt(e.target.value, 10);
              if (f === 's') this.activeEditingSod.severity = val;
              if (f === 'o') this.activeEditingSod.occurrence = val;
              if (f === 'd') this.activeEditingSod.detection = val;
              updateSodDisplay();
            };
          }

          const container = document.getElementById(`sod-selector-${f}`);
          if (container) {
            container.querySelectorAll('.btn-sod-step').forEach(b => {
              b.onclick = (e) => {
                const val = parseInt(e.currentTarget.getAttribute('data-val'), 10);
                if (f === 's') this.activeEditingSod.severity = val;
                if (f === 'o') this.activeEditingSod.occurrence = val;
                if (f === 'd') this.activeEditingSod.detection = val;
                updateSodDisplay();
              };
            });
          }
        });
      };

      updateSodDisplay();
    }

    if (type === 'THREAT' && containerLinkPrev) {
      const activeIds = item?.barrierIds || [];
      containerLinkPrev.innerHTML = this.currentDiagram.preventiveBarriers.map(pb => `
        <label style="font-weight: 500; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" class="chk-link-prev" value="${pb.id}" ${activeIds.includes(pb.id) ? 'checked' : ''}>
          ${pb.code || 'BP'} — ${pb.title}
        </label>
      `).join('');
    }

    if (type === 'CONSEQUENCE' && containerLinkMit) {
      const activeIds = item?.mitigationBarrierIds || [];
      containerLinkMit.innerHTML = this.currentDiagram.mitigationBarriers.map(bm => `
        <label style="font-weight: 500; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" class="chk-link-mit" value="${bm.id}" ${activeIds.includes(bm.id) ? 'checked' : ''}>
          ${bm.code || 'BM'} — ${bm.title}
        </label>
      `).join('');
    }

    modal.classList.add('active');
  }

  handleSaveNode() {
    const id = document.getElementById('node-edit-id').value;
    const type = document.getElementById('node-edit-type').value;
    const title = document.getElementById('node-edit-title').value;
    const desc = document.getElementById('node-edit-desc').value;

    if (!title) return alert('Informe um título.');

    if (type === 'CENTRAL_EVENT') {
      this.currentDiagram.centralEvent.title = title;
      this.currentDiagram.centralEvent.description = desc;
    } else if (type === 'THREAT') {
      const selectedPrev = Array.from(document.querySelectorAll('.chk-link-prev:checked')).map(cb => cb.value);
      const sodData = this.activeEditingSod || { severity: 5, occurrence: 5, detection: 5, rpn: 125 };

      if (id) {
        const item = this.currentDiagram.threats.find(t => t.id === id);
        if (item) {
          item.title = title;
          item.description = desc;
          item.barrierIds = selectedPrev;
          item.sod = { ...sodData };
        }
      } else {
        this.currentDiagram.threats.push({
          id: `th-${Date.now()}`,
          code: `AM-0${this.currentDiagram.threats.length + 1}`,
          title, description: desc,
          sod: { ...sodData },
          barrierIds: selectedPrev
        });
      }
    } else if (type === 'PREVENTIVE_BARRIER' || type === 'PREVENTIVE') {
      const bStatus = document.getElementById('node-edit-barrier-status')?.value || 'IMPLEMENTED';
      if (id) {
        const item = this.currentDiagram.preventiveBarriers.find(b => b.id === id);
        if (item) { item.title = title; item.description = desc; item.status = bStatus; }
      } else {
        this.currentDiagram.preventiveBarriers.push({
          id: `bp-${Date.now()}`,
          code: `BP-0${this.currentDiagram.preventiveBarriers.length + 1}`,
          title, description: desc, status: bStatus, responsible: 'Equipe Técnica'
        });
      }
    } else if (type === 'MITIGATION_BARRIER' || type === 'MITIGATION') {
      const bStatus = document.getElementById('node-edit-barrier-status')?.value || 'IMPLEMENTED';
      if (id) {
        const item = this.currentDiagram.mitigationBarriers.find(b => b.id === id);
        if (item) { item.title = title; item.description = desc; item.status = bStatus; }
      } else {
        this.currentDiagram.mitigationBarriers.push({
          id: `bm-${Date.now()}`,
          code: `BM-0${this.currentDiagram.mitigationBarriers.length + 1}`,
          title, description: desc, status: bStatus, responsible: 'Equipe Técnica'
        });
      }
    } else if (type === 'CONSEQUENCE') {
      const selectedMit = Array.from(document.querySelectorAll('.chk-link-mit:checked')).map(cb => cb.value);
      if (id) {
        const item = this.currentDiagram.consequences.find(c => c.id === id);
        if (item) { item.title = title; item.description = desc; item.mitigationBarrierIds = selectedMit; }
      } else {
        this.currentDiagram.consequences.push({
          id: `cs-${Date.now()}`,
          code: `CQ-0${this.currentDiagram.consequences.length + 1}`,
          title, description: desc, severityImpact: 3,
          mitigationBarrierIds: selectedMit
        });
      }
    }

    this.saveToStorage();
    document.getElementById('modal-node-editor')?.classList.remove('active');
    this.render();
  }

  openRcaSummary() {
    const modal = document.getElementById('modal-rca-summary');
    const content = document.getElementById('rca-summary-content');
    if (!modal || !content) return;

    const d = this.currentDiagram;
    const disabledPrev = d.preventiveBarriers.filter(b => b.status === 'NOT_IMPLEMENTED');
    const disabledMit = d.mitigationBarriers.filter(b => b.status === 'NOT_IMPLEMENTED');
    const degradedPrev = d.preventiveBarriers.filter(b => b.status === 'DEGRADED');
    const degradedMit = d.mitigationBarriers.filter(b => b.status === 'DEGRADED');

    const maxRpn = d.threats.reduce((max, t) => Math.max(max, t.sod?.rpn || 0), 0);

    let html = `
      <div style="background: var(--color-canvas-soft); padding: 14px; border-radius: var(--rounded-md);">
        <h4 style="margin: 0 0 6px 0;">Análise de Risco: ${d.centralEvent.title}</h4>
        <p style="margin:0; font-size:13px; color:var(--color-body);">${d.centralEvent.description}</p>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <div style="flex:1; background: #f8fafc; padding: 10px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-body);">RPN MÁXIMO</div>
          <div style="font-size: 20px; font-weight: 900; color: ${maxRpn > 200 ? '#dc2626' : 'var(--color-ink)'}">${maxRpn}</div>
        </div>
        <div style="flex:1; background: #f8fafc; padding: 10px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-body);">INATIVAS / DEGRADADAS</div>
          <div style="font-size: 20px; font-weight: 900; color: ${disabledPrev.length + disabledMit.length + degradedPrev.length + degradedMit.length > 0 ? '#dc2626' : '#16a34a'}">
            ${disabledPrev.length + disabledMit.length + degradedPrev.length + degradedMit.length}
          </div>
        </div>
      </div>

      <h4 style="margin: 16px 0 6px 0; color: var(--color-danger);">Vulnerabilidades / Alertas Detectados</h4>
    `;

    if (disabledPrev.length === 0 && disabledMit.length === 0 && degradedPrev.length === 0 && degradedMit.length === 0) {
      html += `<p style="font-size: 13px; color: #16a34a;">Todas as barreiras operacionais encontram-se ativas e 100% implementadas!</p>`;
    } else {
      html += `<ul style="font-size: 13px; padding-left: 20px;">`;
      disabledPrev.forEach(b => html += `<li><strong style="color: var(--color-danger);">${b.code} - ${b.title}:</strong> Barreira Preventiva Inativa</li>`);
      disabledMit.forEach(b => html += `<li><strong style="color: var(--color-danger);">${b.code} - ${b.title}:</strong> Barreira Mitigadora Inativa</li>`);
      degradedPrev.forEach(b => html += `<li><strong style="color: #d97706;">${b.code} - ${b.title}:</strong> Barreira Preventiva Degradada ⚠</li>`);
      degradedMit.forEach(b => html += `<li><strong style="color: #d97706;">${b.code} - ${b.title}:</strong> Barreira Mitigadora Degradada ⚠</li>`);
      html += `</ul>`;
    }

    content.innerHTML = html;
    modal.classList.add('active');
  }

  async exportJson() {
    const jsonString = JSON.stringify(this.currentDiagram, null, 2);
    const fileName = `bowtie_mindmap_${this.currentDiagram.id || 'export'}.json`;

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Arquivo JSON Bowtie',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        alert('Análise exportada com sucesso para a pasta selecionada!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // Usuário cancelou a janela de salvar
        console.warn('Fallback para download automático:', err);
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  renameScenario() {
    const currentTitle = this.currentDiagram.title || 'Cenário Padrão';
    const newTitle = prompt('Informe o novo nome para este Cenário:', currentTitle);
    if (newTitle && newTitle.trim() !== '') {
      const titleClean = newTitle.trim();
      this.currentDiagram.title = titleClean;

      const idx = this.scenarios.findIndex(s => s.id === this.currentDiagram.id);
      if (idx >= 0) {
        this.scenarios[idx].title = titleClean;
        this.scenarios[idx].diagram.title = titleClean;
      }

      this.saveToStorage();
      this.renderTemplateOptions();
      this.render();
      alert('Nome do cenário atualizado com sucesso!');
    }
  }

  clearDiagram() {
    if (confirm('Deseja realmente limpar toda a análise atual do Bowtie? Esta ação irá resetar os dados salvos.')) {
      this.currentDiagram = {
        id: `diag-${Date.now()}`,
        title: 'Nova Análise Bowtie',
        centralEvent: {
          id: `ce-${Date.now()}`,
          code: 'EV-01',
          title: 'EVENTO CENTRAL / FALHA FOCO',
          hazard: 'Descreva o perigo associado',
          description: 'Clique em Editar para personalizar o evento central da análise.',
          location: 'Geral',
          system: 'Sistema Principal'
        },
        threats: [],
        preventiveBarriers: [],
        mitigationBarriers: [],
        consequences: []
      };
      this.saveToStorage();
      this.renderTemplateOptions();
      this.render();
      alert('Análise limpa com sucesso!');
    }
  }

  importJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.centralEvent && parsed.threats) {
          if (!parsed.id) parsed.id = `diag-${Date.now()}`;
          this.currentDiagram = parsed;
          this.saveToStorage();
          this.renderTemplateOptions();
          this.render();
          alert('Mindmap Bowtie importado e adicionado aos seus cenários!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao ler JSON.');
      }
    };
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bowtieMindmapManager = new BowtieMindmapManager();
});

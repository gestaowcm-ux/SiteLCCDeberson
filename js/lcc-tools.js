// ============================================================================
// js/lcc-tools.js — Engine das Ferramentas LCC (aba Opcionais)
// Extraído e modularizado a partir de fontes/Curso_LCC_Completo.html
// ============================================================================

import {
  DEFAULTS,
  cloneParams,
  loadParams,
  saveParams,
  resetParams,
  comparison,
  thresholdHours,
  money,
  num
} from './lcc-model.js';

const TOOLS_STORAGE_KEY = 'lcc_tools_state_v1';

const TOOL_META = {
  opening: { title: 'Ficha de abertura da análise', kicker: 'Escopo e Definição' },
  assumptions: { title: 'Registro de dados e premissas', kicker: 'Rastreabilidade' },
  costs: { title: 'Estrutura de custos', kicker: 'Mapeamento de Parcelas' },
  flow: { title: 'Fluxo anual econômico', kicker: 'Valor Presente' },
  simulator: { title: 'Simulador do caso', kicker: 'Modelagem Interativa' },
  exercise: { title: 'Exercício da turma — 300 h/ano', kicker: 'Oficina Prática' },
  answers: { title: 'Gabarito do instrutor', kicker: 'Referência de Cálculo' },
  checklist: { title: 'Checklist da análise', kicker: 'Qualidade (34 itens)' },
  audit: { title: 'Auditoria de uso do LCC', kicker: 'Maturidade (1 a 5)' },
  decision: { title: 'Registro da decisão', kicker: 'Governança e Aprovação' },
  tracking: { title: 'Previsto versus realizado', kicker: 'Retroalimentação' },
  glossary: { title: 'Glossário LCC', kicker: 'Terminologia' },
  references: { title: 'Referências e convenções', kicker: 'Base Metodológica' }
};

const COMMON_FIELDS = [
  ['hours', 'Horas efetivas anuais', 'h/ano', 0, 8760, 'any'],
  ['years', 'Horizonte', 'anos', 1, 50, 1],
  ['rate', 'Taxa real', '% a.a.', 0, 100, 'any'],
  ['tariff', 'Tarifa de energia', 'R$/kWh', 0, 1000000, 'any'],
  ['loss', 'Perda econômica líquida', 'R$/h', 0, 1e12, 'any'],
  ['renewalYear', 'Ano da intervenção planejada', 'ano', 1, 50, 1]
];

const SIDE_FIELDS = [
  ['purchase', 'Aquisição', 'R$'],
  ['engineering', 'Engenharia', 'R$'],
  ['logistics', 'Logística', 'R$'],
  ['installation', 'Instalação', 'R$'],
  ['commissioning', 'Comissionamento', 'R$'],
  ['power', 'Potência elétrica absorvida', 'kW'],
  ['operation', 'Outros custos operacionais anuais', 'R$/ano'],
  ['planned', 'Planejada — rotinas anuais', 'R$/ano'],
  ['mtbf', 'MTBF', 'h de operação'],
  ['repair', 'Custo direto por falha', 'R$/evento'],
  ['downtime', 'Indisponibilidade por falha', 'h/evento'],
  ['renewal', 'Planejada — intervenção prevista', 'R$'],
  ['disposal', 'Descomissionamento', 'R$'],
  ['residual', 'Valor residual', 'R$']
];

const CHECKS = [
  ['Escopo', [
    'A decisão está formulada?',
    'A necessidade está descrita?',
    'Os requisitos obrigatórios foram verificados?',
    'As alternativas entregam serviço comparável?',
    'As fronteiras e exclusões estão documentadas?',
    'O horizonte e a data-base estão definidos?'
  ]],
  ['Dados', [
    'As fontes e datas estão registradas?',
    'O regime de operação foi validado?',
    'As unidades são consistentes?',
    'Os dados de falha representam a aplicação?',
    'As estimativas possuem responsáveis?',
    'As lacunas e incertezas estão registradas?'
  ]],
  ['Custos', [
    'Os custos de implantação foram considerados?',
    'Energia e operação foram avaliadas?',
    'Planejada e corretiva estão separadas, sem dupla contagem da intervenção prevista?',
    'Perdas de produção possuem justificativa econômica?',
    'Descomissionamento e residual foram considerados?',
    'Custos relevantes adicionais foram avaliados?',
    'Duplas contagens foram eliminadas?',
    'Custos já incorridos foram tratados corretamente?'
  ]],
  ['Modelo', [
    'Os custos estão posicionados no tempo?',
    'A taxa é coerente com a base real ou nominal?',
    'Substituições e valores terminais estão tratados?',
    'Fórmulas e sinais foram verificados?',
    'Custos diretos e de oportunidade estão identificados?',
    'O resultado pode ser reproduzido?'
  ]],
  ['Decisão', [
    'Foram testadas variáveis críticas?',
    'As condições de validade estão declaradas?',
    'A recomendação atende aos requisitos?',
    'Existe registro de aprovação e versão?'
  ]],
  ['Acompanhamento', [
    'Há responsáveis por medir o realizado?',
    'Existem indicadores e frequência de revisão?',
    'Foram definidos gatilhos de reavaliação?',
    'Os dados reais serão usados em decisões futuras?'
  ]]
];

const AUDIT_QUESTIONS = [
  ['A empresa define quando uma análise de LCC é necessária?', 'Política, critérios de criticidade e gatilhos de investimento.'],
  ['A necessidade e os requisitos são definidos antes da comparação?', 'Especificação aprovada e ficha de abertura.'],
  ['As alternativas são comparadas com escopos equivalentes?', 'Matriz de escopo, inclusões e adequações.'],
  ['Os custos relevantes de todo o horizonte são considerados?', 'Estrutura de custos, encerramento e residual.'],
  ['As fontes e premissas são rastreáveis?', 'Registro de dados, datas e responsáveis.'],
  ['As estimativas de confiabilidade refletem a aplicação?', 'Histórico, população comparável e análise técnica.'],
  ['As consequências da indisponibilidade são validadas?', 'Gargalo, redundância e perda líquida.'],
  ['O modelo evita omissões e dupla contagem?', 'Revisão independente e conciliação de parcelas.'],
  ['A empresa trata corretamente tempo, inflação e desconto?', 'Critérios financeiros e modelo revisado.'],
  ['A sensibilidade influencia a recomendação?', 'Cenários, limites e decisões condicionais.'],
  ['A decisão preserva modelo, versão e responsáveis?', 'Registro de aprovação e controle de mudanças.'],
  ['Os resultados reais retroalimentam análises futuras?', 'Comparação previsto/realizado e modelos atualizados.']
];

const GLOSSARY = [
  ['LCC — Life Cycle Cost', 'Custo do ciclo de vida nas fronteiras e no horizonte definidos.'],
  ['LCCA — Life Cycle Cost Analysis', 'Processo de análise dos custos do ciclo de vida.'],
  ['CAPEX', 'Dispêndios de capital conforme critérios contábeis aplicáveis. A classificação não define o momento do desembolso.'],
  ['OPEX', 'Despesas operacionais conforme a classificação adotada.'],
  ['VP', 'Valor equivalente na data-base.'],
  ['VPL', 'Valor presente líquido de benefícios e custos. Não equivale automaticamente ao LCC.'],
  ['CAE', 'Custo anual uniforme equivalente ao valor presente, nas condições adotadas.'],
  ['MTBF', 'Tempo médio de operação entre falhas de itens reparáveis. Não é vida útil.'],
  ['MTTR', 'Tempo médio de reparo conforme definição e fronteira declaradas.'],
  ['MDT', 'Tempo médio total de indisponibilidade, podendo incluir esperas além do reparo ativo.'],
  ['CMMS', 'Sistema informatizado de gestão da manutenção.'],
  ['EAM', 'Enterprise Asset Management: sistema ou abordagem de gestão de ativos empresariais.'],
  ['Taxa real', 'Exclui a inflação geral.'],
  ['Taxa nominal', 'Incorpora a inflação geral.'],
  ['Horizonte', 'Período escolhido para avaliar a decisão.'],
  ['Vida útil', 'Período de utilização do ativo nas condições consideradas.'],
  ['Valor residual', 'Valor econômico estimado ao final do horizonte.'],
  ['Custo de oportunidade', 'Consequência econômica relevante sem desembolso direto equivalente, ou valor da alternativa sacrificada.'],
  ['Custo irrecuperável', 'Custo já incorrido que não pode ser recuperado pela decisão atual.'],
  ['Sensibilidade', 'Avaliação do efeito de mudanças nas entradas.'],
  ['Cenário', 'Conjunto coerente de premissas.'],
  ['Ponto de indiferença', 'Condição em que as alternativas têm o mesmo resultado no critério analisado.'],
  ['TCO', 'Total Cost of Ownership. Seu escopo varia: declarar fronteiras em vez de presumir equivalência automática com LCC.'],
  ['ACV', 'Avaliação do ciclo de vida ambiental. Não é sinônimo de análise econômica de LCC.']
];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadToolState() {
  try {
    const raw = localStorage.getItem(TOOLS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        fields: parsed.fields && typeof parsed.fields === 'object' ? parsed.fields : {},
        checklist: parsed.checklist && typeof parsed.checklist === 'object' ? parsed.checklist : {},
        audit: parsed.audit && typeof parsed.audit === 'object' ? parsed.audit : {}
      };
    }
  } catch (_) {}
  return { fields: {}, checklist: {}, audit: {} };
}

function saveToolState(state) {
  try {
    localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

let toolState = loadToolState();
let params = loadParams();

function isParamsChanged() {
  return JSON.stringify(params) !== JSON.stringify(DEFAULTS);
}

function caseLabel(h = params.hours) {
  return `${num(h, 0)} h/ano · ${params.years} anos · ${num(params.rate)}% real a.a. · ${
    isParamsChanged() ? 'premissas editadas' : 'caso didático original'
  }`;
}

function conclusion(delta) {
  if (Math.abs(delta) < 0.01) return 'Custos equivalentes neste cenário.';
  return `${delta > 0 ? 'B' : 'A'} apresenta menor LCC neste cenário.`;
}

function validParams(p) {
  if (!p || !p.A || !p.B) return false;
  if (!Number.isInteger(p.years) || p.years < 1 || p.years > 50) return false;
  if (!Number.isInteger(p.renewalYear) || p.renewalYear < 1 || p.renewalYear > 50) return false;
  if (!Number.isFinite(p.hours) || p.hours < 0 || p.hours > 8760) return false;
  if (!Number.isFinite(p.rate) || p.rate < 0 || p.rate > 100) return false;
  if (!Number.isFinite(p.tariff) || p.tariff < 0 || p.tariff > 1000000) return false;
  if (!Number.isFinite(p.loss) || p.loss < 0 || p.loss > 1e12) return false;
  for (const side of ['A', 'B']) {
    const s = p[side];
    for (const [k] of SIDE_FIELDS) {
      const v = s[k];
      if (!Number.isFinite(v)) return false;
      if (k === 'mtbf' && (v < 0.001 || v > 1e12)) return false;
      else if (k === 'downtime' && (v < 0 || v > 8760)) return false;
      else if (v < 0 || v > 1e12) return false;
    }
  }
  return true;
}

function field(id, label, type = 'text', placeholder = '') {
  const val = toolState.fields[id] ?? '';
  return `<label class="lcc-field">${esc(label)}<input type="${esc(type)}" data-field="${esc(id)}" value="${esc(val)}" placeholder="${esc(placeholder)}"></label>`;
}

function textField(id, label, placeholder = '') {
  const val = toolState.fields[id] ?? '';
  return `<label class="lcc-field">${esc(label)}<textarea data-field="${esc(id)}" placeholder="${esc(placeholder)}">${esc(val)}</textarea></label>`;
}

function table(headers, rows) {
  const ths = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const trs = rows
    .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="lcc-table-wrap"><table class="lcc-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function annualRows(c) {
  return [
    ['Energia', money(c.A.energy, 2), money(c.B.energy, 2)],
    ['Outros custos operacionais', money(params.A.operation, 2), money(params.B.operation, 2)],
    ['Planejada — rotinas anuais', money(params.A.planned, 2), money(params.B.planned, 2)],
    ['Corretivas esperadas', money(c.A.corrective, 2), money(c.B.corrective, 2)],
    ['Perdas econômicas', money(c.A.loss, 2), money(c.B.loss, 2)],
    ['<strong>Total anual</strong>', `<strong>${money(c.A.annual, 2)}</strong>`, `<strong>${money(c.B.annual, 2)}</strong>`]
  ];
}

function numberInput(name, value, min = 0, max = 1e12, step = 'any') {
  return `<input name="${esc(name)}" aria-label="${esc(name)}" type="number" required value="${value}" min="${min}" max="${max}" step="${step}">`;
}

function auditSummary() {
  const vals = Array.from({ length: AUDIT_QUESTIONS.length }, (_, i) => toolState.audit[String(i + 1)] || {});
  const scores = vals.map((v) => Number(v.score)).filter((n) => n >= 1 && n <= 5);
  const na = vals.filter((v) => v.score === 'NA').length;
  const missing = vals.filter((v) => v.score && !String(v.evidence || '').trim()).length;
  const total = AUDIT_QUESTIONS.length;
  return (
    (scores.length
      ? `Média de ${scores.length} itens: ${num(scores.reduce((a, b) => a + b, 0) / scores.length, 2)} / 5. `
      : 'Nenhum item pontuado. ') +
    `${na} não aplicáveis. ${total - scores.length - na} sem nota.` +
    (missing ? ` ${missing} registros sem evidência ou justificativa.` : '')
  );
}

function renderToolBody(toolId) {
  const p = params;
  const c = comparison(p.hours, p);

  switch (toolId) {
    case 'opening':
      return `<div class="lcc-fields">
        ${field('openDecision', 'Decisão', 'text', 'Selecionar uma bomba industrial.')}
        ${field('openNeed', 'Necessidade', 'text', 'Atender ao serviço requerido pela operação.')}
        ${textField('openService', 'Serviço requerido', 'Vazão e pressão requeridas: detalhar especificação.')}
        ${textField('openRequirements', 'Requisitos obrigatórios')}
        ${textField('openAlternatives', 'Alternativas', 'Bombas A e B.')}
        ${textField('openScope', 'Fronteiras')}
        ${textField('openIncludes', 'Inclusões')}
        ${textField('openExcludes', 'Exclusões e justificativas')}
        ${field('openDate', 'Data-base', 'date')}
        ${field('openHorizon', 'Horizonte', 'text', `${p.years} anos`)}
        ${field('openOwner', 'Responsável pela análise')}
        ${textField('openPending', 'Pendências e encaminhamentos')}
      </div>
      <p class="lcc-micro">Esta ficha documental é salva automaticamente no navegador e não altera o simulador.</p>`;

    case 'assumptions':
      return `<p class="lcc-notice">Dados iniciais fictícios. Registre a origem antes de uma aplicação real.</p>
      ${table(['Variável', 'Modelo atual', 'Base'], [
        ['Horas anuais', `${num(p.hours, 0)} h`, 'Premissa operacional'],
        ['Horizonte', `${p.years} anos`, 'Período da decisão'],
        ['Taxa', `${num(p.rate)}% real a.a.`, 'Premissa didática'],
        ['Tarifa', `${money(p.tariff, 2)}/kWh`, 'Sem escalada real'],
        ['Perda líquida', `${money(p.loss, 2)}/h`, 'Não recuperável no caso'],
        ['MTBF A / B', `${num(p.A.mtbf, 0)} / ${num(p.B.mtbf, 0)} h`, 'Taxa estável'],
        ['Planejada — intervenção prevista', `Ano ${p.renewalYear}`, 'Por calendário']
      ])}
      <div class="lcc-fields">
        ${textField('assumpSources', 'Fontes, datas e responsáveis')}
        ${textField('assumpConfidence', 'Confiança e limitações')}
        ${textField('assumpRanges', 'Faixas plausíveis')}
        ${textField('assumpValidation', 'Próximas verificações')}
      </div>`;

    case 'costs':
      return `${table(['Categoria', 'Momento', 'A', 'B'], [
        ['Aquisição', 't = 0', money(p.A.purchase), money(p.B.purchase)],
        ['Engenharia', 't = 0', money(p.A.engineering), money(p.B.engineering)],
        ['Logística', 't = 0', money(p.A.logistics), money(p.B.logistics)],
        ['Instalação', 't = 0', money(p.A.installation), money(p.B.installation)],
        ['Comissionamento', 't = 0', money(p.A.commissioning), money(p.B.commissioning)],
        ...annualRows(c).map((r) => [r[0], 'Anual', r[1], r[2]]),
        ['Planejada — intervenção prevista', `Fim do ano ${p.renewalYear}`, money(p.A.renewal), money(p.B.renewal)],
        ['Descomissionamento', `Fim do ano ${p.years}`, money(p.A.disposal), money(p.B.disposal)],
        ['Residual — crédito', `Fim do ano ${p.years}`, money(p.A.residual), money(p.B.residual)]
      ])}
      <div class="lcc-fields">
        ${textField('costSources', 'Fontes e documentos')}
        ${textField('costDouble', 'Verificação de dupla contagem')}
        ${textField('costExcluded', 'Itens excluídos e justificativa')}
        ${textField('costPending', 'Custos pendentes')}
      </div>`;

    case 'flow':
      return `<p class="lcc-small">${esc(caseLabel())}. Custos positivos; residual deduzido. Inclui perdas de oportunidade.</p>
      <div class="lcc-summary-cards">
        <div class="lcc-summary-card"><small>LCC Bomba A</small><strong>${money(c.A.lcc, 2)}</strong></div>
        <div class="lcc-summary-card"><small>LCC Bomba B</small><strong>${money(c.B.lcc, 2)}</strong></div>
        <div class="lcc-summary-card dark"><small>Diferença (A − B)</small><strong>${money(c.delta, 2)}</strong></div>
      </div>
      ${table(
        ['Ano', 'A — valor do ano', 'A — VP', 'B — valor do ano', 'B — VP'],
        c.A.flow.map((r, i) => [
          String(r.year),
          money(r.total, 2),
          money(r.pv, 2),
          money(c.B.flow[i].total, 2),
          money(c.B.flow[i].pv, 2)
        ])
      )}
      <button type="button" class="lcc-btn lcc-btn-primary" data-action="csv">Exportar fluxo detalhado · CSV</button>`;

    case 'simulator':
      return `<p class="lcc-notice">Os campos alteram a base compartilhada dos slides e das demais ferramentas. Custos anuais fixos e intervenção por calendário permanecem ao variar horas. Valores fictícios.</p>
      <form id="modelForm">
        <div class="lcc-fields">
          ${COMMON_FIELDS.map(([key, label, unit, min, max, step]) =>
            `<label class="lcc-field">${esc(label)} · ${esc(unit)}${numberInput(key, p[key], min, max, step)}</label>`
          ).join('')}
        </div>
        ${table(
          ['Parâmetro', 'A', 'B'],
          SIDE_FIELDS.map(([key, label, unit]) => [
            esc(`${label} · ${unit}`),
            numberInput(`A.${key}`, p.A[key], key === 'mtbf' ? 0.001 : 0, key === 'downtime' ? 8760 : 1e12),
            numberInput(`B.${key}`, p.B[key], key === 'mtbf' ? 0.001 : 0, key === 'downtime' ? 8760 : 1e12)
          ])
        )}
        <div class="lcc-tool-actions">
          <button class="lcc-btn lcc-btn-primary" type="submit">Aplicar e recalcular</button>
          <button class="lcc-btn" type="button" data-action="restore">Restaurar cenário original</button>
        </div>
      </form>
      <p id="modelError" class="lcc-error" role="alert"></p>
      <h2 class="lcc-section-title">Resultado atual</h2>
      ${table(['Parcela', 'A', 'B'], [
        ['Investimento inicial', money(c.A.initial, 2), money(c.B.initial, 2)],
        ['Custo anual', money(c.A.annual, 2), money(c.B.annual, 2)],
        ['LCC de custos diretos', money(c.A.directLCC, 2), money(c.B.directLCC, 2)],
        ['VP de perdas econômicas', money(c.A.lossPV, 2), money(c.B.lossPV, 2)],
        ['<strong>LCC econômico</strong>', `<strong>${money(c.A.lcc, 2)}</strong>`, `<strong>${money(c.B.lcc, 2)}</strong>`]
      ])}
      <p class="lcc-small"><strong>${esc(conclusion(c.delta))}</strong> Diferença A − B: ${money(c.delta, 2)}.</p>
      <p class="lcc-micro">Intervenção posterior ao horizonte não entra no cálculo. Ao mudar o horizonte, revise os valores residuais e a vida útil. Impostos, financiamento, capital de giro e acidentes não estão modelados.</p>`;

    case 'exercise':
      return `<p class="lcc-small">Mantenha as demais premissas. Recalcule energia, falhas, corretivas e perdas. A planejada (rotinas e intervenção por calendário) e a operação fixa permanecem.</p>
      <p class="lcc-notice">Usa as entradas atuais do simulador. Restaure o cenário original no Simulador para reproduzir o gabarito original.</p>
      ${table(['Dado', 'A', 'B'], [
        ['Aquisição', money(p.A.purchase), money(p.B.purchase)],
        ['Implantação adicional', money(c.A.initial - p.A.purchase), money(c.B.initial - p.B.purchase)],
        ['Potência', `${num(p.A.power)} kW`, `${num(p.B.power)} kW`],
        ['MTBF', `${num(p.A.mtbf, 0)} h`, `${num(p.B.mtbf, 0)} h`],
        ['Duração por falha', `${num(p.A.downtime)} h`, `${num(p.B.downtime)} h`],
        ['Reparo por falha', money(p.A.repair), money(p.B.repair)],
        ['Planejada anual', money(p.A.planned), money(p.B.planned)],
        ['Operação fixa anual', money(p.A.operation), money(p.B.operation)],
        ['Planejada — intervenção prevista', money(p.A.renewal), money(p.B.renewal)],
        ['Descomissionamento', money(p.A.disposal), money(p.B.disposal)],
        ['Residual', money(p.A.residual), money(p.B.residual)]
      ])}
      <p class="lcc-small">Tarifa: ${money(p.tariff, 2)}/kWh · Perda: ${money(p.loss)}/h · ${p.years} anos · ${num(p.rate)}% real · Intervenção: ano ${p.renewalYear}.<br>Fator da série uniforme: <strong>${num(c.A.factor, 8)}</strong>.</p>
      <div class="lcc-fields">
        ${field('exerciseAnnualA', 'Custo anual A — R$')}
        ${field('exerciseAnnualB', 'Custo anual B — R$')}
        ${field('exerciseLCCA', 'LCC A — R$')}
        ${field('exerciseLCCB', 'LCC B — R$')}
        ${textField('exerciseDecision', 'Recomendação e condições')}
        ${textField('exerciseChecks', 'Dados que precisam de validação')}
      </div>`;

    case 'answers': {
      const ex = comparison(300, p);
      const t = thresholdHours(p);
      return `<p class="lcc-notice">As respostas estão visíveis. Resultados calculados com as premissas atuais do simulador.</p>
      <h2 class="lcc-section-title">Cenário atual — ${num(p.hours, 0)} h/ano</h2>
      ${table(['Parcela', 'A', 'B'], annualRows(c))}
      <div class="lcc-summary-cards">
        <div class="lcc-summary-card"><small>LCC A (${num(p.hours, 0)} h)</small><strong>${money(c.A.lcc, 2)}</strong></div>
        <div class="lcc-summary-card"><small>LCC B (${num(p.hours, 0)} h)</small><strong>${money(c.B.lcc, 2)}</strong></div>
        <div class="lcc-summary-card dark"><small>Diferença A − B</small><strong>${money(c.delta, 2)}</strong></div>
      </div>
      <h2 class="lcc-section-title">Exercício — 300 h/ano</h2>
      ${table(['Parcela', 'A', 'B'], annualRows(ex))}
      <div class="lcc-summary-cards">
        <div class="lcc-summary-card"><small>LCC A (300 h)</small><strong>${money(ex.A.lcc, 2)}</strong></div>
        <div class="lcc-summary-card"><small>LCC B (300 h)</small><strong>${money(ex.B.lcc, 2)}</strong></div>
        <div class="lcc-summary-card dark"><small>Diferença A − B</small><strong>${money(ex.delta, 2)}</strong></div>
      </div>
      <p class="lcc-small"><strong>${esc(conclusion(ex.delta))}</strong><br>
      Ponto de indiferença: ${t !== null && t >= 0 && t <= 8760 ? `${num(t, 2)} h/ano` : 'sem cruzamento na faixa 0–8.760 h/ano'}.</p>
      <h2 class="lcc-section-title">Referências fixas originais</h2>
      <p class="lcc-small">6.000 h/ano: A R$ 1.053.970,49; B R$ 889.770,48.<br>300 h/ano: A R$ 202.318,60; B R$ 207.357,10.<br>Ponto de indiferença original: aproximadamente 469,70 h/ano.</p>`;
    }

    case 'checklist': {
      let i = 0;
      return `<p class="lcc-small">34 itens distribuídos em 6 blocos. Registre evidência e responsável. “Não aplicável” exige justificativa.</p>` +
      CHECKS.map(([group, items]) =>
        `<section class="lcc-check-group"><h3>${esc(group)}</h3>${items.map((text) => {
          const id = String(++i);
          const v = toolState.checklist[id] || {};
          return `<div class="lcc-check-row">
            <div><strong>${id}.</strong> ${esc(text)}</div>
            <select data-check="${id}" data-key="status" aria-label="Status do item ${id}">
              ${['Pendente', 'Concluído', 'Não aplicável'].map((s) =>
                `<option ${(v.status || 'Pendente') === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
            <textarea data-check="${id}" data-key="evidence" aria-label="Evidência e responsável do item ${id}" placeholder="Evidência, responsável ou justificativa">${esc(v.evidence || '')}</textarea>
          </div>`;
        }).join('')}</section>`
      ).join('');
    }

    case 'audit':
      return `<p class="lcc-notice">Instrumento didático, não certificação normativa. A média não compensa falhas críticas. Ausência de evidência não equivale a não aplicabilidade.</p>
      ${table(['Nota', 'Critério'], [
        ['1', 'Inexistente: sem prática ou evidência demonstrável.'],
        ['2', 'Pontual: iniciativas isoladas e dependentes de pessoas.'],
        ['3', 'Definida: método e registros, aplicação ou revisão parcial.'],
        ['4', 'Aplicada e verificada: uso consistente e revisão evidenciada.'],
        ['5', 'Aprimorada com resultados: dados reais geram melhorias demonstráveis.']
      ])}
      <p id="auditSummary" class="lcc-audit-warn">${esc(auditSummary())}</p>` +
      AUDIT_QUESTIONS.map(([q, e], i) => {
        const id = String(i + 1);
        const v = toolState.audit[id] || {};
        return `<section class="lcc-audit-item">
          <div class="lcc-audit-head">
            <h3>${id}. ${esc(q)}</h3>
            <select data-audit="${id}" data-key="score" aria-label="Nota da pergunta ${id}">
              <option value="">Sem nota</option>
              ${['1', '2', '3', '4', '5', 'NA'].map((val) =>
                `<option value="${val}" ${v.score === val ? 'selected' : ''}>${val === 'NA' ? 'Não aplicável' : val}</option>`
              ).join('')}
            </select>
          </div>
          <p class="lcc-small">Evidências esperadas: ${esc(e)}</p>
          <div class="lcc-fields">
            ${[
              ['evidence', 'Evidência ou justificativa de não aplicabilidade'],
              ['gap', 'Lacuna'],
              ['action', 'Ação'],
              ['owner', 'Responsável e prazo']
            ].map(([key, label]) =>
              `<label class="lcc-field">${esc(label)}<textarea data-audit="${id}" data-key="${key}">${esc(v[key] || '')}</textarea></label>`
            ).join('')}
          </div>
        </section>`;
      }).join('');

    case 'decision':
      return `<div class="lcc-fields">
        ${field('decisionChoice', 'Alternativa recomendada')}
        ${field('decisionVersion', 'Versão do modelo')}
        ${field('decisionDate', 'Data', 'date')}
        ${field('decisionApprover', 'Aprovador')}
        ${textField('decisionResults', 'Resultados comparados')}
        ${textField('decisionDifferences', 'Principais diferenças')}
        ${textField('decisionCritical', 'Variáveis críticas')}
        ${textField('decisionRequirements', 'Requisitos verificados')}
        ${textField('decisionConditions', 'Condições de aprovação')}
        ${textField('decisionRisks', 'Riscos residuais')}
        ${textField('decisionOwners', 'Responsáveis')}
        ${textField('decisionTriggers', 'Gatilhos de revisão')}
      </div>`;

    case 'tracking':
      return `<p class="lcc-notice">Compare períodos e bases equivalentes. Separe uso, preço e desempenho. Não compare o LCC de oito anos com desembolsos de um único ano.</p>
      <div class="lcc-fields">
        ${field('trackPeriod', 'Período acompanhado')}
        ${field('trackVersion', 'Versão aprovada de referência')}
        ${textField('trackHours', 'Horas: previsto, realizado e explicação')}
        ${textField('trackEnergy', 'Energia: previsto, realizado e explicação')}
        ${textField('trackMaintenance', 'Manutenção: previsto, realizado e explicação')}
        ${textField('trackFailures', 'Falhas e indisponibilidade')}
        ${textField('trackLosses', 'Perdas econômicas: base e evidência')}
        ${textField('trackAction', 'Ações, responsáveis e próxima revisão')}
      </div>`;

    case 'glossary':
      return table(['Termo', 'Definição'], GLOSSARY.map((row) => row.map(esc)));

    case 'references':
      return `<h2 class="lcc-section-title">Fontes metodológicas</h2>
      <div class="lcc-ref-card">
        <a href="https://doi.org/10.6028/NIST.HB.135e2025" target="_blank" rel="noopener">NIST Handbook 135 — edição 2025</a>
        <p class="lcc-small" style="margin:6px 0 0">Life Cycle Costing Manual for the Federal Energy Management Program. Estrutura econômica e consistência de premissas. Não importar automaticamente taxas e regras específicas do programa federal dos EUA para a empresa.</p>
      </div>
      <div class="lcc-ref-card">
        <a href="https://www.energy.gov/sites/default/files/2014/05/f16/pumplcc_1001.pdf" target="_blank" rel="noopener">Pump Life Cycle Costs — Executive Summary</a>
        <p class="lcc-small" style="margin:6px 0 0">Hydraulic Institute, Europump e U.S. Department of Energy. Componentes de custo e interfaces dos sistemas de bombeamento.</p>
      </div>
      <h2 class="lcc-section-title">Convenções do caso</h2>
      <ul class="lcc-ref-list">
        ${[
          'Todos os dados iniciais são fictícios; 8% não é uma recomendação de taxa.',
          'Valores constantes e taxa real; sem escalada real de preços.',
          'Investimento em t=0. Custos anuais ao final de cada ano.',
          'Intervenção por calendário; encerramento ao final do horizonte.',
          'A planejada reúne rotinas anuais e intervenção prevista; seus valores são informados separadamente por ocorrerem em momentos diferentes. A corretiva é calculada à parte.',
          'Custo por falha não inclui perda de produção.',
          'A perda por hora é líquida e não recuperável, no caso.',
          'A potência já é elétrica absorvida.',
          'Não há reserva no cenário original.',
          'Intervenções planejadas ocorrem sem perda adicional no exercício.',
          'Custos fixos anuais permanecem ao variar horas.',
          'Impostos, financiamento, capital de giro, acidentes e mudanças de demanda não são modelados.',
          'As duas bombas permanecem utilizáveis até o fim do horizonte com as intervenções previstas.',
          'Requisitos precisam ser verificados independentemente do resultado econômico.'
        ].map((t) => `<li>${esc(t)}</li>`).join('')}
      </ul>
      <h2 class="lcc-section-title">Equações</h2>
      <p class="lcc-small">
        Energia = potência × horas × tarifa.<br>
        Falhas esperadas ≈ horas / MTBF.<br>
        Corretivas = falhas esperadas × custo direto por falha.<br>
        Indisponibilidade = falhas esperadas × duração média total.<br>
        Perda = indisponibilidade × perda líquida por hora.<br>
        VP = custo / (1 + taxa)<sup>ano</sup>.<br>
        F = [1 − (1 + taxa)<sup>−n</sup>] / taxa; se taxa zero, F = n.<br>
        LCC = inicial + anual × F + VP(intervenção) + VP(descomissionamento − residual).<br>
        ΔLCC = LCC_A − LCC_B; positivo favorece B.<br>
        CAE = LCC / F.<br>
        (1 + taxa nominal) = (1 + taxa real) × (1 + inflação).
      </p>
      <h2 class="lcc-section-title">Limites</h2>
      <p class="lcc-small">MTBF não é vida útil. A aproximação de falhas pressupõe taxa estável. Envelhecimento e riscos graves exigem análise apropriada. Menor LCC é critério de custo entre alternativas admissíveis e não mede sozinho todo o valor gerado.</p>
      <p class="lcc-small">Exercícios, checklists e escala de auditoria são construções didáticas próprias. A ferramenta não emite certificação normativa.</p>`;

    default:
      return '<p class="lcc-error">Ferramenta não encontrada.</p>';
  }
}

function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  downloadFile(
    'LCC_Dados_e_Registros.json',
    JSON.stringify({
      format: 'LCC-CURSO-8',
      version: 2,
      exportedAt: new Date().toISOString(),
      params,
      ...toolState,
      result: comparison(params.hours, params),
      exercise300: comparison(300, params)
    }, null, 2),
    'application/json;charset=utf-8'
  );
  showToast('Registros exportados (.json)');
}

function exportCSV() {
  const c = comparison(params.hours, params);
  const rows = [[
    'Alternativa', 'Ano', 'Inicial', 'Energia', 'Operacao',
    'Planejada_total', 'Corretivas', 'Perdas', 'Descomissionamento',
    'Residual_credito', 'Total_economico', 'Valor_presente'
  ]];
  for (const side of ['A', 'B']) {
    for (const r of c[side].flow) {
      rows.push([
        side, r.year, r.initial, r.energy, r.operation,
        r.planned + r.renewal, r.corrective, r.loss, r.disposal,
        r.residual, r.total, r.pv
      ]);
    }
  }
  const csv = rows
    .map((row) => row.map((v) => `"${(typeof v === 'number' ? v.toFixed(2).replace('.', ',') : String(v)).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');
  downloadFile('LCC_Fluxo_Detalhado.csv', `\ufeff${csv}`, 'text/csv;charset=utf-8');
  showToast('Fluxo exportado (.csv)');
}

async function importJSON(file, toolId) {
  if (!file) return;
  if (file.size > 2000000) {
    alert('Arquivo muito grande. Use uma exportação de até 2 MB.');
    return;
  }
  try {
    const data = JSON.parse(await file.text());
    if (data.format !== 'LCC-CURSO-8' || !validParams(data.params)) {
      throw new Error('Formato ou parâmetros inválidos.');
    }
    const nextState = { fields: {}, checklist: {}, audit: {} };
    if (data.fields && typeof data.fields === 'object') {
      for (const [k, v] of Object.entries(data.fields)) {
        if (/^[a-zA-Z0-9_]+$/.test(k) && !['__proto__', 'prototype', 'constructor'].includes(k) && typeof v === 'string') {
          nextState.fields[k] = v;
        }
      }
    }
    for (let i = 1; i <= 34; i++) {
      const v = data.checklist?.[i];
      if (v && typeof v === 'object') {
        nextState.checklist[i] = {
          status: ['Pendente', 'Concluído', 'Não aplicável'].includes(v.status) ? v.status : 'Pendente',
          evidence: typeof v.evidence === 'string' ? v.evidence : ''
        };
      }
    }
    for (let i = 1; i <= AUDIT_QUESTIONS.length; i++) {
      const v = data.audit?.[i];
      if (v && typeof v === 'object') {
        nextState.audit[i] = { score: ['1', '2', '3', '4', '5', 'NA'].includes(v.score) ? v.score : '' };
        for (const k of ['evidence', 'gap', 'action', 'owner']) {
          nextState.audit[i][k] = typeof v[k] === 'string' ? v[k] : '';
        }
      }
    }
    params = cloneParams(data.params);
    saveParams(params);
    toolState = nextState;
    saveToolState(toolState);
    render(toolId);
    showToast('Registros importados com sucesso');
  } catch (e) {
    alert(`Não foi possível importar: ${e.message}`);
  }
}

let toastTimer = null;
function showToast(msg) {
  let toast = document.getElementById('lccToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lccToast';
    toast.className = 'lcc-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function render(toolId) {
  const root = document.getElementById('lcc-tool-root');
  if (!root) return;
  const meta = TOOL_META[toolId] || { title: 'Ferramenta LCC', kicker: 'Opcionais' };

  root.innerHTML = `
    <div class="lcc-tool-shell">
      <header class="lcc-tool-header">
        <div>
          <span class="lcc-tool-kicker">OPCIONAIS · ${esc(meta.kicker)}</span>
          <h1 class="lcc-tool-title">${esc(meta.title)}</h1>
        </div>
        <div class="lcc-tool-actions">
          <button type="button" class="lcc-btn" data-action="export">Exportar (.json)</button>
          <button type="button" class="lcc-btn" data-action="import">Importar (.json)</button>
          <button type="button" class="lcc-btn" data-action="print">Imprimir</button>
          <input id="importFile" type="file" accept=".json,application/json" hidden>
        </div>
      </header>
      <main id="lccToolContent">
        ${renderToolBody(toolId)}
      </main>
    </div>
  `;

  bindEvents(toolId);
}

function bindEvents(toolId) {
  const root = document.getElementById('lcc-tool-root');
  if (!root) return;

  root.querySelectorAll('[data-field]').forEach((el) => {
    el.addEventListener('input', () => {
      toolState.fields[el.dataset.field] = el.value;
      saveToolState(toolState);
    });
  });

  root.querySelectorAll('[data-check]').forEach((el) => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const id = el.dataset.check;
      toolState.checklist[id] ||= {};
      toolState.checklist[id][el.dataset.key] = el.value;
      saveToolState(toolState);
    });
  });

  root.querySelectorAll('[data-audit]').forEach((el) => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const id = el.dataset.audit;
      toolState.audit[id] ||= {};
      toolState.audit[id][el.dataset.key] = el.value;
      saveToolState(toolState);
      const summaryEl = document.getElementById('auditSummary');
      if (summaryEl) summaryEl.textContent = auditSummary();
    });
  });

  root.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'export') exportJSON();
      else if (action === 'import') document.getElementById('importFile')?.click();
      else if (action === 'print') window.print();
      else if (action === 'csv') exportCSV();
      else if (action === 'restore') {
        params = resetParams();
        render(toolId);
        showToast('Cenário original restaurado');
      }
    });
  });

  const importInput = document.getElementById('importFile');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      importJSON(e.target.files?.[0], toolId);
      e.target.value = '';
    });
  }

  const form = document.getElementById('modelForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const candidate = cloneParams(params);
      for (const [k] of COMMON_FIELDS) {
        const val = Number(fd.get(k));
        candidate[k] = (k === 'years' || k === 'renewalYear') ? Math.round(val) : val;
      }
      for (const side of ['A', 'B']) {
        for (const [k] of SIDE_FIELDS) {
          candidate[side][k] = Number(fd.get(`${side}.${k}`));
        }
      }
      if (!validParams(candidate)) {
        const err = document.getElementById('modelError');
        if (err) err.textContent = 'Verifique os valores informados: campos obrigatórios devem ser numéricos e válidos.';
        return;
      }
      params = candidate;
      saveParams(params);
      render(toolId);
      showToast('Parâmetros aplicados e recalculados');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toolId = document.body.dataset.lccTool;
  if (toolId) {
    render(toolId);
  }
});

// Sincroniza caso outro iframe/aba altere os parâmetros ou registros
window.addEventListener('storage', (e) => {
  if (e.key === 'lcc_course_params_v1' || e.key === TOOLS_STORAGE_KEY) {
    params = loadParams();
    toolState = loadToolState();
    const toolId = document.body.dataset.lccTool;
    if (toolId) render(toolId);
  }
});

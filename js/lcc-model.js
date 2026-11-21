// ============================================================================
// js/lcc-model.js — Modelo Econômico Oficial do Caso Didático (Bomba A vs B)
// Extraído integralmente de fontes/Curso_LCC_Completo.html
// ============================================================================

export const DEFAULTS = {
  hours: 6000,
  years: 8,
  rate: 8,
  tariff: 0.8,
  loss: 1000,
  renewalYear: 4,
  A: {
    purchase: 80000,
    engineering: 5000,
    logistics: 3000,
    installation: 8000,
    commissioning: 4000,
    power: 30,
    operation: 2000,
    planned: 6000,
    mtbf: 6000,
    repair: 4000,
    downtime: 8,
    renewal: 12000,
    disposal: 10000,
    residual: 5000
  },
  B: {
    purchase: 110000,
    engineering: 5000,
    logistics: 3000,
    installation: 8000,
    commissioning: 4000,
    power: 25,
    operation: 2000,
    planned: 4000,
    mtbf: 12000,
    repair: 4000,
    downtime: 6,
    renewal: 8000,
    disposal: 10000,
    residual: 8000
  }
};

export const STORAGE_KEY = 'lcc_course_params_v1';

export function cloneParams(value) {
  return JSON.parse(JSON.stringify(value));
}

export function money(v, d = 0) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: d,
    maximumFractionDigits: d
  }).format(v);
}

export function num(v, d = 2) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: d
  }).format(v);
}

export function signedMoney(v, d = 0) {
  return (v > 0 ? '+' : '') + money(v, d);
}

export function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneParams(DEFAULTS);
    const parsed = JSON.parse(raw);
    if (parsed && parsed.A && parsed.B && Number.isFinite(parsed.hours)) {
      return parsed;
    }
  } catch (_) {}
  return cloneParams(DEFAULTS);
}

export function saveParams(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (_) {}
}

export function resetParams() {
  const fresh = cloneParams(DEFAULTS);
  saveParams(fresh);
  return fresh;
}

export function model(p, side, hours = p.hours) {
  const s = p[side];
  const n = p.years;
  const r = p.rate / 100;
  const factor = r === 0 ? n : -Math.expm1(-n * Math.log1p(r)) / r;

  const initial = s.purchase + s.engineering + s.logistics + s.installation + s.commissioning;
  const energy = s.power * hours * p.tariff;
  const failures = hours / s.mtbf;
  const corrective = failures * s.repair;
  const downHours = failures * s.downtime;
  const loss = downHours * p.loss;

  const directAnnual = energy + s.operation + s.planned + corrective;
  const annual = directAnnual + loss;

  const renewalPV = p.renewalYear <= n ? s.renewal / Math.pow(1 + r, p.renewalYear) : 0;
  const terminalPV = (s.disposal - s.residual) / Math.pow(1 + r, n);
  const directLCC = initial + directAnnual * factor + renewalPV + terminalPV;
  const lossPV = loss * factor;
  const lcc = directLCC + lossPV;

  const flow = [
    {
      year: 0,
      initial,
      energy: 0,
      operation: 0,
      planned: 0,
      corrective: 0,
      loss: 0,
      renewal: 0,
      disposal: 0,
      residual: 0,
      total: initial,
      pv: initial
    }
  ];

  for (let year = 1; year <= n; year++) {
    const renewal = year === p.renewalYear ? s.renewal : 0;
    const disposal = year === n ? s.disposal : 0;
    const residual = year === n ? s.residual : 0;
    const total = annual + renewal + disposal - residual;
    flow.push({
      year,
      initial: 0,
      energy,
      operation: s.operation,
      planned: s.planned,
      corrective,
      loss,
      renewal,
      disposal,
      residual,
      total,
      pv: total / Math.pow(1 + r, year)
    });
  }

  return {
    initial,
    energy,
    failures,
    corrective,
    downHours,
    loss,
    directAnnual,
    annual,
    factor,
    renewalPV,
    terminalPV,
    directLCC,
    lossPV,
    lcc,
    cae: lcc / factor,
    flow
  };
}

export function comparison(hours = DEFAULTS.hours, p = DEFAULTS) {
  const A = model(p, 'A', hours);
  const B = model(p, 'B', hours);
  return { A, B, delta: A.lcc - B.lcc };
}

export function thresholdHours(p = DEFAULTS) {
  const d0 = comparison(0, p).delta;
  const slope = comparison(1, p).delta - d0;
  return Math.abs(slope) < 1e-8 ? null : -d0 / slope;
}

export const SENS_DRIVERS = [
  { key: 'hours', label: 'Horas de operação/ano' },
  { key: 'tariff', label: 'Tarifa de energia' },
  { key: 'loss', label: 'Perda produtiva/hora' },
  { key: 'mtbf', label: 'Confiabilidade (MTBF)' },
  { key: 'planned', label: 'Manutenção planejada' },
  { key: 'repair', label: 'Custo por reparo' },
  { key: 'rate', label: 'Taxa de desconto' }
];

export function variedParam(p, key, mult) {
  const copy = cloneParams(p);
  if (key === 'hours') copy.hours = Math.min(8760, p.hours * mult);
  else if (key === 'tariff' || key === 'loss' || key === 'rate') copy[key] = p[key] * mult;
  else if (key === 'planned') {
    for (const side of ['A', 'B']) {
      copy[side].planned = p[side].planned * mult;
      copy[side].renewal = p[side].renewal * mult;
    }
  } else {
    for (const side of ['A', 'B']) copy[side][key] = p[side][key] * mult;
  }
  return copy;
}

export function sensitivityData(p = DEFAULTS, spread = 20) {
  const base = comparison(p.hours, p).delta;
  const lowMult = 1 - spread / 100;
  const highMult = 1 + spread / 100;

  return SENS_DRIVERS.map((d) => {
    const pLow = variedParam(p, d.key, lowMult);
    const pHigh = variedParam(p, d.key, highMult);
    const dLow = comparison(pLow.hours, pLow).delta;
    const dHigh = comparison(pHigh.hours, pHigh).delta;
    const min = Math.min(dLow, dHigh);
    const max = Math.max(dLow, dHigh);
    return {
      key: d.key,
      label: d.label,
      dLow,
      dHigh,
      min,
      max,
      swing: max - min,
      flips: (dLow < 0 && dHigh > 0) || (dLow > 0 && dHigh < 0)
    };
  }).sort((a, b) => b.swing - a.swing);
}

export function decisionCurvePoints(p = DEFAULTS, variable = 'hours', maxHours = 1200) {
  const points = [];
  const maxX = variable === 'hours' ? maxHours : Math.max(2.0, p.tariff * 2.5);
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (maxX * i) / steps;
    const test = cloneParams(p);
    test[variable] = x;
    const res = comparison(test.hours, test);
    points.push({ x, a: res.A.lcc, b: res.B.lcc, delta: res.delta });
  }
  return { points, maxX };
}

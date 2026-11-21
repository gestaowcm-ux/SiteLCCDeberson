# Documentação de Interação: Simulador de Fluxo de OS e KPIs (Work Order & KPI Simulator)

Este documento especifica os padrões de comportamento interativo, reatividade matemática de indicadores e técnicas de performance para a página **Gestão de KPIs de Manutenção**, com base nos arquivos analisados do projeto SiteMentoria.

---

## Descrição da Funcionalidade

### 1. Seletor Interativo de Campos de Ordem de Serviço (Database Fields)
O módulo de fluxo de dados permite ao usuário clicar em campos individuais de uma "Ficha de Ordem de Serviço" mockada (ex: Número da OS, Data de Abertura, TAG do Ativo, Sintoma, Fechamento Técnico):
* **Foco e Destaque**: Ao clicar em um campo, a célula ganha destaque com cor de borda preta espessa (`border-color: var(--color-ink)`) e as demais esmaecem.
* **Painel de Relação e Impacto**: Um painel lateral é preenchido reativamente com:
  * Descrição detalhada do campo técnico.
  * O impacto desse campo no cálculo de KPIs de confiabilidade.
  * Uma dica prática (ex: "Nunca reutilize números de OS para evitar duplicidade de cadastro").

### 2. Calculadora de KPIs Reativa (Live Calculator & Sinaleira)
Permite ao usuário selecionar um indicador-chave de desempenho (Disponibilidade, MTBF, MTTR, Backlog, OEE) e interagir com uma simulação numérica de cálculo:
* **Entradas Dinâmicas (Dynamic Inputs)**: O contêiner de inputs limpa e cria formulários numéricos específicos para o KPI escolhido (ex: Horas Totais Disponíveis, Tempo Fora de Operação, Número de Falhas para o MTBF).
* **Processamento de Fórmulas no Cliente**:
  * Ao digitar valores em qualquer campo, o script dispara a função `calculateKPI` ligada ao evento `input`.
  * As fórmulas matemáticas de cálculo (ex: $MTBF = \frac{HorasOperacao - TempoIndisponibilidade}{NumeroFalhas}$) são executadas dinamicamente.
* **Semáforo de Metas (Traffic Light Thresholds)**:
  * A cor do valor resultante muda instantaneamente com base no atingimento da meta definida para o KPI:
    * **Verde (Dentro da Meta)**: Se o resultado estiver acima da meta (ou abaixo, caso o indicador seja tempo de reparo ou falhas).
    * **Amarelo (Atenção)**: Se o resultado estiver dentro de uma margem de segurança crítica.
    * **Vermelho (Fora da Meta)**: Se o resultado violar gravemente a meta de engenharia estabelecida.

---

## Guia Conceitual de Performance

### 1. Debouncing em Inputs Numéricos
* Embora os cálculos matemáticos simples de KPIs não pesem na CPU, atualizações na tela em dispositivos de baixa performance sob digitação contínua de valores decimais longos podem gerar gargalos de renderização se associados a gráficos complexos.
* Se a calculadora estiver acoplada a desenhos de gráficos de barras ou de tendências, recomenda-se aplicar uma técnica de *debouncing* (atraso de 50ms) ou usar `requestAnimationFrame` para adiar a re-renderização visual do gráfico até que a digitação pare temporariamente.

### 2. Transições de Estado Semáforo
* A troca de classes CSS de semáforo (`semaforo-display.dentro` / `semaforo-display.atencao` / `semaforo-display.fora`) deve aplicar animações curtas de cor de texto e cor de fundo (`transition: background-color 0.2s ease, color 0.2s ease`) para suavizar o feedback de transição entre estados críticos.

---

## Código de Exemplo Completo

Abaixo está o código autônomo de uma calculadora reativa de Disponibilidade e MTBF com sinaleira interativa integrada.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador de KPIs e Metas de Manutenção</title>
  <style>
    :root {
      --color-bg: #09090b;
      --color-card: #18181b;
      --color-border: #27272a;
      --color-text: #ffffff;
      --color-text-mute: #71717a;
      --color-green: #10b981;
      --color-yellow: #f59e0b;
      --color-red: #ef4444;
      --color-accent: #3b82f6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
    }

    h2 { font-size: 20px; margin-bottom: 15px; }

    /* KPI Select tab */
    .kpi-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .kpi-tab {
      background: #27272a;
      color: var(--color-text-mute);
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .kpi-tab.active {
      background: var(--color-accent);
      color: white;
    }

    /* Calculator Grid */
    .calc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media(max-width: 600px) {
      .calc-grid { grid-template-columns: 1fr; }
    }

    .input-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label { font-size: 13px; color: var(--color-text-mute); }
    .form-group input {
      background: #09090b;
      border: 1px solid var(--color-border);
      color: white;
      padding: 10px;
      border-radius: 6px;
      outline: none;
      font-size: 15px;
    }
    .form-group input:focus { border-color: var(--color-accent); }

    /* Semáforo Display */
    .semaforo-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .result-value {
      font-size: 48px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 8px;
      transition: color 0.3s ease;
    }

    .result-value.green { color: var(--color-green); }
    .result-value.yellow { color: var(--color-yellow); }
    .result-value.red { color: var(--color-red); }

    .result-meta {
      font-size: 12px;
      color: var(--color-text-mute);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .result-status {
      font-size: 14px;
      font-weight: 700;
      margin-top: 5px;
    }
    .result-status.green { color: var(--color-green); }
    .result-status.yellow { color: var(--color-yellow); }
    .result-status.red { color: var(--color-red); }
  </style>
</head>
<body>

  <div class="container">
    <div class="card">
      <h2>Painel de Simulação de Confiabilidade & KPIs</h2>
      
      <!-- Select KPIs Tab -->
      <div class="kpi-tabs">
        <button class="kpi-tab active" data-kpi="disp">Disponibilidade</button>
        <button class="kpi-tab" data-kpi="mtbf">MTBF</button>
      </div>

      <div class="calc-grid">
        <!-- Input Form -->
        <div class="input-form" id="input-container">
          <!-- Dynamic inputs will load here -->
        </div>

        <!-- Semantic Semaforo Result -->
        <div class="semaforo-container">
          <span class="result-meta" id="kpi-label-display">Disponibilidade Operacional</span>
          <div class="result-value green" id="result-val">100%</div>
          <div class="result-status green" id="result-status">DENTRO DA META</div>
          <span style="font-size:11px; color:var(--color-text-mute); margin-top:8px;" id="kpi-formula-display">Meta: &gt; 95% | Fórmula: (H_Ativas / H_Calendário) * 100</span>
        </div>
      </div>

    </div>
  </div>

  <script>
    const KPIS = {
      disp: {
        name: 'Disponibilidade',
        formula: 'Fórmula: ((H_Calendário - H_Indisponíveis) / H_Calendário) * 100',
        metaText: 'Meta: > 95%',
        inputs: [
          { id: 'cal_hours', label: 'Horas Calendário Totais (h)', default: 720 },
          { id: 'down_hours', label: 'Horas Indisponíveis por Falha (h)', default: 24 }
        ],
        calculate: (vals) => {
          if (vals.cal_hours <= 0) return 0;
          return ((vals.cal_hours - vals.down_hours) / vals.cal_hours) * 100;
        },
        evaluate: (val) => {
          if (val >= 95) return 'green';
          if (val >= 90) return 'yellow';
          return 'red';
        },
        format: (val) => `${val.toFixed(1)}%`
      },
      mtbf: {
        name: 'MTBF (Período Médio Entre Falhas)',
        formula: 'Fórmula: (Horas Ativas - Horas Paradas) / Nº de Falhas',
        metaText: 'Meta: > 150h',
        inputs: [
          { id: 'uptime_hours', label: 'Horas Ativas Totais (h)', default: 720 },
          { id: 'down_hours_mtbf', label: 'Horas Paradas Totais (h)', default: 30 },
          { id: 'failures', label: 'Número de Falhas Registradas', default: 3 }
        ],
        calculate: (vals) => {
          if (vals.failures <= 0) return vals.uptime_hours - vals.down_hours_mtbf;
          return (vals.uptime_hours - vals.down_hours_mtbf) / vals.failures;
        },
        evaluate: (val) => {
          if (val >= 150) return 'green';
          if (val >= 100) return 'yellow';
          return 'red';
        },
        format: (val) => `${val.toFixed(0)}h`
      }
    };

    let activeKPI = 'disp';

    const inputContainer = document.getElementById('input-container');
    const resultVal = document.getElementById('result-val');
    const resultStatus = document.getElementById('result-status');
    const kpiLabelDisplay = document.getElementById('kpi-label-display');
    const kpiFormulaDisplay = document.getElementById('kpi-formula-display');

    function loadKPICalculator(kpiKey) {
      activeKPI = kpiKey;
      const kpi = KPIS[kpiKey];
      
      kpiLabelDisplay.textContent = kpi.name;
      kpiFormulaDisplay.textContent = `${kpi.metaText} | ${kpi.formula}`;

      // Populate input form
      inputContainer.innerHTML = '';
      kpi.inputs.forEach(inp => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
          <label for="${inp.id}">${inp.label}</label>
          <input type="number" id="${inp.id}" value="${inp.default}">
        `;
        inputContainer.appendChild(group);
        
        // Listen input event
        group.querySelector('input').addEventListener('input', runCalculations);
      });

      runCalculations();
    }

    function runCalculations() {
      const kpi = KPIS[activeKPI];
      const vals = {};
      kpi.inputs.forEach(inp => {
        const el = document.getElementById(inp.id);
        vals[inp.id] = el ? parseFloat(el.value) || 0 : 0;
      });

      const result = kpi.calculate(vals);
      const status = kpi.evaluate(result);

      // Render Result UI
      resultVal.textContent = kpi.format(result);
      resultVal.className = `result-value ${status}`;
      
      const statusTexts = {
        green: 'DENTRO DA META',
        yellow: 'ATENÇÃO CRÍTICA',
        red: 'FORA DA META'
      };
      
      resultStatus.textContent = statusTexts[status];
      resultStatus.className = `result-status ${status}`;
    }

    // Tabs binding
    document.querySelectorAll('.kpi-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.kpi-tab').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadKPICalculator(e.target.dataset.kpi);
      });
    });

    // Init
    loadKPICalculator('disp');
  </script>
</body>
</html>
```

/**
 * StickManBlueprint50.js
 * Catálogo Completo das 50 Poses do Stick Man Blueprint CAD Industrial
 * Projetado para Curso RCA — Engenharia, Confiabilidade e Gestão de Ativos
 */

(function() {
  'use strict';

  // Base helper para gerar a cabeça com cruzeta CAD clássica
  function headCAD(cx, cy, r = 19) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" stroke="currentColor" stroke-width="2.2" fill="none"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>
      <line x1="${cx}" y1="${cy - r - 6}" x2="${cx}" y2="${cy + r + 6}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7"/>
      <line x1="${cx - r - 6}" y1="${cy}" x2="${cx + r + 6}" y2="${cy}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7"/>
    `;
  }

  // Base helper para nós de articulação
  function joint(cx, cy, r = 3) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;
  }

  // Definição das 50 Poses com metadados, identificadores e SVGs puros
  const cadCatalog = [
    // ----------------------------------------------------
    // GRUPO 1: ALERTAS, ALARMES E INCIDENTES (CAD-01 a CAD-08)
    // ----------------------------------------------------
    {
      id: 'CAD-01',
      num: 1,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Alarme de Sobrecarga',
      desc: 'Nó central em sobretensão com linhas de alerta dinâmico.',
      keywords: 'alarme sobrecarga choque alerta falha perigo emergência',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 40H170M30 230H170" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
  <text x="135" y="38" font-size="8" fill="currentColor" font-family="monospace">ΔT > MAX</text>
  ${headCAD(100, 68)}
  <line x1="100" y1="90" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 110)}${joint(100, 165)}
  <path d="M100 110L65 85L50 55" stroke="currentColor" stroke-width="2.5"/>
  ${joint(65, 85)}${joint(50, 55)}
  <path d="M100 110L135 85L150 55" stroke="currentColor" stroke-width="2.5"/>
  ${joint(135, 85)}${joint(150, 55)}
  <path d="M100 165L70 195L55 230" stroke="currentColor" stroke-width="2.5"/>
  ${joint(70, 195)}
  <path d="M100 165L130 195L145 230" stroke="currentColor" stroke-width="2.5"/>
  ${joint(130, 195)}
  <path d="M35 55L45 68M165 55L155 68" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`
    },
    {
      id: 'CAD-02',
      num: 2,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Botão E-Stop de Emergência',
      desc: 'Acionando com a palma da mão o botão tipo cogumelo de parada.',
      keywords: 'estop parada emergencia botao cogumelo desligamento seguranca',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Botão E-Stop Cogumelo -->
  <rect x="135" y="110" width="30" height="40" stroke="currentColor" stroke-width="2" fill="none"/>
  <ellipse cx="150" cy="110" rx="20" ry="8" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <line x1="150" y1="118" x2="150" y2="128" stroke="currentColor" stroke-width="4"/>
  <text x="133" y="162" font-size="8" fill="currentColor" font-family="monospace">E-STOP</text>
  ${headCAD(75, 68)}
  <line x1="75" y1="90" x2="80" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(76, 110)}${joint(80, 165)}
  <path d="M76 110L115 105L145 108" stroke="currentColor" stroke-width="2.5"/>
  ${joint(115, 105)}${joint(145, 108, 4)}
  <path d="M76 110L50 135L42 155" stroke="currentColor" stroke-width="2.5"/>
  ${joint(50, 135)}
  <path d="M80 165L60 195L50 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L105 195L115 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-03',
      num: 3,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Vazamento sob Pressão',
      desc: 'Identificando jato de pressão e duto com perda de estanqueidade.',
      keywords: 'vazamento pressao duto fluido gas perda contencao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Duto e Jato -->
  <line x1="140" y1="30" x2="140" y2="210" stroke="currentColor" stroke-width="4"/>
  <line x1="155" y1="30" x2="155" y2="210" stroke="currentColor" stroke-width="4"/>
  <path d="M140 100L95 80M140 105L85 100M140 110L90 120" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 3"/>
  <text x="145" y="95" font-size="8" fill="currentColor" font-family="monospace">ΔP=12bar</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="96" x2="55" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(62, 115)}${joint(55, 165)}
  <path d="M62 115L90 105" stroke="currentColor" stroke-width="2.5"/>
  ${joint(90, 105)}
  <path d="M62 115L40 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M55 165L40 198L35 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M55 165L80 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-04',
      num: 4,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Superaquecimento Térmico',
      desc: 'Termômetro infravermelho e gradiente térmico elevado.',
      keywords: 'temperatura calor superaquecimento termografia termometro quente',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Mira de Termografia -->
  <circle cx="145" cy="80" r="22" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/>
  <line x1="145" y1="52" x2="145" y2="108" stroke="currentColor" stroke-width="1"/>
  <line x1="117" y1="80" x2="173" y2="80" stroke="currentColor" stroke-width="1"/>
  <text x="130" y="75" font-size="8" fill="currentColor" font-family="monospace">145°C</text>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(70, 112)}${joint(70, 165)}
  <path d="M70 112L105 95L125 88" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 95)}${joint(125, 88)}
  <path d="M70 112L48 135L42 155" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L88 198L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-05',
      num: 5,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Vibração & Desbalanceamento',
      desc: 'Registro de ondas senoidais e aceleração mecânica fora do padrão.',
      keywords: 'vibracao desbalanceamento acelerometro senoide frequencia mecanica',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Onda de Vibração -->
  <path d="M20 35Q40 15 60 35T100 35T140 35T180 35" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <line x1="20" y1="35" x2="180" y2="35" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.5"/>
  <text x="140" y="24" font-size="8" fill="currentColor" font-family="monospace">Vrms>15mm/s</text>
  ${headCAD(100, 75)}
  <line x1="100" y1="97" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 115)}${joint(100, 165)}
  <path d="M100 115L70 95L55 80" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 115L130 95L145 80" stroke="currentColor" stroke-width="2.5"/>
  ${joint(70, 95)}${joint(130, 95)}
  <path d="M100 165L80 198L70 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L120 198L130 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-06',
      num: 6,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Arco Elétrico & Curto-Circuito',
      desc: 'Proteção contra descarga e linhas de arco voltaico.',
      keywords: 'arco eletrico curto circuito choque eletricidade disjuntor',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Símbolo de Raio Elétrico -->
  <path d="M140 30L125 55H145L120 90" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="145" y="45" font-size="8" fill="currentColor" font-family="monospace">13.8 kV</text>
  ${headCAD(75, 75)}
  <line x1="75" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(72, 115)}${joint(65, 165)}
  <!-- Braço em Defesa -->
  <path d="M72 115L95 90L115 85" stroke="currentColor" stroke-width="2.5"/>
  ${joint(95, 90)}${joint(115, 85)}
  <path d="M72 115L45 130" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L45 198L35 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L90 198L105 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-07',
      num: 7,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Trinca por Fadiga',
      desc: 'Apontando para fratura com cota de propagação milimétrica.',
      keywords: 'trinca fadiga fratura metalografia fissura metallurgia',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Linha de Trinca com Cota -->
  <path d="M130 110L145 130L140 145L160 170" stroke="currentColor" stroke-width="3"/>
  <line x1="125" y1="110" x2="165" y2="110" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/>
  <line x1="125" y1="170" x2="165" y2="170" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/>
  <line x1="175" y1="110" x2="175" y2="170" stroke="currentColor" stroke-width="1.2"/>
  <text x="178" y="143" font-size="8" fill="currentColor" font-family="monospace">a=60mm</text>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="80" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(73, 112)}${joint(80, 165)}
  <path d="M73 112L110 120L130 135" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 120)}${joint(130, 135)}
  <path d="M73 112L50 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L60 198L50 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L105 198L115 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-08',
      num: 8,
      group: 'alarm',
      groupLabel: 'Alertas & Incidentes',
      name: 'Bloqueio & Travamento LOTO',
      desc: 'Cadeado e cartão de bloqueio físico para energia zero.',
      keywords: 'loto bloqueio travamento cadeado energia zero seguranca',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cadeado LOTO -->
  <rect x="125" y="115" width="28" height="24" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M132 115V102C132 97 146 97 146 102V115" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="128" y="130" font-size="7" fill="currentColor" font-family="monospace">LOTO</text>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(70, 112)}${joint(70, 165)}
  <path d="M70 112L105 110L125 118" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 110)}${joint(125, 118)}
  <path d="M70 112L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L55 198L48 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L88 198L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },

    // ----------------------------------------------------
    // GRUPO 2: METROLOGIA, INSPEÇÃO E COLETA (CAD-09 a CAD-16)
    // ----------------------------------------------------
    {
      id: 'CAD-09',
      num: 9,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Medição com Paquímetro',
      desc: 'Checagem de diâmetro e tolerância dimensional.',
      keywords: 'paquimetro medicao metrologia diametro cota dimensao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Paquímetro -->
  <line x1="110" y1="85" x2="175" y2="85" stroke="currentColor" stroke-width="2.5"/>
  <line x1="115" y1="80" x2="115" y2="105" stroke="currentColor" stroke-width="2"/>
  <line x1="145" y1="80" x2="145" y2="105" stroke="currentColor" stroke-width="2"/>
  <text x="120" y="78" font-size="8" fill="currentColor" font-family="monospace">Ø 30.02</text>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="80" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(73, 112)}${joint(80, 165)}
  <path d="M73 112L110 90" stroke="currentColor" stroke-width="2.5"/>
  <path d="M73 112L135 90" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 90)}${joint(135, 90)}
  <path d="M80 165L62 198L55 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L102 198L110 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-10',
      num: 10,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Micrômetro de Alta Precisão',
      desc: 'Verificação micrométrica com arco rígido.',
      keywords: 'micrometro medicao precisao milesimos metrologia',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Micrômetro -->
  <path d="M125 75C115 85 115 105 125 115H150V75H125Z" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="150" y1="95" x2="175" y2="95" stroke="currentColor" stroke-width="3"/>
  <text x="122" y="70" font-size="8" fill="currentColor" font-family="monospace">±0.005mm</text>
  ${headCAD(65, 70)}
  <line x1="65" y1="92" x2="75" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(68, 112)}${joint(75, 165)}
  <path d="M68 112L115 95" stroke="currentColor" stroke-width="2.5"/>
  <path d="M68 112L150 95" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 165L55 198L48 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 165L98 198L105 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-11',
      num: 11,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Inspeção com Lupa Forense',
      desc: 'Inspeção visual direta com lente de ampliação.',
      keywords: 'lupa forense microscopio inspecao visual analise estria',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Lupa com Cruzeta -->
  <circle cx="140" cy="110" r="18" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <line x1="153" y1="123" x2="172" y2="142" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M133 110H147M140 103V117" stroke="currentColor" stroke-width="1.5"/>
  ${headCAD(75, 70)}
  <line x1="75" y1="92" x2="85" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(78, 112)}${joint(85, 165)}
  <path d="M78 112L120 115L155 125" stroke="currentColor" stroke-width="2.5"/>
  ${joint(120, 115)}
  <path d="M78 112L55 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M85 165L65 198L55 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M85 165L108 198L115 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-12',
      num: 12,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Amostragem de Óleo & Tribologia',
      desc: 'Coletando frasco de lubrificante para análise laboratorial.',
      keywords: 'oleo lubrificante tribologia amostra frasco laboratorio',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Frasco de Amostra -->
  <rect x="135" y="105" width="22" height="35" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="140" y1="100" x2="152" y2="100" stroke="currentColor" stroke-width="3"/>
  <line x1="135" y1="125" x2="157" y2="125" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <text x="136" y="93" font-size="7" fill="currentColor" font-family="monospace">ISO 4406</text>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(70, 112)}${joint(70, 165)}
  <path d="M70 112L105 110L135 115" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 110)}${joint(135, 115)}
  <path d="M70 112L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L55 198L48 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L88 198L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-13',
      num: 13,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Ensaio de Ultrassom (END)',
      desc: 'Sonda piezoelétrica para detecção de descontinuidades.',
      keywords: 'ultrassom end ensaio nao destrutivo sonda eco espessura',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Sonda e Ecos -->
  <rect x="140" y="120" width="20" height="15" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M140 120Q120 100 110 70" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
  <path d="M150 140V180" stroke="currentColor" stroke-width="4"/>
  <text x="125" y="60" font-size="8" fill="currentColor" font-family="monospace">5 MHz</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="75" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(68, 115)}${joint(75, 165)}
  <path d="M68 115L110 120L140 125" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 120)}${joint(140, 125)}
  <path d="M68 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 165L55 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M75 165L98 198L105 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-14',
      num: 14,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Torquímetro & Momento Angular',
      desc: 'Aplicação de torque controlado conforme especificação.',
      keywords: 'torquimetro torque aperto momento forca parafuso parafuso',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Torquímetro com Vetor de Torque -->
  <line x1="110" y1="120" x2="165" y2="90" stroke="currentColor" stroke-width="3"/>
  <circle cx="110" cy="120" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M150 75A15 15 0 0 1 170 95" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <text x="135" y="70" font-size="8" fill="currentColor" font-family="monospace">120 N·m</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 120" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L145 100" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 120)}${joint(145, 100)}
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-15',
      num: 15,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Leitura de Manômetro',
      desc: 'Verificação visual direta de escala de pressão.',
      keywords: 'manometro pressao escala agulha bar psi leitura',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Manômetro -->
  <circle cx="145" cy="85" r="22" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="145" y1="85" x2="155" y2="73" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="145" y1="107" x2="145" y2="135" stroke="currentColor" stroke-width="3"/>
  <text x="130" y="60" font-size="8" fill="currentColor" font-family="monospace">6.5 BAR</text>
  ${headCAD(70, 75)}
  <line x1="70" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(70, 115)}${joint(70, 165)}
  <path d="M70 115L110 100L125 90" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 100)}${joint(125, 90)}
  <path d="M70 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L55 198L48 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L88 198L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-16',
      num: 16,
      group: 'metro',
      groupLabel: 'Metrologia & Coleta',
      name: 'Alinhamento a Laser de Eixos',
      desc: 'Feixe óptico coaxial para ajuste de paralelismo angular.',
      keywords: 'alinhamento laser eixos coaxial paralelismo desvio',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Feixe Laser -->
  <line x1="25" y1="135" x2="175" y2="135" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/>
  <circle cx="150" cy="135" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <text x="125" y="125" font-size="8" fill="currentColor" font-family="monospace">θ < 0.05°</text>
  ${headCAD(80, 75)}
  <line x1="80" y1="97" x2="80" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(80, 115)}${joint(80, 165)}
  <path d="M80 115L115 125L145 135" stroke="currentColor" stroke-width="2.5"/>
  ${joint(115, 125)}${joint(145, 135)}
  <path d="M80 115L55 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L62 198L55 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L98 198L105 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },

    // ----------------------------------------------------
    // GRUPO 3: FERRAMENTAS RCA & INVESTIGAÇÃO (CAD-17 a CAD-24)
    // ----------------------------------------------------
    {
      id: 'CAD-17',
      num: 17,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Diagrama de Ishikawa 6M',
      desc: 'Espinha de peixe com ramos para método, máquina, etc.',
      keywords: 'ishikawa 6m espinha de peixe causa efeito diagrama',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Espinha de Peixe CAD -->
  <line x1="100" y1="70" x2="185" y2="70" stroke="currentColor" stroke-width="2"/>
  <line x1="120" y1="45" x2="135" y2="70" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="95" x2="135" y2="70" stroke="currentColor" stroke-width="1.5"/>
  <line x1="150" y1="45" x2="165" y2="70" stroke="currentColor" stroke-width="1.5"/>
  <line x1="150" y1="95" x2="165" y2="70" stroke="currentColor" stroke-width="1.5"/>
  <rect x="175" y="60" width="18" height="20" stroke="currentColor" stroke-width="1.5" fill="none"/>
  ${headCAD(60, 75)}
  <line x1="60" y1="97" x2="60" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(60, 115)}${joint(60, 165)}
  <path d="M60 115L95 85L120 70" stroke="currentColor" stroke-width="2.5"/>
  ${joint(95, 85)}
  <path d="M60 115L40 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M60 165L45 198L38 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M60 165L78 198L85 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-18',
      num: 18,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Os 5 Porquês',
      desc: 'Encadeamento causal vertical com níveis de profundidade.',
      keywords: '5 porques 5w causa raiz encadeamento profundidade niveis',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 5 Caixas Verticais -->
  <rect x="125" y="30" width="55" height="15" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <text x="130" y="41" font-size="8" fill="currentColor" font-family="monospace">1. POR QUE?</text>
  <line x1="152" y1="45" x2="152" y2="55" stroke="currentColor" stroke-width="1.5"/>
  <rect x="125" y="55" width="55" height="15" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="152" y1="70" x2="152" y2="80" stroke="currentColor" stroke-width="1.5"/>
  <rect x="125" y="80" width="55" height="15" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="152" y1="95" x2="152" y2="105" stroke="currentColor" stroke-width="1.5"/>
  <rect x="125" y="105" width="55" height="15" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="130" y="116" font-size="8" fill="currentColor" font-family="monospace">5. RAIZ</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 105L125 112" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 105)}
  <path d="M65 115L42 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-19',
      num: 19,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Árvore de Falhas (FTA)',
      desc: 'Portas lógicas E/OU com ramificações de eventos.',
      keywords: 'fta arvore de falhas portas logicas and or eventos arvore',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Porta Lógica FTA -->
  <rect x="135" y="30" width="35" height="18" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="152" y1="48" x2="152" y2="60" stroke="currentColor" stroke-width="1.5"/>
  <!-- Porta AND -->
  <path d="M142 60H162V72C162 78 142 78 142 72Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="145" y1="78" x2="135" y2="95" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160" y1="78" x2="170" y2="95" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="135" cy="100" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <circle cx="170" cy="100" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L105 85L135 65" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 85)}
  <path d="M65 115L42 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-20',
      num: 20,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Diagrama BowTie',
      desc: 'Top Event central com barreiras preventivas e mitigadoras.',
      keywords: 'bowtie barreiras top event ameaca consequencia mitigacao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- BowTie Shape -->
  <polygon points="100,75 140,55 140,95" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <circle cx="140" cy="75" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
  <polygon points="180,55 140,75 180,95" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="118" y1="60" x2="118" y2="90" stroke="currentColor" stroke-width="2.5"/>
  <line x1="162" y1="60" x2="162" y2="90" stroke="currentColor" stroke-width="2.5"/>
  ${headCAD(55, 75)}
  <line x1="55" y1="97" x2="55" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(55, 115)}${joint(55, 165)}
  <path d="M55 115L95 85L132 75" stroke="currentColor" stroke-width="2.5"/>
  ${joint(95, 85)}
  <path d="M55 115L35 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M55 165L40 198L32 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M55 165L72 198L80 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-21',
      num: 21,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Matriz de Risco FMEA',
      desc: 'Grid 3x3 de severidade, ocorrência e detecção.',
      keywords: 'fmea risco matriz severidade ocorrencia rpn npr',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Grid 3x3 -->
  <rect x="120" y="45" width="60" height="60" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="140" y1="45" x2="140" y2="105" stroke="currentColor" stroke-width="1"/>
  <line x1="160" y1="45" x2="160" y2="105" stroke="currentColor" stroke-width="1"/>
  <line x1="120" y1="65" x2="180" y2="65" stroke="currentColor" stroke-width="1"/>
  <line x1="120" y1="85" x2="180" y2="85" stroke="currentColor" stroke-width="1"/>
  <circle cx="170" cy="55" r="4" fill="currentColor"/>
  <text x="125" y="40" font-size="8" fill="currentColor" font-family="monospace">RPN CRÍTICO</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 85L120 75" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 85)}
  <path d="M65 115L42 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-22',
      num: 22,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Dúvida & Bifurcação de Hipóteses',
      desc: 'Postura de reflexão diante de caminhos divergentes.',
      keywords: 'duvida hipoteses bifurcacao caminhos escolha analise',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Setas de Bifurcação -->
  <path d="M100 45V20L75 5M100 20L125 5" stroke="currentColor" stroke-width="2"/>
  <text x="50" y="10" font-size="8" fill="currentColor" font-family="monospace">HIP. A</text>
  <text x="130" y="10" font-size="8" fill="currentColor" font-family="monospace">HIP. B</text>
  ${headCAD(100, 75)}
  <line x1="100" y1="97" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 115)}${joint(100, 165)}
  <path d="M100 115L75 105L90 85" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 115L125 105L110 85" stroke="currentColor" stroke-width="2.5"/>
  ${joint(75, 105)}${joint(125, 105)}
  <path d="M100 165L80 198L70 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L120 198L130 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-23',
      num: 23,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Eureka da Causa Raiz',
      desc: 'Ponto focal iluminado com convergência total de vetores.',
      keywords: 'eureka descoberta causa raiz lampada insight solucao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Ponto Focal / Lâmpada CAD -->
  <circle cx="100" cy="25" r="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  <circle cx="100" cy="25" r="4" fill="currentColor"/>
  <line x1="100" y1="5" x2="100" y2="45" stroke="currentColor" stroke-width="1"/>
  <line x1="80" y1="25" x2="120" y2="25" stroke="currentColor" stroke-width="1"/>
  ${headCAD(100, 75)}
  <line x1="100" y1="95" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 112)}${joint(100, 165)}
  <path d="M100 112L70 85L95 38" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 112L130 85L105 38" stroke="currentColor" stroke-width="2.5"/>
  ${joint(70, 85)}${joint(130, 85)}
  <path d="M100 165L75 198L65 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L125 198L135 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-24',
      num: 24,
      group: 'rca',
      groupLabel: 'Ferramentas RCA',
      name: 'Debate Técnico Multidisciplinar',
      desc: 'Segurando prancheta de dados em discussão com time.',
      keywords: 'debate equipe colaboracao discussao multidisciplinar reuniao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Prancheta Segurada -->
  <rect x="110" y="90" width="30" height="42" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="118" y1="102" x2="132" y2="102" stroke="currentColor" stroke-width="2"/>
  <line x1="118" y1="112" x2="132" y2="112" stroke="currentColor" stroke-width="2"/>
  <line x1="118" y1="122" x2="128" y2="122" stroke="currentColor" stroke-width="2"/>
  ${headCAD(70, 70)}
  <line x1="70" y1="92" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(70, 112)}${joint(70, 165)}
  <path d="M70 112L110 110" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 112L130 110" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 110)}${joint(130, 110)}
  <path d="M70 165L55 198L48 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L88 198L95 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },

    // ----------------------------------------------------
    // GRUPO 4: APRESENTAÇÃO, LIDERANÇA E 5W2H (CAD-25 a CAD-32)
    // ----------------------------------------------------
    {
      id: 'CAD-25',
      num: 25,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Apresentação com Ponteiro',
      desc: 'Ponteiro laser projetando dados no telão executivo.',
      keywords: 'apresentacao telao ponteiro laser grafico slide pitch',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Telão Projetado -->
  <rect x="110" y="30" width="75" height="55" rx="3" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" fill="none"/>
  <line x1="118" y1="65" x2="135" y2="45L150" y2="55L175" y2="38" stroke="currentColor" stroke-width="1.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L105 85L150 55" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 85)}${joint(150, 55, 4)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-26',
      num: 26,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Matriz 5W2H de Ações',
      desc: 'Checklist com prazos, responsáveis e status.',
      keywords: '5w2h plano de acao checklist matriz prazos tarefas',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Quadro 5W2H -->
  <rect x="110" y="35" width="75" height="70" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="120" y="48" font-size="7" fill="currentColor" font-family="monospace">PLANO 5W2H</text>
  <rect x="118" y="55" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>
  <line x1="130" y1="60" x2="175" y2="60" stroke="currentColor" stroke-width="1.5"/>
  <rect x="118" y="70" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>
  <line x1="130" y1="75" x2="165" y2="75" stroke="currentColor" stroke-width="1.5"/>
  <rect x="118" y="85" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>
  <line x1="130" y1="90" x2="170" y2="90" stroke="currentColor" stroke-width="1.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 95L118 74" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 95)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-27',
      num: 27,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Curva da Banheira (Bathtub)',
      desc: 'Taxa de falhas na mortalidade infantil, vida útil e desgaste.',
      keywords: 'curva da banheira bathtub confiabilidade taxa falha desgaste',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Gráfico Curva da Banheira -->
  <path d="M110 35V95H180" stroke="currentColor" stroke-width="1.5"/>
  <path d="M115 45Q125 80 145 80T175 45" stroke="currentColor" stroke-width="2" fill="none"/>
  <text x="120" y="32" font-size="7" fill="currentColor" font-family="monospace">λ(t) - BATHTUB</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 95L145 80" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 95)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-28',
      num: 28,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Gráfico de Pareto 80/20',
      desc: 'Histograma ordenado com curva percentual acumulada.',
      keywords: 'pareto 80 20 histograma frequencia perdas priorizacao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Barras Pareto -->
  <rect x="120" y="55" width="12" height="40" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="135" y="70" width="12" height="25" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="150" y="82" width="12" height="13" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <path d="M125 55Q145 45 170 40" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <line x1="115" y1="95" x2="175" y2="95" stroke="currentColor" stroke-width="1.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 85L125 55" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 85)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-29',
      num: 29,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Impacto Financeiro & Custos',
      desc: 'Cifrão e redução do custo total de não conformidade.',
      keywords: 'custos financeiro cifrao perdas lucro economia roi',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cifrão e Gráfico em Queda -->
  <text x="140" y="60" font-size="26" font-weight="bold" fill="currentColor" font-family="sans-serif">$</text>
  <path d="M125 75L145 90L165 115" stroke="currentColor" stroke-width="2"/>
  <polyline points="158,115 165,115 165,108" stroke="currentColor" stroke-width="2"/>
  <text x="125" y="130" font-size="7" fill="currentColor" font-family="monospace">-45% CUSTO</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 95L140 60" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 95)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-30',
      num: 30,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Cronograma Gantt de Parada',
      desc: 'Barras temporais de tarefas críticas e caminho crítico.',
      keywords: 'gantt cronograma parada manutencao prazo caminho critico',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Barras Gantt -->
  <rect x="120" y="45" width="25" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="135" y="60" width="30" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="155" y="75" width="20" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="115" y1="90" x2="180" y2="90" stroke="currentColor" stroke-width="1.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 85L135 64" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 85)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-31',
      num: 31,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Carimbo de Aprovação Técnica',
      desc: 'Validação e assinatura de ordem de modificação de engenharia.',
      keywords: 'aprovacao carimbo assinatura engenharia validacao ordem',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Carimbo APPROVED -->
  <rect x="115" y="55" width="65" height="28" rx="3" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2" fill="none"/>
  <text x="122" y="73" font-size="9" font-weight="bold" fill="currentColor" font-family="monospace">APPROVED</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 95L115 75" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 95)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-32',
      num: 32,
      group: 'action',
      groupLabel: 'Apresentação & 5W2H',
      name: 'Governança & Alinhamento Executivo',
      desc: 'Postura formal de prestação de contas à diretoria.',
      keywords: 'governanca executivo diretoria postura formal lideranca',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${headCAD(100, 65)}
  <line x1="100" y1="87" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 110)}${joint(100, 165)}
  <!-- Braços Cruzados na Frente -->
  <path d="M100 110L70 125L100 135L130 125L100 110" stroke="currentColor" stroke-width="2.5"/>
  ${joint(70, 125)}${joint(130, 125)}
  <!-- Pernas -->
  <path d="M100 165L78 198L70 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L122 198L130 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },

    // ----------------------------------------------------
    // GRUPO 5: MANUTENÇÃO, MONTAGEM E BARREIRAS (CAD-33 a CAD-40)
    // ----------------------------------------------------
    {
      id: 'CAD-33',
      num: 33,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Chave Inglesa & Aperto Manual',
      desc: 'Ajuste mecânico de fixação com ferramenta combinada.',
      keywords: 'chave inglesa ferramenta manual aperto parafuso montagem',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Chave Inglesa -->
  <path d="M125 115L155 85" stroke="currentColor" stroke-width="3.5"/>
  <circle cx="122" cy="118" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 115L125 115" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L135 95" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 115)}${joint(135, 95)}
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-34',
      num: 34,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Ajuste de Rolamento de Esferas',
      desc: 'Inspeção de folga radial em mancal de rolamento.',
      keywords: 'rolamento esferas mancal folga radial montagem eixo',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Rolamento em Corte CAD -->
  <circle cx="145" cy="100" r="24" stroke="currentColor" stroke-width="2" fill="none"/>
  <circle cx="145" cy="100" r="14" stroke="currentColor" stroke-width="2" fill="none"/>
  <circle cx="145" cy="81" r="3.5" fill="currentColor"/>
  <circle cx="145" cy="119" r="3.5" fill="currentColor"/>
  <circle cx="126" cy="100" r="3.5" fill="currentColor"/>
  <circle cx="164" cy="100" r="3.5" fill="currentColor"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 105L125 100" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 105)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-35',
      num: 35,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Lubrificação com Pistola de Graxa',
      desc: 'Injeção periódica de graxa em bico graxeiro.',
      keywords: 'lubrificacao graxa bomba pistola graxeiro lubrificante',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Pistola de Graxa -->
  <rect x="110" y="110" width="35" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="145" y1="115" x2="175" y2="105" stroke="currentColor" stroke-width="2.5"/>
  <path d="M120" y="110L115" y2="95" stroke="currentColor" stroke-width="2.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 115" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L135 115" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-36',
      num: 36,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Calibração de Válvula de Controle',
      desc: 'Ajuste de atuador pneumático e posicionador 4-20mA.',
      keywords: 'valvula controle atuador posicionador calibracao pneumatica',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Símbolo de Válvula com Atuador -->
  <polygon points="135,110 165,130 165,110 135,130" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="150" y1="120" x2="150" y2="90" stroke="currentColor" stroke-width="2"/>
  <ellipse cx="150" cy="85" rx="14" ry="7" stroke="currentColor" stroke-width="2" fill="none"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 100L140 88" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 100)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-37',
      num: 37,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Intertravamento de Segurança',
      desc: 'Chave de segurança com relé de monitoramento cat. 4.',
      keywords: 'intertravamento seguranca rele sensor fim de curso',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Chave de Fim de Curso -->
  <rect x="135" y="90" width="28" height="35" stroke="currentColor" stroke-width="2" fill="none"/>
  <circle cx="149" cy="78" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="149" y1="84" x2="149" y2="90" stroke="currentColor" stroke-width="2"/>
  <text x="130" y="140" font-size="7" fill="currentColor" font-family="monospace">CAT. 4</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 100L135 95" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 100)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-38',
      num: 38,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Redesenho em Prancheta CAD',
      desc: 'Modificação de projeto técnico com compasso e esquadro.',
      keywords: 'redesenho projeto prancheta cad esquadro compasso desenho',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Mesa de Desenho Inclinada -->
  <line x1="110" y1="120" x2="175" y2="85" stroke="currentColor" stroke-width="3"/>
  <line x1="140" y1="102" x2="140" y2="150" stroke="currentColor" stroke-width="2"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 110L145 95" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 110)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-39',
      num: 39,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Teste de Bancada / Comissionamento',
      desc: 'Painel de teste de cargas e validação funcional.',
      keywords: 'teste bancada comissionamento painel carga validacao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Painel de Testes -->
  <rect x="125" y="60" width="45" height="65" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
  <circle cx="137" cy="75" r="4" fill="currentColor"/>
  <circle cx="157" cy="75" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="132" y1="95" x2="162" y2="95" stroke="currentColor" stroke-width="2"/>
  <text x="130" y="115" font-size="7" fill="currentColor" font-family="monospace">TEST: OK</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 100L125 95" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 100)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-40',
      num: 40,
      group: 'maint',
      groupLabel: 'Manutenção & Barreiras',
      name: 'Cortina de Luz & Barreira Óptica',
      desc: 'Instalação de sensor óptico com feixes de proteção.',
      keywords: 'cortina de luz barreira optica sensor protecao nr12',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Cortina de Luz NR12 -->
  <line x1="165" y1="40" x2="165" y2="150" stroke="currentColor" stroke-width="4"/>
  <line x1="125" y1="60" x2="165" y2="60" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="125" y1="80" x2="165" y2="80" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="125" y1="100" x2="165" y2="100" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="125" y1="120" x2="165" y2="120" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 105L125 100" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 105)}
  <path d="M67 115L48 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },

    // ----------------------------------------------------
    // GRUPO 6: OPERAÇÃO, CONFIABILIDADE E MONITORAMENTO (CAD-41 a CAD-50)
    // ----------------------------------------------------
    {
      id: 'CAD-41',
      num: 41,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Operador de Console SCADA',
      desc: 'Monitoramento de telas industriais com telemetria ao vivo.',
      keywords: 'scada operador sala de controle console telemetria telas',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Monitores SCADA -->
  <rect x="115" y="45" width="30" height="22" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="150" y="45" width="30" height="22" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="110" y1="95" x2="185" y2="95" stroke="currentColor" stroke-width="2.5"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 95L135 95" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L120 95" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 95)}
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-42',
      num: 42,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Inspeção Preditiva com Tablet',
      desc: 'Checklist digital na planta com georreferenciamento.',
      keywords: 'tablet preditiva rota checklist digital mobilidade campo',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Tablet Digital -->
  <rect x="110" y="90" width="34" height="46" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="118" y1="102" x2="136" y2="102" stroke="currentColor" stroke-width="1.5"/>
  <line x1="118" y1="112" x2="136" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="127" cy="130" r="2" fill="currentColor"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L105 110L112 120" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L135 110L128 120" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 110)}${joint(135, 110)}
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-43',
      num: 43,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Análise Espectral FFT',
      desc: 'Espectro de frequências com picos harmônicos e envelope.',
      keywords: 'fft espectro frequencia picos harmonicos vibracao analise',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Gráfico FFT -->
  <line x1="110" y1="95" x2="185" y2="95" stroke="currentColor" stroke-width="1.5"/>
  <path d="M115 95V80L125 95V50L135 95V70L145 95V35L155 95V85L165 95" stroke="currentColor" stroke-width="1.8"/>
  <text x="135" y="28" font-size="7" fill="currentColor" font-family="monospace">1X / 2X / 3X</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L100 85L145 35" stroke="currentColor" stroke-width="2.5"/>
  ${joint(100, 85)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-44',
      num: 44,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Joinha de Aprovação CAD',
      desc: 'Gesto afirmativo com indicação de conformidade 100%.',
      keywords: 'joinha aprovacao ok sucesso positivo confianca',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Mão Joinha CAD -->
  <path d="M140 100V85M140 100H150" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  <text x="135" y="75" font-size="8" fill="currentColor" font-family="monospace">100% OK</text>
  ${headCAD(80, 70)}
  <line x1="80" y1="92" x2="80" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(80, 112)}${joint(80, 165)}
  <path d="M80 112L115 110L140 100" stroke="currentColor" stroke-width="2.5"/>
  ${joint(115, 110)}${joint(140, 100)}
  <path d="M80 112L55 135L65 150" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L62 198L55 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M80 165L98 198L105 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-45',
      num: 45,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Meta de Zero Falhas Atingida',
      desc: 'Troféu ou estrela técnica de excelência operacional.',
      keywords: 'zero falhas trofeu meta celebracao excelencia conquista',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Estrela de Excelência -->
  <path d="M100 5L105 18L118 20L108 28L112 40L100 32L88 40L92 28L82 20L95 18Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
  ${headCAD(100, 75)}
  <line x1="100" y1="97" x2="100" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 115)}${joint(100, 165)}
  <!-- Braços em V de Vitória -->
  <path d="M100 115L65 90L45 65" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 115L135 90L155 65" stroke="currentColor" stroke-width="2.5"/>
  ${joint(65, 90)}${joint(135, 90)}
  <path d="M100 165L75 198L65 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 165L125 198L135 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-46',
      num: 46,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Sistema em Equilíbrio Estável',
      desc: 'Balança e distribuição uniforme de cargas operacionais.',
      keywords: 'equilibrio balanca estabilidade forcas cargas nominal',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Balança / Barra Balanceada -->
  <line x1="30" y1="70" x2="170" y2="70" stroke="currentColor" stroke-width="2"/>
  <circle cx="100" cy="70" r="4" fill="currentColor"/>
  <polygon points="92,90 108,90 100,70" stroke="currentColor" stroke-width="1.5" fill="none"/>
  ${headCAD(100, 115)}
  <line x1="100" y1="135" x2="100" y2="185" stroke="currentColor" stroke-width="3"/>
  ${joint(100, 150)}${joint(100, 185)}
  <path d="M100 150L60 110L30 70" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 150L140 110L170 70" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 185L78 210L70 235" stroke="currentColor" stroke-width="2.5"/>
  <path d="M100 185L122 210L130 235" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-47',
      num: 47,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Procedimento Operacional (POP)',
      desc: 'Consulta rigorosa ao manual técnico padronizado.',
      keywords: 'pop procedimento manual norma padrao padronizacao',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Livro / Manual Aberto -->
  <path d="M120 105C130 100 145 100 155 105C165 100 180 100 190 105V135C180 130 165 130 155 135C145 130 130 130 120 135Z" stroke="currentColor" stroke-width="2" fill="none"/>
  <line x1="155" y1="105" x2="155" y2="135" stroke="currentColor" stroke-width="2"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="70" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(67, 115)}${joint(70, 165)}
  <path d="M67 115L110 115L125 120" stroke="currentColor" stroke-width="2.5"/>
  <path d="M67 115L145 120" stroke="currentColor" stroke-width="2.5"/>
  ${joint(110, 115)}
  <path d="M70 165L52 198L45 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M70 165L92 198L100 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-48',
      num: 48,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Selo de Qualidade & Certificação',
      desc: 'Selo circular de conformidade ISO 55000 / ISO 9001.',
      keywords: 'selo qualidade certificacao iso conformidade auditoria',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Selo Circular de Certificação -->
  <circle cx="145" cy="80" r="24" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2" fill="none"/>
  <circle cx="145" cy="80" r="18" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <text x="131" y="83" font-size="7" font-weight="bold" fill="currentColor" font-family="monospace">ISO 55K</text>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L105 90L125 80" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 90)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-49',
      num: 49,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Passagem de Turno Operacional',
      desc: 'Passagem do bastão e prancheta com histórico de ocorrências.',
      keywords: 'turno passagem troca de bastao comunicacao passagem de turno',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Bastão / Rolo de Turno -->
  <line x1="120" y1="120" x2="160" y2="90" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <path d="M65 115L105 115L125 115" stroke="currentColor" stroke-width="2.5"/>
  ${joint(105, 115)}
  <path d="M65 115L45 135" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    },
    {
      id: 'CAD-50',
      num: 50,
      group: 'ops',
      groupLabel: 'Operação & Confiabilidade',
      name: 'Engenheiro do Futuro & Visão 4.0',
      desc: 'Olhar visionário para o horizonte da Indústria 4.0 e confiabilidade.',
      keywords: 'futuro visionario industria 4.0 confianca horizonte lider',
      svg: `<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Linhas de Perspectiva do Horizonte -->
  <line x1="120" y1="80" x2="185" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="120" y1="80" x2="185" y2="80" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="80" x2="185" y2="110" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  <circle cx="185" cy="80" r="3" fill="currentColor"/>
  ${headCAD(65, 75)}
  <line x1="65" y1="97" x2="65" y2="165" stroke="currentColor" stroke-width="3"/>
  ${joint(65, 115)}${joint(65, 165)}
  <!-- Mão na Testa Observando o Futuro -->
  <path d="M65 115L95 80L85 65" stroke="currentColor" stroke-width="2.5"/>
  ${joint(95, 80)}
  <!-- Outro Braço na Cintura -->
  <path d="M65 115L45 130L55 145" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L48 198L40 230" stroke="currentColor" stroke-width="2.5"/>
  <path d="M65 165L82 198L90 230" stroke="currentColor" stroke-width="2.5"/>
</svg>`
    }
  ];

  // Estado da UI
  let activeFilter = 'all';
  let currentSearchQuery = '';

  // Elementos do DOM
  const posesGrid = document.getElementById('posesGrid');
  const visibleCountEl = document.getElementById('visibleCount');
  const searchInput = document.getElementById('searchInput');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const themeBtns = document.querySelectorAll('[data-theme-btn]');
  const cadToast = document.getElementById('cadToast');
  const cadToastText = document.getElementById('cadToastText');

  // Inicialização
  function init() {
    renderGrid();
    setupFilters();
    setupSearch();
    setupThemeSwitchers();
  }

  // Renderizar os Cards
  function renderGrid() {
    posesGrid.innerHTML = '';

    const filtered = cadCatalog.filter(item => {
      const matchFilter = (activeFilter === 'all' || item.group === activeFilter);
      const matchQuery = !currentSearchQuery || 
        item.id.toLowerCase().includes(currentSearchQuery) ||
        item.name.toLowerCase().includes(currentSearchQuery) ||
        item.desc.toLowerCase().includes(currentSearchQuery) ||
        item.keywords.toLowerCase().includes(currentSearchQuery) ||
        item.num.toString() === currentSearchQuery ||
        `#${item.num}` === currentSearchQuery;
      return matchFilter && matchQuery;
    });

    visibleCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      posesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          Nenhuma pose encontrada para os termos pesquisados.
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'cad-card';
      card.innerHTML = `
        <div class="cad-card-header">
          <span class="cad-number-tag">${item.id}</span>
          <span class="cad-group-tag">${item.groupLabel}</span>
        </div>
        <div class="cad-preview-box">
          ${item.svg}
        </div>
        <div class="cad-info">
          <div class="cad-name" title="${item.name}">${item.num}. ${item.name}</div>
          <div class="cad-desc">${item.desc}</div>
        </div>
        <div class="cad-card-actions">
          <button class="btn-copy-cad" data-id="${item.id}" title="Copiar código SVG para colar no slide">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar SVG
          </button>
          <button class="btn-copy-id" data-id="${item.id}" title="Copiar código de identificação">${item.id}</button>
        </div>
      `;
      posesGrid.appendChild(card);
    });

    setupCardButtons();
  }

  // Configurar Botões de Copiar SVG e ID
  function setupCardButtons() {
    posesGrid.querySelectorAll('.btn-copy-cad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cadCatalog.find(p => p.id === id);
        if (item) {
          navigator.clipboard.writeText(item.svg).then(() => {
            showToast(`SVG [${item.id} - ${item.name}] copiado com sucesso!`);
          }).catch(() => {
            showToast('Erro ao copiar SVG.');
          });
        }
      });
    });

    posesGrid.querySelectorAll('.btn-copy-id').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        navigator.clipboard.writeText(id).then(() => {
          showToast(`Código de chamada "${id}" copiado!`);
        });
      });
    });
  }

  // Filtro por Categoria
  function setupFilters() {
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderGrid();
      });
    });
  }

  // Busca em Tempo Real
  function setupSearch() {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderGrid();
    });
  }

  // Troca de Temas
  function setupThemeSwitchers() {
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.getAttribute('data-theme-btn');
        document.body.setAttribute('data-theme', theme);
      });
    });
  }

  // Toast
  function showToast(msg) {
    cadToastText.textContent = msg;
    cadToast.classList.add('show');
    setTimeout(() => {
      cadToast.classList.remove('show');
    }, 2800);
  }

  // Tornar acessível globalmente caso scripts queiram buscar poses por ID (ex: window.getCADPose('CAD-17'))
  window.CAD_CATALOG = cadCatalog;
  window.getCADPose = function(idOrNum) {
    if (typeof idOrNum === 'number') {
      return cadCatalog.find(p => p.num === idOrNum);
    }
    const cleanId = idOrNum.toUpperCase().trim();
    return cadCatalog.find(p => p.id === cleanId || `#${p.num}` === cleanId || `${p.num}` === cleanId);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

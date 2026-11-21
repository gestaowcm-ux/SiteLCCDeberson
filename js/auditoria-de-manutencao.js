// auditoria-de-manutencao.js — Maintenance Audit page-specific script

// ── 1. Audit Phases Data ──────────────────────────────────────────────────
const PHASES = {
  iniciacao: {
    tag: 'Fase 1 · Necessidade & Escopo',
    title: 'Iniciação',
    description:
      'Fase de entendimento da necessidade, objetivos e escopo da auditoria. Aqui define-se a autoridade dos auditores, sua autonomia de ação e o alinhamento inicial com o sponsor (diretor ou gerente responsável final pelos ativos e resultados da manutenção).',
    roles: {
      sponsor: 'Garante a autoridade e legitimidade do programa de auditoria e provê o suporte inicial.',
      auditor: 'Delimita as fronteiras e áreas físicas ou sistêmicas que serão avaliadas no ciclo.',
      auditado: 'Participa do alinhamento inicial compartilhando o escopo da planta e a documentação básica.'
    },
    checklist: [
      'Definição da necessidade e objetivos gerais da auditoria',
      'Delimitação das fronteiras e áreas auditadas (escopo)',
      'Formalização do Sponsor do projeto (gerente ou diretor)',
      'Declaração formal de intenção do que será feito'
    ]
  },
  planejamento: {
    tag: 'Fase 2 · Métodos & Recursos',
    title: 'Planejamento',
    description:
      'Definição do "como". Elaboração do procedimento formal de auditoria, definição dos critérios e pesos de cada grupo, sequenciamento das entrevistas para otimização de tempo e solicitação de documentos sistêmicos antecipadamente para evitar correções ad-hoc.',
    roles: {
      sponsor: 'Revisa o cronograma planejado e garante os recursos necessários.',
      auditor: 'Elabora a agenda de entrevistas, define o padrão de notas e os questionários de critérios.',
      auditado: 'Fornece a lista de profissionais participantes e providencia a documentação prévia solicitada.'
    },
    checklist: [
      'Criação do procedimento formal e critérios específicos',
      'Definição da sequência de entrevistas para otimizar tempo',
      'Agendamento de salas de reunião e infraestrutura de tecnologia',
      'Coleta antecipada de dados do CMMS/ERP para otimização'
    ]
  },
  aplicacao: {
    tag: 'Fase 3 · Entrevistas & Evidências',
    title: 'Aplicação',
    description:
      'Execução em campo. Começa com uma reunião de Kick Off de no máximo uma hora para nivelamento de expectativas. Segue com entrevistas baseadas em perguntas abertas para o auditado dissertar, e a catalogação rígida de evidências físicas (fotos do campo) e digitais.',
    roles: {
      sponsor: 'Valida a abertura da auditoria participando ativamente da reunião de Kick Off.',
      auditor: 'Conduz entrevistas sem viés hierárquico, registra observações e cataloga evidências materiais.',
      auditado: 'Responde de forma honesta ("jogo aberto") e apresenta as evidências de seus processos.'
    },
    checklist: [
      'Reunião de Kick Off (nivelamento de expectativas, máx 1 hora)',
      'Condução de entrevistas baseadas em perguntas abertas',
      'Coleta e arquivamento de evidências (físicas e digitais)',
      'Nomenclatura padronizada de arquivos (ex: 8_criticidade_ativos_3.png)'
    ]
  },
  conclusao: {
    tag: 'Fase 4 · Resultados & Plano de Ação',
    title: 'Conclusão',
    description:
      'Momento de consolidar os achados (Findings). O auditor apresenta as conformidades, não conformidades e oportunidades encontradas. Juntos, auditor e auditado desenham o plano de ação utilizando a ferramenta 5W2H para sanar cada desvio de forma justificada.',
    roles: {
      sponsor: 'Aprova o orçamento e recursos necessários para execução do plano de ação corretivo.',
      auditor: 'Apresenta o relatório final detalhado com a nota média geral e as notas por grupo.',
      auditado: 'Co-cria e assume a responsabilidade pelas ações corretivas mapeadas no plano 5W2H.'
    },
    checklist: [
      'Reunião de encerramento presencial para revisão de findings',
      'Emissão do Relatório Final (nota média, desvios e oportunidades)',
      'Preenchimento do plano de ação usando a ferramenta 5W2H',
      'Estudo de custo-benefício para cada ação de correção proposta'
    ],
    hasPlanBuilder: true
  },
  melhoria: {
    tag: 'Fase 5 · Lições Aprendidas & Evolução',
    title: 'Melhoria Contínua',
    description:
      'Refinamento do processo. Ao final da auditoria, as lições aprendidas são registradas. Os próprios critérios, pesos e perguntas da auditoria devem ser revistos e aprovados por um comitê para o próximo ciclo anual, adaptando o processo à evolução tecnológica da empresa.',
    roles: {
      sponsor: 'Aprova as atualizações sugeridas nos critérios para as futuras auditorias.',
      auditor: 'Propõe a exclusão ou inclusão de novos quesitos com base nos resultados práticos.',
      auditado: 'Participa sugerindo melhorias na logística e nos tempos de autoavaliação.'
    },
    checklist: [
      'Anotação de pontos de melhoria observados durante a aplicação',
      'Revisão e avaliação em reunião de lições aprendidas',
      'Aprovação de melhorias nos critérios por comitê formal',
      'Atualização dos procedimentos para o próximo ciclo de auditorias'
    ]
  }
};

// ── 2. Knowledge Groups & Criteria (Chapter 6) ───────────────────────────
const KNOWLEDGE_GROUPS = [
  {
    id: 'estrategia',
    shortName: 'Estratégia',
    name: 'Grupo 1 — Estratégia',
    objective: 'Definir uma política para o departamento de manutenção, sua tática e plano de execução, integrando-a com as metas corporativas de curto, médio e longo prazo (normas ISO 55000/1/2).',
    criteria: [
      'A companhia possui uma política de manutenção claramente definida e divulgada internamente?',
      'Existe um plano estratégico de manutenção de longo prazo (mínimo 5 anos) integrado aos objetivos de negócio?',
      'O plano tático de manutenção é desdobrado em atividades em um plano executivo anual?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Sem política de manutenção definida ou plano estratégico na empresa.',
      'Iniciante: Há intenção de criar políticas e planos, porém nada está formalizado em procedimentos ou executado.',
      'Conhecimento: Política de manutenção escrita e conhecida, mas planos de longo prazo não são desdobrados em táticos/anuais.',
      'Excelente: Política estruturada e divulgada. Planos de longo (5 anos), médio (2 anos) e curto prazo executados na íntegra.',
      'Otimizado: Estratégia revisada dinamicamente com base em inteligência competitiva e retorno financeiro comprovado aos acionistas.'
    ]
  },
  {
    id: 'segurança',
    shortName: 'Segurança & M.A.',
    name: 'Grupo 2 — Segurança, Saúde e Meio Ambiente',
    objective: 'Zelar pela integridade física dos colaboradores e pela sustentabilidade ambiental, garantindo que a segurança seja um valor inegociável na execução de qualquer atividade técnica.',
    criteria: [
      'Os mantenedores possuem acesso facilitado aos Equipamentos de Proteção Individual (EPI) e Coletivos (EPC)?',
      'As atividades e manutenções consideradas críticas em segurança são mapeadas e possuem procedimentos claros?',
      'Existe uma rotina rigorosa de auditorias comportamentais e análise de riscos antes do início dos trabalhos em campo?'
    ],
    score: 4,
    scoreDescriptions: [
      'Inexistente: Sem preocupação estruturada com segurança ou meio ambiente nas atividades.',
      'Iniciante: Equipamentos de proteção distribuídos, mas normas vigentes são ignoradas para acelerar reparos.',
      'Conhecimento: Treinamentos realizados e normas vigentes de segurança seguidas, porém sem análises rigorosas de risco na preparação.',
      'Excelente: 100% dos trabalhos críticos são precedidos de análise de risco e uso de EPI/EPC adequados. Zero tolerância a desvios.',
      'Otimizado: Uso de tecnologias de detecção de risco ativa e cultura de segurança em que os próprios mantenedores propõem melhorias no fluxo.'
    ]
  },
  {
    id: 'ciclo_vida',
    shortName: 'Ciclo de Vida',
    name: 'Grupo 3 — Ciclo de Vida do Ativo',
    objective: 'Gerenciar estrategicamente cada ativo desde a sua concepção, especificação técnica, comissionamento até o descarte seguro e avaliação de viabilidade financeira (VPL, TIR, Payback, ROI).',
    criteria: [
      'As funções primárias e secundárias do ativo são especificadas detalhadamente antes da compra?',
      'A equipe de manutenção participa da análise e decisão de investimentos em novos ativos?',
      'Existe um plano de substituição de ativos de longo prazo elaborado com base na obsolescência e risco?'
    ],
    score: 2,
    scoreDescriptions: [
      'Inexistente: Ativos comprados sem critérios de manutenibilidade ou plano de descarte definido.',
      'Iniciante: Manutenção é consultada informalmente no momento da instalação, mas sem participação nas compras.',
      'Conhecimento: Manutenção participa do projeto e novas instalações têm comissionamento formal, mas sem plano de obsolescência.',
      'Excelente: Comissionamento coleta baseline detalhada de condição e há análises de viabilidade robustas para substituições (VPL/TIR).',
      'Otimizado: LCC (Life Cycle Cost) calcula o custo total de posse de cada ativo para prever descartes com máximo ROI.'
    ]
  },
  {
    id: 'confiabilidade',
    shortName: 'Confiabilidade',
    name: 'Grupo 4 — Engenharia de Confiabilidade',
    objective: 'Aplicar estudos estatísticos e qualitativos para compreender modos de falha de equipamentos, calcular parâmetros operacionais e criar estratégias de eliminação de falhas com melhor custo-benefício.',
    criteria: [
      'Existe uma lista atualizada de criticidade de ativos com categorias de impacto claras (segurança, operação, custo)?',
      'Planos de manutenção são desenhados a partir de metodologias estruturadas como o FMEA/RCM?',
      'São conduzidos estudos estatísticos de probabilidade de falhas e tempo médio de operação?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Sem estudos de falhas ou mapeamento de criticidade. Ativos tratados de forma igual.',
      'Iniciante: Criticidade de ativos existe informalmente, mas sem metodologias como FMEA aplicadas nos planos de manutenção.',
      'Conhecimento: Lista de criticidade formalizada e atualizada. Planos de manutenção baseados em FMEA para ativos críticos.',
      'Excelente: Estudos de falha probabilísticos ativos (Weibull) e gatilhos de investigação definidos para eventos críticos.',
      'Otimizado: Confiabilidade em tempo real interligada a sensores IoT, predizendo modos de falha antes de sua ocorrência.'
    ]
  },
  {
    id: 'informacao',
    shortName: 'Informação',
    name: 'Grupo 5 — Gestão da Informação',
    objective: 'Garantir a integridade, atualização e facilidade de acesso a dados técnicos de equipamentos e sistemas de forma integrada e livre de adulterações arbitrárias.',
    criteria: [
      'Os ativos possuem uma taxonomia clara e padronizada cadastrada nos sistemas da empresa?',
      'O sistema CMMS (gerenciamento de manutenção) é integrado ao ERP corporativo?',
      'Existe controle rígido de permissões de usuário para alteração de históricos e dados técnicos de ativos no software?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Sem taxonomia ou controle de dados. Informações mantidas em papéis ou planilhas locais.',
      'Iniciante: CMMS existe, mas é desatualizado, sem integração com o ERP e dados podem ser alterados sem rastreabilidade.',
      'Conhecimento: CMMS integrado ao ERP. Taxonomia cadastrada de forma coerente e histórico de ordens de serviço confiável.',
      'Excelente: Controle total de alterações de cadastro. Dados técnicos 100% atualizados e disponíveis remotamente em campo.',
      'Otimizado: Geração de relatórios automáticos de ciclo de vida e inteligência artificial para categorização de falhas históricas.'
    ]
  },
  {
    id: 'desempenho',
    shortName: 'Desempenho',
    name: 'Grupo 6 — Gestão de Desempenho',
    objective: 'Medir e analisar o processo de manutenção utilizando indicadores segregados em níveis estratégicos, táticos e operacionais, comparando-os com benchmarks de mercado.',
    criteria: [
      'Os indicadores de manutenção (KPIs) são separados em níveis estratégicos, táticos e operacionais?',
      'As metas de manutenção seguem o padrão SMART (específicas, mensuráveis, atingíveis, realistas e temporais)?',
      'Os indicadores são expostos em painéis de gestão à vista e discutidos regularmente em reuniões de equipe?'
    ],
    score: 2,
    scoreDescriptions: [
      'Inexistente: Sem medição de indicadores na manutenção. Gestão baseada em intuição.',
      'Iniciante: Indicadores calculados esporadicamente, mas metas não são específicas e não há reuniões de alinhamento.',
      'Conhecimento: KPIs calculados mensalmente, discutidos com a gerência e expostos em quadros operacionais.',
      'Excelente: Gestão à vista diária. Indicadores em painéis dinâmicos integrando operação e manutenção com foco em desvios.',
      'Otimizado: Benchmarking contínuo contra plantas externas e modelos preditivos de performance baseados em KPIs integrados.'
    ]
  },
  {
    id: 'planejamento',
    shortName: 'Planejamento',
    name: 'Grupo 7 — Planejamento e Programação',
    objective: 'Otimizar a alocação de recursos (mão de obra, ferramentas, sobressalentes) e tempo por meio de processos padronizados de priorização de serviços e reuniões semanais.',
    criteria: [
      'A empresa possui profissionais focados e dedicados exclusivamente à atividade de Planejamento (PCM)?',
      'As ordens de serviço solicitadas passam por uma aprovação e triagem antes de serem planejadas?',
      'Existe uma reunião semanal de programação de materiais e priorização de mão de obra?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Serviços executados conforme surgem as urgências. Sem planejamento prévio.',
      'Iniciante: PCM nomeado, mas ele gasta o tempo resolvendo emergências em vez de planejar recursos de ordens futuras.',
      'Conhecimento: PCM atua focado no planejamento. Priorização semanal das atividades com os supervisores de área.',
      'Excelente: Reunião semanal de programação alinha materiais separados no almoxarifado antes de enviar as equipes a campo. Eficiência máxima.',
      'Otimizado: Planejamento preditivo integrado automatizado que planeja ordens futuras disparadas por sensores de desgaste.'
    ]
  },
  {
    id: 'execucao',
    shortName: 'Execução',
    name: 'Grupo 8 — Execução e Controle da Manutenção',
    objective: 'Assegurar que os trabalhos de manutenção planejados sejam executados com alto padrão de qualidade, documentação rigorosa e controle por parte da liderança.',
    criteria: [
      'Há controle formal de qualidade sobre os trabalhos executados em campo?',
      'Os serviços de manutenção são registrados em detalhes em ordens de serviço do CMMS?',
      'Existe uma matriz de habilidades técnicas (matriz de versatilidade) atualizada para os mantenedores?'
    ],
    score: 2,
    scoreDescriptions: [
      'Inexistente: Serviços de manutenção sem registros técnicos em ordens de serviço. Sem controle de qualidade.',
      'Iniciante: Ordens de serviço abertas e fechadas apenas para registrar horas, sem descrições técnicas das falhas.',
      'Conhecimento: Histórico de ordens de serviço preenchido de forma técnica. Liderança valida a qualidade de forma visual.',
      'Excelente: Controle de qualidade pós-execução formalizado. Análise rigorosa de retrabalhos e matriz de habilidades atualizada.',
      'Otimizado: Apontamentos e encerramentos de ordens feitos por tablets diretamente no campo na hora da execução.'
    ]
  },
  {
    id: 'infraestrutura',
    shortName: 'Infra & Tec',
    name: 'Grupo 9 — Infraestrutura e Tecnologia',
    objective: 'Prover instalações físicas seguras, oficinas organizadas (5S) e ferramentas calibradas, adotando inovações tecnológicas para alavancar a produtividade técnica.',
    criteria: [
      'As oficinas e locais de trabalho de manutenção são limpos e organizados conforme o 5S?',
      'Existe controle e calibração periódica das ferramentas coletivas e de precisão?',
      'Novas tecnologias móveis e sistemas remotos de monitoramento são investigados e aplicados?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Oficinas sujas e desorganizadas. Ferramentas quebradas e sem calibração.',
      'Iniciante: Ferramentas básicas disponíveis, mas não há rotina de calibração ou regras de organização de bancadas (5S).',
      'Conhecimento: Oficinas organizadas seguindo 5S. Calibração periódica de instrumentos de precisão cadastrada no CMMS.',
      'Excelente: Ferramentas calibradas e inspecionadas. Uso de tecnologia móvel para apontamentos de ordens de serviço.',
      'Otimizado: Oficinas integradas de manufatura aditiva (impressão 3D) para reposições rápidas e sensoriamento preditivo completo.'
    ]
  },
  {
    id: 'financeiro',
    shortName: 'Finanças',
    name: 'Grupo 10 — Gestão Financeira',
    objective: 'Controlar custos de manutenção e garantir a previsibilidade orçamentária por meio do lançamento diário de despesas e orçamentos base zero ou equivalentes.',
    criteria: [
      'Os gastos com manutenção são lançados e acompanhados diariamente?',
      'Existe uma reunião semanal formal para avaliação de despesas ocorridas contra o orçamento (forecast)?',
      'As despesas de manutenção são atreladas diretamente a ordens de serviço e centros de custos dos ativos?'
    ],
    score: 4,
    scoreDescriptions: [
      'Inexistente: Despesas lançadas sem controle. Estouro frequente de orçamento sem justificativas.',
      'Iniciante: Acompanhamento de custos mensal via contabilidade, sem vínculo com as ordens de serviço da manutenção.',
      'Conhecimento: Custos acompanhados semanalmente. Despesas vinculadas a ordens de serviço e centros de custos no ERP.',
      'Excelente: Orçamento base zero anual controlado por forecast semanal. Previsibilidade financeira alta de curto e longo prazo.',
      'Otimizado: Simulação de custos futuros (LCC) e modelos preditivos de impacto financeiro causados por falhas operacionais.'
    ]
  },
  {
    id: 'contratados',
    shortName: 'Terceiros',
    name: 'Grupo 11 — Administração de Contratados',
    objective: 'Gerenciar prestadores de serviços de manutenção com foco em equalização técnica, controle de qualidade, segurança do trabalho e acompanhamento de cronogramas/histogramas.',
    criteria: [
      'Existe uma regra clara para serviços terceirizados baseada em custos e especialização ("make or buy")?',
      'O controle de qualidade e as normas de segurança aplicados aos terceiros são idênticos aos dos funcionários internos?',
      'O desempenho de cronograma e histograma de terceiros é controlado pela equipe interna?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Terceiros contratados sem controle técnico ou fiscalização de segurança e qualidade.',
      'Iniciante: Contratos existem mas sem indicadores de performance (SLA). Controle de segurança de terceiros é falho.',
      'Conhecimento: Contratos geridos com SLAs. Regras de segurança e qualidade idênticas às internas aplicadas formalmente.',
      'Excelente: Avaliação de desempenho de terceiros contínua. Memorial descritivo rigoroso de escopos impede aditivos recorrentes.',
      'Otimizado: Integração completa de sistemas de terceiros no CMMS, com controle automático de produtividade e compliance de segurança.'
    ]
  },
  {
    id: 'materiais',
    shortName: 'Materiais',
    name: 'Grupo 12 — Gestão de Materiais',
    objective: 'Manter níveis ótimos de peças sobressalentes e consumíveis no estoque, com endereçamento codificado e fluxos rígidos de recebimento, evitando a criação de estoques paralelos nas oficinas.',
    criteria: [
      'Os níveis de estoque máximo e mínimo de peças sobressalentes são revistos periodicamente?',
      'O almoxarifado possui endereçamento codificado e acondicionamento adequado para evitar oxidação ou degradação?',
      'Existe controle para impedir a criação de estoques paralelos ("gavetas") de peças nas oficinas?'
    ],
    score: 2,
    scoreDescriptions: [
      'Inexistente: Almoxarifado desorganizado. Falta constante de peças críticas. Estoques paralelos tolerados nas oficinas.',
      'Iniciante: Almoxarifado organizado por códigos, mas sem revisão de máximos/mínimos e presença de depósitos de peças nas oficinas.',
      'Conhecimento: Máximos e mínimos cadastrados e revisados anualmente. Sem estoques paralelos nas oficinas da manutenção.',
      'Excelente: Rastreamento total de peças. Uso de sistema Kanban para materiais de alto giro na oficina. Almoxarifado aclimatado.',
      'Otimizado: Integração com fornecedores para reposição automática de insumos (VMI) e previsão de consumo por probabilidade de falhas.'
    ]
  },
  {
    id: 'lubrificacao',
    shortName: 'Lubrificação',
    name: 'Grupo 13 — Lubrificação',
    objective: 'Implementar planos e rotinas rígidas de lubrificação, incluindo controle de contaminantes desde o recebimento do óleo, filtragem obrigatória antes do uso e análises de óleo lubrificante.',
    criteria: [
      'Existe um plano de lubrificação cadastrado com frequências, pontos e lubrificante específico para cada máquina?',
      'Os lubrificantes armazenados passam por programa de controle de contaminantes e filtragem prévia antes da aplicação?',
      'As ferramentas de lubrificação (baldes, bombas manuais) são identificadas por cor e mantidas limpas e isoladas?'
    ],
    score: 2,
    scoreDescriptions: [
      'Inexistente: Sem plano de lubrificação. Óleos misturados e aplicados sem critérios de limpeza ou filtragem.',
      'Iniciante: Plano de lubrificação existe no CMMS, mas lubrificantes são armazenados em recipientes abertos sem controle de umidade.',
      'Conhecimento: Plano seguido à risca. Lubrificantes estocados em sala dedicada, fechada e com identificação visual por cores.',
      'Excelente: Filtragem prévia (descontaminação) realizada antes do abastecimento. Análise de óleo sistemática nos equipamentos.',
      'Otimizado: Lubrificação preditiva acoplada a ultrassom online, injetando óleo automaticamente com base na frequência acústica.'
    ]
  },
  {
    id: 'paradas',
    shortName: 'Paradas',
    name: 'Grupo 14 — Gestão de Grandes Paradas',
    objective: 'Planejar e controlar grandes paradas de manutenção (turnaround) com metodologias de gerenciamento de projetos, controle rígido de escopo, riscos e curvas de avanço físico-financeiro (Curva S).',
    criteria: [
      'A gestão de grandes paradas segue fases formais de projeto (iniciação, planejamento, execução, fechamento)?',
      'É utilizado o método de Curva S para acompanhamento do avanço físico e financeiro em tempo real durante a execução?',
      'O escopo de serviços da parada passa por um comitê de congelamento antes do início do evento?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Paradas de manutenção executadas de forma caótica, com estouros frequentes de prazo e orçamento.',
      'Iniciante: Planejamento feito por listas manuais de tarefas, sem controle de caminho crítico (CPM) ou reuniões de controle.',
      'Conhecimento: Planejamento robusto em MS Project. Reuniões de controle diárias na execução e comitê de congelamento de escopo.',
      'Excelente: Controle em tempo real via Curva S (física/financeira). Análise rigorosa de riscos e reuniões de lições aprendidas.',
      'Otimizado: Simulações 4D da parada interligando modelo 3D ao cronograma e rastreamento de mantenedores via RFID.'
    ]
  },
  {
    id: 'equipe',
    shortName: 'Equipe',
    name: 'Grupo 15 — Desenvolvimento da Equipe',
    objective: 'Assegurar que as competências técnicas e comportamentais da equipe sejam avaliadas e desenvolvidas por meio de descrições de cargos, matriz de competências e planos de treinamento obrigatórios.',
    criteria: [
      'Todos os cargos de manutenção possuem descrição de atividades vinculada a atribuições formais?',
      'Existe uma matriz de habilidades técnicas de manutenção mapeando as lacunas individuais?',
      'A empresa implementa um plano anual de treinamentos com acompanhamento de eficácia?'
    ],
    score: 3,
    scoreDescriptions: [
      'Inexistente: Equipe de manutenção contratada e alocada sem descrição de cargos ou treinamentos técnicos planejados.',
      'Iniciante: Descrição de cargos básica existente, mas contratações não são baseadas em competências e não há planos de cursos.',
      'Conhecimento: Descrições formais ativas. Matriz de habilidades operando e indicando planos de treinamento anuais.',
      'Excelente: Matriz de habilidades vinculada ao plano de carreira. Avaliação formal pós-treinamento para medir a eficácia técnica.',
      'Otimizado: Academias internas de formação técnica continuada e planos de desenvolvimento individuais baseados em metas de confiabilidade.'
    ]
  }
];

// ── 3. Preset Action Plans (for Phase 4) ──────────────────────────────────
let actionPlans = [
  {
    id: 1,
    why: 'Não conformidade no Grupo 12 - Gestão de Materiais (presença de estoques paralelos nas oficinas)',
    what: 'Realizar inventário geral das oficinas e devolver materiais ao almoxarifado central',
    who: 'Supervisor de Manutenção',
    when: '15 dias',
    where: 'Oficina Mecânica',
    how: 'Fazer varredura física nos armários de ferramentas, registrar materiais excedentes e integrá-los de volta ao sistema oficial.',
    howMuch: 'R$ 0 (mão de obra interna)'
  },
  {
    id: 2,
    why: 'Não conformidade no Grupo 13 - Lubrificação (lubrificantes armazenados sem controle de contaminantes)',
    what: 'Adquirir e instalar filtros dessecantes de respiro nos tambores de óleo armazenados',
    who: 'PCM / Compras',
    when: '30 dias',
    where: 'Sala de Lubrificação',
    how: 'Mapear roscas dos tambores, cotar filtros de ar de sílica gel com fornecedor homologado e emitir pedido de compras.',
    howMuch: 'R$ 2.400 (custo de aquisição)'
  }
];

// ── 4. Rendering Phase Stepper ────────────────────────────────────────────
function renderPhase(phaseKey) {
  const data = PHASES[phaseKey];
  if (!data) return;

  const contentEl = document.getElementById('phase-content');
  if (!contentEl) return;

  // Build checklist HTML
  const checklistHTML = data.checklist
    .map(item => `<li><input type="checkbox" checked disabled style="accent-color: var(--color-success); width: 14px; height: 14px; margin-top:2px;"> <span>${item}</span></li>`)
    .join('');

  // Conditional builder for Phase 4 (Conclusão)
  let planBuilderHTML = '';
  if (data.hasPlanBuilder) {
    planBuilderHTML = `
      <div class="action-plan-builder">
        <h4 class="body-md-strong" style="margin-bottom: var(--spacing-sm);">Plano de Ação Corretivo (5W2H)</h4>
        <p class="caption" style="margin-bottom: var(--spacing-md); max-width: 700px;">
          Adicione planos de ação focados em sanar as não conformidades encontradas durante a simulação da auditoria:
        </p>

        <!-- Form 5W2H -->
        <form id="w2h-form" class="w2h-form">
          <div class="form-group w2h-span-2">
            <label for="w2h-why">WHY (Por que será feito / Qual o desvio?) *</label>
            <input type="text" id="w2h-why" class="w2h-input" placeholder="Ex: Não conformidade no Grupo 13 (Lubrificação)..." required>
          </div>
          <div class="form-group">
            <label for="w2h-what">WHAT (O que será feito?) *</label>
            <input type="text" id="w2h-what" class="w2h-input" placeholder="Ex: Adquirir carrinho de filtragem de óleo..." required>
          </div>
          <div class="form-group">
            <label for="w2h-who">WHO (Quem fará?) *</label>
            <input type="text" id="w2h-who" class="w2h-input" placeholder="Ex: Técnico de Lubrificação / PCM" required>
          </div>
          <div class="form-group">
            <label for="w2h-when">WHEN (Quando será finalizado?) *</label>
            <input type="text" id="w2h-when" class="w2h-input" placeholder="Ex: 30 dias / Data Limite" required>
          </div>
          <div class="form-group">
            <label for="w2h-where">WHERE (Onde a ação será feita?) *</label>
            <input type="text" id="w2h-where" class="w2h-input" placeholder="Ex: Oficina Mecânica / Sistema ERP" required>
          </div>
          <div class="form-group">
            <label for="w2h-how">HOW (Como será executada?) *</label>
            <input type="text" id="w2h-how" class="w2h-input" placeholder="Ex: Pesquisar fornecedores e emitir compra..." required>
          </div>
          <div class="form-group">
            <label for="w2h-howmuch">HOW MUCH (Quanto custa?) *</label>
            <input type="text" id="w2h-howmuch" class="w2h-input" placeholder="Ex: R$ 8.500 / R$ 0" required>
          </div>
          <div class="form-group w2h-span-2" style="margin-top: 4px;">
            <button type="submit" class="btn btn-primary" style="font-size:13px; align-self: flex-start; padding: 8px 16px;">Adicionar Ação</button>
          </div>
        </form>

        <!-- Actions List Table -->
        <div class="action-table-container">
          <table class="action-table" id="action-table">
            <thead>
              <tr>
                <th>Why (Motivo)</th>
                <th>What (Ação)</th>
                <th>Who (Quem)</th>
                <th>When (Prazo)</th>
                <th>Where (Onde)</th>
                <th>How (Como)</th>
                <th>How Much (Custo)</th>
              </tr>
            </thead>
            <tbody id="action-table-body">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  contentEl.innerHTML = `
    <div style="border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm); margin-bottom: var(--spacing-lg); display: flex; justify-content: space-between; align-items: center;">
      <span class="caption" style="color: var(--color-success); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${data.tag}</span>
      <span class="caption" style="font-weight:600;">Checklist Completo</span>
    </div>
    <div class="phase-grid">
      <div>
        <h3 class="display-md" style="margin-bottom: var(--spacing-md); font-weight: 700;">${data.title}</h3>
        <p class="body-md" style="margin-bottom: var(--spacing-lg); line-height: 1.6; color: var(--color-body);">${data.description}</p>
        
        <h4 class="body-sm-strong" style="margin-bottom: var(--spacing-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-mute);">Checklist da Fase</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--spacing-xs); padding-left: 0; font-size:14px;">
          ${checklistHTML}
        </ul>
      </div>
      <div>
        <div style="background-color: var(--color-canvas-soft); padding: var(--spacing-xl); border-radius: var(--rounded-lg); border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: var(--spacing-md); height: 100%;">
          <h4 class="body-md-strong" style="margin-bottom: -4px;">Papéis &amp; Responsabilidades</h4>
          <div>
            <span class="caption" style="font-weight: 700; color: var(--color-ink); display:block; margin-bottom:2px;">SPONSOR (PATROCINADOR)</span>
            <p class="body-sm" style="font-size:13px; line-height:1.4; color: var(--color-body);">${data.roles.sponsor}</p>
          </div>
          <div>
            <span class="caption" style="font-weight: 700; color: var(--color-ink); display:block; margin-bottom:2px;">AUDITOR</span>
            <p class="body-sm" style="font-size:13px; line-height:1.4; color: var(--color-body);">${data.roles.auditor}</p>
          </div>
          <div>
            <span class="caption" style="font-weight: 700; color: var(--color-ink); display:block; margin-bottom:2px;">AUDITADO</span>
            <p class="body-sm" style="font-size:13px; line-height:1.4; color: var(--color-body);">${data.roles.auditado}</p>
          </div>
        </div>
      </div>
    </div>
    ${planBuilderHTML}
  `;

  // Attach submit listener to w2h form if present
  if (data.hasPlanBuilder) {
    const form = document.getElementById('w2h-form');
    form.addEventListener('submit', handleAddAction);
    renderActionsTable();
  }
}

function handleAddAction(e) {
  e.preventDefault();
  const why = document.getElementById('w2h-why').value;
  const what = document.getElementById('w2h-what').value;
  const who = document.getElementById('w2h-who').value;
  const when = document.getElementById('w2h-when').value;
  const where = document.getElementById('w2h-where').value;
  const how = document.getElementById('w2h-how').value;
  const howMuch = document.getElementById('w2h-howmuch').value;

  const newAction = {
    id: Date.now(),
    why,
    what,
    who,
    when,
    where,
    how,
    howMuch
  };

  actionPlans.push(newAction);
  renderActionsTable();
  e.target.reset();
}

function renderActionsTable() {
  const tbody = document.getElementById('action-table-body');
  if (!tbody) return;

  if (actionPlans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--color-mute);">Nenhum plano de ação adicionado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = actionPlans
    .map(
      act => `
      <tr>
        <td style="font-weight:500;">${act.why}</td>
        <td>${act.what}</td>
        <td><strong>${act.who}</strong></td>
        <td>${act.when}</td>
        <td>${act.where}</td>
        <td>${act.how}</td>
        <td style="color: var(--color-success); font-weight:700;">${act.howMuch}</td>
      </tr>
    `
    )
    .join('');
}

function initStepper() {
  const buttons = document.querySelectorAll('.step-item');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      renderPhase(btn.dataset.phase);
    });
  });

  // Render initial phase
  renderPhase('iniciacao');
}

// ── 5. Interactive Radar Chart & Maturity logic ──────────────────────────
const RADAR_CENTER = 200;
const RADAR_MAX_VAL = 5;
const RADAR_RADIUS = 135;

function getRadarCoordinates(index, total, val) {
  const angle = (index * (2 * Math.PI / total)) - (Math.PI / 2);
  const r = (val / RADAR_MAX_VAL) * RADAR_RADIUS;
  return {
    x: RADAR_CENTER + r * Math.cos(angle),
    y: RADAR_CENTER + r * Math.sin(angle)
  };
}

function drawRadarGrid(total) {
  const svg = document.getElementById('radar-svg');
  if (!svg) return;

  // Draw concentric regular 15-gons for levels 1 to 5
  let gridPaths = '';
  for (let lvl = 1; lvl <= 5; lvl++) {
    let points = [];
    for (let idx = 0; idx < total; idx++) {
      const coord = getRadarCoordinates(idx, total, lvl);
      points.push(`${coord.x},${coord.y}`);
    }
    const pathClass = lvl === 4 ? 'radar-web-grid-level-4' : 'radar-web-grid';
    gridPaths += `<polygon points="${points.join(' ')}" class="${pathClass}" />`;
  }

  // Draw axes lines and labels
  let axesHTML = '';
  for (let idx = 0; idx < total; idx++) {
    const edgeCoord = getRadarCoordinates(idx, total, 5);
    
    // Axis line
    axesHTML += `<line x1="${RADAR_CENTER}" y1="${RADAR_CENTER}" x2="${edgeCoord.x}" y2="${edgeCoord.y}" class="radar-axis-line" />`;
    
    // Label placement with a slight offset outwards
    const angle = (idx * (2 * Math.PI / total)) - (Math.PI / 2);
    const labelDistance = RADAR_RADIUS + 25;
    const lx = RADAR_CENTER + labelDistance * Math.cos(angle);
    // Align y coordinate depending on top/bottom of center
    const ly = RADAR_CENTER + labelDistance * Math.sin(angle) + 3;

    const shortName = KNOWLEDGE_GROUPS[idx].shortName;
    axesHTML += `<text x="${lx}" y="${ly}" class="radar-axis-label">${shortName}</text>`;
  }

  // Inject grid and axes before building polygons
  svg.innerHTML = `
    <g id="radar-grid-layer">
      ${gridPaths}
      ${axesHTML}
    </g>
    <g id="radar-polygons-layer">
      <!-- Dynamic polygons inserted here -->
    </g>
  `;
}

function updateRadarChart() {
  const layer = document.getElementById('radar-polygons-layer');
  if (!layer) return;

  const total = KNOWLEDGE_GROUPS.length;

  // Build target / meta polygon (Level 4 target)
  let metaPoints = [];
  for (let idx = 0; idx < total; idx++) {
    const coord = getRadarCoordinates(idx, total, 4);
    metaPoints.push(`${coord.x},${coord.y}`);
  }
  const metaPolygonHTML = `<polygon points="${metaPoints.join(' ')}" class="radar-meta-polygon" />`;

  // Build actual user scores polygon
  let actualPoints = [];
  for (let idx = 0; idx < total; idx++) {
    const score = KNOWLEDGE_GROUPS[idx].score;
    const coord = getRadarCoordinates(idx, total, score);
    actualPoints.push(`${coord.x},${coord.y}`);
  }
  const actualPolygonHTML = `<polygon points="${actualPoints.join(' ')}" class="radar-actual-polygon" />`;

  // Add dots on vertices of actual polygon
  let dotsHTML = '';
  for (let idx = 0; idx < total; idx++) {
    const score = KNOWLEDGE_GROUPS[idx].score;
    const coord = getRadarCoordinates(idx, total, score);
    // Active group gets a bigger highlighted dot
    const selectedGroupSelect = document.getElementById('group-select');
    const isSelected = selectedGroupSelect && selectedGroupSelect.selectedIndex === idx;
    const dotColor = isSelected ? 'var(--color-primary)' : 'var(--color-danger)';
    const dotRadius = isSelected ? 5.5 : 3.5;
    dotsHTML += `<circle cx="${coord.x}" cy="${coord.y}" r="${dotRadius}" fill="${dotColor}" stroke="#fff" stroke-width="1" />`;
  }

  layer.innerHTML = `${metaPolygonHTML} ${actualPolygonHTML} ${dotsHTML}`;

  // Update Average Score display
  const sum = KNOWLEDGE_GROUPS.reduce((acc, curr) => acc + curr.score, 0);
  const avg = sum / total;
  const avgDisplay = document.getElementById('overall-average-display');
  if (avgDisplay) {
    avgDisplay.textContent = avg.toFixed(2);
  }
}

function renderGroupSelectOptions() {
  const select = document.getElementById('group-select');
  if (!select) return;

  select.innerHTML = KNOWLEDGE_GROUPS
    .map((grp, idx) => `<option value="${grp.id}" ${idx === 0 ? 'selected' : ''}>${grp.name}</option>`)
    .join('');
}

function displayGroupDetails(groupId) {
  const grp = KNOWLEDGE_GROUPS.find(g => g.id === groupId);
  if (!grp) return;

  // Update Objective
  document.getElementById('group-objective').textContent = grp.objective;

  // Update Criteria list
  const criteriaHTML = grp.criteria
    .map(crit => `<li>${crit}</li>`)
    .join('');
  document.getElementById('group-criteria').innerHTML = criteriaHTML;

  // Update Slider & Score
  const slider = document.getElementById('score-slider');
  const badge = document.getElementById('score-val-display');
  const descBox = document.getElementById('score-desc');

  if (slider && badge && descBox) {
    slider.value = grp.score;
    badge.textContent = grp.score;
    descBox.textContent = grp.scoreDescriptions[grp.score - 1];
  }
}

function initMaturityAssessment() {
  const select = document.getElementById('group-select');
  const slider = document.getElementById('score-slider');

  if (!select || !slider) return;

  renderGroupSelectOptions();
  displayGroupDetails(KNOWLEDGE_GROUPS[0].id);

  // Setup grid axes
  drawRadarGrid(KNOWLEDGE_GROUPS.length);
  updateRadarChart();

  select.addEventListener('change', () => {
    displayGroupDetails(select.value);
    updateRadarChart(); // Re-highlight active dot
  });

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    const badge = document.getElementById('score-val-display');
    const descBox = document.getElementById('score-desc');
    const groupId = select.value;

    const grp = KNOWLEDGE_GROUPS.find(g => g.id === groupId);
    if (grp) {
      grp.score = val;
      badge.textContent = val;
      descBox.textContent = grp.scoreDescriptions[val - 1];
    }

    updateRadarChart();
  });
}

// ── 6. Page Initialization ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initStepper();
  initMaturityAssessment();
});

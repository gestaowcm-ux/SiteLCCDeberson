/**
 * mentoria-modal.js — Popup Minha Mentoria (fonte única compartilhada)
 *
 * Uso: Adicione este script em qualquer página. O popup será injetado
 * automaticamente e qualquer botão com o atributo
 *   data-modal="mentoria"
 * irá abrí-lo ao ser clicado.
 */

(function () {
  // ── 1. HTML do popup (fonte única de verdade) ──────────────────────────────
  const MODAL_HTML = `
  <div class="profile-modal" id="mentoria-modal" style="display:none;" aria-modal="true" role="dialog" aria-labelledby="mentoria-modal-title">
    <div class="profile-modal-overlay" id="mentoria-modal-overlay"></div>
    <div class="profile-modal-content">
      <div class="modal-header">
        <h3 class="display-sm" id="mentoria-modal-title">Sobre a minha Mentoria</h3>
        <button class="modal-close" id="mentoria-modal-close" aria-label="Fechar">×</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;flex-direction:column;gap:var(--spacing-md);">

          <p style="font-size:1rem; color:var(--color-body); margin:0; line-height:1.6;">
            A mentoria te ajudará a resolver problemas reais aprimorando teoricamente o que será executado na prática com acompanhamento.
          </p>

          <div class="modal-info-row" style="flex-direction:column;align-items:flex-start;gap:8px;margin-top:var(--spacing-sm);">
            <strong>Mentorias disponíveis:</strong>
            <p class="body-sm" style="color:var(--color-body); margin:0;"><strong>Análise de falha:</strong> Aprenda a resolver problemas proativamente através do FMEA e com a ferramenta de RCA. Tudo que você precisa saber para evitar problemas recorrentes.</p>
            <p class="body-sm" style="color:var(--color-body); margin:0;"><strong>Gestão de indicadores:</strong> Todos os cálculos e como implementar essa rotina da forma correta.</p>
            <p class="body-sm" style="color:var(--color-body); margin:0;"><strong>Auditoria de Manutenção:</strong> Entenda o nível de maturidade da sua organização.</p>
            <p class="body-sm" style="color:var(--color-body); margin:0;"><strong>Caminho da confiabilidade:</strong> O passo a passo que você precisa saber para tornar sua organização profundamente com mais rentabilidade e previsibilidade.</p>
          </div>
          <div class="modal-info-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-top:var(--spacing-sm);">
            <strong>+ Informações:</strong>
            <p class="body-sm" style="color:var(--color-body);">
              Você vai ter acesso ao conteúdo teórico e prático da mentoria escolhida, além de acompanhamento personalizado durante a mentora. Serão encontros online que ficarão gravados e disponíveis por até 12 meses. Cada mentoria traz sessões exclusivas com o mentorado para avaliar seu caso na prática, após as aulas teóricas. Para mais informações entre em contato pelo telefone abaixo.
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <span class="modal-alert-vagas">
          <span class="dot-vagas"></span>
          Entre na fila de espera, estamos sem vagas no momento
        </span>
        <a href="https://wa.me/5517997858438" target="_blank" rel="noopener noreferrer"
           style="display:flex; align-items:center; gap:10px; text-decoration:none; cursor:pointer; transition: opacity 0.2s ease;"
           onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32" fill="#25D366">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.476 2.027 7.785L0 32l8.437-2.01A15.938 15.938 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.853l-.485-.29-5.007 1.194 1.243-4.877-.318-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.72-1.295-.366-.133-.632-.199-.898.2-.266.398-1.031 1.295-1.264 1.561-.233.266-.466.299-.864.1-.398-.2-1.681-.619-3.202-1.977-1.184-1.056-1.983-2.36-2.216-2.758-.233-.398-.025-.614.175-.812.18-.179.398-.466.597-.699.2-.233.266-.399.399-.665.133-.266.067-.499-.033-.698-.1-.2-.898-2.163-1.23-2.96-.324-.778-.654-.673-.898-.685l-.765-.013c-.266 0-.698.1-1.064.499-.366.398-1.396 1.362-1.396 3.325s1.43 3.856 1.63 4.122c.199.266 2.814 4.297 6.817 6.027.953.411 1.696.657 2.276.841.956.304 1.827.261 2.515.158.767-.114 2.354-.962 2.687-1.892.333-.93.333-1.727.233-1.892-.1-.166-.366-.266-.764-.465z"/>
          </svg>
          <span style="font-size:15px; font-weight:600; color:#25D366;">WhatsApp</span>
          <span style="font-size:15px; font-weight:600; color: var(--color-ink);">+55 17 9 9785 8438</span>
        </a>
      </div>
    </div>
  </div>`;

  // ── 2. Injeta o modal no <body> ────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  // ── 3. Referências ─────────────────────────────────────────────────────────
  const modal   = document.getElementById('mentoria-modal');
  const overlay = document.getElementById('mentoria-modal-overlay');
  const closeBtn = document.getElementById('mentoria-modal-close');

  // ── 4. Funções de abrir / fechar ───────────────────────────────────────────
  function openModal()  { modal.style.display = 'flex'; }
  function closeModal() { modal.style.display = 'none'; }

  // ── 5. Botão ✕ e clique no overlay fecham o modal ─────────────────────────
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // ── 6. Tecla Escape fecha o modal ─────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // ── 7. Conecta TODOS os botões da página que tenham data-modal="mentoria" ──
  function bindTriggers() {
    document.querySelectorAll('[data-modal="mentoria"]').forEach((btn) => {
      // Evita duplicar listeners adicionando uma flag
      if (!btn._mentoriaModalBound) {
        btn.addEventListener('click', openModal);
        btn._mentoriaModalBound = true;
      }
    });
  }

  // Conecta ao carregar e também observa novos elementos adicionados
  // dinamicamente (ex.: árvore de causas)
  bindTriggers();
  const mutationObs = new MutationObserver(bindTriggers);
  mutationObs.observe(document.body, { childList: true, subtree: true });
})();

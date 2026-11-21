// app-about.js - Lógica interativa da página "Quem sou eu"

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Modal de Perfil Detalhado (Trigger no Avatar)
     ========================================================================== */
  const avatarContainer = document.getElementById('profile-avatar-container');
  const profileModal = document.getElementById('profile-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeModalOverlay = document.getElementById('close-modal-overlay');
  const closeModalFooterBtn = document.getElementById('close-modal-footer-btn');

  function openModal() {
    profileModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Impede o scroll de fundo
  }

  function closeModal() {
    profileModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Habilita o scroll novamente
  }

  if (avatarContainer && profileModal) {
    avatarContainer.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    closeModalOverlay.addEventListener('click', closeModal);
    closeModalFooterBtn.addEventListener('click', closeModal);

    // Fecha o modal ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileModal.style.display === 'flex') {
        closeModal();
      }
    });
  }


  /* ==========================================================================
     2. Animação de Scroll da Linha do Tempo (Timeline Items)
     ========================================================================== */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const openTimelineBtn = document.getElementById('open-timeline-btn');

  const timelineObserverOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Aciona um pouco antes de entrar completamente
    threshold: 0.15
  };

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        timelineObserver.unobserve(entry.target); // Deixa fixo após animar uma vez
      }
    });
  }, timelineObserverOptions);

  timelineItems.forEach(item => {
    timelineObserver.observe(item);
  });

  // Botão "Ver Trajetória" rola a tela até a seção da timeline
  if (openTimelineBtn) {
    openTimelineBtn.addEventListener('click', () => {
      const timelineSection = document.querySelector('.timeline-container');
      if (timelineSection) {
        timelineSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }


  /* ==========================================================================
     3. Contador Animado no Destaque de Impacto (Downtime Horas)
     ========================================================================== */
  const countElement = document.getElementById('count-hours');
  const targetCount = 1420; // Horas salvas de produção
  const duration = 2000; // Tempo em milissegundos para a contagem completa

  let hasCounted = false;

  function startCounter() {
    if (hasCounted || !countElement) return;
    hasCounted = true;

    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Efeito de desaceleração (ease out quad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * targetCount);

      // Formata com separador de milhar
      countElement.textContent = currentVal.toLocaleString('pt-BR');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        countElement.textContent = targetCount.toLocaleString('pt-BR');
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Aciona o contador quando o card de impacto estiver visível na tela
  const impactSection = document.querySelector('.impact-grid');
  if (impactSection) {
    const impactObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter();
          impactObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    impactObserver.observe(impactSection);
  }

});

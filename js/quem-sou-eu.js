// quem-sou-eu.js - Interações para a subpágina de Perfil e Trajetória

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Foto do perfil também abre o Popup Minha Mentoria
     ========================================================================== */
  // O botão "Diferenciais da minha Mentoria" já é gerenciado por mentoria-modal.js
  // (atributo data-modal="mentoria"). Aqui apenas conectamos também a foto.
  const picPerfil = document.getElementById('profile-pic-container');
  if (picPerfil) {
    picPerfil.addEventListener('click', () => {
      const modal = document.getElementById('mentoria-modal');
      if (modal) modal.style.display = 'flex';
    });
  }


  /* ==========================================================================
     2. Destaque Interativo na Linha do Tempo (IntersectionObserver)
     ========================================================================== */
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (timelineItems.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.1
    };

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          // Mantém o estado ativo depois que entra, ou remove ao sair para re-animar.
          // Vamos remover para dar o efeito de rolagem contínuo.
          entry.target.classList.remove('active');
        }
      });
    }, observerOptions);

    timelineItems.forEach(item => {
      timelineObserver.observe(item);
    });
  }


  /* ==========================================================================
     3. Animação de Contadores Numéricos (Impacto Milionário)
     ========================================================================== */
  const countAvailability = document.getElementById('count-availability');
  const countRcas = document.getElementById('count-rcas');
  const countYears = document.getElementById('count-years');
  const impactSection = document.querySelector('.impact-section');

  function animateValue(element, start, end, duration, formatFn) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (end - start) + start);
      element.textContent = formatFn ? formatFn(val) : val;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  if (impactSection) {
    let animated = false;

    const impactObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          
          // Anima a disponibilidade de 0 a 3
          if (countAvailability) {
            const target = parseInt(countAvailability.getAttribute('data-target') || '3');
            animateValue(countAvailability, 0, target, 1200);
          }

          // Anima as RCAs de 0 a 400
          if (countRcas) {
            const target = parseInt(countRcas.getAttribute('data-target') || '400');
            animateValue(countRcas, 0, target, 1800);
          }

          // Anima os Anos de 0 a 15
          if (countYears) {
            const target = parseInt(countYears.getAttribute('data-target') || '15');
            animateValue(countYears, 0, target, 1500);
          }

          // Para de observar após rodar a animação
          impactObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    impactObserver.observe(impactSection);
  }

  /* ==========================================================================
     4. Lógica de Sanfona das Perguntas Frequentes (FAQ Accordion)
     ========================================================================== */
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const faqAnswer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');
      
      // Fecha outros itens de FAQ abertos
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        faqItem.classList.add('active');
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
      }
    });
  });
});

// app.js - SPA Presentation Shell Controller & Router

document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('view-frame');
  const titleText = document.getElementById('viewport-title-text');
  const timerDisplay = document.getElementById('session-timer');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnPresenter = document.getElementById('btn-presenter');
  
  // Sidebar elements
  const sidebar = document.getElementById('sidebar');
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  
  let presenterWindow = null;
  let pendingSlideIndex = null;
  let isFrameLoading = false;
  let slideInputShieldTimer = null;

  // --- 0. TURMA PROGRESSION SYSTEM ---
  let turmas = [];
  let activeTurmaId = 'default';
  let lastVisitedSlideKey = null;
  const manuallyUncheckedSlideKeys = new Set();

  const turmaSelect = document.getElementById('turma-select');
  const turmaProgressFill = document.getElementById('turma-progress-fill');
  const turmaProgressPercent = document.getElementById('turma-progress-percent');
  const turmaModal = document.getElementById('turma-modal');
  const newTurmaNameInput = document.getElementById('new-turma-name');
  const turmasManagerList = document.getElementById('turmas-manager-list');
  const importFileInput = document.getElementById('import-progresso-file');

  // IndexedDB Helpers para guardar FileSystemDirectoryHandle objetos (persistíveis entre sessões)
  function storeDirectoryHandle(turmaId, handle) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LCCTurmaFolders', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        db.createObjectStore('folders');
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('folders', 'readwrite');
        const store = tx.objectStore('folders');
        store.put(handle, turmaId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  function getDirectoryHandle(turmaId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LCCTurmaFolders', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        db.createObjectStore('folders');
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('folders', 'readonly');
        const store = tx.objectStore('folders');
        const getReq = store.get(turmaId);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  function saveTurmasToStorage() {
    localStorage.setItem('LCC_TURMAS', JSON.stringify(turmas));
    localStorage.setItem('LCC_ACTIVE_TURMA_ID', activeTurmaId);
  }

  function loadTurmasFromStorage() {
    const storedTurmas = localStorage.getItem('LCC_TURMAS');
    const storedActiveId = localStorage.getItem('LCC_ACTIVE_TURMA_ID');
    
    if (storedTurmas) {
      turmas = JSON.parse(storedTurmas);
    } else {
      turmas = [{
        id: 'default',
        name: 'Turma LCC - Geral',
        completedSlides: [],
        currentSlide: './Aulas/000.CapaCurso.html#slide-0'
      }];
    }
    
    activeTurmaId = storedActiveId || 'default';
    if (!turmas.some(t => t.id === activeTurmaId)) {
      activeTurmaId = turmas[0].id;
    }
  }

  function populateTurmaDropdown() {
    turmaSelect.innerHTML = '';
    turmas.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      opt.selected = t.id === activeTurmaId;
      turmaSelect.appendChild(opt);
    });
  }

  function updateProgressUI() {
    const activeTurma = turmas.find(t => t.id === activeTurmaId);
    if (!activeTurma) return;

    const allSlides = [];
    document.querySelectorAll('.menu-item').forEach(mi => {
      const src = mi.dataset.src;
      if (src && src.includes('/Aulas/') && mi.dataset.progression === 'true') {
        mi.querySelectorAll('.sub-menu-item').forEach(si => {
          const slideIdx = si.dataset.slide;
          allSlides.push(`${src}#slide-${slideIdx}`);
        });
      }
    });

    const completedSlides = activeTurma.completedSlides || [];
    const completedCount = allSlides.filter(s => completedSlides.includes(s)).length;
    const totalCount = allSlides.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    turmaProgressFill.style.width = `${percentage}%`;
    turmaProgressPercent.textContent = `${percentage}% concluído (${completedCount}/${totalCount} slides)`;

    // Atualiza o nome da pasta vinculada no rodapé da barra de progresso da barra lateral
    const folderDisplay = document.getElementById('turma-folder-display');
    if (folderDisplay) {
      folderDisplay.textContent = `📂 ${activeTurma.folderName || 'Sem pasta vinculada'}`;
    }

    // Atualiza indicadores visuais de progresso (checkmarks) na árvore lateral
    document.querySelectorAll('.menu-item').forEach(mi => {
      const src = mi.dataset.src;
      let allSubCompleted = true;
      let hasSubItems = false;

      mi.querySelectorAll('.sub-menu-item').forEach(si => {
        hasSubItems = true;
        const slideIdx = si.dataset.slide;
        const slideKey = `${src}#slide-${slideIdx}`;
        
        // Assegura que o elemento interativo de status do slide (botão check) exista
        let statusBtn = si.querySelector('.slide-status-btn');
        if (!statusBtn) {
          statusBtn = document.createElement('span');
          statusBtn.className = 'slide-status-btn';
          statusBtn.textContent = '✓';
          si.appendChild(statusBtn);
        }

        if (completedSlides.includes(slideKey)) {
          si.classList.add('completed');
          statusBtn.title = 'Marcar como não concluído';
        } else {
          si.classList.remove('completed');
          statusBtn.title = 'Marcar como concluído';
          allSubCompleted = false;
        }
      });

      if (hasSubItems && allSubCompleted) {
        mi.classList.add('completed');
      } else {
        mi.classList.remove('completed');
      }
    });
  }

  function markSlideCompleted(slideKey) {
    const activeTurma = turmas.find(t => t.id === activeTurmaId);
    if (activeTurma) {
      if (!activeTurma.completedSlides) {
        activeTurma.completedSlides = [];
      }
      if (!activeTurma.completedSlides.includes(slideKey)) {
        activeTurma.completedSlides.push(slideKey);
        saveTurmasToStorage();
        updateProgressUI();
      }
    }
  }

  function unmarkSlideCompleted(slideKey) {
    const activeTurma = turmas.find(t => t.id === activeTurmaId);
    if (activeTurma && activeTurma.completedSlides) {
      const idx = activeTurma.completedSlides.indexOf(slideKey);
      if (idx !== -1) {
        activeTurma.completedSlides.splice(idx, 1);
        saveTurmasToStorage();
        updateProgressUI();
      }
    }
  }

  function toggleSlideCompleted(slideKey) {
    const activeTurma = turmas.find(t => t.id === activeTurmaId);
    if (activeTurma) {
      if (!activeTurma.completedSlides) {
        activeTurma.completedSlides = [];
      }
      if (activeTurma.completedSlides.includes(slideKey)) {
        unmarkSlideCompleted(slideKey);
        manuallyUncheckedSlideKeys.add(slideKey);
        return false;
      } else {
        markSlideCompleted(slideKey);
        manuallyUncheckedSlideKeys.delete(slideKey);
        return true;
      }
    }
    return false;
  }

  function handleTurmaChange(newId) {
    activeTurmaId = newId;
    saveTurmasToStorage();
    updateProgressUI();
    
    // Carrega o último slide visitado pela turma selecionada
    const activeTurma = turmas.find(t => t.id === activeTurmaId);
    if (activeTurma && activeTurma.currentSlide) {
      const [slideSrc, slideHash] = activeTurma.currentSlide.split('#');
      const slideIndex = slideHash ? parseInt(slideHash.replace('slide-', ''), 10) : 0;

      const matchingMenuItem = Array.from(document.querySelectorAll('.menu-item')).find(mi => mi.dataset.src === slideSrc);
      if (matchingMenuItem) {
        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        matchingMenuItem.classList.add('active');
        ensureGroupExpanded(matchingMenuItem);
        
        titleText.textContent = matchingMenuItem.dataset.title;
        iframe.src = slideSrc;

        const subItems = matchingMenuItem.querySelectorAll('.sub-menu-item');
        subItems.forEach((si, idx) => {
          if (idx === slideIndex) {
            si.classList.add('active');
          } else {
            si.classList.remove('active');
          }
        });

        iframe.onload = () => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'GOTO_SLIDE', slideIndex }, '*');
          }
        };
      }
    }
  }

  function openTurmaModal() {
    turmaModal.style.display = 'flex';
    renderTurmasManagerList();
  }

  function closeTurmaModal() {
    turmaModal.style.display = 'none';
  }

  function renderTurmasManagerList() {
    turmasManagerList.innerHTML = '';
    turmas.forEach(t => {
      const item = document.createElement('div');
      item.className = 'turma-manager-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'turma-item-name';
      nameSpan.innerHTML = `${t.name} <span style="display:block; font-size:10px; color:var(--color-ink-light); font-weight:normal; margin-top:2px;">📂 ${t.folderName || 'Sem pasta vinculada'}</span>`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-turma';
      deleteBtn.title = 'Deletar Turma';
      deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
      
      if (turmas.length <= 1) {
        deleteBtn.style.opacity = '0.3';
        deleteBtn.style.cursor = 'not-allowed';
        deleteBtn.disabled = true;
      } else {
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Tem certeza de que deseja deletar a turma "${t.name}"? Todo o progresso de slides concluídos será excluído.`)) {
            turmas = turmas.filter(item => item.id !== t.id);
            if (activeTurmaId === t.id) {
              activeTurmaId = turmas[0].id;
            }
            saveTurmasToStorage();
            populateTurmaDropdown();
            updateProgressUI();
            renderTurmasManagerList();
          }
        });
      }

      item.appendChild(nameSpan);
      item.appendChild(deleteBtn);
      turmasManagerList.appendChild(item);
    });
  }

  async function createNewTurma() {
    const name = newTurmaNameInput.value.trim();
    if (!name) return;

    let dirHandle = null;
    let folderName = '';
    
    try {
      // Abre o diálogo nativo do sistema para escolha de diretório
      dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      folderName = dirHandle.name;
    } catch (err) {
      console.warn("Seleção de pasta cancelada ou não suportada:", err);
      alert("Aviso: Nenhuma pasta destino foi vinculada. O progresso será salvo, mas os arquivos salvos não serão direcionados para um diretório padrão.");
    }

    const newId = 'turma_' + Date.now();
    const newTurma = {
      id: newId,
      name: name,
      folderName: folderName || 'Sem pasta vinculada',
      completedSlides: [],
      currentSlide: './Aulas/000.CapaCurso.html#slide-0'
    };

    if (dirHandle) {
      try {
        await storeDirectoryHandle(newId, dirHandle);
      } catch (e) {
        console.error("Falha ao salvar manipulador de pasta no IndexedDB:", e);
      }
    }

    turmas.push(newTurma);
    activeTurmaId = newId;
    newTurmaNameInput.value = '';
    
    saveTurmasToStorage();
    populateTurmaDropdown();
    updateProgressUI();
    renderTurmasManagerList();
  }

  async function exportProgresso() {
    const dataObj = {
      version: '1.0.0',
      turmas: turmas,
      activeTurmaId: activeTurmaId
    };
    const dataStr = JSON.stringify(dataObj, null, 2);

    // Tenta usar showSaveFilePicker para abrir o diálogo de escolha de pasta nativo
    if ('showSaveFilePicker' in window) {
      try {
        let startInDir = null;
        try {
          const handle = await getDirectoryHandle(activeTurmaId);
          if (handle) {
            const opts = { mode: 'readwrite' };
            if (await handle.queryPermission(opts) === 'granted') {
              startInDir = handle;
            }
          }
        } catch (e) {
          console.warn("Falha ao recuperar pasta da turma para exportação:", e);
        }

        const options = {
          suggestedName: `lcc-progresso-turmas-${new Date().toISOString().slice(0,10)}.json`,
          types: [{
            description: 'Progresso do Curso LCC (.json)',
            accept: { 'application/json': ['.json'] }
          }],
          startIn: startInDir || undefined
        };

        const fileHandle = await window.showSaveFilePicker(options);
        const writable = await fileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();
        return; // Sucesso
      } catch (err) {
        if (err.name === 'AbortError') return; // Cancelado pelo usuário
        console.warn("showSaveFilePicker falhou, utilizando fallback clássico", err);
      }
    }

    // Fallback clássico se showSaveFilePicker não for suportado
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `lcc-progresso-turmas-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }

  function importProgresso(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        if (data && Array.isArray(data.turmas)) {
          turmas = data.turmas;
          activeTurmaId = data.activeTurmaId || turmas[0].id;
          saveTurmasToStorage();
          populateTurmaDropdown();
          updateProgressUI();
          renderTurmasManagerList();
          alert('Progresso das turmas importado com sucesso!');
        } else {
          alert('Formato de arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  }

  // Ouvintes do Gerenciador de Turmas
  turmaSelect.addEventListener('change', (e) => handleTurmaChange(e.target.value));
  document.getElementById('btn-manage-turmas').addEventListener('click', openTurmaModal);
  document.getElementById('btn-close-turma-modal').addEventListener('click', closeTurmaModal);
  document.getElementById('btn-create-turma').addEventListener('click', createNewTurma);
  document.getElementById('btn-export-progresso').addEventListener('click', exportProgresso);
  document.getElementById('btn-import-progresso').addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importProgresso);
  
  turmaModal.addEventListener('mousedown', (e) => {
    if (e.target === turmaModal) closeTurmaModal();
  });

  // 1. Sidebar Retraction Toggle
  btnSidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // 1b. Collapsible Tree View Sections System
  const SECTION_STATE_STORAGE_KEY = 'LCC_SECTION_COLLAPSED_STATES';

  function getSavedSectionStates() {
    try {
      return JSON.parse(localStorage.getItem(SECTION_STATE_STORAGE_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function saveSectionState(sectionId, isCollapsed) {
    try {
      const states = getSavedSectionStates();
      states[sectionId] = isCollapsed;
      localStorage.setItem(SECTION_STATE_STORAGE_KEY, JSON.stringify(states));
    } catch (err) {
      console.warn("Falha ao salvar estado da seção:", err);
    }
  }

  function ensureGroupExpanded(element) {
    const group = element ? element.closest('.menu-group') : null;
    if (group && group.classList.contains('collapsed')) {
      group.classList.remove('collapsed');
      const sectionId = group.dataset.section;
      if (sectionId) {
        saveSectionState(sectionId, false);
      }
    }
  }

  // Initialize Section Tree View Event Listeners & Restore States
  const initialSectionStates = getSavedSectionStates();
  document.querySelectorAll('.menu-group').forEach(group => {
    const sectionId = group.dataset.section;
    const header = group.querySelector('.menu-group-header');
    
    // Atualiza dinamicamente o número de itens na badge de contagem da seção
    const items = group.querySelectorAll('.menu-list > .menu-item');
    const countBadge = group.querySelector('.menu-group-count');
    if (countBadge) {
      countBadge.textContent = items.length;
    }

    // Ao carregar a página, sempre deixa a seção recolhida na tree view
    group.classList.add('collapsed');

    if (header) {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = group.classList.toggle('collapsed');
        if (sectionId) {
          saveSectionState(sectionId, isCollapsed);
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    }
  });

  // 1c. Module Slide Sub-Menu Tree View Collapsible System
  const MODULE_SLIDE_STATE_KEY = 'LCC_MODULE_SLIDE_COLLAPSED_STATES';

  function getModuleSlideStates() {
    try {
      return JSON.parse(localStorage.getItem(MODULE_SLIDE_STATE_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function saveModuleSlideState(moduleKey, isCollapsed) {
    try {
      const states = getModuleSlideStates();
      states[moduleKey] = isCollapsed;
      localStorage.setItem(MODULE_SLIDE_STATE_KEY, JSON.stringify(states));
    } catch (err) {
      console.warn("Falha ao salvar estado de slides do módulo:", err);
    }
  }

  // Initializing Level 2 Tree View for each module (menu-item with sub-menu-list)
  const savedModuleSlideStates = getModuleSlideStates();
  document.querySelectorAll('.menu-item').forEach(item => {
    const mainBtn = item.querySelector('.menu-item-btn');
    const subList = item.querySelector('.sub-menu-list');
    if (!mainBtn || !subList) return;

    const subItems = subList.querySelectorAll('.sub-menu-item');
    if (subItems.length === 0) return;

    const moduleKey = item.dataset.src || item.dataset.title;

    // Wraps label text cleanly inside .menu-item-label if not already wrapped
    let labelSpan = mainBtn.querySelector('.menu-item-label');
    if (!labelSpan) {
      labelSpan = document.createElement('span');
      labelSpan.className = 'menu-item-label';
      const nodesToMove = [];
      mainBtn.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          labelSpan.textContent = node.textContent.trim();
          nodesToMove.push(node);
        }
      });
      nodesToMove.forEach(n => n.remove());
      
      const svgIcon = mainBtn.querySelector('svg');
      if (svgIcon && svgIcon.nextSibling) {
        mainBtn.insertBefore(labelSpan, svgIcon.nextSibling);
      } else {
        mainBtn.appendChild(labelSpan);
      }
    }

    // Badge count indicator
    let badge = mainBtn.querySelector('.menu-item-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'menu-item-badge';
      mainBtn.appendChild(badge);
    }
    badge.textContent = subItems.length;

    // Chevron expand/collapse toggle button for slides
    let chevronBtn = mainBtn.querySelector('.menu-item-chevron-btn');
    if (!chevronBtn) {
      chevronBtn = document.createElement('span');
      chevronBtn.className = 'menu-item-chevron-btn';
      chevronBtn.setAttribute('role', 'button');
      chevronBtn.setAttribute('title', 'Recolher/Expandir slides deste módulo');
      chevronBtn.innerHTML = `<svg class="menu-item-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      mainBtn.appendChild(chevronBtn);
    }

    // Ao carregar a página, sempre deixa os slides do módulo recolhidos na tree view
    item.classList.add('sub-collapsed');
    item.classList.remove('sub-expanded');

    // Click handler on chevron toggle button
    chevronBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isSubCollapsed = item.classList.toggle('sub-collapsed');
      if (isSubCollapsed) {
        item.classList.remove('sub-expanded');
      } else {
        if (!item.classList.contains('active')) {
          item.classList.add('sub-expanded');
        }
      }
      if (moduleKey) {
        saveModuleSlideState(moduleKey, isSubCollapsed);
      }
    });

    chevronBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        chevronBtn.click();
      }
    });
  });

  // 2. Communication channel with Presenter Window
  const channel = new BroadcastChannel('lcc_classroom_presentation');

  function focusSlideFrame() {
    if (!iframe) return;
    // Give the browser one frame to complete the click/load focus change.
    requestAnimationFrame(() => iframe.focus());
  }

  const slideInputShield = document.createElement('div');
  slideInputShield.setAttribute('aria-hidden', 'true');
  Object.assign(slideInputShield.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    top: '56px',
    bottom: '0',
    zIndex: '5',
    display: 'none',
    background: 'transparent'
  });
  iframe.parentElement.appendChild(slideInputShield);

  function hideSlideInputShield() {
    slideInputShield.style.display = 'none';
    if (slideInputShieldTimer) {
      clearTimeout(slideInputShieldTimer);
      slideInputShieldTimer = null;
    }
  }

  function showSlideInputShield() {
    slideInputShield.style.display = 'block';
    if (slideInputShieldTimer) clearTimeout(slideInputShieldTimer);
    slideInputShieldTimer = setTimeout(hideSlideInputShield, 1400);
  }

  function postSlideCommand(slideIndex) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'GOTO_SLIDE', slideIndex }, '*');
    }
  }

  function getActiveSidebarSlideIndex() {
    const activeMenuItem = document.querySelector('.menu-item.active');
    if (!activeMenuItem) return 0;

    const subItems = Array.from(activeMenuItem.querySelectorAll('.sub-menu-item'));
    const activeIndex = subItems.findIndex(si => si.classList.contains('active'));
    return activeIndex >= 0 ? activeIndex : 0;
  }

  function getActiveSidebarSlideCount() {
    const activeMenuItem = document.querySelector('.menu-item.active');
    return activeMenuItem ? activeMenuItem.querySelectorAll('.sub-menu-item').length : 0;
  }

  function navigateFromShell(direction) {
    const currentSlideIndex = getActiveSidebarSlideIndex();
    const slideCount = getActiveSidebarSlideCount();
    let targetSlideIndex = currentSlideIndex;

    if (direction === 'next') {
      targetSlideIndex = slideCount ? Math.min(currentSlideIndex + 1, slideCount - 1) : currentSlideIndex + 1;
    } else {
      targetSlideIndex = Math.max(currentSlideIndex - 1, 0);
    }

    if (isFrameLoading) {
      pendingSlideIndex = targetSlideIndex;
    } else {
      postSlideCommand(targetSlideIndex);
    }

    focusSlideFrame();
  }

  // Handle messages from the presenter window
  channel.onmessage = (event) => {
    const { type, slideIndex, file, notes } = event.data;
    if (type === 'GOTO_SLIDE') {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'GOTO_SLIDE', slideIndex }, '*');
      }
    } else if (type === 'NOTES_EDITED') {
      try {
        if (iframe && iframe.contentDocument) {
          const slideId = `slide-${slideIndex + 1}`;
          const slideEl = iframe.contentDocument.getElementById(slideId);
          const notesEl = slideEl ? slideEl.querySelector('.speaker-notes') : null;
          if (notesEl) {
            notesEl.innerHTML = notes;
            console.log(`[App] DOM of iframe slide-notes updated locally for ${slideId}`);
          }
        }
      } catch (err) {
        console.error('Failed to update iframe speaker notes DOM directly:', err);
      }
    }
  };

  // Listen to messages from the iframe
  window.addEventListener('message', (event) => {
    const { type, slideIndex, notes, totalSlides, module } = event.data;
    if (type === 'SLIDE_CHANGED') {
      // Notify presenter window of slide index, notes, and total slides to display, along with the active file path and slide titles
      const activeMenuItem = document.querySelector('.menu-item.active');
      const activeFile = activeMenuItem ? activeMenuItem.dataset.src : '';
      const slideTitles = activeMenuItem
        ? Array.from(activeMenuItem.querySelectorAll('.sub-menu-item')).map(si =>
            Array.from(si.childNodes)
              .filter(n => n.nodeType === Node.TEXT_NODE)
              .map(n => n.textContent)
              .join('')
              .trim()
          )
        : [];
      channel.postMessage({ type: 'UPDATE_NOTES', slideIndex, notes, totalSlides, activeFile, slideTitles });

      // Salva o arquivo e slide atual no localStorage para permitir que o Grafo Local carregue o contexto correto
      if (activeFile && activeFile.includes('/Aulas/')) {
        localStorage.setItem('LCC_ACTIVE_SLIDE_SRC', activeFile);
        localStorage.setItem('LCC_ACTIVE_SLIDE_INDEX', slideIndex);
      }

      // Bidirectional sync: Highlight the active sub-menu item inside the active menu list
      if (activeMenuItem) {
        const subItems = activeMenuItem.querySelectorAll('.sub-menu-item');
        subItems.forEach((si, idx) => {
          if (idx === slideIndex) {
            si.classList.add('active');
          } else {
            si.classList.remove('active');
          }
        });

        // Registro de progresso de aula
        const src = activeMenuItem.dataset.src;
        if (src && src.includes('/Aulas/')) {
          const newSlideKey = `${src}#slide-${slideIndex}`;
          
          // Quando o professor muda de slide, a página anterior visitada é marcada como dada (concluída) desde que não tenha sido desmarcada manualmente
          if (lastVisitedSlideKey && lastVisitedSlideKey !== newSlideKey) {
            if (!manuallyUncheckedSlideKeys.has(lastVisitedSlideKey)) {
              markSlideCompleted(lastVisitedSlideKey);
            }
          }

          // Se o usuário passar novamente por este slide (ou entrar nele novamente), reativa a conclusão automática
          if (manuallyUncheckedSlideKeys.has(newSlideKey)) {
            manuallyUncheckedSlideKeys.delete(newSlideKey);
            markSlideCompleted(newSlideKey);
          }

          lastVisitedSlideKey = newSlideKey;
          
          // Salva o último slide atual visitado pela turma ativa
          const activeTurma = turmas.find(t => t.id === activeTurmaId);
          if (activeTurma) {
            activeTurma.currentSlide = newSlideKey;
            saveTurmasToStorage();
          }
        }
      }
    } else if (type === 'GOTO_MODULE') {
      const menuItems = document.querySelectorAll('.menu-item');
      if (menuItems.length > module) {
        const itemToClick = menuItems[module];
        const mainBtn = itemToClick.querySelector('.menu-item-btn');
        if (mainBtn) mainBtn.click();
      }
    } else if (type === 'NEXT_MODULE') {
      const activeMenuItem = document.querySelector('.menu-item.active');
      if (activeMenuItem) {
        const group = activeMenuItem.closest('.menu-group');
        const groupItems = group ? Array.from(group.querySelectorAll('.menu-item')) : [];
        const currentIdx = groupItems.indexOf(activeMenuItem);
        if (currentIdx >= 0 && currentIdx + 1 < groupItems.length) {
          const nextItem = groupItems[currentIdx + 1];
          const mainBtn = nextItem.querySelector('.menu-item-btn');
          if (mainBtn) mainBtn.click();
        }
      }
    }
  });

  // 3. Menu Navigation (Accordion & Main items)
  document.querySelectorAll('.menu-item').forEach(item => {
    const mainBtn = item.querySelector('.menu-item-btn');
    if (!mainBtn) return;

    mainBtn.addEventListener('click', () => {
      const src = item.dataset.src;
      const title = item.dataset.title;

      // Se for a ferramenta de Notas de Aula, abre em janela popup para uso exclusivo do professor
      if (src && src.includes('NotasAula.html')) {
        window.open(src, 'NotasAulaWindow', 'width=1100,height=700,resizable=yes,scrollbars=yes');
        return;
      }

      // Switch active lesson module
      document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      ensureGroupExpanded(item);

      // Auto-expand this item's sub-list and collapse other items' sub-lists
      document.querySelectorAll('.menu-item').forEach(mi => {
        if (mi !== item && mi.querySelector('.sub-menu-list')) {
          mi.classList.add('sub-collapsed');
          mi.classList.remove('sub-expanded');
        }
      });
      item.classList.remove('sub-collapsed');
      item.classList.add('sub-expanded');

      titleText.textContent = title;
      isFrameLoading = true;
      iframe.src = src;
      pendingSlideIndex = 0;
      showSlideInputShield();
      focusSlideFrame();

      // Select first slide by default in the sub-list
      const subItems = item.querySelectorAll('.sub-menu-item');
      if (subItems.length > 0) {
        subItems.forEach(si => si.classList.remove('active'));
        subItems[0].classList.add('active');
      }

      // Reset presenter window state when switching modules
      channel.postMessage({ type: 'RESET_MODULE', title });
    });
  });

  // 4. Sub-menu Slide Navigation & Status Toggle clicks
  document.querySelectorAll('.sub-menu-item').forEach(subItem => {
    subItem.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering parent button

      const parent = subItem.closest('.menu-item');
      const src = parent ? parent.dataset.src : '';
      const title = parent ? parent.dataset.title : '';
      const slideIndex = parseInt(subItem.dataset.slide, 10);
      const slideKey = `${src}#slide-${slideIndex}`;

      // Se o clique foi especificamente no ícone de status (✓)
      if (e.target.closest('.slide-status-btn')) {
        toggleSlideCompleted(slideKey);
        return;
      }

      // Verifica se o iframe já está na página deste módulo
      let isSameModule = false;
      try {
        if (iframe && iframe.src && src) {
          const currentPath = new URL(iframe.src, window.location.href).pathname;
          const targetPath = new URL(src, window.location.href).pathname;
          isSameModule = (currentPath === targetPath);
        }
      } catch (err) {
        isSameModule = false;
      }

      if (!isSameModule && parent && src) {
        // Módulo alterado! Atualiza estado ativo do pai, título e recarrega o iframe com o novo módulo
        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        parent.classList.add('active');
        ensureGroupExpanded(parent);

        document.querySelectorAll('.menu-item').forEach(mi => {
          if (mi !== parent && mi.querySelector('.sub-menu-list')) {
            mi.classList.add('sub-collapsed');
            mi.classList.remove('sub-expanded');
          }
        });
        parent.classList.remove('sub-collapsed');
        parent.classList.add('sub-expanded');

        titleText.textContent = title;
        isFrameLoading = true;
        iframe.src = src;
        pendingSlideIndex = slideIndex;
        showSlideInputShield();

        channel.postMessage({ type: 'RESET_MODULE', title });
      } else {
        // Mesmo módulo: se ainda está carregando, atualiza o slide pendente; senão, navega direto
        if (isFrameLoading) {
          pendingSlideIndex = slideIndex;
        } else {
          postSlideCommand(slideIndex);
        }
      }

      // Highlight clicked slide sub-item
      if (parent) {
        parent.querySelectorAll('.sub-menu-item').forEach(si => si.classList.remove('active'));
      }
      subItem.classList.add('active');

      focusSlideFrame();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', ' '].includes(event.key)) return;
    if (document.activeElement === iframe) return;
    if (event.target.closest('input, textarea, select, button, [contenteditable="true"]') && !event.target.closest('.menu-item-btn')) return;

    event.preventDefault();
    navigateFromShell(event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ' ? 'next' : 'prev');
  });

  document.addEventListener('wheel', (event) => {
    if (event.target.closest('#sidebar')) return;
    if (Math.abs(event.deltaY) < 12) return;

    event.preventDefault();
    navigateFromShell(event.deltaY > 0 ? 'next' : 'prev');
  }, { passive: false });

  slideInputShield.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) < 12) return;

    event.preventDefault();
    navigateFromShell(event.deltaY > 0 ? 'next' : 'prev');

    if (!isFrameLoading) hideSlideInputShield();
  }, { passive: false });

  // 5. Class Timer
  let startTime = Date.now();
  setInterval(() => {
    const elapsedMs = Date.now() - startTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const secs = totalSecs % 60;
    const mins = Math.floor(totalSecs / 60) % 60;
    const hours = Math.floor(totalSecs / 3600);

    const pad = (n) => n.toString().padStart(2, '0');
    timerDisplay.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }, 1000);

  // 6. Fullscreen Control
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      btnFullscreen.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"/></svg>
        Sair da Tela Cheia
      `;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'ENTER_PRESENTATION' }, '*');
      }
    } else {
      btnFullscreen.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        Tela Cheia (F11)
      `;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'EXIT_PRESENTATION' }, '*');
      }
    }
  });

  iframe.addEventListener('load', () => {
    isFrameLoading = false;
    if (document.fullscreenElement && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'ENTER_PRESENTATION' }, '*');
    }
    if (pendingSlideIndex !== null) {
      postSlideCommand(pendingSlideIndex);
      pendingSlideIndex = null;
    }
    focusSlideFrame();
    slideInputShieldTimer = setTimeout(hideSlideInputShield, 450);
  });

  // 7. Launch Presenter Mode
  btnPresenter.addEventListener('click', () => {
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
    } else {
      const w = 1000;
      const h = 700;
      const left = (screen.width - w) / 2;
      const top = (screen.height - h) / 2;

      presenterWindow = window.open(
        './presenter.html',
        'PresenterMode',
        `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    }
  });

  // Inicialização do sistema de progresso de turmas
  loadTurmasFromStorage();
  populateTurmaDropdown();
  updateProgressUI();
});

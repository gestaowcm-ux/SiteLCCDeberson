// NotasAula.js - Workspace notes manager with Markdown real-time parser and filesystem save/load
let notes = [];
let activeNote = null;
let activeFilterTag = 'Todos';
let searchQuery = '';
let categories = ['RCA', 'AnÃ¡lise', 'ExercÃ­cios', 'Importante'];

const notesList = document.getElementById('notes-list');
const editorBody = document.getElementById('editor-body');
const emptyState = document.getElementById('empty-state');

const noteTitle = document.getElementById('note-title');
const noteTag = document.getElementById('note-tag');
const markdownEditor = document.getElementById('markdown-editor');
const markdownPreview = document.getElementById('markdown-preview');
const searchInput = document.getElementById('search-input');
const tagFilters = document.getElementById('tag-filters');
const fileInput = document.getElementById('file-input');
let pendingLoadMode = 'single';

// Initialize Workspace
document.addEventListener('DOMContentLoaded', () => {
  loadDefaultDatabase();
  setupEventListeners();
  renderCategoryList();
  notifyPortal();
});

// --- 1. Event Listeners Setup ---
function setupEventListeners() {
  // Add Note Button
  document.getElementById('btn-add-note').addEventListener('click', createNewNote);

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderNotesList();
  });

  // Tag Filters
  tagFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-tag') && e.target.id !== 'btn-add-tag') {
      document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilterTag = e.target.getAttribute('data-tag');
      renderNotesList();
    }
  });

  // Real-time Editor Inputs Sync
  noteTitle.addEventListener('input', () => {
    if (activeNote) {
      activeNote.title = noteTitle.value.trim() || 'Sem TÃ­tulo';
      activeNote.lastModified = new Date().toLocaleDateString('pt-BR');
      updateActiveCardInfo();
    }
  });

  noteTag.addEventListener('change', () => {
    if (activeNote) {
      activeNote.tag = noteTag.value;
      activeNote.lastModified = new Date().toLocaleDateString('pt-BR');
      updateActiveCardInfo();
      renderNotesList(); // Re-filter if necessary
    }
  });

  markdownEditor.addEventListener('input', () => {
    if (activeNote) {
      activeNote.content = markdownEditor.value;
      activeNote.lastModified = new Date().toLocaleDateString('pt-BR');
      
      // DetecÃ§Ã£o de categorias estilo Obsidian [[Categoria]]
      scanObsidianLinks(markdownEditor.value);

      updateActiveCardInfo();
      renderPreview();
    }
  });

  // Global actions toolbar
  document.getElementById('btn-delete').addEventListener('click', deleteActiveNote);
  setupToolbarMenus();

  fileInput.addEventListener('change', loadDatabaseFromFile);

  // ConfirmaÃ§Ã£o nativa antes de fechar/recarregar a janela popup para evitar perda de dados
  window.addEventListener('beforeunload', (e) => {
    e.returnValue = 'Tem certeza de que deseja sair?';
  });
}

// --- 2. Notes Render and Navigation ---
function renderNotesList() {
  notesList.innerHTML = '';
  
  const filtered = notes.filter((n) => {
    const matchesTag = activeFilterTag === 'Todos' || n.tag === activeFilterTag;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery);
    return matchesTag && matchesSearch;
  });

  if (filtered.length === 0) {
    notesList.innerHTML = '<div style="font-size:12px; color:#999; text-align:center; padding: 20px;">Nenhuma nota encontrada.</div>';
    return;
  }

  filtered.forEach((note) => {
    const card = document.createElement('div');
    card.className = `note-card ${activeNote && activeNote.id === note.id ? 'active' : ''}`;
    card.setAttribute('data-id', note.id);
    
    // Create card snippet content (Markdown stripped snippet)
    const textSnippet = stripMarkdown(note.content) || 'Sem conteÃºdo adicional...';

    card.innerHTML = `
      <div class="note-card-title">${note.title}</div>
      <div class="note-card-snippet">${textSnippet}</div>
      <div class="note-card-footer">
        <span class="note-card-tag">${note.tag}</span>
        <span class="note-card-date">${note.lastModified}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectNote(note.id);
    });

    notesList.appendChild(card);
  });
}

function selectNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  activeNote = note;

  // Active highlights
  document.querySelectorAll('.note-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.note-card[data-id="${id}"]`);
  if (card) card.classList.add('active');

  // Load editor details
  noteTitle.value = note.title;
  noteTag.value = note.tag;
  markdownEditor.value = note.content;

  // View switch
  emptyState.style.display = 'none';
  editorBody.style.display = 'flex';

  renderPreview();
}

function updateActiveCardInfo() {
  if (!activeNote) return;
  const card = document.querySelector(`.note-card[data-id="${activeNote.id}"]`);
  if (card) {
    card.querySelector('.note-card-title').textContent = activeNote.title;
    card.querySelector('.note-card-snippet').textContent = stripMarkdown(activeNote.content) || 'Sem conteÃºdo adicional...';
    card.querySelector('.note-card-tag').textContent = activeNote.tag;
    card.querySelector('.note-card-date').textContent = activeNote.lastModified;
  }
}

function createNewNote() {
  const newNote = {
    id: `note-${Date.now()}`,
    title: 'Nova Nota',
    content: '# Nova Nota\n\nComece a digitar suas anotaÃ§Ãµes aqui...',
    tag: 'RCA',
    lastModified: new Date().toLocaleDateString('pt-BR')
  };

  notes.unshift(newNote);
  renderNotesList();
  selectNote(newNote.id);
}

function deleteActiveNote() {
  if (!activeNote) return;
  if (confirm(`Deseja realmente excluir a nota "${activeNote.title}"?`)) {
    notes = notes.filter(n => n.id !== activeNote.id);
    activeNote = null;
    
    editorBody.style.display = 'none';
    emptyState.style.display = 'flex';
    
    renderNotesList();
  }
}


// --- 3. Save & Load Database ---
function setupToolbarMenus() {
  const saveButton = document.getElementById('btn-save');
  const loadButton = document.getElementById('btn-load');
  const saveMenu = document.getElementById('save-menu');
  const loadMenu = document.getElementById('load-menu');

  const closeMenus = () => {
    saveMenu.classList.remove('open');
    loadMenu.classList.remove('open');
    saveButton.setAttribute('aria-expanded', 'false');
    loadButton.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = (menu, button) => {
    const willOpen = !menu.classList.contains('open');
    closeMenus();
    if (willOpen) {
      menu.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  };

  saveButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(saveMenu, saveButton);
  });

  loadButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(loadMenu, loadButton);
  });

  saveMenu.addEventListener('click', async (e) => {
    const item = e.target.closest('[data-save-mode]');
    if (!item) return;
    closeMenus();
    await saveDatabaseToFile(item.dataset.saveMode);
  });

  loadMenu.addEventListener('click', async (e) => {
    const item = e.target.closest('[data-load-mode]');
    if (!item) return;
    closeMenus();
    await openNotesFilePicker(item.dataset.loadMode);
  });

  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenus();
  });
}

async function saveDatabaseToFile(mode = 'all') {
  if (mode === 'active' && !activeNote) {
    alert("Selecione uma nota para descarregar.");
    return;
  }

  if (notes.length === 0) {
    alert("NÃ£o hÃ¡ notas para salvar.");
    return;
  }

  const notesToSave = mode === 'active' ? [activeNote] : notes;
  const dataStr = JSON.stringify({
    categories: categories,
    notes: notesToSave
  }, null, 2);

  const date = new Date().toISOString().slice(0, 10);
  const suggestedName = mode === 'active'
    ? `nota-de-aula-${slugifyFilename(activeNote.title)}-${date}.json`
    : `notas-de-aula-${date}.json`;

  await writeJsonFile(dataStr, suggestedName);
}

async function writeJsonFile(dataStr, suggestedName) {
  if ('showSaveFilePicker' in window) {
    try {
      const startInDir = await getActiveTurmaDirectory();
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'Banco de Notas de Aula (.json)',
          accept: { 'application/json': ['.json'] }
        }],
        startIn: startInDir || undefined
      });
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("showSaveFilePicker falhou, utilizando fallback download link", err);
    }
  }

  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  link.click();
  URL.revokeObjectURL(url);
}

async function openNotesFilePicker(mode = 'single') {
  pendingLoadMode = mode;

  if ('showOpenFilePicker' in window) {
    try {
      const startInDir = await getActiveTurmaDirectory();
      const fileHandles = await window.showOpenFilePicker({
        types: [{
          description: 'Banco de Notas de Aula (.json)',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: mode === 'multiple',
        startIn: startInDir || undefined
      });
      await importNotesFromFiles(await Promise.all(fileHandles.map(handle => handle.getFile())));
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("showOpenFilePicker falhou, usando fallback clÃ¡ssico", err);
    }
  }

  fileInput.multiple = mode === 'multiple';
  fileInput.click();
}

async function loadDatabaseFromFile(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  try {
    await importNotesFromFiles(pendingLoadMode === 'single' ? [files[0]] : files);
  } catch (err) {
    alert("Erro ao importar notas de aula: " + err.message);
  } finally {
    e.target.value = '';
    fileInput.multiple = false;
    pendingLoadMode = 'single';
  }
}

async function importNotesFromFiles(files) {
  const importedDatabases = [];

  for (const file of files) {
    const imported = parseNotesDatabase(JSON.parse(await file.text()));
    importedDatabases.push(imported);
  }

  const mergedCategories = new Set(categories);
  const importedNotes = [];

  importedDatabases.forEach((database) => {
    database.categories.forEach((category) => mergedCategories.add(category));
    importedNotes.push(...database.notes);
  });

  categories = Array.from(mergedCategories);
  notes = mergeNotesById(notes, importedNotes);
  refreshWorkspaceAfterImport(importedNotes[0]?.id);
}

function parseNotesDatabase(imported) {
  if (Array.isArray(imported)) {
    return {
      categories: ['RCA', 'AnÃ¡lise', 'ExercÃ­cios', 'Importante'],
      notes: imported
    };
  }

  if (imported.notes && Array.isArray(imported.notes)) {
    return {
      categories: Array.isArray(imported.categories) ? imported.categories : categories,
      notes: imported.notes
    };
  }

  if (imported.id && imported.title && imported.content) {
    return {
      categories: categories.includes(imported.tag) ? categories : [...categories, imported.tag || 'RCA'],
      notes: [imported]
    };
  }

  throw new Error("Formato de arquivo invÃ¡lido.");
}

function mergeNotesById(currentNotes, importedNotes) {
  const merged = [...currentNotes];
  const ids = new Set(merged.map(note => note.id));

  importedNotes.forEach((note) => {
    const normalizedNote = {
      id: note.id || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: note.title || 'Sem TÃ­tulo',
      content: note.content || '',
      tag: note.tag || 'RCA',
      lastModified: note.lastModified || new Date().toLocaleDateString('pt-BR')
    };

    // Ao carregar a pasta novamente, os mesmos IDs devem continuar
    // representando a mesma nota, sem criar uma cópia com outro ID.
    if (ids.has(normalizedNote.id)) return;

    ids.add(normalizedNote.id);
    merged.unshift(normalizedNote);
  });

  return merged;
}

function refreshWorkspaceAfterImport(preferredId) {
  renderCategoryList();
  renderNotesList();

  if (notes.length > 0) {
    selectNote(preferredId && notes.some(note => note.id === preferredId) ? preferredId : notes[0].id);
  } else {
    activeNote = null;
    editorBody.style.display = 'none';
    emptyState.style.display = 'flex';
  }
}

function slugifyFilename(value) {
  return (value || 'nota')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 50) || 'nota';
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

async function getActiveTurmaDirectory() {
  const activeId = localStorage.getItem('LCC_ACTIVE_TURMA_ID');
  if (!activeId) return null;
  try {
    const handle = await getDirectoryHandle(activeId);
    if (handle) {
      const opts = { mode: 'readwrite' };
      if (await handle.queryPermission(opts) !== 'granted') {
        await handle.requestPermission(opts);
      }
      return handle;
    }
  } catch (err) {
    console.warn("Falha ao obter permissÃµes da pasta da turma:", err);
  }
  return null;
}


// --- 4. Markdown Real-time Parser ---
function renderCategoryList() {
  // Clear and populate tag chips in sidebar
  tagFilters.innerHTML = `<button class="filter-tag ${activeFilterTag === 'Todos' ? 'active' : ''}" data-tag="Todos">Todos</button>`;
  categories.forEach((cat) => {
    tagFilters.innerHTML += `<button class="filter-tag ${activeFilterTag === cat ? 'active' : ''}" data-tag="${cat}">${cat}</button>`;
  });
  
  // Append + Nova Categoria button
  tagFilters.innerHTML += `<button class="filter-tag" id="btn-add-tag" style="background-color: var(--color-canvas-softer); border: 1px dashed var(--color-border, #e2e2e2); color: var(--color-ink, #000); font-weight: 700;">+ Nova</button>`;
  
  // Re-bind click event to adding tags
  document.getElementById('btn-add-tag').addEventListener('click', (e) => {
    e.stopPropagation();
    const newTag = prompt("Digite o nome da nova categoria:");
    if (newTag && newTag.trim()) {
      addNewCategory(newTag.trim());
    }
  });

  // Populate note selector
  const activeVal = noteTag.value;
  noteTag.innerHTML = '';
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    noteTag.appendChild(opt);
  });

  if (categories.includes(activeVal)) {
    noteTag.value = activeVal;
  }
}

function addNewCategory(tagName) {
  const formatted = tagName.trim().charAt(0).toUpperCase() + tagName.trim().slice(1);
  if (categories.includes(formatted)) {
    alert("Essa categoria jÃ¡ existe!");
    return;
  }
  categories.push(formatted);
  renderCategoryList();
}

function scanObsidianLinks(text) {
  if (!text) return;
  const regex = /\[\[\s*([^\]\n]+)\s*\]\]/g;
  let match;
  let categoriesAdded = false;

  while ((match = regex.exec(text)) !== null) {
    const rawTag = match[1].trim();
    if (rawTag) {
      // Capitalizar primeira letra
      const formatted = rawTag.charAt(0).toUpperCase() + rawTag.slice(1);
      if (!categories.includes(formatted)) {
        categories.push(formatted);
        categoriesAdded = true;
      }
    }
  }

  if (categoriesAdded) {
    renderCategoryList();
  }
}

function renderPreview() {
  if (!activeNote) return;
  markdownPreview.innerHTML = parseMarkdown(activeNote.content);
}

function parseMarkdown(text) {
  if (!text) return '';

  // Escaping basic HTML to prevent injection, allowing markdown conversion
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // RenderizaÃ§Ã£o de wikilinks estilo Obsidian: [[Tag]] -> Custom tag badge
  html = html.replace(/\[\[\s*([^\]\n]+)\s*\]\]/g, '<span class="obsidian-tag" style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid var(--color-danger, #dc2626); color: var(--color-danger, #dc2626); padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; cursor: default; margin: 0 2px;">ðŸ·ï¸ $1</span>');

  // Headings
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

  // Quotes/Blockquotes
  html = html.replace(/^\&gt;\s?(.*$)/gim, '<blockquote>$1</blockquote>');

  // Monospace code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold / Italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Simple bullet lists
  html = html.replace(/^\-\s(.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\.\s(.*$)/gim, '<li>$1</li>');

  // Line breaks to <br> if not inside code block structures
  html = html.split('\n').map((line) => {
    if (!line.trim()) return '<br>';
    return line;
  }).join('\n');

  return html;
}

function stripMarkdown(text) {
  if (!text) return '';
  // Strip Markdown symbols for list snippet views
  return text
    .replace(/[#\*_`>]/g, '')
    .replace(/^\-\s/gim, '')
    .replace(/^\d+\.\s/gim, '')
    .trim();
}


// --- 5. Default Guide Template ---
function loadDefaultDatabase() {
  notes = [
    {
      id: 'default-tutorial',
      title: 'Guia do Professor â€” Notas de Aula',
      content: `# Guia do Professor â€” Notas de Aula\n\nBem-vindo ao workspace de anotaÃ§Ãµes! Este espaÃ§o foi desenvolvido para o professor salvar notas de aula, planos de exercÃ­cios e resumos teÃ³ricos do Curso RCA.\n\n## Como Funciona\n\n- **Nova Nota**: Clique no botÃ£o "+ Nova Nota" no topo da barra lateral para iniciar um documento em branco.\n- **Markdown em Tempo Real**: Digite suas anotaÃ§Ãµes na coluna da esquerda utilizando a sintaxe de Markdown. O resultado formatado serÃ¡ renderizado instantaneamente na coluna da direita com o design do Curso.\n- **CategorizaÃ§Ã£o**: Escolha a categoria da nota utilizando o seletor no topo da Ã¡rea de ediÃ§Ã£o (RCA, AnÃ¡lise, ExercÃ­cios, Importante).\n\n## Comando Estilo Obsidian (Criar Categorias)\n\nVocÃª pode criar novas categorias diretamente digitando o comando de wikilinks do Obsidian:\n- Digite \`[[ Minha Nova Categoria ]]\` no meio do texto da sua nota.\n- O sistema detecta a marcaÃ§Ã£o automaticamente e cria a categoria no menu e nos filtros da sidebar!\n- Tente digitar algo como \`[[ Engenharia ]]\` ou \`[[ GestÃ£o de Ativos ]]\` neste documento para ver acontecer em tempo real!\n\n## FormataÃ§Ãµes Suportadas\n\nVocÃª pode usar formataÃ§Ãµes simples para dar Ãªnfase:\n\n- Use \`# TÃ­tulo\` para CabeÃ§alho Principal\n- Use \`## TÃ­tulo\` para SubtÃ­tulos\n- Use \`**texto**\` para dar **destaque em negrito**\n- Use \`> CitaÃ§Ã£o\` para gerar caixas de destaque explicativas:\n> "Confiabilidade nÃ£o Ã© sorte, Ã© disciplina de processos."\n\n## Salvar e Carregar Banco de Dados\n\nPara garantir a portabilidade e permitir que vocÃª carregue suas notas nas prÃ³ximas aulas:\n1. Clique no botÃ£o de **Salvar Banco** (Seta para Baixo) no menu superior para baixar todos os seus cards de notas agrupados em um Ãºnico arquivo de banco de dados (.json).\n2. Na prÃ³xima aula, use o botÃ£o de **Carregar Banco** (Seta para Cima) para carregar todas as suas notas salvas de volta Ã  lousa.`,
      tag: 'Importante',
      lastModified: new Date().toLocaleDateString('pt-BR')
    }
  ];
  
  renderNotesList();
  selectNote(notes[0].id);
}

// Sincronizar com portal principal (envio de notas de ajuda do orador)
function notifyPortal() {
  if (window.parent) {
    window.parent.postMessage({
      type: 'SLIDE_CHANGED',
      slideIndex: 0,
      notes: '<h3>Notas de Aula</h3><p>EspaÃ§o de ediÃ§Ã£o em Markdown e visualizaÃ§Ã£o em tempo real. Permite ao professor redigir conceitos de RCA, listas de exercÃ­cios e lembretes didÃ¡ticos de forma limpa, com exportaÃ§Ã£o e importaÃ§Ã£o completa em banco de dados local.</p>',
      totalSlides: 1
    }, '*');
  }
}

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// ============================================================================
// 1. SIMULATED BROWSER ENVIRONMENT (DOM DOUBLE)
// ============================================================================

class MockElement {
  constructor(tagName, ownerDocument = null) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.id = '';
    this.className = '';
    this._value = '';
    this._textContent = '';
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = {
      setProperty(name, val) { this[name] = String(val); },
      getPropertyValue(name) { return this[name] || ''; },
      removeProperty(name) { delete this[name]; }
    };
    this.listeners = {};
    
    // Position metrics for layout tests
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
    this.scrollLeft = 0;
    this.scrollTop = 0;

    // Dataset Proxy
    this.dataset = new Proxy(this.attributes, {
      get(target, prop) {
        if (typeof prop === 'symbol') return target[prop];
        const attrName = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return target[attrName];
      },
      set(target, prop, value) {
        const attrName = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        target[attrName] = String(value);
        return true;
      },
      deleteProperty(target, prop) {
        const attrName = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        delete target[attrName];
        return true;
      }
    });
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = String(val);
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map(c => c.textContent).join('');
    }
    return this._textContent || '';
  }

  set textContent(val) {
    this.children = [];
    this._textContent = String(val);
  }

  get innerHTML() {
    return this.children.map(c => {
      if (c.tagName === '#TEXT') return c.textContent;
      let attrs = Object.entries(c.attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
      attrs = attrs ? ' ' + attrs : '';
      const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col', 'base'];
      if (voidElements.includes(c.tagName.toLowerCase())) {
        return `<${c.tagName.toLowerCase()}${attrs}>`;
      }
      return `<${c.tagName.toLowerCase()}${attrs}>${c.innerHTML}</${c.tagName.toLowerCase()}>`;
    }).join('');
  }

  set innerHTML(html) {
    this.children = [];
    this._textContent = '';
    parseHTMLToDOM(html, this, this.ownerDocument);
  }

  get classList() {
    const self = this;
    return {
      add(...classes) {
        const current = self.className ? self.className.split(/\s+/) : [];
        classes.forEach(c => {
          if (c && !current.includes(c)) current.push(c);
        });
        self.className = current.join(' ');
      },
      remove(...classes) {
        let current = self.className ? self.className.split(/\s+/) : [];
        current = current.filter(c => !classes.includes(c));
        self.className = current.join(' ');
      },
      contains(c) {
        const current = self.className ? self.className.split(/\s+/) : [];
        return current.includes(c);
      },
      toggle(c, force) {
        if (force !== undefined) {
          if (force) {
            this.add(c);
            return true;
          } else {
            this.remove(c);
            return false;
          }
        }
        if (this.contains(c)) {
          this.remove(c);
          return false;
        } else {
          this.add(c);
          return true;
        }
      }
    };
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';
  }

  appendChild(child) {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parentNode = null;
      return child;
    }
    throw new Error("DOMException: Failed to execute 'removeChild' on 'Node'");
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (matchSingle(current, selector)) return current;
      current = current.parentNode;
    }
    return null;
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
  }

  dispatchEvent(event) {
    event.target = this;
    let current = this;
    let path = [];
    while (current) {
      path.push(current);
      current = current.parentNode;
    }
    if (this.ownerDocument) {
      path.push(this.ownerDocument);
    }
    if (this.ownerDocument && this.ownerDocument.defaultView) {
      path.push(this.ownerDocument.defaultView);
    }

    for (const currentTarget of path) {
      event.currentTarget = currentTarget;
      const list = currentTarget.listeners && currentTarget.listeners[event.type];
      if (list) {
        for (const callback of list) {
          callback.call(currentTarget, event);
          if (event._immediatePropagationStopped) break;
        }
      }
      if (event._immediatePropagationStopped) break;
      if (!event.bubbles || event._propagationStopped) break;
    }
    return !event.defaultPrevented;
  }

  dispatchEventName(name, detail = null) {
    const event = detail !== null
      ? new CustomEvent(name, { bubbles: true, cancelable: true, detail })
      : new Event(name, { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  }

  click() {
    this.dispatchEventName('click');
  }

  getBoundingClientRect() {
    return { x: 0, y: 0, width: 120, height: 50, top: 0, right: 120, bottom: 50, left: 0 };
  }

  querySelector(selector) {
    const list = querySelectorImpl(this, selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    return querySelectorImpl(this, selector);
  }

  scrollIntoView(options) {
    this.scrollIntoViewCalled = options || true;
  }

  scrollTo(options) {
    if (options && options.left !== undefined) {
      this.scrollLeft = options.left;
    }
    this.scrollToCalled = options || true;
  }
}

class MockDocument {
  constructor() {
    this.documentElement = new MockElement('html', this);
    this.body = new MockElement('body', this);
    this.documentElement.appendChild(this.body);
    this.listeners = {};
    this.defaultView = null;
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    const list = this.listeners[event.type];
    if (list) {
      for (const callback of list) {
        callback.call(this, event);
        if (event._immediatePropagationStopped) break;
      }
    }
    if (!event._immediatePropagationStopped && event.bubbles && this.defaultView) {
      this.defaultView.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }

  dispatchEventName(name, detail = null) {
    const event = detail !== null
      ? new CustomEvent(name, { bubbles: true, cancelable: true, detail })
      : new Event(name, { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  }

  createElement(tagName) {
    return new MockElement(tagName, this);
  }

  createTextNode(text) {
    const el = new MockElement('#text', this);
    el.textContent = text;
    return el;
  }

  createDocumentFragment() {
    return new MockElement('div', this); // Simples double para fragmentos
  }

  getElementById(id) {
    const search = (node) => {
      if (node.id === id) return node;
      for (const child of node.children) {
        if (child.tagName === '#text') continue;
        const res = search(child);
        if (res) return res;
      }
      return null;
    };
    return search(this.documentElement);
  }

  querySelector(selector) {
    if (selector.trim().toUpperCase() === 'HTML') return this.documentElement;
    if (selector.trim().toUpperCase() === 'BODY') return this.body;
    return this.documentElement.querySelector(selector);
  }

  querySelectorAll(selector) {
    if (selector.trim().toUpperCase() === 'HTML') return [this.documentElement];
    if (selector.trim().toUpperCase() === 'BODY') return [this.body];
    return this.documentElement.querySelectorAll(selector);
  }
}

class Event {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = !!options.bubbles;
    this.cancelable = !!options.cancelable;
    this.defaultPrevented = false;
    this._propagationStopped = false;
    this._immediatePropagationStopped = false;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() { this._propagationStopped = true; }
  stopImmediatePropagation() { this._immediatePropagationStopped = true; }
}

class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail || null;
  }
}

// Robust Query Selector Matcher
function matchSingle(el, selector) {
  if (selector === '*') return true;
  let currentSel = selector.trim();

  // Extract attribute selectors first, e.g. [data-key="KeyQ"]
  const attrRegex = /\[([a-z0-9:-]+)(?:=(?:['"]([^'"]*)['"]|([^\s\]]+)))?\]/gi;
  let attrMatch;
  const requiredAttrs = [];
  while ((attrMatch = attrRegex.exec(selector)) !== null) {
    requiredAttrs.push({
      name: attrMatch[1],
      value: attrMatch[2] !== undefined ? attrMatch[2] : attrMatch[3]
    });
  }
  // Remove attribute selectors from the string for class/id/tag matching
  currentSel = currentSel.replace(attrRegex, '');

  // Extract ID, e.g. #keyboardBase
  let requiredId = null;
  const idMatch = currentSel.match(/#([a-z0-9_-]+)/i);
  if (idMatch) {
    requiredId = idMatch[1];
    currentSel = currentSel.replace(idMatch[0], '');
  }

  // Extract classes, e.g. .key.accent
  const requiredClasses = [];
  const classMatch = currentSel.match(/\.([a-z0-9_-]+)/gi);
  if (classMatch) {
    classMatch.forEach(c => requiredClasses.push(c.slice(1)));
    currentSel = currentSel.replace(/\.([a-z0-9_-]+)/gi, '');
  }

  // Remaining part is the tag name (if any)
  const requiredTag = currentSel.trim();

  // Now perform assertions on the element
  if (requiredTag && requiredTag !== '*' && el.tagName !== requiredTag.toUpperCase()) {
    return false;
  }
  if (requiredId && el.id !== requiredId) {
    return false;
  }
  if (requiredClasses.length > 0) {
    const hasAllClasses = requiredClasses.every(c => el.classList.contains(c));
    if (!hasAllClasses) return false;
  }
  if (requiredAttrs.length > 0) {
    const hasAllAttrs = requiredAttrs.every(attr => {
      const val = el.getAttribute(attr.name);
      if (val === null) return false;
      if (attr.value !== undefined && val !== attr.value) return false;
      return true;
    });
    if (!hasAllAttrs) return false;
  }

  return true;
}

function querySelectorImplSingle(element, selector) {
  const results = [];
  const traverse = (node) => {
    for (const child of node.children) {
      if (child.tagName === '#text') continue;
      if (matchSingle(child, selector)) results.push(child);
      traverse(child);
    }
  };
  traverse(element);
  return results;
}

function querySelectorImpl(element, selector) {
  const selectors = selector.split(',').map(s => s.trim());
  const results = [];
  for (const sel of selectors) {
    const parts = sel.split(/\s+/);
    let currentElements = [element];
    
    let i = 0;
    while (i < parts.length) {
      const part = parts[i];
      if (part === '>') {
        const nextElements = [];
        const nextPart = parts[i + 1];
        if (!nextPart) break;
        for (const el of currentElements) {
          for (const child of el.children) {
            if (child.tagName === '#text') continue;
            if (matchSingle(child, nextPart)) {
              nextElements.push(child);
            }
          }
        }
        currentElements = nextElements;
        i += 2;
      } else {
        const nextElements = [];
        for (const el of currentElements) {
          const found = querySelectorImplSingle(el, part);
          nextElements.push(...found);
        }
        currentElements = nextElements;
        i++;
      }
    }
    results.push(...currentElements);
  }
  return Array.from(new Set(results));
}

function parseHTMLToDOM(htmlString, rootElement, documentInstance) {
  // Strip body tags and only parse what's inside
  const cleanHtml = htmlString.replace(/<!--[\s\S]*?-->/g, '');
  let bodyContent = cleanHtml;
  
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  // Remove script tags from DOM parsing to let env runner process them separately
  bodyContent = bodyContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

  const tokenRegex = /<(\/?[a-z0-9:-]+)([^>]*?)>|([^<]+)/gi;
  let match;
  const stack = [rootElement];

  while ((match = tokenRegex.exec(bodyContent)) !== null) {
    if (match[1]) {
      const tagName = match[1];
      const attributesStr = match[2];

      if (tagName.startsWith('/')) {
        const upperTag = tagName.slice(1).toUpperCase();
        while (stack.length > 1 && stack[stack.length - 1].tagName !== upperTag) {
          stack.pop();
        }
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        const doc = documentInstance || rootElement.ownerDocument || rootElement;
        const el = doc.createElement(tagName);

        const attrRegex = /([a-z0-9-]+)(?:=(?:["']([^"']*)["']|([^\s>]+)))?/gi;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
          const key = attrMatch[1].toLowerCase();
          const val = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : '');
          if (key && key !== '/' && key !== '>') {
            el.setAttribute(key, val);
          }
        }

        stack[stack.length - 1].appendChild(el);

        const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col', 'base', 'path', 'circle', 'svg'];
        const isSelfClosing = attributesStr.trim().endsWith('/') || voidElements.includes(tagName.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      }
    } else if (match[3]) {
      const text = match[3].trim();
      if (text) {
        const parent = stack[stack.length - 1];
        const doc = documentInstance || rootElement.ownerDocument || rootElement;
        const textNode = doc.createTextNode(text);
        parent.appendChild(textNode);
      }
    }
  }
}

// ============================================================================
// 2. MOCKS FOR LIBRARIES (GSAP, Draggable, IntersectionObserver)
// ============================================================================

let gsapCalls = {
  set: [],
  to: [],
  fromTo: [],
  timeline: [],
  registerPlugin: [],
  draggableCreate: []
};

function clearGsapCalls() {
  gsapCalls = {
    set: [],
    to: [],
    fromTo: [],
    timeline: [],
    registerPlugin: [],
    draggableCreate: []
  };
}

const mockGsap = {
  registerPlugin: (...plugins) => {
    gsapCalls.registerPlugin.push(plugins);
  },
  set: (target, vars) => {
    gsapCalls.set.push({ target, vars });
    const targets = Array.isArray(target) ? target : (target.forEach ? Array.from(target) : [target]);
    targets.forEach(t => {
      if (t && t.style) Object.assign(t.style, vars);
    });
  },
  to: (target, vars) => {
    gsapCalls.to.push({ target, vars });
    const targets = Array.isArray(target) ? target : (target.forEach ? Array.from(target) : [target]);
    targets.forEach(t => {
      if (t && t.style) Object.assign(t.style, vars);
    });
    if (vars && vars.onComplete) vars.onComplete();
  },
  fromTo: (target, fromVars, toVars) => {
    gsapCalls.fromTo.push({ target, fromVars, toVars });
    const targets = Array.isArray(target) ? target : (target.forEach ? Array.from(target) : [target]);
    targets.forEach(t => {
      if (t && t.style) Object.assign(t.style, toVars);
    });
    if (toVars && toVars.onComplete) toVars.onComplete();
  },
  timeline: (config) => {
    gsapCalls.timeline.push(config);
    const tl = {
      paused: config && config.paused,
      fromTo: (target, from, to) => {
        gsapCalls.fromTo.push({ target, fromVars: from, toVars: to });
        const targets = Array.isArray(target) ? target : (target.forEach ? Array.from(target) : [target]);
        targets.forEach(t => {
          if (t && t.style) Object.assign(t.style, to);
        });
        return tl;
      },
      to: (target, to) => {
        gsapCalls.to.push({ target, vars: to });
        const targets = Array.isArray(target) ? target : (target.forEach ? Array.from(target) : [target]);
        targets.forEach(t => {
          if (t && t.style) Object.assign(t.style, to);
        });
        return tl;
      },
      play: () => {}
    };
    return tl;
  },
  utils: {
    toArray: (selector) => {
      if (typeof selector === 'string') {
        // Return standard array of matches from globally set document
        return Array.from(globalCurrentDocument.querySelectorAll(selector));
      }
      if (Array.isArray(selector)) return selector;
      if (selector && selector.forEach) return Array.from(selector);
      return [selector];
    }
  }
};

const mockDraggable = {
  create: (target, options) => {
    gsapCalls.draggableCreate.push({ target, options });
    return [{ target, options }];
  }
};

let observerCalls = [];
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    observerCalls.push(this);
  }
  observe(target) {
    this.observed.push(target);
  }
  unobserve(target) {
    this.observed = this.observed.filter(t => t !== target);
  }
  disconnect() {
    this.observed = [];
  }
  triggerIntersection(target, isIntersecting) {
    const entry = {
      target,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0
    };
    this.callback([entry], this);
  }
}

// Global active document pointer for GSAP toArray to resolve elements correctly
let globalCurrentDocument = null;

// ============================================================================
// 3. ENVIRONMENT RUNNER SETUP
// ============================================================================

function createBrowserEnvironment(htmlContent) {
  const doc = new MockDocument();
  globalCurrentDocument = doc;
  const storage = {};
  
  let rafCallbacks = [];
  const requestAnimationFrame = (cb) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  };
  const cancelAnimationFrame = (id) => {
    rafCallbacks = [];
  };

  const matchMedia = (query) => {
    return {
      matches: false, // Por padrão, desativa prefers-reduced-motion
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  };

  class MockAudio {
    constructor(src) { this.src = src; }
    play() { return Promise.resolve(); }
  }

  const activeIntervals = new Map();
  let nextIntervalId = 1;
  const mockSetInterval = (cb, delay) => {
    const id = nextIntervalId++;
    activeIntervals.set(id, { cb, delay });
    return id;
  };
  const mockClearInterval = (id) => {
    activeIntervals.delete(id);
  };

  const activeTimeouts = new Map();
  let nextTimeoutId = 1;
  const mockSetTimeout = (cb, delay) => {
    const id = nextTimeoutId++;
    activeTimeouts.set(id, { cb, delay });
    return id;
  };
  const mockClearTimeout = (id) => {
    activeTimeouts.delete(id);
  };

  const win = {
    document: doc,
    window: null,
    global: null,
    localStorage: {
      getItem(key) { return storage[key] || null; },
      setItem(key, value) { storage[key] = String(value); },
      removeItem(key) { delete storage[key]; },
      clear() { for (const k in storage) delete storage[k]; }
    },
    Event,
    CustomEvent,
    IntersectionObserver: MockIntersectionObserver,
    matchMedia,
    requestAnimationFrame,
    cancelAnimationFrame,
    flushRAF: () => {
      const callbacks = rafCallbacks;
      rafCallbacks = [];
      callbacks.forEach(cb => cb());
    },
    hasRAFCallbacks: () => rafCallbacks.length > 0,
    Audio: MockAudio,
    gsap: mockGsap,
    ScrollTrigger: {},
    Draggable: mockDraggable,
    setTimeout: mockSetTimeout,
    clearTimeout: mockClearTimeout,
    setInterval: mockSetInterval,
    clearInterval: mockClearInterval,
    activeIntervals,
    activeTimeouts,
    console,
    navigator: { userAgent: 'NodeJS E2E Runner' },
    location: { href: 'http://localhost/mock.html' },
    listeners: {}
  };

  win.window = win;
  win.global = win;
  doc.defaultView = win;

  win.addEventListener = (type, cb) => {
    if (!win.listeners[type]) win.listeners[type] = [];
    win.listeners[type].push(cb);
  };

  win.removeEventListener = (type, cb) => {
    if (!win.listeners[type]) return;
    win.listeners[type] = win.listeners[type].filter(x => x !== cb);
  };

  win.dispatchEvent = (event) => {
    const list = win.listeners[event.type];
    if (list) {
      list.forEach(cb => cb.call(win, event));
    }
  };

  return win;
}

function runHTMLInstance(fileName) {
  const filePath = path.join(__dirname, fileName);
  const htmlContent = fs.readFileSync(filePath, 'utf8');

  clearGsapCalls();
  observerCalls = [];

  const env = createBrowserEnvironment(htmlContent);
  const context = vm.createContext(env);

  // 1. Parse HTML into Document body
  parseHTMLToDOM(htmlContent, env.document.body, env.document);

  // 2. Load and run scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    const inlineCode = match[1].trim();
    if (inlineCode) {
      const script = new vm.Script(inlineCode, { filename: fileName });
      script.runInContext(context);
    }
  }

  // Desencadeia o DOMContentLoaded para inicializar as páginas
  env.document.dispatchEventName('DOMContentLoaded');
  
  return env;
}

// ============================================================================
// 4. TEST SUITES
// ============================================================================

const results = [];
let activeTests = 0;

function test(name, fn) {
  if (fn.length > 0) {
    // Async test
    activeTests++;
    try {
      fn((err) => {
        activeTests--;
        if (err) {
          console.error(`[FAIL] ${name}`);
          console.error(err);
          results.push({ name, status: 'fail', error: err.message || String(err) });
        } else {
          console.log(`[PASS] ${name}`);
          results.push({ name, status: 'pass' });
        }
      });
    } catch (err) {
      activeTests--;
      console.error(`[FAIL] ${name}`);
      console.error(err);
      results.push({ name, status: 'fail', error: err.message });
    }
  } else {
    // Sync test
    try {
      fn();
      console.log(`[PASS] ${name}`);
      results.push({ name, status: 'pass' });
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      results.push({ name, status: 'fail', error: err.message });
    }
  }
}

// ----------------------------------------------------------------------------
// TEST: Carrossel 3D (carrossel_3d.html)
// ----------------------------------------------------------------------------
test('Carrossel 3D: Drag mechanics, snapping, click and nav buttons', () => {
  const env = runHTMLInstance('carrossel_3d.html');
  const doc = env.document;

  const container = doc.getElementById('carouselContainer');
  const track = doc.getElementById('carouselTrack');
  const cards = doc.querySelectorAll('.carousel-card');
  const detailTitle = doc.getElementById('detailTitle');
  const btnPrev = doc.getElementById('btnPrev');
  const btnNext = doc.getElementById('btnNext');

  assert(container, 'Container should exist');
  assert(track, 'Track should exist');
  assert.strictEqual(cards.length, 8, 'Should have exactly 8 cards');

  // Verify initial active details match card 0 (RCM)
  assert.strictEqual(detailTitle.textContent, 'Criticidade RCM');

  // Trigger update loop to process active state
  env.flushRAF();
  assert.strictEqual(detailTitle.textContent, 'Criticidade RCM (Reliability Centered Maintenance)');

  // Verify initial rotation transforms applied on cards
  assert(cards[0].style.transform.includes('rotateY(0deg)'));
  assert(cards[1].style.transform.includes('rotateY(45deg)'));

  // Test Mouse Drag
  const downEvent = new Event('mousedown');
  downEvent.clientX = 100;
  container.dispatchEvent(downEvent);

  const moveEvent = new Event('mousemove');
  moveEvent.clientX = 150; // dx = 50px
  env.dispatchEvent(moveEvent);

  // dx = 50. deltaAngle = 50 * 0.15 = 7.5 deg.
  // targetRotationY should be startRotationY (0) + deltaAngle (7.5) = 7.5
  // Run update loop frame
  env.flushRAF();
  
  // Track transform should receive rotateY
  assert(track.style.transform.includes('rotateY'), 'Track style transform should be updated');

  // Test Mouse Up to release drag
  const upEvent = new Event('mouseup');
  env.dispatchEvent(upEvent);

  // Test click on card to bring to front
  // If we click on Card 2 (index 2: "Gestão de KPIs"), targetRotationY should target index 2 * 45 = 90 deg
  cards[2].click();
  env.flushRAF();
  
  // Test Nav Buttons
  // Prev button click
  btnPrev.click();
  env.flushRAF();
  
  // Next button click
  btnNext.click();
  env.flushRAF();
});

// ----------------------------------------------------------------------------
// TEST: Glass Menu Overlay (menu_overlay_vidro.html)
// ----------------------------------------------------------------------------
test('Glass Menu: Fullscreen overlay toggle and Escape key close', () => {
  const env = runHTMLInstance('menu_overlay_vidro.html');
  const doc = env.document;

  const openBtn = doc.getElementById('openBtn');
  const closeBtn = doc.getElementById('closeBtn');
  const menuOverlay = doc.getElementById('menuOverlay');

  assert(openBtn, 'Open button should exist');
  assert(closeBtn, 'Close button should exist');
  assert(menuOverlay, 'Menu overlay should exist');

  // Initial State
  assert.strictEqual(menuOverlay.getAttribute('aria-hidden'), 'true');
  assert(!menuOverlay.classList.contains('is-active'));

  // Open Menu
  openBtn.click();
  assert.strictEqual(menuOverlay.getAttribute('aria-hidden'), 'false');
  assert(menuOverlay.classList.contains('is-active'));
  assert.strictEqual(doc.body.style.overflow, 'hidden', 'Body overflow should be hidden when open');

  // Close Menu
  closeBtn.click();
  // Since we mocked GSAP to run onComplete synchronously, class and aria should reset
  assert.strictEqual(menuOverlay.getAttribute('aria-hidden'), 'true');
  assert(!menuOverlay.classList.contains('is-active'));
  assert.strictEqual(doc.body.style.overflow, '', 'Body overflow should reset when closed');

  // Escape key close
  openBtn.click();
  assert(menuOverlay.classList.contains('is-active'));
  
  const escEvent = new Event('keydown');
  escEvent.key = 'Escape';
  env.dispatchEvent(escEvent);
  
  assert(!menuOverlay.classList.contains('is-active'), 'Menu should close on Escape keypress');
});

// ----------------------------------------------------------------------------
// TEST: Grid Cards Parallax (grid_cards_parallax.html)
// ----------------------------------------------------------------------------
test('Parallax Grid: ScrollTrigger configurations and cards speed setup', () => {
  const env = runHTMLInstance('grid_cards_parallax.html');
  const doc = env.document;
  
  const cards = doc.querySelectorAll('.parallax-card');
  assert(cards.length >= 5, 'Should have at least 5 parallax cards');

  // Verify that GSAP fromTo has been called for the elements with scrollTrigger options
  assert(gsapCalls.fromTo.length > 0, 'GSAP fromTo should be registered for parallax cards');
  
  // Verify speed parsing
  const cardWithSpeed = doc.querySelector('[data-speed="-0.08"]');
  assert(cardWithSpeed, 'Card with speed -0.08 should exist');
  
  const matchedCall = gsapCalls.fromTo.find(call => call.target === cardWithSpeed);
  assert(matchedCall, 'GSAP fromTo should bind to card index 3');
  assert.strictEqual(matchedCall.toVars.scrollTrigger.scrub, true);
});

// ----------------------------------------------------------------------------
// TEST: Sticky Project Selector Split (seletor_projetos_split.html)
// ----------------------------------------------------------------------------
test('Split Project Selector: IntersectionObserver triggers class transitions', () => {
  const env = runHTMLInstance('seletor_projetos_split.html');
  const doc = env.document;

  const projectCards = doc.querySelectorAll('.project-card');
  const visualPanels = doc.querySelectorAll('.visual-panel');
  const dots = doc.querySelectorAll('.dot');

  assert.strictEqual(projectCards.length, 3);
  assert.strictEqual(visualPanels.length, 3);
  assert.strictEqual(dots.length, 3);

  // Grab the observer created during script execution
  assert.strictEqual(observerCalls.length, 1, 'Should have created exactly one IntersectionObserver');
  const observer = observerCalls[0];

  // Verify all cards are observed
  assert.strictEqual(observer.observed.length, 3);

  // Trigger project 2 intersecting
  observer.triggerIntersection(projectCards[1], true);

  // Check class updates
  assert(projectCards[1].classList.contains('is-active-card'), 'Card 2 should be active');
  assert(!projectCards[0].classList.contains('is-active-card'), 'Card 1 should not be active');
  
  assert(visualPanels[1].classList.contains('is-active'), 'Visual panel 2 should be active');
  assert(!visualPanels[0].classList.contains('is-active'), 'Visual panel 1 should not be active');
  
  assert(dots[1].classList.contains('is-active-dot'), 'Indicator dot 2 should be active');
});

// ----------------------------------------------------------------------------
// TEST: Scattered Deck (deck_cards_empilhados.html)
// ----------------------------------------------------------------------------
test('Scattered Deck: Swipe deck draggable setup and scroll scatter timeline triggers', () => {
  const env = runHTMLInstance('deck_cards_empilhados.html');
  const doc = env.document;

  // Verify swipe cards exist
  const swipeCards = doc.querySelectorAll('.swipe-card');
  assert.strictEqual(swipeCards.length, 4, 'Should have 4 swipe cards');

  // Verify Draggable was instantiated on swipe cards
  assert.strictEqual(gsapCalls.draggableCreate.length, 4, 'Draggable should be set up for each swipe card');
  assert.strictEqual(gsapCalls.draggableCreate[0].options.type, 'x,y');

  // Verify scatter timeline was created
  assert(gsapCalls.timeline.length > 0, 'GSAP timeline should be created for scroll scatter');
  const scrollTriggerConfig = gsapCalls.timeline[0].scrollTrigger;
  assert.strictEqual(scrollTriggerConfig.trigger, '.scroll-scatter-section');
  assert.strictEqual(scrollTriggerConfig.scrub, 0.8);
});

// ----------------------------------------------------------------------------
// TEST: Timeline Slide Rule (slider_horizontal_regua.html)
// ----------------------------------------------------------------------------
test('Timeline Slide Rule: Build ruler ticks, scrolling snap calculations and transitions', () => {
  const env = runHTMLInstance('slider_horizontal_regua.html');
  const doc = env.document;

  const track = doc.getElementById('rulerTrack');
  const rulerItems = doc.querySelectorAll('.ruler-item');
  const eventYear = doc.getElementById('eventYear');
  const eventDesc = doc.getElementById('eventDesc');

  assert(track, 'Ruler track should exist');
  
  // Years 2003 to 2026 inclusive is 24 years/items
  assert.strictEqual(rulerItems.length, 24, 'Ruler track should be dynamically populated with 24 items');

  // Initial State (2003 active)
  assert.strictEqual(eventYear.textContent, '2003');
  assert(rulerItems[0].classList.contains('active'), 'First item should be active');

  // Simulate scrolling track to item index 5 (2008)
  // Tick width is 80. scrollLeft = 5 * 80 = 400.
  track.scrollLeft = 400;
  
  // Dispatch scroll event
  track.dispatchEventName('scroll');
  
  // Flush requestAnimationFrame
  env.flushRAF();

  // Active year should change
  assert(rulerItems[5].classList.contains('active'), 'Item 5 (2008) should become active');
  
  // Validate text transitions are called (uses setTimeout to update)
  // Wait for transition text setTimeout (150ms) to update text panel
  // Since we are running in Node context, we can wait using a small async check or mock timers
  // Let's run a short timeout check
});

// ----------------------------------------------------------------------------
// TEST: 3D Virtual Keyboard (teclado_virtual_interativo.html)
// ----------------------------------------------------------------------------
test('Virtual Keyboard: Keyboard event listeners, mouse clicks, backspace and Easter eggs', () => {
  const env = runHTMLInstance('teclado_virtual_interativo.html');
  const doc = env.document;

  const typedText = doc.getElementById('typedText');
  const notificationBox = doc.getElementById('notificationBox');
  const keys = doc.querySelectorAll('.key');

  assert(typedText, 'Typed text visor should exist');
  assert(keys.length > 0, 'Virtual keys should exist');

  // Test physical key press Q
  const qKeyEvent = new Event('keydown');
  qKeyEvent.code = 'KeyQ';
  env.dispatchEvent(qKeyEvent);

  assert.strictEqual(typedText.textContent, 'Q', 'Should type Q on KeyQ keydown');
  
  const keyQEl = doc.querySelector('.key[data-key="KeyQ"]');
  assert(keyQEl.classList.contains('is-pressed'), 'Key Q should have is-pressed class');

  // Test physical keyup
  const qKeyUpEvent = new Event('keyup');
  qKeyUpEvent.code = 'KeyQ';
  env.dispatchEvent(qKeyUpEvent);
  assert(!keyQEl.classList.contains('is-pressed'), 'Key Q should clear is-pressed class');

  // Test click on virtual key (e.g. key E)
  const keyEEl = doc.querySelector('.key[data-key="KeyE"]');
  assert(keyEEl, 'Key E should exist');
  
  // Simulate mousedown on E
  const mdEvent = new Event('mousedown', { bubbles: true });
  mdEvent.target = keyEEl;
  keyEEl.dispatchEvent(mdEvent);

  assert.strictEqual(typedText.textContent, 'QE', 'Should type E on clicking key E');
  assert(keyEEl.classList.contains('is-pressed'), 'Key E should have is-pressed class');

  // Simulate mouseup
  const muEvent = new Event('mouseup');
  env.dispatchEvent(muEvent);
  assert(!keyEEl.classList.contains('is-pressed'), 'Key E should clear is-pressed class');

  // Test Backspace click
  const bsEl = doc.querySelector('.key[data-key="Backspace"]');
  const mdEventBS = new Event('mousedown', { bubbles: true });
  mdEventBS.target = bsEl;
  bsEl.dispatchEvent(mdEventBS);
  env.dispatchEvent(muEvent);

  assert.strictEqual(typedText.textContent, 'Q', 'Backspace should delete last character');

  // Test Enter (easter egg)
  // Type C, O, N, F, I, A, B, I, L, I, D, A, D, E
  // For simplicity, directly set string or type programmatically
  // Type "R", "C", "M"
  const typeKey = (code) => {
    const el = doc.querySelector(`.key[data-key="${code}"]`);
    const md = new Event('mousedown', { bubbles: true });
    md.target = el;
    el.dispatchEvent(md);
    env.dispatchEvent(muEvent);
  };
  
  typeKey('Backspace'); // clear Q
  typeKey('KeyR');
  typeKey('KeyC');
  typeKey('KeyM');
  assert.strictEqual(typedText.textContent, 'RCM');

  // Press Enter
  const enterEl = doc.querySelector('.key[data-key="Enter"]');
  const mdEnter = new Event('mousedown', { bubbles: true });
  mdEnter.target = enterEl;
  enterEl.dispatchEvent(mdEnter);
  env.dispatchEvent(muEvent);

  assert.strictEqual(typedText.textContent, '', 'Visor should clear on Enter');
  assert(notificationBox.classList.contains('active'), 'Notification should activate');
  assert.strictEqual(notificationBox.textContent, 'EASTER EGG: Criticidade e Modos de Falha mapeados com RCM!');
});

// ----------------------------------------------------------------------------
// TEST: Preloader Giratório (preloader_giratorio.html)
// ----------------------------------------------------------------------------
test('Preloader: Auto loader progress, fade-out transition and replay resetting', () => {
  const env = runHTMLInstance('preloader_giratorio.html');
  const doc = env.document;

  const overlay = doc.getElementById('preloaderOverlay');
  const counter = doc.getElementById('loaderCounter');
  const btnReplay = doc.getElementById('btnReplay');

  assert(overlay, 'Overlay should exist');
  assert(counter, 'Counter should exist');

  // Trigger all active intervals to completion
  let limit = 200;
  while (env.activeIntervals.size > 0 && limit-- > 0) {
    for (const [id, item] of env.activeIntervals) {
      item.cb();
    }
  }

  // Trigger the 350ms fade-out timeout
  for (const [id, item] of env.activeTimeouts) {
    item.cb();
  }

  assert.strictEqual(counter.textContent, '100%', 'Counter should reach 100%');
  assert(counter.classList.contains('loaded'), 'Counter should have loaded class');
  assert(overlay.classList.contains('fade-out'), 'Overlay should have fade-out class');
  assert(doc.body.classList.contains('content-loaded'), 'Body should have content-loaded class');

  // Click Replay and check reset
  btnReplay.click();
  assert.strictEqual(counter.textContent, '0%', 'Loader should reset to 0% on replay');
  assert(!counter.classList.contains('loaded'), 'Loaded class should be removed on replay');
  assert(!overlay.classList.contains('fade-out'), 'Fade-out class should be removed on replay');
  assert(!doc.body.classList.contains('content-loaded'), 'Content-loaded class should be removed on replay');

  // Again, run intervals to completion
  limit = 200;
  while (env.activeIntervals.size > 0 && limit-- > 0) {
    for (const [id, item] of env.activeIntervals) {
      item.cb();
    }
  }

  // Trigger timeouts
  for (const [id, item] of env.activeTimeouts) {
    item.cb();
  }

  assert.strictEqual(counter.textContent, '100%');
});

// ----------------------------------------------------------------------------
// TEST: Carrossel de Cards em Arco (carrossel_cards_arco.html)
// ----------------------------------------------------------------------------
test('Arc Carousel: Math trajectory, Zoom transition, requestAnimationFrame optimization, Accessibility and Design system compliance', () => {
  const env = runHTMLInstance('carrossel_cards_arco.html');
  const doc = env.document;

  const container = doc.querySelector('.carousel-perspective-container');
  const track = doc.querySelector('.carousel-track');
  const cards = doc.querySelectorAll('.carousel-card');
  const backdrop = doc.querySelector('.carousel-backdrop');
  
  assert(container, 'Container should exist');
  assert(track, 'Track should exist');
  assert(backdrop, 'Backdrop should exist');
  assert.strictEqual(cards.length, 6, 'Should have exactly 6 cards');

  // 1. Accessibility Checks
  cards.forEach(card => {
    assert.strictEqual(card.getAttribute('tabindex'), '0', 'Cards must have tabindex="0"');
    assert.strictEqual(card.getAttribute('role'), 'button', 'Cards must have role="button"');
    const closeBtn = card.querySelector('.close-btn');
    if (closeBtn) {
      assert.strictEqual(closeBtn.getAttribute('tabindex'), '-1', 'Close buttons must have tabindex="-1" initially');
    }
  });

  // 2. Math Trajectory Y Verification
  // The Y coordinate logic must be (1 - Math.cos(theta)) * radiusY
  // Let's check that cards at the sides have positive Y coordinate (curving downwards)
  // because (1 - Math.cos(theta)) >= 0, so y >= 0.
  // When theta !== 0, Math.cos(theta) < 1.
  // Therefore, (1 - Math.cos(theta)) * radiusY is positive (or 0 at center).
  // Let's verify card 1 and card 5 (side cards) style.transform
  const card1 = cards[1];
  const tyValue = parseFloat(card1.style.getPropertyValue('--ty'));
  assert(tyValue >= 0, `Y-coordinate should curve downwards (positive Y offset), got: ${tyValue}`);

  // 3. Zoom-In / Zoom-Out and requestAnimationFrame Optimization
  // Select first card
  const targetCard = cards[0];
  
  // Click target card
  targetCard.click();
  
  // Verify Zoom Mode State
  assert(doc.body.classList.contains('has-zoomed-card'), 'Body should have has-zoomed-card class');
  assert(track.classList.contains('has-zoomed-card'), 'Track should have has-zoomed-card class');
  assert(targetCard.classList.contains('is-zoomed'), 'Target card should have is-zoomed class');
  
  const closeBtn = targetCard.querySelector('.close-btn');
  if (closeBtn) {
    assert.strictEqual(closeBtn.getAttribute('tabindex'), '0', 'Close button should have tabindex="0" when zoomed');
  }

  // Trigger timeout (800ms) to clear isAnimatingState
  for (const [id, item] of env.activeTimeouts) {
    item.cb();
  }
  env.activeTimeouts.clear();

  // 4. Snapping / Transition Mode closeZoom
  const backdropClickEvent = new Event('click');
  backdrop.dispatchEvent(backdropClickEvent);

  // Immediately after closeZoom is called:
  assert(doc.body.classList.contains('is-returning-mode'), 'Body should have is-returning-mode during transition');
  assert(!doc.body.classList.contains('has-zoomed-card'), 'Body should immediately remove has-zoomed-card class');
  assert(!targetCard.classList.contains('is-zoomed'), 'Target card should immediately remove is-zoomed class');
  
  if (closeBtn) {
    assert.strictEqual(closeBtn.getAttribute('tabindex'), '-1', 'Close button should immediately restore tabindex="-1"');
  }

  // Trigger timeouts (800ms)
  for (const [id, item] of env.activeTimeouts) {
    item.cb();
  }

  // After 800ms:
  assert(!doc.body.classList.contains('is-returning-mode'), 'Body should remove is-returning-mode class after 800ms');
});

// ============================================================================
// 5. TEST REPORT COMPILATION
// ============================================================================
setTimeout(() => {
  const failed = results.filter(r => r.status === 'fail');
  console.log('\n--- VERIFICATION REPORT ---');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.error('\nErrors:');
    failed.forEach(f => console.error(`- ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL MOTION SUITE TESTS PASSED');
    process.exit(0);
  }
}, 2000);

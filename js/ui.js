// ===== UI ROUTER =====
let currentMode = 'encrypt';

const views = {
  home: document.getElementById('home-view'),
  simulator: document.getElementById('simulator-view'),
};

function showHome() {
  views.home.style.display = '';
  views.simulator.classList.remove('active');
  document.querySelector('.back-btn').style.display = 'none';
  document.querySelector('.nav-breadcrumb').innerHTML = '';
  document.querySelector('.logo-sub').textContent = 'CNS Lab Simulator';
}

function showSimulator(id) {
  views.home.style.display = 'none';
  views.simulator.classList.add('active');
  document.querySelector('.back-btn').style.display = 'flex';
  renderSimulator(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== CIPHER CONFIGS =====
const CIPHERS = {
  caesar: {
    title: 'Caesar Cipher',
    icon: '🔤',
    category: 'Mono-alphabetic Substitution',
    color: '#00d4ff',
    desc: 'A substitution cipher where each letter is shifted by a fixed number of positions in the alphabet. One of the simplest and most widely known encryption techniques.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'shift', label: 'Shift Value (0–25)', type: 'number', placeholder: '3', min: 0, max: 25 }
    ],
    example: { text: 'HELLO WORLD', shift: '3' },
    run(vals, mode) {
      if (!vals.text) return { result: '', steps: 'Please enter text.' };
      if (vals.shift === '' || vals.shift === undefined) return { result: '', steps: 'Please enter a shift value.' };
      return mode === 'encrypt' ? Caesar.encrypt(vals.text, vals.shift) : Caesar.decrypt(vals.text, vals.shift);
    }
  },
  multiplicative: {
    title: 'Multiplicative Cipher',
    icon: '✖️',
    category: 'Mono-alphabetic Substitution',
    color: '#7c3aed',
    desc: 'A substitution cipher using multiplication modulo 26. The key must be coprime with 26 (valid keys: 1,3,5,7,9,11,15,17,19,21,23,25).',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'key', label: 'Key (coprime with 26)', type: 'number', placeholder: '7', min: 1, max: 25 }
    ],
    example: { text: 'HELLO WORLD', key: '7' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? Multiplicative.encrypt(vals.text, vals.key) : Multiplicative.decrypt(vals.text, vals.key);
    }
  },
  affine: {
    title: 'Affine Cipher',
    icon: '📐',
    category: 'Mono-alphabetic Substitution',
    color: '#ec4899',
    desc: 'Combines Caesar and Multiplicative ciphers. Uses E(x) = (ax + b) mod 26 for encryption. The key "a" must be coprime with 26.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'a', label: 'Key a (coprime with 26)', type: 'number', placeholder: '7' },
      { id: 'b', label: 'Key b (shift, 0–25)', type: 'number', placeholder: '10' }
    ],
    example: { text: 'HELLO WORLD', a: '7', b: '10' },
    run(vals, mode) {
      if (!vals.text || !vals.a || vals.b === '') return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? Affine.encrypt(vals.text, vals.a, vals.b) : Affine.decrypt(vals.text, vals.a, vals.b);
    }
  },
  vernam: {
    title: 'Vernam Cipher',
    icon: '🔗',
    category: 'Poly-alphabetic Substitution',
    color: '#10b981',
    desc: 'Also called One-Time Pad. Uses XOR of plaintext and key characters. When the key is truly random and as long as message, it provides perfect secrecy.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text (letters only used)...' },
      { id: 'key', label: 'Key (letters)', type: 'text', placeholder: 'SECRETKEY' }
    ],
    example: { text: 'HELLOWORLD', key: 'SECRETKEYP' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? Vernam.encrypt(vals.text, vals.key) : Vernam.decrypt(vals.text, vals.key);
    }
  },
  vigenere: {
    title: 'Vigenère Cipher',
    icon: '🔑',
    category: 'Poly-alphabetic Substitution',
    color: '#f59e0b',
    desc: 'A polyalphabetic cipher using a keyword to determine shifting amounts. Resisted breaking for three centuries—once called "le chiffre indéchiffrable".',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'key', label: 'Keyword', type: 'text', placeholder: 'LEMON' }
    ],
    example: { text: 'ATTACKATDAWN', key: 'LEMON' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? Vigenere.encrypt(vals.text, vals.key) : Vigenere.decrypt(vals.text, vals.key);
    }
  },
  playfair: {
    title: 'Playfair Cipher',
    icon: '🟦',
    category: 'Poly-alphabetic Substitution',
    color: '#06b6d4',
    desc: 'Encrypts bigrams (pairs of letters) using a 5×5 key matrix. I and J share a cell. Three rules: same row, same column, or rectangle.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'key', label: 'Keyword', type: 'text', placeholder: 'MONARCHY' }
    ],
    example: { text: 'INSTRUMENTS', key: 'MONARCHY' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      const res = mode === 'encrypt' ? Playfair.encrypt(vals.text, vals.key) : Playfair.decrypt(vals.text, vals.key);
      return res;
    },
    extra(vals, container) {
      const res = Playfair.processPairs(vals.text || '', vals.key || 'KEY', true);
      renderPlayfairGrid(res.matrix, container);
    }
  },
  hill: {
    title: 'Hill Cipher',
    icon: '🔢',
    category: 'Poly-alphabetic Substitution',
    color: '#8b5cf6',
    desc: 'A polygraphic cipher based on linear algebra. Uses a 2×2 matrix. The key matrix must be invertible modulo 26.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext (even length)', type: 'textarea', placeholder: 'HELP (even length)' },
      { id: 'key', label: 'Key Matrix (4 numbers, row-by-row)', type: 'text', placeholder: '3 3 2 5' }
    ],
    example: { text: 'HELP', key: '3 3 2 5' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? Hill.encrypt(vals.text, vals.key) : Hill.decrypt(vals.text, vals.key);
    }
  },
  keyless: {
    title: 'Keyless Transposition',
    icon: '↔️',
    category: 'Transposition',
    color: '#ef4444',
    desc: 'Rearranges characters by writing plaintext into rows of fixed width, then reading column by column. No keyword required.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'cols', label: 'Number of Columns', type: 'number', placeholder: '4', min: 2, max: 20 }
    ],
    example: { text: 'HELLOWORLD', cols: '4' },
    run(vals, mode) {
      if (!vals.text || !vals.cols) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? KeylessTransposition.encrypt(vals.text, vals.cols) : KeylessTransposition.decrypt(vals.text, vals.cols);
    }
  },
  keyed: {
    title: 'Keyed Transposition',
    icon: '🗝️',
    category: 'Transposition',
    color: '#f97316',
    desc: 'Uses a keyword to determine the order in which columns are read. The alphabetical order of key letters determines the column reading sequence.',
    fields: [
      { id: 'text', label: 'Plaintext / Ciphertext', type: 'textarea', placeholder: 'Enter text...' },
      { id: 'key', label: 'Keyword', type: 'text', placeholder: 'CRYPTO' }
    ],
    example: { text: 'ATTACKATDAWN', key: 'CRYPTO' },
    run(vals, mode) {
      if (!vals.text || !vals.key) return { result: '', steps: 'Please fill in all fields.' };
      return mode === 'encrypt' ? KeyedTransposition.encrypt(vals.text, vals.key) : KeyedTransposition.decrypt(vals.text, vals.key);
    }
  },
  rsa: {
    title: 'RSA Cryptosystem',
    icon: '🔐',
    category: 'Asymmetric Encryption',
    color: '#00d4ff',
    desc: 'Rivest–Shamir–Adleman: the most widely used asymmetric encryption algorithm. Security based on difficulty of factoring large prime products.',
    isAsymmetric: true
  },
  dh: {
    title: 'Diffie-Hellman Key Exchange',
    icon: '🤝',
    category: 'Key Exchange Protocol',
    color: '#7c3aed',
    desc: 'First public-key protocol (1976). Allows two parties to establish a shared secret over an insecure channel without prior communication.',
    isDH: true
  }
};

// ===== RENDER SIMULATOR =====
function renderSimulator(id) {
  const cfg = CIPHERS[id];
  const view = document.getElementById('simulator-view');

  document.querySelector('.nav-breadcrumb').innerHTML =
    `<span>Home</span> <span>›</span> <span class="active">${cfg.title}</span>`;

  if (cfg.isAsymmetric) { renderRSA(view, cfg); return; }
  if (cfg.isDH) { renderDH(view, cfg); return; }

  view.innerHTML = `
    <div class="sim-header fade-in">
      <div class="sim-badge" style="background:${cfg.color}18;color:${cfg.color};border:1px solid ${cfg.color}40">
        ${cfg.icon} ${cfg.category}
      </div>
      <h2 class="sim-title">${cfg.title}</h2>
      <p class="sim-desc">${cfg.desc}</p>
    </div>

    <div class="sim-body fade-in">
      <!-- Mode tabs -->
      <div class="sim-card">
        <div class="sim-card-title">⚙️ Mode</div>
        <div class="mode-tabs">
          <button class="mode-tab active" id="tab-enc" onclick="setMode('encrypt','${id}')">🔒 Encrypt</button>
          <button class="mode-tab" id="tab-dec" onclick="setMode('decrypt','${id}')">🔓 Decrypt</button>
        </div>
      </div>

      <!-- Inputs -->
      <div class="sim-card" id="inputs-card">
        <div class="sim-card-title">📝 Input Parameters</div>
        <div style="display:flex;flex-direction:column;gap:14px;" id="fields-container">
        </div>
      </div>

      ${id === 'playfair' ? `
      <div class="sim-card" id="pf-grid-card">
        <div class="sim-card-title">🟦 Playfair Matrix (5×5)</div>
        <div id="pf-grid-display">Enter a keyword to see the matrix</div>
      </div>` : ''}

      ${id === 'hill' ? `
      <div class="sim-card" id="hill-matrix-card">
        <div class="sim-card-title">🔢 Key Matrix</div>
        <div id="hill-matrix-display" style="color:var(--text-muted);font-size:0.85rem;">Enter 4 numbers to see matrix</div>
      </div>` : ''}

      <!-- Buttons -->
      <div class="btn-row">
        <button class="run-btn" onclick="runCipher('${id}')">▶ Run ${cfg.title}</button>
        <button class="clear-btn" onclick="clearAll('${id}')">✕ Clear</button>
        ${cfg.example ? `<button class="clear-btn" style="border-color:var(--accent-cyan);color:var(--accent-cyan)" onclick="loadExample('${id}')">💡 Load Example</button>` : ''}
      </div>

      <div class="error-msg" id="err-box"></div>

      <!-- Output -->
      <div class="sim-card">
        <div class="output-label">
          <span>📤 Output</span>
          <button class="copy-btn" onclick="copyOutput()">📋 Copy</button>
        </div>
        <div class="output-box" id="output-box">—</div>
      </div>

      <!-- Steps -->
      <div class="sim-card">
        <div class="sim-card-title">🧮 Step-by-Step Trace</div>
        <div class="steps-box" id="steps-box">Run the cipher to see detailed steps...</div>
      </div>

      <!-- Info -->
      <div class="info-box" id="info-box">
        ${getInfoText(id)}
      </div>
    </div>
  `;

  renderFields(id, cfg.fields);
  if (id === 'playfair') setupPlayfairLive();
  if (id === 'hill') setupHillLive();
}

function renderFields(id, fields) {
  const container = document.getElementById('fields-container');
  container.innerHTML = fields.map(f => {
    if (f.type === 'textarea') {
      return `<div class="input-group">
        <label>${f.label}</label>
        <textarea class="sim-textarea" id="f_${f.id}" placeholder="${f.placeholder || ''}" oninput="onFieldChange('${id}')"></textarea>
      </div>`;
    }
    return `<div class="input-group">
      <label>${f.label}</label>
      <input class="sim-input" type="${f.type}" id="f_${f.id}" placeholder="${f.placeholder || ''}" 
        ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''}
        oninput="onFieldChange('${id}')">
    </div>`;
  }).join('');
}

function onFieldChange(id) {
  if (id === 'playfair') {
    const keyEl = document.getElementById('f_key');
    if (keyEl && keyEl.value) {
      const matrix = Playfair.buildMatrix(keyEl.value);
      renderPlayfairGrid(matrix, document.getElementById('pf-grid-display'));
    }
  }
  if (id === 'hill') {
    const keyEl = document.getElementById('f_key');
    if (keyEl) updateHillMatrix(keyEl.value);
  }
}

function setupPlayfairLive() {
  setTimeout(() => {
    const keyEl = document.getElementById('f_key');
    if (keyEl) {
      keyEl.addEventListener('input', () => {
        if (keyEl.value) {
          const matrix = Playfair.buildMatrix(keyEl.value);
          renderPlayfairGrid(matrix, document.getElementById('pf-grid-display'));
        }
      });
    }
  }, 100);
}

function setupHillLive() {
  setTimeout(() => {
    const keyEl = document.getElementById('f_key');
    if (keyEl) keyEl.addEventListener('input', () => updateHillMatrix(keyEl.value));
  }, 100);
}

function updateHillMatrix(val) {
  const nums = val.match(/\d+/g);
  const el = document.getElementById('hill-matrix-display');
  if (!el) return;
  if (!nums || nums.length < 4) { el.innerHTML = '<span style="color:var(--text-muted)">Enter 4 numbers...</span>'; return; }
  const [a,b,c,d] = nums.map(Number);
  el.innerHTML = `<div class="matrix-display" style="grid-template-columns:repeat(2,42px)">
    <div class="matrix-cell">${a}</div><div class="matrix-cell">${b}</div>
    <div class="matrix-cell">${c}</div><div class="matrix-cell">${d}</div>
  </div>`;
}

function renderPlayfairGrid(matrix, container) {
  if (!container) return;
  container.innerHTML = `<div class="playfair-grid">
    ${matrix.map(c => `<div class="playfair-cell">${c}</div>`).join('')}
  </div>`;
}

function setMode(mode, id) {
  currentMode = mode;
  document.getElementById('tab-enc').classList.toggle('active', mode === 'encrypt');
  document.getElementById('tab-dec').classList.toggle('active', mode === 'decrypt');
}

function getFieldVals(fields) {
  const vals = {};
  fields.forEach(f => {
    const el = document.getElementById(`f_${f.id}`);
    vals[f.id] = el ? el.value : '';
  });
  return vals;
}

function runCipher(id) {
  const cfg = CIPHERS[id];
  const vals = getFieldVals(cfg.fields);
  const errBox = document.getElementById('err-box');
  errBox.classList.remove('visible');

  try {
    const res = cfg.run(vals, currentMode);
    if (res.error || (res.result === '' && res.steps && res.steps.includes('Error'))) {
      errBox.innerHTML = res.steps || res.error || 'An error occurred.';
      errBox.classList.add('visible');
      return;
    }
    document.getElementById('output-box').textContent = res.result || '(empty)';
    document.getElementById('steps-box').innerHTML = res.steps || '';
  } catch(e) {
    errBox.textContent = 'Error: ' + e.message;
    errBox.classList.add('visible');
  }
}

function clearAll(id) {
  const cfg = CIPHERS[id];
  cfg.fields.forEach(f => {
    const el = document.getElementById(`f_${f.id}`);
    if (el) el.value = '';
  });
  document.getElementById('output-box').textContent = '—';
  document.getElementById('steps-box').textContent = 'Run the cipher to see detailed steps...';
  document.getElementById('err-box').classList.remove('visible');
}

function loadExample(id) {
  const cfg = CIPHERS[id];
  if (!cfg.example) return;
  Object.entries(cfg.example).forEach(([key, val]) => {
    const el = document.getElementById(`f_${key}`);
    if (el) { el.value = val; onFieldChange(id); }
  });
  // Auto-run
  runCipher(id);
}

function copyOutput() {
  const text = document.getElementById('output-box').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy', 1500);
  });
}

// ===== RSA RENDERER =====
function renderRSA(view, cfg) {
  view.innerHTML = `
    <div class="sim-header fade-in">
      <div class="sim-badge" style="background:#00d4ff18;color:#00d4ff;border:1px solid #00d4ff40">
        🔐 Asymmetric Encryption
      </div>
      <h2 class="sim-title">RSA Cryptosystem</h2>
      <p class="sim-desc">${cfg.desc}</p>
    </div>
    <div class="sim-body fade-in">
      <!-- Key Generation -->
      <div class="sim-card">
        <div class="sim-card-title">🔑 Key Generation</div>
        <div class="input-row">
          <div class="input-group"><label>Prime p</label><input class="sim-input" id="rsa_p" type="number" placeholder="61" min="2"></div>
          <div class="input-group"><label>Prime q</label><input class="sim-input" id="rsa_q" type="number" placeholder="53" min="2"></div>
        </div>
        <div class="input-group" style="margin-top:12px">
          <label>Public Exponent e (coprime with φ(n))</label>
          <input class="sim-input" id="rsa_e" type="number" placeholder="17" min="2">
        </div>
        <div style="margin-top:14px">
          <button class="run-btn" onclick="rsaGenerate()">🔑 Generate Keys</button>
        </div>
        <div class="error-msg" id="rsa-err" style="margin-top:12px"></div>
        <div id="rsa-keys" style="display:none;margin-top:16px">
          <div class="kv-grid" id="rsa-kv"></div>
        </div>
      </div>

      <!-- Encrypt -->
      <div class="sim-card">
        <div class="sim-card-title">🔒 Encrypt Message</div>
        <div class="input-row">
          <div class="input-group"><label>Message M (integer)</label><input class="sim-input" id="rsa_m" type="number" placeholder="42"></div>
          <div class="input-group"><label>Public Key e</label><input class="sim-input" id="rsa_enc_e" type="number" placeholder="17"></div>
        </div>
        <div class="input-group" style="margin-top:12px">
          <label>Modulus n</label>
          <input class="sim-input" id="rsa_enc_n" type="number" placeholder="3233">
        </div>
        <div style="margin-top:14px">
          <button class="run-btn" onclick="rsaEncrypt()">🔒 Encrypt</button>
        </div>
        <div class="output-label" style="margin-top:14px">
          <span>Ciphertext C</span>
        </div>
        <div class="output-box" id="rsa-enc-out">—</div>
        <div class="steps-box" id="rsa-enc-steps" style="margin-top:10px">Steps will appear here...</div>
      </div>

      <!-- Decrypt -->
      <div class="sim-card">
        <div class="sim-card-title">🔓 Decrypt Message</div>
        <div class="input-row">
          <div class="input-group"><label>Ciphertext C</label><input class="sim-input" id="rsa_c" type="number" placeholder="Enter C..."></div>
          <div class="input-group"><label>Private Key d</label><input class="sim-input" id="rsa_dec_d" type="number" placeholder="2753"></div>
        </div>
        <div class="input-group" style="margin-top:12px">
          <label>Modulus n</label>
          <input class="sim-input" id="rsa_dec_n" type="number" placeholder="3233">
        </div>
        <div style="margin-top:14px">
          <button class="run-btn" onclick="rsaDecrypt()">🔓 Decrypt</button>
        </div>
        <div class="output-label" style="margin-top:14px">
          <span>Plaintext M</span>
        </div>
        <div class="output-box" id="rsa-dec-out">—</div>
        <div class="steps-box" id="rsa-dec-steps" style="margin-top:10px">Steps will appear here...</div>
      </div>

      <div class="info-box">
        <strong>RSA Algorithm:</strong> Choose two primes p, q. Compute n = p×q, φ(n) = (p-1)(q-1). 
        Pick e coprime with φ(n). Find d = e⁻¹ mod φ(n). Public key: (e,n). Private key: (d,n).
        Encrypt: C = Mᵉ mod n. Decrypt: M = Cᵈ mod n.
      </div>
    </div>`;
}

function rsaGenerate() {
  const p = document.getElementById('rsa_p').value;
  const q = document.getElementById('rsa_q').value;
  const e = document.getElementById('rsa_e').value;
  const errEl = document.getElementById('rsa-err');
  const res = RSA.generate(p, q, e);
  if (res.error) {
    errEl.textContent = res.error;
    errEl.classList.add('visible');
    document.getElementById('rsa-keys').style.display = 'none';
    return;
  }
  errEl.classList.remove('visible');
  document.getElementById('rsa-keys').style.display = 'block';
  document.getElementById('rsa-kv').innerHTML = [
    ['n = p × q', res.n],
    ['φ(n) = (p-1)(q-1)', res.phi],
    ['Public Key e', res.e],
    ['Private Key d', res.d],
    ['Public Key Pair', res.publicKey],
    ['Private Key Pair', res.privateKey],
  ].map(([l,v]) => `<div class="kv-item"><div class="kv-label">${l}</div><div class="kv-value">${v}</div></div>`).join('');
  // Autofill encrypt/decrypt fields
  document.getElementById('rsa_enc_e').value = res.e;
  document.getElementById('rsa_enc_n').value = res.n;
  document.getElementById('rsa_dec_d').value = res.d;
  document.getElementById('rsa_dec_n').value = res.n;
}

function rsaEncrypt() {
  const m = document.getElementById('rsa_m').value;
  const e = document.getElementById('rsa_enc_e').value;
  const n = document.getElementById('rsa_enc_n').value;
  const res = RSA.encrypt(m, parseInt(e), parseInt(n));
  if (res.error) { document.getElementById('rsa-enc-out').textContent = 'Error: ' + res.error; return; }
  document.getElementById('rsa-enc-out').textContent = res.result;
  document.getElementById('rsa-enc-steps').textContent = res.steps;
  // Autofill decrypt
  document.getElementById('rsa_c').value = res.result;
}

function rsaDecrypt() {
  const c = document.getElementById('rsa_c').value;
  const d = document.getElementById('rsa_dec_d').value;
  const n = document.getElementById('rsa_dec_n').value;
  const res = RSA.decrypt(c, parseInt(d), parseInt(n));
  if (res.error) { document.getElementById('rsa-dec-out').textContent = 'Error: ' + res.error; return; }
  document.getElementById('rsa-dec-out').textContent = res.result;
  document.getElementById('rsa-dec-steps').textContent = res.steps;
}

// ===== DIFFIE-HELLMAN RENDERER =====
function renderDH(view, cfg) {
  view.innerHTML = `
    <div class="sim-header fade-in">
      <div class="sim-badge" style="background:#7c3aed18;color:#a78bfa;border:1px solid #7c3aed40">
        🤝 Key Exchange Protocol
      </div>
      <h2 class="sim-title">Diffie-Hellman Key Exchange</h2>
      <p class="sim-desc">${cfg.desc}</p>
    </div>
    <div class="sim-body fade-in">
      <div class="sim-card">
        <div class="sim-card-title">🌐 Public Parameters</div>
        <div class="input-row">
          <div class="input-group"><label>Prime Modulus p</label><input class="sim-input" id="dh_p" type="number" placeholder="23" min="2"></div>
          <div class="input-group"><label>Generator g (primitive root mod p)</label><input class="sim-input" id="dh_g" type="number" placeholder="5" min="2"></div>
        </div>
      </div>

      <div class="input-row">
        <div class="sim-card">
          <div class="sim-card-title" style="color:#00d4ff">👤 Alice</div>
          <div class="input-group">
            <label>Private Key a (secret)</label>
            <input class="sim-input" id="dh_a" type="number" placeholder="6" min="1">
          </div>
        </div>
        <div class="sim-card">
          <div class="sim-card-title" style="color:#a78bfa">👤 Bob</div>
          <div class="input-group">
            <label>Private Key b (secret)</label>
            <input class="sim-input" id="dh_b" type="number" placeholder="15" min="1">
          </div>
        </div>
      </div>

      <div class="btn-row">
        <button class="run-btn" onclick="dhRun()">🤝 Exchange Keys</button>
        <button class="clear-btn" onclick="dhClear()">✕ Clear</button>
        <button class="clear-btn" style="border-color:var(--accent-cyan);color:var(--accent-cyan)" onclick="dhExample()">💡 Load Example</button>
      </div>

      <div class="error-msg" id="dh-err"></div>

      <div id="dh-result" style="display:none">
        <div class="sim-card">
          <div class="sim-card-title">📊 Exchange Results</div>
          <div class="kv-grid" id="dh-kv"></div>
        </div>
        <div class="sim-card">
          <div class="sim-card-title">🧮 Step-by-Step Trace</div>
          <div class="steps-box" id="dh-steps"></div>
        </div>
      </div>

      <div class="info-box">
        <strong>DH Key Exchange:</strong> Alice and Bob agree on public p, g. Alice picks secret a, computes A = g^a mod p.
        Bob picks secret b, computes B = g^b mod p. They exchange A and B publicly.
        Alice computes s = B^a mod p. Bob computes s = A^b mod p. Both get the <strong>same shared secret</strong>!
        An eavesdropper cannot compute s without solving the discrete logarithm problem.
      </div>
    </div>`;
}

function dhRun() {
  const p = document.getElementById('dh_p').value;
  const g = document.getElementById('dh_g').value;
  const a = document.getElementById('dh_a').value;
  const b = document.getElementById('dh_b').value;
  const errEl = document.getElementById('dh-err');
  if (!p || !g || !a || !b) {
    errEl.textContent = 'Please fill in all four fields (p, g, a, b).';
    errEl.classList.add('visible');
    return;
  }
  const res = DiffieHellman.compute(p, g, a, b);
  if (res.error) {
    errEl.textContent = res.error;
    errEl.classList.add('visible');
    document.getElementById('dh-result').style.display = 'none';
    return;
  }
  errEl.classList.remove('visible');
  document.getElementById('dh-result').style.display = 'block';
  document.getElementById('dh-kv').innerHTML = [
    ['Prime p', res.p], ['Generator g', res.g],
    ['Alice private a', res.a], ['Bob private b', res.b],
    ["Alice's public A = g^a mod p", res.A], ["Bob's public B = g^b mod p", res.B],
    ['🔑 Shared Secret Key', res.sharedKey],
  ].map(([l,v]) => `<div class="kv-item"><div class="kv-label">${l}</div><div class="kv-value">${v}</div></div>`).join('');
  document.getElementById('dh-steps').textContent = res.steps;
}

function dhClear() {
  ['dh_p','dh_g','dh_a','dh_b'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  document.getElementById('dh-result').style.display = 'none';
  document.getElementById('dh-err').classList.remove('visible');
}

function dhExample() {
  document.getElementById('dh_p').value = '23';
  document.getElementById('dh_g').value = '5';
  document.getElementById('dh_a').value = '6';
  document.getElementById('dh_b').value = '15';
  dhRun();
}

// ===== INFO TEXT =====
function getInfoText(id) {
  const texts = {
    caesar: '<strong>Formula:</strong> E(x) = (x + k) mod 26 &nbsp;|&nbsp; D(x) = (x − k) mod 26. Named after Julius Caesar who used shift=3.',
    multiplicative: '<strong>Formula:</strong> E(x) = (k·x) mod 26 &nbsp;|&nbsp; D(x) = (k⁻¹·x) mod 26. Valid keys (coprime with 26): 1,3,5,7,9,11,15,17,19,21,23,25.',
    affine: '<strong>Formula:</strong> E(x) = (ax + b) mod 26 &nbsp;|&nbsp; D(y) = a⁻¹(y − b) mod 26. Generalizes both Caesar and Multiplicative ciphers.',
    vernam: '<strong>XOR Property:</strong> Encrypting and decrypting use the same operation. If key length = message length and key is truly random: perfect secrecy (One-Time Pad).',
    vigenere: '<strong>Key repetition:</strong> The keyword repeats to match plaintext length. Each letter shifts by the corresponding key letter value (A=0, B=1, ...).',
    playfair: '<strong>Rules:</strong> (1) Same row: shift right. (2) Same column: shift down. (3) Rectangle: swap columns. I and J share the same cell. Pairs never use same letter.',
    hill: '<strong>Formula:</strong> C = K·P mod 26 (as column vector). For 2×2: encrypt pairs of letters. Key must be invertible mod 26 (det must be coprime with 26).',
    keyless: '<strong>Method:</strong> Write plaintext left-to-right in rows of width N. Read top-to-bottom by columns. Pad with X if needed.',
    keyed: '<strong>Method:</strong> Write plaintext in rows under key letters. Read columns in alphabetical order of key letters. More secure than keyless.',
  };
  return texts[id] || '';
}

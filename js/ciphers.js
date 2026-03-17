// ===== UTILITY FUNCTIONS =====
const mod = (n, m) => ((n % m) + m) % m;
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const modInverse = (a, m) => {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return -1;
};

const isPrime = n => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
};

const modPow = (base, exp, mod) => {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
};

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const clean = t => t.toUpperCase().replace(/[^A-Z]/g, '');

// ===== CAESAR CIPHER =====
const Caesar = {
  encrypt(text, shift) {
    shift = mod(parseInt(shift), 26);
    let steps = `Key (shift) = ${shift}\n\n`;
    let result = '';
    for (const c of text.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        const orig = c.charCodeAt(0) - 65;
        const enc = mod(orig + shift, 26);
        steps += `${c}(${orig}) + ${shift} = ${enc} → <span class="result">${alpha[enc]}</span>\n`;
        result += alpha[enc];
      } else {
        result += c;
        if (c !== ' ') steps += `${c} → <span class="result">${c}</span>\n`;
      }
    }
    return { result, steps };
  },
  decrypt(text, shift) {
    return Caesar.encrypt(text, -shift);
  }
};

// ===== MULTIPLICATIVE CIPHER =====
const Multiplicative = {
  encrypt(text, key) {
    key = parseInt(key);
    if (gcd(key, 26) !== 1) return { result: '', steps: `<span style="color:var(--accent-red)">Error: key ${key} is not coprime with 26. GCD = ${gcd(key,26)}</span>` };
    let steps = `Key (a) = ${key}, must be coprime with 26\n\n`;
    let result = '';
    for (const c of text.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        const orig = c.charCodeAt(0) - 65;
        const enc = mod(orig * key, 26);
        steps += `${c}(${orig}) × ${key} mod 26 = ${enc} → <span class="result">${alpha[enc]}</span>\n`;
        result += alpha[enc];
      } else { result += c; }
    }
    return { result, steps };
  },
  decrypt(text, key) {
    key = parseInt(key);
    const inv = modInverse(key, 26);
    if (inv === -1) return { result: '', steps: `<span style="color:var(--accent-red)">No inverse for key ${key}</span>` };
    let steps = `Key (a) = ${key}, Inverse = ${inv}\n\n`;
    let result = '';
    for (const c of text.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        const orig = c.charCodeAt(0) - 65;
        const dec = mod(orig * inv, 26);
        steps += `${c}(${orig}) × ${inv} mod 26 = ${dec} → <span class="result">${alpha[dec]}</span>\n`;
        result += alpha[dec];
      } else { result += c; }
    }
    return { result, steps };
  }
};

// ===== AFFINE CIPHER =====
const Affine = {
  encrypt(text, a, b) {
    a = parseInt(a); b = parseInt(b);
    if (gcd(a, 26) !== 1) return { result: '', steps: `<span style="color:var(--accent-red)">Error: 'a'=${a} must be coprime with 26</span>` };
    let steps = `Keys: a=${a}, b=${b}\nFormula: E(x) = (${a}·x + ${b}) mod 26\n\n`;
    let result = '';
    for (const c of text.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        const x = c.charCodeAt(0) - 65;
        const enc = mod(a * x + b, 26);
        steps += `${c}(${x}): (${a}×${x}+${b}) mod 26 = ${enc} → <span class="result">${alpha[enc]}</span>\n`;
        result += alpha[enc];
      } else { result += c; }
    }
    return { result, steps };
  },
  decrypt(text, a, b) {
    a = parseInt(a); b = parseInt(b);
    const inv = modInverse(a, 26);
    if (inv === -1) return { result: '', steps: `<span style="color:var(--accent-red)">No inverse for a=${a}</span>` };
    let steps = `Keys: a=${a}, b=${b}, a⁻¹=${inv}\nFormula: D(y) = ${inv}·(y - ${b}) mod 26\n\n`;
    let result = '';
    for (const c of text.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        const y = c.charCodeAt(0) - 65;
        const dec = mod(inv * (y - b), 26);
        steps += `${c}(${y}): ${inv}×(${y}-${b}) mod 26 = ${dec} → <span class="result">${alpha[dec]}</span>\n`;
        result += alpha[dec];
      } else { result += c; }
    }
    return { result, steps };
  }
};

// ===== VERNAM CIPHER =====
const Vernam = {
  encrypt(text, key) {
    const t = text.toUpperCase().replace(/[^A-Z]/g, '');
    const k = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!k) return { result: '', steps: 'Key cannot be empty.' };
    let steps = `Text:  ${t}\nKey:   ${k.substring(0,t.length).padEnd(t.length,'?')}\n\n`;
    let result = '';
    for (let i = 0; i < t.length; i++) {
      const ti = t.charCodeAt(i) - 65;
      const ki = k.charCodeAt(i % k.length) - 65;
      const enc = mod(ti ^ ki, 26);
      steps += `${t[i]}(${ti}) XOR ${k[i%k.length]}(${ki}) = ${enc} → <span class="result">${alpha[enc]}</span>\n`;
      result += alpha[enc];
    }
    return { result, steps };
  },
  decrypt(text, key) {
    return Vernam.encrypt(text, key); // XOR is self-inverse
  }
};

// ===== VIGENÈRE CIPHER =====
const Vigenere = {
  encrypt(text, key) {
    const t = text.toUpperCase();
    const k = clean(key);
    if (!k) return { result: '', steps: 'Key cannot be empty.' };
    let steps = `Key: ${k}\n\n`;
    let result = '';
    let ki = 0;
    for (const c of t) {
      if (/[A-Z]/.test(c)) {
        const shift = k.charCodeAt(ki % k.length) - 65;
        const enc = mod(c.charCodeAt(0) - 65 + shift, 26);
        steps += `${c}+${k[ki%k.length]}(${shift}) = <span class="result">${alpha[enc]}</span>\n`;
        result += alpha[enc];
        ki++;
      } else { result += c; }
    }
    return { result, steps };
  },
  decrypt(text, key) {
    const t = text.toUpperCase();
    const k = clean(key);
    if (!k) return { result: '', steps: 'Key cannot be empty.' };
    let steps = `Key: ${k}\n\n`;
    let result = '';
    let ki = 0;
    for (const c of t) {
      if (/[A-Z]/.test(c)) {
        const shift = k.charCodeAt(ki % k.length) - 65;
        const dec = mod(c.charCodeAt(0) - 65 - shift, 26);
        steps += `${c}-${k[ki%k.length]}(${shift}) = <span class="result">${alpha[dec]}</span>\n`;
        result += alpha[dec];
        ki++;
      } else { result += c; }
    }
    return { result, steps };
  }
};

// ===== PLAYFAIR CIPHER =====
const Playfair = {
  buildMatrix(key) {
    const k = clean(key).replace(/J/g, 'I');
    const used = new Set();
    const matrix = [];
    for (const c of k + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
      if (!used.has(c)) { used.add(c); matrix.push(c); }
    }
    return matrix; // 25-char array, row-major 5x5
  },
  findPos(matrix, c) {
    const i = matrix.indexOf(c === 'J' ? 'I' : c);
    return [Math.floor(i / 5), i % 5];
  },
  processPairs(text, key, encrypt) {
    const matrix = this.buildMatrix(key);
    const t = clean(text).replace(/J/g, 'I');
    const pairs = [];
    let i = 0;
    while (i < t.length) {
      const a = t[i];
      let b = t[i + 1] || 'X';
      if (a === b) b = 'X';
      else i++;
      pairs.push([a, b]);
      i++;
    }
    const d = encrypt ? 1 : -1;
    let result = '';
    let steps = `Key matrix built.\nPairs: ${pairs.map(p=>p.join('')).join(' ')}\n\n`;
    for (const [a, b] of pairs) {
      const [ra, ca] = this.findPos(matrix, a);
      const [rb, cb] = this.findPos(matrix, b);
      let ea, eb, rule;
      if (ra === rb) {
        ea = matrix[ra * 5 + mod(ca + d, 5)];
        eb = matrix[rb * 5 + mod(cb + d, 5)];
        rule = 'Same row';
      } else if (ca === cb) {
        ea = matrix[mod(ra + d, 5) * 5 + ca];
        eb = matrix[mod(rb + d, 5) * 5 + cb];
        rule = 'Same col';
      } else {
        ea = matrix[ra * 5 + cb];
        eb = matrix[rb * 5 + ca];
        rule = 'Rectangle';
      }
      steps += `${a}${b} [${rule}] → <span class="result">${ea}${eb}</span>\n`;
      result += ea + eb;
    }
    return { result, steps, matrix };
  },
  encrypt(text, key) { return this.processPairs(text, key, true); },
  decrypt(text, key) { return this.processPairs(text, key, false); }
};

// ===== HILL CIPHER =====
const Hill = {
  matMul(A, B, mod26 = true) {
    const n = A.length;
    return A.map((row, i) =>
      B[0].map((_, j) =>
        row.reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0) % (mod26 ? 26 : Infinity)
      )
    );
  },
  det2(m) { return mod(m[0][0]*m[1][1] - m[0][1]*m[1][0], 26); },
  inverse2x2(m) {
    const d = this.det2(m);
    const inv = modInverse(d, 26);
    if (inv === -1) return null;
    return [
      [mod(inv * m[1][1], 26), mod(-inv * m[0][1], 26)],
      [mod(-inv * m[1][0], 26), mod(inv * m[0][0], 26)]
    ];
  },
  process(text, keyStr, decrypt) {
    const nums = keyStr.match(/\d+/g);
    if (!nums || nums.length < 4) return { result: '', steps: 'Enter 4 numbers for 2×2 key matrix (row-major).' };
    const key = [[parseInt(nums[0]), parseInt(nums[1])], [parseInt(nums[2]), parseInt(nums[3])]];
    const mat = decrypt ? this.inverse2x2(key) : key;
    if (!mat) return { result: '', steps: `<span style="color:var(--accent-red)">Key matrix is not invertible mod 26 (det has no inverse).</span>` };
    const t = clean(text);
    if (t.length % 2 !== 0) return { result: '', steps: 'Text length must be even for 2×2 Hill cipher (pad with X).' };
    let result = '';
    let steps = `Key matrix: [${key[0]}] [${key[1]}]\n`;
    if (decrypt) steps += `Inverse matrix: [${mat[0]}] [${mat[1]}]\n`;
    steps += '\n';
    for (let i = 0; i < t.length; i += 2) {
      const v = [[t.charCodeAt(i)-65], [t.charCodeAt(i+1)-65]];
      const out = this.matMul(mat, v);
      const c1 = mod(out[0][0], 26), c2 = mod(out[1][0], 26);
      steps += `[${t[i]},${t[i+1]}] × matrix = [${c1},${c2}] → <span class="result">${alpha[c1]}${alpha[c2]}</span>\n`;
      result += alpha[c1] + alpha[c2];
    }
    return { result, steps, keyMatrix: key, invMatrix: mat };
  },
  encrypt(text, key) { return this.process(text, key, false); },
  decrypt(text, key) { return this.process(text, key, true); }
};

// ===== KEYLESS TRANSPOSITION =====
const KeylessTransposition = {
  encrypt(text, cols) {
    cols = parseInt(cols);
    const t = text.replace(/\s/g, '').toUpperCase();
    const rows = Math.ceil(t.length / cols);
    const padded = t.padEnd(rows * cols, 'X');
    let steps = `Columns: ${cols}, Rows: ${rows}\n\nGrid:\n`;
    let grid = [];
    for (let r = 0; r < rows; r++) {
      const row = padded.slice(r*cols, (r+1)*cols).split('');
      grid.push(row);
      steps += row.join(' ') + '\n';
    }
    let result = '';
    steps += '\nRead by columns:\n';
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        result += grid[r][c];
      }
      steps += `Col ${c+1}: <span class="result">${grid.map(r=>r[c]).join('')}</span>\n`;
    }
    return { result, steps };
  },
  decrypt(text, cols) {
    cols = parseInt(cols);
    const t = text.replace(/\s/g, '').toUpperCase();
    const rows = Math.ceil(t.length / cols);
    let grid = Array.from({length:rows}, ()=>Array(cols).fill(''));
    let idx = 0;
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++)
        grid[r][c] = t[idx++] || '';
    let result = '';
    let steps = `Columns: ${cols}\nFilling grid by columns, reading by rows:\n\n`;
    for (let r = 0; r < rows; r++) {
      steps += grid[r].join(' ') + '\n';
      result += grid[r].join('');
    }
    result = result.replace(/X+$/, '');
    steps += `\n<span class="result">Result: ${result}</span>`;
    return { result, steps };
  }
};

// ===== KEYED TRANSPOSITION =====
const KeyedTransposition = {
  getOrder(key) {
    const k = key.toUpperCase().replace(/[^A-Z0-9]/g,'');
    const sorted = [...k].map((c, i) => ({c, i})).sort((a,b) => a.c < b.c ? -1 : a.c > b.c ? 1 : a.i - b.i);
    const order = Array(k.length);
    sorted.forEach((x, rank) => order[x.i] = rank);
    return { k, order };
  },
  encrypt(text, key) {
    const { k, order } = this.getOrder(key);
    const t = text.replace(/\s/g, '').toUpperCase();
    const cols = k.length;
    const rows = Math.ceil(t.length / cols);
    const padded = t.padEnd(rows * cols, 'X');
    let steps = `Key: ${k}\nOrder: ${order.join(' ')}\n\nGrid:\n`;
    let grid = [];
    for (let r = 0; r < rows; r++) {
      const row = padded.slice(r*cols, (r+1)*cols).split('');
      grid.push(row);
      steps += row.join(' ') + '\n';
    }
    // Build rank→col mapping
    const rankToCol = Array(cols);
    order.forEach((rank, col) => rankToCol[rank] = col);
    let result = '';
    steps += '\nRead by key order:\n';
    for (let rank = 0; rank < cols; rank++) {
      const c = rankToCol[rank];
      const col = grid.map(r=>r[c]).join('');
      steps += `Key[${k[c]}] Col${c+1}: <span class="result">${col}</span>\n`;
      result += col;
    }
    return { result, steps };
  },
  decrypt(text, key) {
    const { k, order } = this.getOrder(key);
    const t = text.replace(/\s/g, '').toUpperCase();
    const cols = k.length;
    const rows = Math.ceil(t.length / cols);
    const rankToCol = Array(cols);
    order.forEach((rank, col) => rankToCol[rank] = col);
    let grid = Array.from({length:rows}, ()=>Array(cols).fill(''));
    let idx = 0;
    for (let rank = 0; rank < cols; rank++) {
      const c = rankToCol[rank];
      for (let r = 0; r < rows; r++) grid[r][c] = t[idx++] || '';
    }
    let result = '';
    let steps = `Key: ${k}\nOrder: ${order.join(' ')}\nRebuilding grid:\n\n`;
    for (let r = 0; r < rows; r++) {
      steps += grid[r].join(' ') + '\n';
      result += grid[r].join('');
    }
    result = result.replace(/X+$/, '');
    steps += `\n<span class="result">Result: ${result}</span>`;
    return { result, steps };
  }
};

// ===== RSA =====
const RSA = {
  generate(pStr, qStr, eStr) {
    const p = parseInt(pStr), q = parseInt(qStr), e = parseInt(eStr);
    if (!isPrime(p) || !isPrime(q)) return { error: `Both p and q must be prime numbers.` };
    if (p === q) return { error: 'p and q must be different primes.' };
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    if (gcd(e, phi) !== 1) return { error: `e=${e} is not coprime with φ(n)=${phi}. Choose another e.` };
    const d = modInverse(e, phi);
    if (d === -1) return { error: `No modular inverse found for e.` };
    return { p, q, n, phi, e, d, publicKey: `(e=${e}, n=${n})`, privateKey: `(d=${d}, n=${n})` };
  },
  encrypt(msg, e, n) {
    const m = parseInt(msg);
    if (m >= n) return { error: `Message m=${m} must be less than n=${n}.` };
    const c = Number(modPow(BigInt(m), BigInt(e), BigInt(n)));
    return { result: c, steps: `C = M^e mod n = ${m}^${e} mod ${n} = ${c}` };
  },
  decrypt(cipher, d, n) {
    const c = parseInt(cipher);
    const m = Number(modPow(BigInt(c), BigInt(d), BigInt(n)));
    return { result: m, steps: `M = C^d mod n = ${c}^${d} mod ${n} = ${m}` };
  }
};

// ===== DIFFIE-HELLMAN =====
const DiffieHellman = {
  compute(pStr, gStr, aStr, bStr) {
    const p = parseInt(pStr), g = parseInt(gStr), a = parseInt(aStr), b = parseInt(bStr);
    if (!isPrime(p)) return { error: `p=${p} must be prime.` };
    const A = Number(modPow(BigInt(g), BigInt(a), BigInt(p)));
    const B = Number(modPow(BigInt(g), BigInt(b), BigInt(p)));
    const sA = Number(modPow(BigInt(B), BigInt(a), BigInt(p)));
    const sB = Number(modPow(BigInt(A), BigInt(b), BigInt(p)));
    return {
      p, g, a, b, A, B,
      sharedKey: sA,
      steps: `Public prime p = ${p}\nGenerator g = ${g}\n\nAlice private key a = ${a}\nBob   private key b = ${b}\n\nAlice public: A = g^a mod p = ${g}^${a} mod ${p} = ${A}\nBob   public: B = g^b mod p = ${g}^${b} mod ${p} = ${B}\n\nAlice computes: s = B^a mod p = ${B}^${a} mod ${p} = ${sA}\nBob   computes: s = A^b mod p = ${A}^${b} mod ${p} = ${sB}\n\nShared Secret = ${sA}`
    };
  }
};

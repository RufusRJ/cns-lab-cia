# 🔐 CNS Cipher Lab

> An interactive **Cryptography Simulator** for the Computer Network Security subject.  
> Built by **Rufus Ebenezer**

🌐 **Live Site:** [rufusrj.github.io/cns-lab-cia](https://rufusrj.github.io/cns-lab-cia/)

---

## Simulators Included

### 🔤 Mono-alphabetic Substitution
| Cipher | Description |
|---|---|
| Caesar Cipher | Shifts each letter by a fixed number |
| Multiplicative Cipher | Multiplies letter index by key (mod 26) |
| Affine Cipher | Combines Caesar + Multiplicative: E(x) = ax + b |

### 🔑 Poly-alphabetic Substitution
| Cipher | Description |
|---|---|
| Vernam Cipher | XOR-based One-Time Pad |
| Vigenère Cipher | Repeating keyword shifts |
| Playfair Cipher | 5×5 matrix, digram encryption |
| Hill Cipher | 2×2 matrix linear algebra cipher |

### ↔️ Transposition
| Cipher | Description |
|---|---|
| Keyless Transposition | Columnar read without a key |
| Keyed Transposition | Columnar read ordered by keyword |

### 🔐 Modern Asymmetric Cryptography
| Algorithm | Description |
|---|---|
| RSA | Key generation, encrypt & decrypt |
| Diffie-Hellman | Shared secret key exchange |

---

## Features
- 💡 **Load Example** button on every simulator — pre-fills and runs instantly
- 🧮 **Step-by-step trace** for every calculation
- 🔒 / 🔓 Encrypt & Decrypt modes
- 🟦 Live Playfair 5×5 matrix preview
- 📋 Copy output to clipboard
- 100% static — no backend, no database

## Running Locally
Just open `index.html` in any browser. No server needed.

```
cnslabcia/
├── index.html
├── css/styles.css
└── js/
    ├── ciphers.js   ← All cipher logic
    └── ui.js        ← SPA router & UI
```

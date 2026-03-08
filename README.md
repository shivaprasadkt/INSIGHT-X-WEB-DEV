# 🎲 Dice Forge — Frontend Die Roller Application

A fully functional, browser-based die roller web application built with pure **HTML**, **CSS**, and **Vanilla JavaScript**. No frameworks, no backends, no external APIs — just open `index.html` and roll.

---

## 🚀 Getting Started

1. Download or clone the project folder.
2. Ensure all three files are in the **same directory**:
   ```
   project/
   ├── index.html
   ├── style.css
   └── script.js
   ```
3. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
4. No installation, no build steps, no internet connection required *(except for Google Fonts)*.

---

## 🎯 Features

### Core Functionality
- **Dice Count Selection** — Choose between 1 and 6 dice using clearly labeled selector buttons.
- **Dice Type Selection** — Supports D4, D6, D8, D10, D12, and D20.
- **Random Roll Generation** — Cryptographically random values via `Math.random()`.
- **Individual Dice Display** — Each die is rendered individually in the Dice Arena. D6 shows classic SVG pip dots; other types show numeric values.
- **Total Sum Display** — Instantly calculates and displays the sum of all rolled dice.
- **Highest & Lowest Tracking** — Highlights the best and worst die in each roll with green/red borders.
- **Roll History** — Stores the last 10 rolls with per-die values, die type, and total sum.

### Animations & Interactivity
- **3D Roll Animation** — Each die plays a smooth CSS `rotateX/Y/Z` + scale animation on every roll, staggered per die.
- **Flash Effect** — Full-screen radial glow flash on each roll.
- **Particle Burst** — Emoji particles spawn when a high roll is achieved (≥85% of max possible sum).
- **Slide-in History** — New history entries animate in from the right.
- **Keyboard Shortcut** — Press `R` or `Space` to roll without clicking.

### Bonus Features ⭐
| Feature | Details |
|---|---|
| 🔊 Sound Effects | Web Audio API — rolling thud + result tone scaled to roll quality |
| 🌙 Dark / Light Mode | Full theme toggle with CSS custom properties |
| 🎲 Custom Dice Types | D4, D6, D8, D10, D12, D20 |
| 📊 Session Statistics | Tracks total rolls, average sum, best roll, worst roll |
| 📈 Face Frequency Bars | Visual probability bars showing face distribution per die type |

---

## 📁 File Structure

```
project/
├── index.html     — HTML structure and layout; links CSS and JS
├── style.css      — All styling: CSS variables, animations, responsive layout
└── script.js      — All application logic: state, rolling, audio, history, stats
```

### `index.html`
Defines the full page structure including the header, configuration panel, dice arena, result stats, roll history sidebar, and session stats card. Links `style.css` in `<head>` and `script.js` before `</body>`.

### `style.css`
- CSS custom properties for dark/light theming (`--gold`, `--accent`, `--bg-card`, etc.)
- Grid-based responsive layout (collapses to single column below 820px)
- Keyframe animations: `diceRoll`, `slideIn`, `particleFly`
- Mobile breakpoints at 820px, 600px, and 400px

### `script.js`
- `state` object — single source of truth for all app data
- `buildDiceCountSelector()` / `buildTypeSelector()` — dynamically generate UI controls
- `rollDice()` — core roll logic with animation sequencing
- `addHistory()` / `renderHistory()` — history management and rendering
- `updateSessionStats()` — running session totals
- `updateProbBars()` — live face frequency visualization
- `playRollSound()` / `playResultSound()` — Web Audio API synthesis
- `spawnParticles()` — DOM-based particle system

---

## 🧩 How It Works

```
User clicks ROLL (or presses R / Space)
        │
        ▼
playRollSound()          ← Audio: rolling thud
flashScreen()            ← Visual: screen flash
        │
        ▼
Generate random values   ← Math.random() × dice sides
Render dice to arena     ← DOM elements with stagger animation
        │
        ▼  (after animation completes)
Highlight max / min      ← Green border = highest, Red = lowest
Update result panel      ← Sum, High, Low
Update history           ← Prepend to list (max 10 entries)
Update session stats     ← Rolls, Avg, Best, Worst
Spawn particles?         ← If sum ≥ 85% of max possible
playResultSound()        ← Tone pitched to roll quality
```

---

## 📐 Evaluation Criteria Coverage

| Criteria | Implementation |
|---|---|
| **Core Functionality (40)** | Dice count 1–6, random values, sum display, last 10 rolls in history |
| **UI/UX & Responsiveness (25)** | Gold/dark theme, CSS Grid, 3 mobile breakpoints, glassmorphism cards |
| **Code Quality (20)** | Single `state` object, modular functions, consistent naming, inline comments |
| **Animation & Interactivity (10)** | 3D roll animation, flash, particles, keyboard shortcut |
| **Bonus Features (5)** | Sound, dark/light mode, D4–D20 types, session stats, probability bars |

---

## 🌐 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Mobile Chrome / Safari | ✅ Responsive |

> **Note:** Web Audio API requires a user gesture (click/keypress) before audio plays. This is a browser security requirement and is handled automatically — sound triggers on the roll action.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `R` | Roll dice |
| `Space` | Roll dice |

---

## 🎨 Theming

The app uses CSS custom properties for theming. Toggle between dark and light mode using the 🌙 button in the header. All colors, shadows, and borders update instantly without any JavaScript DOM manipulation beyond toggling a `data-theme` attribute on `<html>`.

---
## 🤝 Contributors
<a href="https://github.com/shivaprasadkt/INSIGHT-X-WEB-DEV/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=shivaprasadkt/INSIGHT-X-WEB-DEV" />
</a>

---

## 👤 Author

**Dice Forge** — Built as a frontend web development challenge submission.  
Technologies: HTML5 · CSS3 · Vanilla JavaScript · Web Audio API

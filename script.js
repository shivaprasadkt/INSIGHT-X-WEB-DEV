/* ========================================================
   DICE FORGE — Complete Die Roller Application
   ======================================================== */

// ── State ──────────────────────────────────────────────
const state = {
  diceCount: 2,
  diceType: 6,
  rolling: false,
  history: [],        // up to 20
  faceFreq: {},       // { [sides]: { [face]: count } }
  sessionRolls: 0,
  sessionSums: [],
  soundOn: true,
  theme: 'dark',
};

const DICE_TYPES = [4, 6, 8, 10, 12, 20];
const MAX_HISTORY = 10;

// ── DOM refs ───────────────────────────────────────────
const diceArena        = document.getElementById('diceArena');
const arenaPlaceholder = document.getElementById('arenaPlaceholder');
const rollBtn          = document.getElementById('rollBtn');
const historyList      = document.getElementById('historyList');
const historyEmpty     = document.getElementById('historyEmpty');
const resultPanel      = document.getElementById('resultPanel');
const statTotal        = document.getElementById('statTotal');
const statHigh         = document.getElementById('statHigh');
const statLow          = document.getElementById('statLow');
const statsCard        = document.getElementById('statsCard');
const sTotal           = document.getElementById('sTotal');
const sAvg             = document.getElementById('sAvg');
const sBest            = document.getElementById('sBest');
const sWorst           = document.getElementById('sWorst');
const probBars         = document.getElementById('probBars');
const rollCountBadge   = document.getElementById('rollCountBadge');
const flashOverlay     = document.getElementById('flashOverlay');
const themeToggle      = document.getElementById('themeToggle');
const soundToggle      = document.getElementById('soundToggle');

// ── Build controls ─────────────────────────────────────
function buildDiceCountSelector() {
  const container = document.getElementById('diceCountSelector');
  container.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const btn = document.createElement('button');
    btn.className = 'count-btn' + (i === state.diceCount ? ' active' : '');
    btn.textContent = i;
    btn.title = `Roll ${i} ${i === 1 ? 'die' : 'dice'}`;
    btn.addEventListener('click', () => {
      state.diceCount = i;
      buildDiceCountSelector();
    });
    container.appendChild(btn);
  }
}

function buildTypeSelector() {
  const container = document.getElementById('typeSelector');
  container.innerHTML = '';
  DICE_TYPES.forEach(sides => {
    const btn = document.createElement('button');
    btn.className = 'type-btn' + (sides === state.diceType ? ' active' : '');
    btn.textContent = 'D' + sides;
    btn.addEventListener('click', () => {
      state.diceType = sides;
      buildTypeSelector();
      updateProbBars();
    });
    container.appendChild(btn);
  });
}

// ── Audio engine ───────────────────────────────────────
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playRollSound() {
  if (!state.soundOn) return;
  try {
    const ctx = getAudio();
    const count = state.diceCount;
    for (let d = 0; d < count; d++) {
      const t = ctx.currentTime + d * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(120 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.2);
    }
    // Thud at end
    const tEnd = ctx.currentTime + count * 0.07 + 0.3;
    const noise = ctx.createOscillator();
    const ng    = ctx.createGain();
    noise.connect(ng); ng.connect(ctx.destination);
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(80, tEnd);
    noise.frequency.exponentialRampToValueAtTime(20, tEnd + 0.12);
    ng.gain.setValueAtTime(0.12, tEnd);
    ng.gain.exponentialRampToValueAtTime(0.001, tEnd + 0.15);
    noise.start(tEnd); noise.stop(tEnd + 0.16);
  } catch(e) {}
}

function playResultSound(val, max) {
  if (!state.soundOn) return;
  try {
    const ctx = getAudio();
    const ratio = val / max;
    const freq = 200 + ratio * 600;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = ratio > 0.8 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.7);
    osc.frequency.setValueAtTime(freq * 1.25, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.7);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.72);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.start(ctx.currentTime + 0.7);
    osc.stop(ctx.currentTime + 1.1);
  } catch(e) {}
}

// ── Particles ──────────────────────────────────────────
const EMOJIS = ['✨','⭐','💎','🎲','⚡','🌟'];
function spawnParticles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const angle = (i / count) * 360;
    const dist  = 60 + Math.random() * 60;
    const dx = Math.cos(angle * Math.PI / 180) * dist;
    const dy = Math.sin(angle * Math.PI / 180) * dist - 40;
    el.style.left = (x + dx - 10) + 'px';
    el.style.top  = (y + dy - 10) + 'px';
    el.style.animationDelay = (Math.random() * 0.15) + 's';
    el.style.fontSize = (14 + Math.random() * 12) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

function flashScreen() {
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 200);
}

// ── Die face SVG dots ──────────────────────────────────
const DOT_POSITIONS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

function makeDotsSVG(n) {
  const dots = DOT_POSITIONS[n] || [];
  const circles = dots.map(([cx,cy]) =>
    `<circle cx="${cx}" cy="${cy}" r="7" fill="currentColor" opacity="0.9"/>`
  ).join('');
  return `<svg viewBox="0 0 100 100" width="52" height="52"
    style="color:var(--gold)">${circles}</svg>`;
}

// ── Roll ───────────────────────────────────────────────
function rollDice() {
  if (state.rolling) return;
  state.rolling = true;
  rollBtn.disabled = true;

  playRollSound();
  flashScreen();

  const sides = state.diceType;
  const count = state.diceCount;
  const values = Array.from({length: count}, () => 1 + Math.floor(Math.random() * sides));

  // Clear arena
  diceArena.innerHTML = '';

  // Render dice with stagger
  const dieEls = [];
  values.forEach((val, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'die-wrapper';

    const die = document.createElement('div');
    die.className = 'die';

    const face = document.createElement('div');
    face.className = 'die-face' + (sides > 6 ? ' special' : '');

    if (sides === 6) {
      face.innerHTML = `<div class="die-value">${makeDotsSVG(val)}</div>`;
    } else {
      face.innerHTML = `<div class="die-value">${val}</div>`;
    }

    const label = document.createElement('div');
    label.className = 'die-label';
    label.textContent = `D${sides}`;

    die.appendChild(face);
    wrapper.appendChild(die);
    wrapper.appendChild(label);
    diceArena.appendChild(wrapper);
    dieEls.push({die, face, val});

    // Staggered roll animation
    setTimeout(() => {
      die.classList.add('rolling');
    }, i * 80);
  });

  // After animation settles
  const animDuration = 700 + (count - 1) * 80;
  setTimeout(() => {
    const max = Math.max(...values);
    const min = Math.min(...values);

    dieEls.forEach(({face, val}) => {
      if (val === max && max !== min) face.classList.add('is-max');
      if (val === min && max !== min) face.classList.add('is-min');
    });

    const sum = values.reduce((a, b) => a + b, 0);

    // Update result stats
    resultPanel.style.display = 'grid';
    statTotal.textContent = sum;
    statHigh.textContent = max;
    statLow.textContent = min;

    // Track frequency
    if (!state.faceFreq[sides]) state.faceFreq[sides] = {};
    values.forEach(v => {
      state.faceFreq[sides][v] = (state.faceFreq[sides][v] || 0) + 1;
    });

    // Session stats
    state.sessionRolls++;
    state.sessionSums.push(sum);
    updateSessionStats(sum, count * sides);

    // Roll count badge
    rollCountBadge.textContent = `Roll #${state.sessionRolls} — ${count}×D${sides}`;

    // History
    addHistory(values, sum, sides);

    // Particles for great rolls
    const maxPossible = count * sides;
    if (sum >= maxPossible * 0.85) {
      const arenaRect = diceArena.getBoundingClientRect();
      spawnParticles(arenaRect.left + arenaRect.width/2, arenaRect.top + arenaRect.height/2, 12);
    }

    playResultSound(sum, count * sides);
    updateProbBars();
    statsCard.style.display = 'block';

    state.rolling = false;
    rollBtn.disabled = false;
  }, animDuration + 100);
}

// ── History ────────────────────────────────────────────
function addHistory(values, sum, sides) {
  const entry = { values, sum, sides, time: new Date() };
  state.history.unshift(entry);
  if (state.history.length > MAX_HISTORY) state.history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (state.history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No rolls yet</div>';
    return;
  }
  state.history.forEach((entry, idx) => {
    const maxV = Math.max(...entry.values);
    const minV = Math.min(...entry.values);
    const item = document.createElement('div');
    item.className = 'history-item' + (idx === 0 ? ' latest' : '');

    const indexEl = document.createElement('div');
    indexEl.className = 'history-index';
    indexEl.textContent = `#${state.sessionRolls - idx}`;

    const diceEl = document.createElement('div');
    diceEl.className = 'history-dice';
    entry.values.forEach(v => {
      const pip = document.createElement('div');
      pip.className = 'history-pip'
        + (v === maxV && maxV !== minV ? ' max' : '')
        + (v === minV && maxV !== minV ? ' min' : '');
      pip.textContent = v;
      diceEl.appendChild(pip);
    });

    const typeEl = document.createElement('div');
    typeEl.className = 'history-meta';
    typeEl.textContent = `D${entry.sides}`;

    const totalEl = document.createElement('div');
    totalEl.className = 'history-total';
    totalEl.textContent = entry.sum;

    item.appendChild(indexEl);
    item.appendChild(diceEl);
    item.appendChild(typeEl);
    item.appendChild(totalEl);
    historyList.appendChild(item);
  });
}

// ── Session stats ──────────────────────────────────────
function updateSessionStats(lastSum, maxPossible) {
  const sums = state.sessionSums;
  sTotal.textContent = state.sessionRolls;
  sAvg.textContent = (sums.reduce((a,b) => a+b, 0) / sums.length).toFixed(1);
  sBest.textContent = Math.max(...sums);
  sWorst.textContent = Math.min(...sums);
}

// ── Probability bars ───────────────────────────────────
function updateProbBars() {
  const sides = state.diceType;
  const freq  = state.faceFreq[sides] || {};
  const total = Object.values(freq).reduce((a,b) => a+b, 0);

  probBars.innerHTML = '';
  if (total === 0) {
    probBars.innerHTML = '<div style="font-size:10px;color:var(--text-muted);font-family:Cinzel,serif;letter-spacing:2px">Roll to see data</div>';
    return;
  }

  const expected = 1 / sides;
  for (let f = 1; f <= sides; f++) {
    const count = freq[f] || 0;
    const actual = count / total;
    const pct    = Math.round(actual * 100);

    const row = document.createElement('div');
    row.className = 'prob-bar-row';
    row.innerHTML = `
      <div class="prob-bar-label">${f}</div>
      <div class="prob-bar-track">
        <div class="prob-bar-fill" style="width:${Math.min(actual/expected/2,1)*100}%"></div>
      </div>
      <div class="prob-bar-pct">${pct}%</div>`;
    probBars.appendChild(row);
  }
}

// ── Theme toggle ───────────────────────────────────────
themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  themeToggle.textContent = state.theme === 'dark' ? '🌙' : '☀️';
});

// ── Sound toggle ───────────────────────────────────────
soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  soundToggle.textContent = state.soundOn ? '🔊 SOUND' : '🔇 MUTED';
  soundToggle.classList.toggle('on', state.soundOn);
});

// ── Roll button ────────────────────────────────────────
rollBtn.addEventListener('click', rollDice);

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R' || e.key === ' ') && !state.rolling) {
    e.preventDefault();
    rollDice();
  }
});

// ── Init ───────────────────────────────────────────────
buildDiceCountSelector();
buildTypeSelector();
updateProbBars();
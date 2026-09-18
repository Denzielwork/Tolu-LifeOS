/* ============================================================
   T.O.L.U. — Full JS (Dashboard + Health + Hevy + JARVIS + Finance)
   ============================================================ */

/* ============================================================
   0. LOCK SCREEN
   ============================================================ */
window.pState = 'LOCKED';
window.shiftStartTime = 0;
window.explodeTime = 0;
window.explodeFired = false;

window.startParticleShift = function () {
  window.pState = 'SHIFTING';
  window.shiftStartTime = Date.now();
};
window.triggerParticleExplosion = function () {
  window.pState = 'NORMAL';
  window.explodeTime = Date.now();
  window.explodeFired = false;
};

document.addEventListener('DOMContentLoaded', () => {
  const pinInput = document.getElementById('pin-input');
  if (!pinInput) return;
  pinInput.focus();
  pinInput.addEventListener('input', (e) => {
    if (e.target.value === '310520') {
      e.target.disabled = true;
      e.target.blur();
      unlockSystem();
    }
  });
});

function unlockSystem() {
  if (document.activeElement) document.activeElement.blur();
  const lockContent = document.getElementById('lock-content');
  lockContent.classList.add('opacity-0');

  setTimeout(() => {
    lockContent.classList.add('hidden');
    document.getElementById('greeting-content').classList.remove('hidden');
    window.startParticleShift();

    setTimeout(() => {
      window.triggerParticleExplosion();
      const lockScreen = document.getElementById('lock-screen');
      const dashboard = document.getElementById('main-dashboard');

      lockScreen.classList.add('opacity-0');
      dashboard.classList.remove('hidden');
      dashboard.classList.add('flex');

      setTimeout(() => dashboard.classList.remove('opacity-0'), 50);
      setTimeout(() => {
        lockScreen.classList.add('hidden');
        window.pState = 'AMBIENT';
      }, 1100);
    }, 3000);
  }, 500);
}

/* ============================================================
   1. UNIFIED PARTICLE SYSTEM
   ============================================================ */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;

const CONNECT_DISTANCE    = 150;
const MOUSE_LINK_DISTANCE = 180;
const MAX_SPEED           = 2.5;
const TOTAL_PARTICLES     = 300;

window.addEventListener('resize', () => {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  faceTargets = buildFaceTargets();
});

const mouse = { x: null, y: null, radius: 180 };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

const VoiceState = {
  IDLE:           'IDLE',
  SUMMONING:      'SUMMONING',
  SPEAKING:       'SPEAKING',
  DISSOLVING:     'DISSOLVING',
  WORKING:        'WORKING',
  REMATERIALIZING:'REMATERIALIZING'
};
let voiceState = VoiceState.IDLE;
let voiceStateStart = Date.now();

function setVoiceState(next) {
  voiceState = next;
  voiceStateStart = Date.now();

  const faceSvg = document.getElementById('face-svg');
  const statusEl = document.getElementById('voice-status');

  if (statusEl) {
    statusEl.classList.add('active');
    statusEl.innerText = next.replace(/_/g, ' ');
  }

  if (faceSvg) {
    if (next === VoiceState.SUMMONING || next === VoiceState.REMATERIALIZING) {
      faceSvg.classList.add('visible', 'materializing');
      setTimeout(() => faceSvg.classList.remove('materializing'), 900);
    }
    if (next === VoiceState.DISSOLVING) {
      faceSvg.classList.remove('visible');
    }
    if (next === VoiceState.IDLE) {
      faceSvg.classList.remove('visible');
      if (statusEl) statusEl.classList.remove('active');
    }
  }
}

let faceTargets = [];

function buildFaceTargets() {
  const cx    = W / 2;
  const cy    = H / 2 - 20;
  const scale = Math.min(W, H) * 0.55;
  const pts   = [];

  for (let i = 0; i < 100; i++) {
    const t = (i / 100) * Math.PI * 2;
    const sinT = Math.sin(t);
    const chin = sinT > 0 ? 1 - 0.32 * sinT : 1;
    pts.push({
      x: cx + Math.cos(t) * 0.30 * scale * chin * 1.02,
      y: cy + sinT * 0.42 * scale
    });
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    pts.push({ x: cx - 0.105 * scale + Math.cos(a) * 0.050 * scale, y: cy - 0.070 * scale + Math.sin(a) * 0.028 * scale });
    pts.push({ x: cx + 0.105 * scale + Math.cos(a) * 0.050 * scale, y: cy - 0.070 * scale + Math.sin(a) * 0.028 * scale });
  }
  for (let i = 0; i < 10; i++) {
    pts.push({ x: cx - 0.16 * scale + (i / 10) * 0.11 * scale, y: cy - 0.14 * scale - Math.sin(i / 10 * Math.PI) * 0.020 * scale });
    pts.push({ x: cx + 0.05 * scale + (i / 10) * 0.11 * scale, y: cy - 0.14 * scale - Math.sin(i / 10 * Math.PI) * 0.020 * scale });
  }
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    pts.push({ x: cx + (t - 0.5) * 0.15 * scale, y: cy + 0.175 * scale + Math.sin(t * Math.PI) * 0.012 * scale });
  }
  for (let i = 0; i < 12; i++) {
    pts.push({ x: cx + Math.sin(i * 0.55) * 2.2, y: cy - 0.045 * scale + (i / 12) * 0.11 * scale });
  }
  return pts;
}
faceTargets = buildFaceTargets();

class Particle {
  constructor() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.size = Math.random() * 1.4 + 0.6;
    this.baseVx = this.vx;
    this.baseVy = this.vy;
    this.color = '#DC143C';
    this.alpha = Math.random() * 0.5 + 0.3;
    this.baseAlpha = this.alpha;
    this.target = null;
    this.isFaceParticle = false;
    this.orbPhase = Math.random() * Math.PI * 2;
  }
  assign(target) { this.target = target; this.isFaceParticle = true; }
  release()      { this.target = null; this.isFaceParticle = false; }

  update() {
    const now = Date.now();

    if (window.pState === 'LOCKED' || window.pState === 'SHIFTING') {
      let targetX = W / 2;
      let targetY = H / 2;
      if (window.pState === 'SHIFTING') {
        const t = now - window.shiftStartTime;
        targetX += Math.sin(t * 0.006283) * (W * 0.25);
      }
      this.vx += (targetX - this.x) * 0.015;
      this.vy += (targetY - this.y) * 0.015;
      this.vx *= 0.82;
      this.vy *= 0.82;
    }
    else if (voiceState === VoiceState.SUMMONING ||
             voiceState === VoiceState.SPEAKING  ||
             voiceState === VoiceState.REMATERIALIZING) {
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const ease = voiceState === VoiceState.REMATERIALIZING ? 0.07 : 0.09;
        this.vx += dx * ease;
        this.vy += dy * ease;
        this.vx *= 0.74;
        this.vy *= 0.74;
        this.vx += (Math.random() - 0.5) * 0.35;
        this.vy += (Math.random() - 0.5) * 0.35;
        this.alpha = Math.min(this.baseAlpha + 0.5, this.alpha + 0.04);
      } else {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.alpha = Math.max(0.10, this.alpha - 0.008);
      }
    }
    else if (voiceState === VoiceState.DISSOLVING || voiceState === VoiceState.WORKING) {
      const orbX = W / 2;
      const orbY = H / 2;
      const orbR = 55 + Math.sin(now * 0.003 + this.orbPhase) * 8;
      const ang  = Math.atan2(this.y - orbY, this.x - orbX) + 0.035;
      const tx   = orbX + Math.cos(ang) * orbR;
      const ty   = orbY + Math.sin(ang) * orbR;
      this.vx += (tx - this.x) * 0.055;
      this.vy += (ty - this.y) * 0.055;
      this.vx *= 0.88;
      this.vy *= 0.88;
      this.alpha = Math.min(1, this.alpha + 0.06);
    }
    else {
      const time = now * 0.0004;
      this.vx += Math.cos(this.y * 0.004 + time) * 0.35;
      this.vy += Math.sin(this.x * 0.004 + time) * 0.35;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0.1) {
          const nx = dx / dist, ny = dy / dist;
          const force = (mouse.radius - dist) / mouse.radius;
          this.vx += nx * force * 0.2 + (-ny * force * 1.4);
          this.vy += ny * force * 0.2 + (nx * force * 1.4);
        }
      }
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const timeSinceExplosion = now - window.explodeTime;
      const activeMaxSpeed = (timeSinceExplosion < 1500) ? 25 : MAX_SPEED;

      if (speed > activeMaxSpeed) {
        this.vx = (this.vx / speed) * activeMaxSpeed;
        this.vy = (this.vy / speed) * activeMaxSpeed;
      }
      if (speed > MAX_SPEED) {
        this.vx *= 0.96; this.vy *= 0.96;
      } else {
        this.vx *= 0.97; this.vy *= 0.97;
        this.vx += (this.baseVx - this.vx) * 0.01;
        this.vy += (this.baseVy - this.vy) * 0.01;
      }
      this.alpha = this.baseAlpha * (0.7 + Math.sin(now * 0.002 + this.size * 6) * 0.3);
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }

  draw() {
    const isOrb = (voiceState === VoiceState.DISSOLVING || voiceState === VoiceState.WORKING);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 20, 60, ${this.alpha})`;
    ctx.fill();
    if (this.isFaceParticle || isOrb) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 20, 60, ${this.alpha * 0.14})`;
      ctx.fill();
    }
  }
}

const particles = [];
for (let i = 0; i < TOTAL_PARTICLES; i++) particles.push(new Particle());

function assignFaceParticles() {
  particles.forEach(p => p.release());
  const shuffled = [...faceTargets].sort(() => Math.random() - 0.5);
  const count = Math.min(shuffled.length, Math.floor(TOTAL_PARTICLES * 0.65));
  for (let i = 0; i < count; i++) particles[i].assign(shuffled[i]);
}

function drawSynapses() {
  const voiceActive = voiceState !== VoiceState.IDLE;
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    const active1 = p1.isFaceParticle || voiceActive;
    if (!active1) continue;
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const active2 = p2.isFaceParticle || voiceActive;
      if (!active2) continue;
      const dx = p1.x - p2.x;
      if (Math.abs(dx) > CONNECT_DISTANCE) continue;
      const dy = p1.y - p2.y;
      if (Math.abs(dy) > CONNECT_DISTANCE) continue;
      const d2 = dx * dx + dy * dy;
      if (d2 < CONNECT_DISTANCE * CONNECT_DISTANCE) {
        const dist = Math.sqrt(d2);
        const baseOpacity = voiceActive ? 0.4 : 0.35;
        ctx.strokeStyle = `rgba(220, 20, 60, ${(1 - dist / CONNECT_DISTANCE) * baseOpacity})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }
    if (!voiceActive && mouse.x !== null && mouse.y !== null) {
      const dx = p1.x - mouse.x;
      if (Math.abs(dx) > MOUSE_LINK_DISTANCE) continue;
      const dy = p1.y - mouse.y;
      if (Math.abs(dy) > MOUSE_LINK_DISTANCE) continue;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_LINK_DISTANCE * MOUSE_LINK_DISTANCE) {
        const dist = Math.sqrt(d2);
        ctx.strokeStyle = `rgba(220, 20, 60, ${(1 - dist / MOUSE_LINK_DISTANCE) * 0.55})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  }
}

function checkExplosion() {
  if (window.pState === 'NORMAL' && !window.explodeFired &&
      Date.now() - window.explodeTime < 50) {
    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      const force = 15 + Math.random() * 25;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
    });
    window.explodeFired = true;
  }
}

function animate() {
  const trailAlpha = (voiceState !== VoiceState.IDLE) ? 0.28 : (
    window.pState === 'AMBIENT' || window.pState === 'NORMAL' ? 0.12 : 0.4
  );
  ctx.fillStyle = `rgba(10, 10, 10, ${trailAlpha})`;
  ctx.fillRect(0, 0, W, H);

  checkExplosion();
  drawSynapses();
  particles.forEach(p => p.update());
  particles.forEach(p => p.draw());

  if (voiceState === VoiceState.SUMMONING && Date.now() - voiceStateStart > 950) {
    setVoiceState(VoiceState.SPEAKING);
    speak("Hello. I'm T.O.L.U. How can I assist you today?");
  }

  requestAnimationFrame(animate);
}
animate();

/* ============================================================
   2. LIVE UTC CLOCK
   ============================================================ */
function updateHeaderClock() {
  const now = new Date();
  const el = document.getElementById('live-clock');
  if (el) el.innerText = now.toUTCString().split(' ')[4] + ' UTC';
}
setInterval(updateHeaderClock, 1000);
updateHeaderClock();

/* ============================================================
   3. STATE
   ============================================================ */
const DEFAULT_HABITS = [
  { id: 'h1', category: 'career',  title: 'Prioritize task routing before execution',     xp: 10, done: false },
  { id: 'h2', category: 'finance', title: 'Review daily telemetry (Transactions)',         xp: 10, done: false },
  { id: 'h3', category: 'fitness', title: '15-min physical state alteration',              xp: 10, done: false },
  { id: 'h4', category: 'mental',  title: 'Execute 5-min open monitoring / gaze dilation', xp: 10, done: false }
];

const DEFAULT_FINANCE = {
  income:    { dailyRate: 50, daysPerWeek: 5 },
  expenses:  { tfl: 84.50, snacks: 20 },
  cash:      21.12,
  accounts: [
    { id: 'capital-one', name: 'Capital One',        type: 'Credit Card',   balance: 984.84, originalBalance: 984.84, priority: 1, note: 'Interest removed' },
    { id: 'rent',        name: 'University Rent',    type: 'Arrears',       balance: 345.00, originalBalance: 345.00, priority: 2, note: '4 x 86.25' },
    { id: 'natwest',     name: 'NatWest Overdraft',  type: 'Overdraft',     balance: 1662.13, originalBalance: 1662.13, priority: 3, note: '0% until 1yr post-grad' },
    { id: 'metro',       name: 'Metro Bank',         type: 'Current',       balance: 8.39,   originalBalance: 8.39,   priority: 4, note: 'Clear ASAP' },
    { id: 'other',       name: 'Other Account',      type: 'Current',       balance: 17.13,  originalBalance: 17.13,  priority: 5, note: 'Clear ASAP' }
  ],
  planner: [
    { month: 'Oct 2026', payments: { 'capital-one': 281.71, 'rent': 86.25, 'natwest': 0, 'metro': 0, 'other': 0 } },
    { month: 'Nov 2026', payments: { 'capital-one': 300,    'rent': 86.25, 'natwest': 0, 'metro': 0, 'other': 0 } },
    { month: 'Dec 2026', payments: { 'capital-one': 300,    'rent': 86.25, 'natwest': 0, 'metro': 0, 'other': 0 } },
    { month: 'Jan 2027', payments: { 'capital-one': 103.13, 'rent': 86.25, 'natwest': 196.87, 'metro': 0, 'other': 0 } }
  ],
  xp: 0,
  streak: 0,
  checkins: []
};

let state = {
  xp:             parseInt(localStorage.getItem('tolu_xp') || '0'),
  level:          parseInt(localStorage.getItem('tolu_lvl') || '1'),
  streak:         parseInt(localStorage.getItem('tolu_streak') || '1'),
  singleWin:      localStorage.getItem('tolu_win') || '',
  singleWinDone:  localStorage.getItem('tolu_win_done') === 'true',
  habits:         JSON.parse(localStorage.getItem('tolu_habits') || JSON.stringify(DEFAULT_HABITS)),
  evidence:       JSON.parse(localStorage.getItem('tolu_evidence') || '[]'),
  currentCategory:'career',
  health:         JSON.parse(localStorage.getItem('tolu_health') || 'null'),
  hevyWorkouts:   JSON.parse(localStorage.getItem('tolu_hevy') || '[]'),
  finance:        JSON.parse(localStorage.getItem('tolu_finance') || 'null') || JSON.parse(JSON.stringify(DEFAULT_FINANCE))
};

function saveState() {
  localStorage.setItem('tolu_xp', state.xp);
  localStorage.setItem('tolu_lvl', state.level);
  localStorage.setItem('tolu_streak', state.streak);
  localStorage.setItem('tolu_win', state.singleWin);
  localStorage.setItem('tolu_win_done', state.singleWinDone);
  localStorage.setItem('tolu_habits', JSON.stringify(state.habits));
  localStorage.setItem('tolu_evidence', JSON.stringify(state.evidence));
  if (state.health) localStorage.setItem('tolu_health', JSON.stringify(state.health));
  localStorage.setItem('tolu_hevy', JSON.stringify(state.hevyWorkouts));
  if (state.finance) localStorage.setItem('tolu_finance', JSON.stringify(state.finance));
  renderHeaderStats();
}

/* ============================================================
   4. STREAK
   ============================================================ */
function updateStreakOnLoad() {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem('tolu_last_active');
  if (lastActive === today) return;
  if (lastActive) {
    const diffDays = Math.round((new Date(today) - new Date(lastActive)) / 86400000);
    if (diffDays === 1)     state.streak += 1;
    else if (diffDays > 1)  state.streak = 1;
  }
  localStorage.setItem('tolu_last_active', today);
  saveState();
}

/* ============================================================
   5. XP / LEVEL
   ============================================================ */
function addXP(amount) {
  state.xp += amount;
  const nextLevelXP = state.level * 100;
  if (state.xp >= nextLevelXP) {
    state.xp -= nextLevelXP;
    state.level += 1;
    alert('[ SYSTEM UPGRADE ] Level ' + state.level + ' Achieved.');
  }
  saveState();
}

function renderHeaderStats() {
  const nextLevelXP = state.level * 100;
  const lvl    = document.getElementById('level-badge');
  const xpText = document.getElementById('xp-text');
  const xpBar  = document.getElementById('xp-bar');
  const streak = document.getElementById('streak-counter');
  if (lvl)    lvl.innerText = state.level;
  if (xpText) xpText.innerText = state.xp + ' / ' + nextLevelXP;
  if (xpBar)  xpBar.style.width = ((state.xp / nextLevelXP) * 100) + '%';
  if (streak) streak.innerText = state.streak + ' Day' + (state.streak === 1 ? '' : 's');
}

/* ============================================================
   6. TABS
   ============================================================ */
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => {
    el.classList.remove('active-tab');
    el.classList.add('inactive-tab');
  });

  const activeBtn = document.querySelector('.nav-btn[data-tab="' + tabId + '"]');
  if (activeBtn) {
    activeBtn.classList.remove('inactive-tab');
    activeBtn.classList.add('active-tab');
  }

  if (['career', 'mental'].indexOf(tabId) !== -1) {
    state.currentCategory = tabId;
    renderCategoryView(tabId);
    document.getElementById('tab-category-view').classList.add('active');
  } else {
    const section = document.getElementById('tab-' + tabId);
    if (section) section.classList.add('active');
  }

  if (tabId === 'finance') renderFinance();
  if (tabId === 'fitness') {
    renderHealthMetrics();
    renderHevyUI();
    renderBodyFitnessItems();
  }
}

/* ============================================================
   7. DASHBOARD
   ============================================================ */
function initDashboard() {
  const winInput = document.getElementById('single-win-input');
  if (winInput) {
    winInput.value = state.singleWin;
    winInput.addEventListener('change', (e) => {
      state.singleWin = e.target.value;
      state.singleWinDone = false;
      saveState();
      updateWinStatus();
    });
  }
  updateWinStatus();
  renderDashboardHabits();
  renderEvidence();
}

function completeSingleWin() {
  if (!state.singleWinDone && state.singleWin.trim() !== '') {
    state.singleWinDone = true;
    addXP(30);
    updateWinStatus();
  }
}

function updateWinStatus() {
  const status = document.getElementById('win-status');
  if (status) status.innerText = state.singleWinDone ? 'STATUS: VERIFIED (+30 XP)' : '';
}

/* ============================================================
   8. HABITS
   ============================================================ */
function renderDashboardHabits() {
  const container = document.getElementById('dashboard-habits-list');
  if (!container) return;
  container.innerHTML = '';
  state.habits.forEach((habit) => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-lg flex items-center justify-between text-sm transition-colors border ' +
      (habit.done
        ? 'bg-[#DC143C]/5 border-[#DC143C]/30 text-[#D3D3D3]/50 line-through'
        : 'bg-[#1A1A1A]/40 border-[#D3D3D3]/15 text-[#D3D3D3]');
    item.innerHTML =
      '<label class="flex items-center gap-3 cursor-pointer w-full">' +
        '<input type="checkbox" ' + (habit.done ? 'checked' : '') +
               ' onchange="toggleHabit(\'' + habit.id + '\')"' +
               ' class="rounded border-[#DC143C]/50 accent-[#DC143C] bg-transparent w-4 h-4 cursor-pointer">' +
        '<span class="tracking-wide">[' + habit.category.substring(0,3).toUpperCase() + '] ' + escapeHtml(habit.title) + '</span>' +
      '</label>' +
      '<span class="text-[#DC143C] font-bold text-xs shrink-0 font-tech">+' + habit.xp + ' XP</span>';
    container.appendChild(item);
  });
}

function toggleHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  habit.done = !habit.done;
  if (habit.done) addXP(habit.xp);
  saveState();
  renderDashboardHabits();
  const catView = document.getElementById('tab-category-view');
  if (catView && catView.classList.contains('active')) {
    renderCategoryView(state.currentCategory);
  }
  const fitView = document.getElementById('tab-fitness');
  if (fitView && fitView.classList.contains('active')) {
    renderBodyFitnessItems();
  }
}

/* ============================================================
   9. CATEGORY VIEW
   ============================================================ */
function renderCategoryView(catId) {
  const titleEl = document.getElementById('category-title');
  if (titleEl) titleEl.innerText = catId.replace('_', ' ');

  const listContainer = document.getElementById('category-items-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  const catHabits = state.habits.filter(h => h.category === catId);
  if (catHabits.length === 0) {
    listContainer.innerHTML = '<p class="text-xs text-[#D3D3D3]/50 uppercase tracking-widest font-tech">No protocols established for this domain.</p>';
    return;
  }
  catHabits.forEach(habit => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-lg flex items-center justify-between text-sm border ' +
      (habit.done ? 'bg-[#DC143C]/5 border-[#DC143C]/30' : 'bg-[#1A1A1A]/40 border-[#D3D3D3]/15');
    item.innerHTML =
      '<label class="flex items-center gap-3 cursor-pointer">' +
        '<input type="checkbox" ' + (habit.done ? 'checked' : '') +
               ' onchange="toggleHabit(\'' + habit.id + '\')"' +
               ' class="rounded border-[#DC143C]/50 accent-[#DC143C] w-4 h-4">' +
        '<span class="' + (habit.done ? 'line-through text-[#D3D3D3]/50' : 'text-[#D3D3D3]') + '">' + escapeHtml(habit.title) + '</span>' +
      '</label>' +
      '<span class="text-[#DC143C] font-bold text-xs font-tech">+' + habit.xp + ' XP</span>';
    listContainer.appendChild(item);
  });
}

function promptNewCategoryItem() {
  const title = prompt('Define new protocol for ' + state.currentCategory.toUpperCase() + ':');
  if (title && title.trim()) {
    state.habits.push({
      id: 'h_' + Date.now(),
      category: state.currentCategory,
      title: title.trim(),
      xp: 10,
      done: false
    });
    saveState();
    renderCategoryView(state.currentCategory);
    renderDashboardHabits();
  }
}

function promptNewFitnessProtocol() {
  const title = prompt('Define new fitness protocol:');
  if (title && title.trim()) {
    state.habits.push({
      id: 'h_' + Date.now(),
      category: 'fitness',
      title: title.trim(),
      xp: 10,
      done: false
    });
    saveState();
    renderBodyFitnessItems();
    renderDashboardHabits();
  }
}

/* ============================================================
   10. EVIDENCE
   ============================================================ */
function addEvidence() {
  const input = document.getElementById('evidence-input');
  if (!input) return;
  const value = input.value.trim();
  if (value === '') return;
  state.evidence.unshift(value);
  input.value = '';
  addXP(15);
  saveState();
  renderEvidence();
}

function renderEvidence() {
  const list = document.getElementById('evidence-list');
  if (!list) return;
  list.innerHTML = '';
  state.evidence.forEach(item => {
    const li = document.createElement('li');
    li.className = 'p-3 rounded bg-[#1A1A1A]/40 border border-[#D3D3D3]/10 flex items-start gap-2';
    li.innerHTML = '<span class="text-[#DC143C]">&#9657;</span> <span>' + escapeHtml(item) + '</span>';
    list.appendChild(li);
  });
}

/* ============================================================
   11. TIMER
   ============================================================ */
let timerDuration = 20 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (!el) return;
  const mins = Math.floor(timerDuration / 60);
  const secs = timerDuration % 60;
  el.innerText = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function toggleTimer() {
  const btn = document.getElementById('timer-toggle-btn');
  if (!btn) return;
  if (timerInterval) {
    clearInterval(timerInterval); timerInterval = null;
    btn.innerText = 'Resume';
  } else {
    btn.innerText = 'Pause';
    timerInterval = setInterval(() => {
      if (timerDuration > 0) {
        timerDuration--; updateTimerDisplay();
      } else {
        clearInterval(timerInterval); timerInterval = null;
        btn.innerText = 'Initiate';
        alert('[ SYSTEM ALERT ] Temporal boundary reached.');
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval); timerInterval = null;
  timerDuration = 20 * 60;
  const btn = document.getElementById('timer-toggle-btn');
  if (btn) btn.innerText = 'Initiate';
  updateTimerDisplay();
}

/* ============================================================
   12. SETTINGS
   ============================================================ */
function openSettingsModal() {
  const g = document.getElementById('setting-gemini-key');
  const h = document.getElementById('setting-hevy-key');
  if (g) g.value = localStorage.getItem('tolu_gemini_key') || '';
  if (h) h.value = localStorage.getItem('tolu_hevy_key') || '';
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}
function saveSettings() {
  const g = document.getElementById('setting-gemini-key');
  const h = document.getElementById('setting-hevy-key');
  if (g) localStorage.setItem('tolu_gemini_key', g.value.trim());
  if (h) localStorage.setItem('tolu_hevy_key', h.value.trim());
  closeSettingsModal();
  alert('Configuration stored locally.');
}

/* ============================================================
   13. AI CORE
   ============================================================ */
async function runGeminiBrainDump() {
  const apiKey = localStorage.getItem('tolu_gemini_key');
  if (!apiKey) {
    alert('System requires Gemini API Key configuration.');
    openSettingsModal();
    return;
  }
  const rawText = document.getElementById('braindump-input').value.trim();
  if (!rawText) return;

  const loader = document.getElementById('ai-loading');
  loader.classList.remove('hidden');

  const systemPrompt = 'You are the AI core of an ADHD executive function dashboard named TOLU. Analyze this unstructured brain dump. Break it down into highly actionable micro-steps to reduce routing table saturation. Return valid JSON only:\n{\n  "tasks": [\n    {"action": "text", "category": "career|finance|fitness|mental", "priority": "CRITICAL|ROUTINE"}\n  ]\n}';

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nUser Input: ' + rawText }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );
    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) throw new Error('Unexpected response');
    const output = JSON.parse(data.candidates[0].content.parts[0].text);
    renderAiResults(output.tasks || []);
  } catch (err) {
    console.error(err);
    alert('Neural processing failed. Check connection or API credentials.');
  } finally {
    loader.classList.add('hidden');
  }
}

function renderAiResults(tasks) {
  const container = document.getElementById('ai-results');
  const box = document.getElementById('ai-output');
  if (!container || !box) return;
  container.innerHTML = '';
  box.classList.remove('hidden');
  tasks.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'bg-[#1A1A1A]/40 p-4 rounded-lg border border-[#D3D3D3]/15 flex flex-col justify-between';
    const priorityClass = t.priority === 'CRITICAL'
      ? 'text-[#DC143C] border-[#DC143C]/50 bg-[#DC143C]/10'
      : 'text-[#D3D3D3]/60 border-[#D3D3D3]/30 bg-[#1A1A1A]/50';
    card.innerHTML =
      '<div class="flex justify-between items-start mb-3">' +
        '<span class="text-[10px] font-tech font-bold uppercase tracking-widest text-[#DC143C]">' + escapeHtml(t.category || 'other') + '</span>' +
        '<span class="px-2 py-1 rounded text-[9px] uppercase tracking-widest font-tech font-bold border ' + priorityClass + '">' + escapeHtml(t.priority || 'ROUTINE') + '</span>' +
      '</div>' +
      '<p class="text-[#D3D3D3] text-sm">' + escapeHtml(t.action || '') + '</p>';
    container.appendChild(card);
  });
}

/* ============================================================
   14. FITNESS TAB — PROTOCOLS
   ============================================================ */
function renderBodyFitnessItems() {
  const container = document.getElementById('body-fitness-items-list');
  if (!container) return;
  container.innerHTML = '';
  const fitnessHabits = state.habits.filter(h => h.category === 'fitness');
  if (fitnessHabits.length === 0) {
    container.innerHTML = '<p class="text-xs text-[#D3D3D3]/50 uppercase tracking-widest font-tech">No fitness protocols yet.</p>';
    return;
  }
  fitnessHabits.forEach(habit => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-lg flex items-center justify-between text-sm border ' +
      (habit.done ? 'bg-[#DC143C]/5 border-[#DC143C]/30' : 'bg-[#1A1A1A]/40 border-[#D3D3D3]/15');
    item.innerHTML =
      '<label class="flex items-center gap-3 cursor-pointer">' +
        '<input type="checkbox" ' + (habit.done ? 'checked' : '') +
               ' onchange="toggleHabit(\'' + habit.id + '\')"' +
               ' class="rounded border-[#DC143C]/50 accent-[#DC143C] w-4 h-4">' +
        '<span class="' + (habit.done ? 'line-through text-[#D3D3D3]/50' : 'text-[#D3D3D3]') + '">' + escapeHtml(habit.title) + '</span>' +
      '</label>' +
      '<span class="text-[#DC143C] font-bold text-xs font-tech">+' + habit.xp + ' XP</span>';
    container.appendChild(item);
  });
}

/* ============================================================
   15. HEALTH SYNC
   ============================================================ */
function parseAppleHealthXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const now = new Date();
  const oneDayAgo    = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = { sleep: 0, sleepDeep: 0, sleepREM: 0, steps: 0, energy: 0, rhr: 0, hrv: 0, recovery: 0, lastSync: now.toISOString() };

  doc.querySelectorAll('Record[type="HKQuantityTypeIdentifierStepCount"]').forEach(r => {
    if (new Date(r.getAttribute('startDate')) >= oneDayAgo)
      result.steps += parseFloat(r.getAttribute('value')) || 0;
  });
  doc.querySelectorAll('Record[type="HKQuantityTypeIdentifierActiveEnergyBurned"]').forEach(r => {
    if (new Date(r.getAttribute('startDate')) >= oneDayAgo)
      result.energy += parseFloat(r.getAttribute('value')) || 0;
  });

  let rhrSum = 0, rhrCount = 0;
  doc.querySelectorAll('Record[type="HKQuantityTypeIdentifierRestingHeartRate"]').forEach(r => {
    if (new Date(r.getAttribute('startDate')) >= sevenDaysAgo) {
      rhrSum += parseFloat(r.getAttribute('value')) || 0; rhrCount++;
    }
  });
  if (rhrCount) result.rhr = rhrSum / rhrCount;

  let hrvSum = 0, hrvCount = 0;
  doc.querySelectorAll('Record[type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"]').forEach(r => {
    if (new Date(r.getAttribute('startDate')) >= sevenDaysAgo) {
      hrvSum += parseFloat(r.getAttribute('value')) || 0; hrvCount++;
    }
  });
  if (hrvCount) result.hrv = hrvSum / hrvCount;

  doc.querySelectorAll('Record[type="HKCategoryTypeIdentifierSleepAnalysis"]').forEach(r => {
    const start = new Date(r.getAttribute('startDate'));
    const end   = new Date(r.getAttribute('endDate'));
    if (start >= oneDayAgo) {
      const hours = (end - start) / 1000 / 60 / 60;
      const val = r.getAttribute('value') || '';
      if (val.indexOf('AsleepDeep') !== -1)     result.sleepDeep += hours;
      else if (val.indexOf('AsleepREM') !== -1) result.sleepREM  += hours;
      if (val.indexOf('Asleep') !== -1)         result.sleep     += hours;
    }
  });

  const sleepScore = Math.min(1, result.sleep / 8);
  const hrvScore   = Math.min(1, result.hrv / 80);
  const rhrScore   = Math.max(0, Math.min(1, (75 - result.rhr) / 25));
  result.recovery  = Math.round(((sleepScore * 0.5) + (hrvScore * 0.3) + (rhrScore * 0.2)) * 100);
  return result;
}

function parseAppleHealthJSON(data) {
  const result = {
    sleep:     parseFloat((data && data.sleep && data.sleep.totalHours) || (data && data.sleepHours) || 0),
    sleepDeep: parseFloat((data && data.sleep && data.sleep.deepHours) || 0),
    sleepREM:  parseFloat((data && data.sleep && data.sleep.remHours) || 0),
    steps:     parseFloat((data && data.steps) || (data && data.stepCount) || 0),
    energy:    parseFloat((data && data.activeEnergy) || (data && data.energy) || 0),
    rhr:       parseFloat((data && data.restingHR) || (data && data.rhr) || 0),
    hrv:       parseFloat((data && data.hrv) || 0),
    recovery:  0,
    lastSync:  new Date().toISOString()
  };
  const sleepScore = Math.min(1, result.sleep / 8);
  const hrvScore   = Math.min(1, result.hrv / 80);
  const rhrScore   = Math.max(0, Math.min(1, (75 - result.rhr) / 25));
  result.recovery  = Math.round(((sleepScore * 0.5) + (hrvScore * 0.3) + (rhrScore * 0.2)) * 100);
  return result;
}

function renderHealthMetrics() {
  const h = state.health;
  const status = document.getElementById('health-sync-status');
  if (!h) {
    if (status) status.innerText = 'NO DATA';
    ['sleep', 'steps', 'energy', 'rhr', 'hrv', 'recovery'].forEach(k => {
      const el = document.getElementById('metric-' + k);
      if (el) el.innerText = '--';
    });
    return;
  }
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set('metric-sleep',    h.sleep ? h.sleep.toFixed(1) : '--');
  set('metric-steps',    h.steps ? Math.round(h.steps).toLocaleString() : '--');
  set('metric-energy',   h.energy ? Math.round(h.energy) : '--');
  set('metric-rhr',      h.rhr ? Math.round(h.rhr) : '--');
  set('metric-hrv',      h.hrv ? Math.round(h.hrv) : '--');
  set('metric-recovery', h.recovery ? h.recovery : '--');

  const sleepSub = document.getElementById('metric-sleep-sub');
  if (sleepSub && h.sleepDeep && h.sleepREM)
    sleepSub.innerText = 'Deep ' + h.sleepDeep.toFixed(1) + 'h / REM ' + h.sleepREM.toFixed(1) + 'h';

  const stepsSub = document.getElementById('metric-steps-sub');
  if (stepsSub) {
    const pct = Math.min(100, Math.round((h.steps / 10000) * 100));
    stepsSub.innerText = 'Goal: 10,000 - ' + pct + '%';
  }
  const recSub = document.getElementById('metric-recovery-sub');
  if (recSub) {
    let label = 'POOR';
    if (h.recovery >= 75) label = 'OPTIMAL';
    else if (h.recovery >= 50) label = 'MODERATE';
    recSub.innerText = label;
  }
  if (status) {
    const when = h.lastSync ? new Date(h.lastSync).toLocaleDateString() : 'today';
    status.innerText = 'SYNCED ' + when;
  }
}

function clearHealthData() {
  if (!confirm('Clear imported health data?')) return;
  state.health = null;
  localStorage.removeItem('tolu_health');
  renderHealthMetrics();
}

/* ============================================================
   16. HEVY
   ============================================================ */
function parseHevyCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map(s => s.toLowerCase().trim());
  const idx = (name) => header.indexOf(name);

  const iTitle    = idx('title');
  const iStart    = idx('start_time');
  const iExercise = idx('exercise_title');
  const iWeight   = idx('weight_kg');
  const iReps     = idx('reps');
  const iSetType  = idx('set_type');

  const workouts = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < header.length - 2) continue;
    const title = iTitle >= 0 ? (cols[iTitle] || '').trim() : 'Workout';
    const start = iStart >= 0 ? (cols[iStart] || '').trim() : '';
    const key = title + '|' + start;
    if (!workouts[key]) {
      workouts[key] = { title: title, startTime: start, exercises: {}, totalVolume: 0, totalSets: 0, duration: 0 };
    }
    const ex = iExercise >= 0 ? (cols[iExercise] || '').trim() : 'Exercise';
    if (!workouts[key].exercises[ex]) workouts[key].exercises[ex] = [];
    const weight = iWeight >= 0 ? parseFloat(cols[iWeight]) || 0 : 0;
    const reps   = iReps >= 0 ? parseInt(cols[iReps]) || 0 : 0;
    const setType = iSetType >= 0 ? (cols[iSetType] || 'normal').trim() : 'normal';
    if (weight > 0 && reps > 0) {
      workouts[key].exercises[ex].push({ weight: weight, reps: reps, setType: setType });
      workouts[key].totalVolume += weight * reps;
      workouts[key].totalSets += 1;
    }
  }
  return Object.values(workouts).sort((a, b) => {
    const da = new Date(a.startTime).getTime() || 0;
    const db = new Date(b.startTime).getTime() || 0;
    return db - da;
  });
}

function splitCsvLine(line) {
  const out = []; let cur = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur); return out;
}

async function fetchHevyWorkouts() {
  const inlineKey = document.getElementById('hevy-inline-key');
  const key = (inlineKey && inlineKey.value.trim()) || localStorage.getItem('tolu_hevy_key');
  if (!key) { alert('Hevy API key required.'); return; }
  localStorage.setItem('tolu_hevy_key', key);

  const statusEl = document.getElementById('hevy-sync-status');
  if (statusEl) statusEl.innerText = 'SYNCING...';

  try {
    const all = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch('https://api.hevyapp.com/v1/workouts?page=' + page + '&pageSize=10', {
        headers: { 'api-key': key, 'accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Hevy API error ' + res.status);
      const data = await res.json();
      if (!data.workouts || data.workouts.length === 0) break;
      all.push.apply(all, data.workouts);
      if (page >= (data.page_count || 1)) break;
    }
    state.hevyWorkouts = all.map(normaliseHevyApiWorkout);
    saveState();
    renderHevyUI();
    if (statusEl) statusEl.innerText = 'SYNCED ' + new Date().toLocaleDateString();
  } catch (err) {
    console.error(err);
    alert('Hevy fetch failed: ' + err.message);
    if (statusEl) statusEl.innerText = 'SYNC FAILED';
  }
}

function normaliseHevyApiWorkout(w) {
  let totalVolume = 0, totalSets = 0;
  const exercises = {};
  (w.exercises || []).forEach(ex => {
    exercises[ex.title] = [];
    (ex.sets || []).forEach(s => {
      const weight = parseFloat(s.weight_kg) || 0;
      const reps   = parseInt(s.reps) || 0;
      if (weight > 0 && reps > 0) {
        exercises[ex.title].push({ weight: weight, reps: reps, setType: s.set_type || 'normal' });
        totalVolume += weight * reps;
        totalSets += 1;
      }
    });
  });
  return { title: w.title || 'Workout', startTime: w.start_time || '', endTime: w.end_time || '', exercises: exercises, totalVolume: totalVolume, totalSets: totalSets };
}

function renderHevyUI() {
  const workouts = state.hevyWorkouts || [];
  const totalWorkouts = workouts.length;
  const totalVolume   = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const totalSets     = workouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set('hevy-total-workouts', totalWorkouts.toLocaleString());
  set('hevy-total-volume',   Math.round(totalVolume).toLocaleString());
  set('hevy-total-sets',     totalSets.toLocaleString());

  const lastEl = document.getElementById('hevy-last-session');
  const lastSub = document.getElementById('hevy-last-session-sub');
  if (lastEl && lastSub) {
    if (workouts.length > 0) {
      const last = workouts[0];
      const date = last.startTime ? new Date(last.startTime) : null;
      const daysAgo = date ? Math.floor((Date.now() - date.getTime()) / 86400000) : null;
      lastEl.innerText = daysAgo === 0 ? 'TODAY'
                        : daysAgo === 1 ? '1 DAY AGO'
                        : daysAgo !== null ? daysAgo + ' DAYS AGO' : '--';
      lastSub.innerText = last.title;
    } else {
      lastEl.innerText = '--'; lastSub.innerText = 'No workouts';
    }
  }
  const statusEl = document.getElementById('hevy-sync-status');
  if (statusEl && workouts.length > 0) statusEl.innerText = totalWorkouts + ' WORKOUTS';

  const feed = document.getElementById('hevy-workout-feed');
  const count = document.getElementById('hevy-feed-count');
  if (!feed) return;
  feed.innerHTML = '';
  if (count) count.innerText = workouts.length + ' LOGGED';

  if (workouts.length === 0) {
    feed.innerHTML = '<p class="text-xs text-[#D3D3D3]/50 uppercase tracking-widest font-tech p-3">No workouts yet. Import a CSV or fetch from Hevy.</p>';
    return;
  }
  workouts.slice(0, 15).forEach(w => {
    const exerciseNames = Object.keys(w.exercises || {});
    const date = w.startTime ? new Date(w.startTime).toLocaleDateString() : '';
    const row = document.createElement('div');
    row.className = 'workout-row';
    row.innerHTML =
      '<div class="flex-1 min-w-0">' +
        '<div class="font-bold text-white text-xs truncate">' + escapeHtml(w.title) + '</div>' +
        '<div class="text-[10px] text-[#D3D3D3]/60 truncate">' + exerciseNames.length + ' exercise' + (exerciseNames.length === 1 ? '' : 's') + ' - ' + w.totalSets + ' sets - ' + date + '</div>' +
      '</div>' +
      '<div class="text-right shrink-0">' +
        '<div class="text-[#DC143C] font-tech font-bold text-sm">' + Math.round(w.totalVolume).toLocaleString() + '<span class="text-[9px] ml-1 opacity-70">KG</span></div>' +
        '<div class="text-[9px] text-[#D3D3D3]/50 uppercase tracking-wider">Volume</div>' +
      '</div>';
    feed.appendChild(row);
  });
}

function clearHevyData() {
  if (!confirm('Clear all imported Hevy workouts?')) return;
  state.hevyWorkouts = [];
  localStorage.removeItem('tolu_hevy');
  renderHevyUI();
}

/* ============================================================
   17. VOICE — JARVIS LAYER
   ============================================================ */
let lipSyncTimer = null;

function startLipSync() {
  stopLipSync();
  const mouth = document.getElementById('mouth');
  if (!mouth) return;
  lipSyncTimer = setInterval(() => {
    const open = 4 + Math.random() * 16;
    const tilt = (Math.random() - 0.5) * 4;
    mouth.setAttribute('d', 'M -24 55 Q ' + tilt + ' ' + (60 + open) + ' 24 55');
  }, 75);
}

function stopLipSync() {
  if (lipSyncTimer) clearInterval(lipSyncTimer);
  lipSyncTimer = null;
  const mouth = document.getElementById('mouth');
  if (mouth) mouth.setAttribute('d', 'M -24 55 Q 0 60 24 55');
}

let britishVoice = null;

function pickBritishVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const preferred = [/daniel/i, /arthur/i, /george/i, /oliver/i, /male/i];
  for (const rx of preferred) {
    const v = voices.find(x => x.lang === 'en-GB' && rx.test(x.name));
    if (v) { britishVoice = v; return; }
  }
  britishVoice = voices.find(v => v.lang === 'en-GB')
              || voices.find(v => v.lang.indexOf('en') === 0)
              || voices[0];
}
speechSynthesis.onvoiceschanged = pickBritishVoice;
pickBritishVoice();

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (britishVoice) u.voice = britishVoice;
  u.lang   = 'en-GB';
  u.rate   = 0.94;
  u.pitch  = 0.80;
  u.volume = 1.0;

  u.onstart = () => {
    if (voiceState !== VoiceState.SPEAKING) setVoiceState(VoiceState.SPEAKING);
    startLipSync();
  };

  u.onend = () => {
    stopLipSync();
    if (voiceState === VoiceState.SPEAKING) {
      setTimeout(() => {
        if (voiceState !== VoiceState.SPEAKING) return;
        setVoiceState(VoiceState.DISSOLVING);
        setTimeout(() => {
          if (voiceState === VoiceState.DISSOLVING) {
            setVoiceState(VoiceState.IDLE);
            particles.forEach(p => p.release());
            window.pState = 'AMBIENT';
          }
        }, 700);
      }, 1600);
    }
  };
  speechSynthesis.speak(u);
}

function summonTolu() {
  if (voiceState === VoiceState.SUMMONING || voiceState === VoiceState.SPEAKING || voiceState === VoiceState.WORKING) return;
  assignFaceParticles();
  window.pState = 'AMBIENT';
  setVoiceState(VoiceState.SUMMONING);
}

function dismissTolu() {
  stopLipSync();
  speechSynthesis.cancel();
  setVoiceState(VoiceState.DISSOLVING);
  setTimeout(() => {
    setVoiceState(VoiceState.IDLE);
    particles.forEach(p => p.release());
    window.pState = 'AMBIENT';
  }, 700);
}

function workOnTask(description) {
  stopLipSync();
  speechSynthesis.cancel();
  setVoiceState(VoiceState.DISSOLVING);
  setTimeout(() => {
    setVoiceState(VoiceState.WORKING);
    setTimeout(() => {
      setVoiceState(VoiceState.REMATERIALIZING);
      setTimeout(() => {
        setVoiceState(VoiceState.SPEAKING);
        speak(description);
      }, 1000);
    }, 2600);
  }, 700);
}

function toggleVoice() {
  if (voiceState === VoiceState.IDLE) {
    summonTolu();
  } else {
    dismissTolu();
  }
}

let recognition = null;
let listening   = false;

function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const status = document.getElementById('voice-status');
    if (status) { status.classList.add('active'); status.innerText = 'SPEECH API UNSUPPORTED'; }
    return;
  }
  recognition = new SR();
  recognition.continuous      = true;
  recognition.interimResults  = true;
  recognition.lang            = 'en-GB';

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const phrase = event.results[i][0].transcript.toLowerCase().trim();
      const isFinal = event.results[i].isFinal;

      const wakeWordHit =
        phrase.indexOf('hey tolu') !== -1   ||
        phrase.indexOf('hey toolu') !== -1  ||
        phrase.indexOf('hello tolu') !== -1 ||
        phrase.indexOf('ok tolu') !== -1;

      if (wakeWordHit) {
        if (voiceState === VoiceState.IDLE) summonTolu();
        if (isFinal) {
          const idx = phrase.indexOf('tolu');
          const command = phrase.substring(idx + 4).trim();
          if (command.length > 2) handleCommand(command);
        }
      } else if (isFinal && (voiceState === VoiceState.SPEAKING || voiceState === VoiceState.SUMMONING)) {
        handleCommand(phrase);
      }
    }
  };

  recognition.onerror = (e) => {
    console.warn('Recognition error:', e.error);
    if (e.error === 'not-allowed') {
      const status = document.getElementById('voice-status');
      if (status) { status.classList.add('active'); status.innerText = 'MIC PERMISSION DENIED'; }
    }
  };

  recognition.onend = () => {
    if (listening) { try { recognition.start(); } catch (_) {} }
  };
}

function startListening() {
  if (!recognition) initRecognition();
  if (!recognition) return;
  listening = true;
  try { recognition.start(); } catch (_) {}
  const status = document.getElementById('voice-status');
  if (status) { status.classList.add('active'); status.innerText = 'STANDBY - SAY "HEY T.O.L.U."'; }
}

async function handleCommand(text) {
  const lower = text.toLowerCase();

  if (lower.indexOf('open') !== -1 || lower.indexOf('show') !== -1 || lower.indexOf('go to') !== -1) {
    if (lower.indexOf('career') !== -1)  { switchTab('career');  return speak('Opening career tab.'); }
    if (lower.indexOf('finance') !== -1 || lower.indexOf('money') !== -1 || lower.indexOf('debt') !== -1) { switchTab('finance'); return speak('Opening finance command.'); }
    if (lower.indexOf('fitness') !== -1 || lower.indexOf('body') !== -1 || lower.indexOf('health') !== -1) { switchTab('fitness'); return speak('Opening fitness and body tab.'); }
    if (lower.indexOf('mental') !== -1)  { switchTab('mental');  return speak('Opening mental health tab.'); }
    if (lower.indexOf('core') !== -1 || lower.indexOf('ai') !== -1) { switchTab('braindump'); return speak('Opening AI core.'); }
    if (lower.indexOf('dashboard') !== -1) { switchTab('dashboard'); return speak('Opening dashboard.'); }
  }

  if (lower.indexOf('weather') !== -1) {
    setVoiceState(VoiceState.DISSOLVING);
    setTimeout(async () => {
      setVoiceState(VoiceState.WORKING);
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current_weather=true');
        const data = await res.json();
        const t = data.current_weather.temperature;
        const w = data.current_weather.windspeed;
        setVoiceState(VoiceState.REMATERIALIZING);
        setTimeout(() => speak("It's currently " + t + " degrees in London, with winds of " + w + " kilometres per hour."), 1000);
      } catch (err) {
        setVoiceState(VoiceState.REMATERIALIZING);
        setTimeout(() => speak('I could not reach the weather service.'), 1000);
      }
    }, 700);
    return;
  }

  if (lower.indexOf('bitcoin') !== -1 || lower.indexOf('crypto') !== -1) {
    setVoiceState(VoiceState.DISSOLVING);
    setTimeout(async () => {
      setVoiceState(VoiceState.WORKING);
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp');
        const data = await res.json();
        const price = data.bitcoin.gbp.toLocaleString();
        setVoiceState(VoiceState.REMATERIALIZING);
        setTimeout(() => speak('Bitcoin is currently ' + price + ' pounds.'), 1000);
      } catch (err) {
        setVoiceState(VoiceState.REMATERIALIZING);
        setTimeout(() => speak('I could not reach the price feed.'), 1000);
      }
    }, 700);
    return;
  }

  if (lower.indexOf('health') !== -1 || lower.indexOf('how am i') !== -1 || lower.indexOf('recovery') !== -1) {
    if (!state.health) {
      return speak("I don't have any health data yet. Import an Apple Health export from the Fitness tab.");
    }
    const h = state.health;
    const msg = 'Your recovery score is ' + h.recovery + ' percent. You slept ' + h.sleep.toFixed(1) + ' hours, took ' + Math.round(h.steps) + ' steps, and your resting heart rate is ' + Math.round(h.rhr) + ' beats per minute.';
    workOnTask(msg);
    return;
  }

  if (lower.indexOf('workout') !== -1 || lower.indexOf('hevy') !== -1 || lower.indexOf('gym') !== -1) {
    if (state.hevyWorkouts.length === 0) {
      return speak('No workouts logged yet. Import a Hevy CSV from the Fitness tab.');
    }
    const total = state.hevyWorkouts.length;
    const vol = Math.round(state.hevyWorkouts.reduce((s, w) => s + w.totalVolume, 0));
    const last = state.hevyWorkouts[0];
    const msg = 'You have ' + total + ' workouts logged, totalling ' + vol + ' kilograms of volume. Your most recent session was ' + last.title + '.';
    workOnTask(msg);
    return;
  }

  if (lower.indexOf('debt') !== -1 || lower.indexOf('money') !== -1 || lower.indexOf('owe') !== -1 || lower.indexOf('net worth') !== -1) {
    const total = finTotalDebt();
    const nw = finNetWorth();
    const months = finEstMonths();
    const msg = 'Total debt is ' + finMoney(total) + '. Net worth is ' + finMoney(nw) + '. At your current pace, you will be debt free in approximately ' + (months === '∞' ? 'no time soon' : months + ' months') + '.';
    workOnTask(msg);
    return;
  }

  speak("I heard you, but I'm not sure what you'd like me to do. Try 'Hey T.O.L.U., check the weather' or 'open finance tab'.");
}

/* ============================================================
   18. FINANCE MODULE
   ============================================================ */
function finTotalDebt() {
  return state.finance.accounts.reduce((s, a) => s + Math.max(0, a.balance), 0);
}
function finNetWorth() {
  return state.finance.cash - finTotalDebt();
}
function finMonthlyIncome() {
  const dailyRate = state.finance.income.dailyRate;
  const daysPerWeek = state.finance.income.daysPerWeek;
  return dailyRate * daysPerWeek * 4.33;
}
function finMonthlySurplus() {
  const inc = finMonthlyIncome();
  return Math.max(0, inc - state.finance.expenses.tfl - state.finance.expenses.snacks);
}
function finEstMonths() {
  const s = finMonthlySurplus();
  if (s <= 0) return '∞';
  return Math.ceil(finTotalDebt() / s);
}
function finMoney(n) {
  const sign = n < 0 ? '-' : '';
  return sign + '£' + Math.abs(n).toLocaleString('en-GB', { maximumFractionDigits: 2 });
}
function finLevelForXP(xp) {
  if (xp < 500)    return { name: 'Debt Rookie',      next: 500 };
  if (xp < 1500)   return { name: 'Debt Slayer',      next: 1500 };
  if (xp < 3000)   return { name: 'Debt Boss',        next: 3000 };
  if (xp < 5000)   return { name: 'Debt Destroyer',   next: 5000 };
  return                  { name: 'Debt Free Legend', next: 10000 };
}

function finAddXP(amount) {
  state.finance.xp = (state.finance.xp || 0) + amount;
  saveState();
}

function renderFinance() {
  renderFinanceHero();
  renderIncomeSimulator();
  renderFinanceAccounts();
  renderFinancePlanner();
  renderFinanceChart();
  renderFinanceXP();
  renderFinanceCheckins();

  const d = document.getElementById('fin-checkin-date');
  if (d) d.innerText = new Date().toDateString();
}

function renderFinanceHero() {
  const total = finTotalDebt();
  const nw = finNetWorth();
  const surplus = finMonthlySurplus();
  const months = finEstMonths();

  const nwEl = document.getElementById('fin-net-worth');
  if (nwEl) {
    nwEl.innerText = finMoney(nw);
    nwEl.className = 'metric-value ' + (nw >= 0 ? 'text-emerald-400' : 'text-white');
  }

  const tdEl = document.getElementById('fin-total-debt');
  if (tdEl) tdEl.innerText = finMoney(total);

  const spEl = document.getElementById('fin-surplus');
  if (spEl) spEl.innerText = finMoney(surplus);

  const mEl = document.getElementById('fin-months');
  if (mEl) mEl.innerText = months === '∞' ? '--' : months + ' mo';

  const originalTotal = state.finance.accounts.reduce((s, a) => s + a.originalBalance, 0);
  const paid = Math.max(0, originalTotal - total);
  const pct = originalTotal > 0 ? (paid / originalTotal) * 100 : 0;

  const bar = document.getElementById('fin-progress-bar');
  if (bar) bar.style.width = pct.toFixed(1) + '%';

  const pctEl = document.getElementById('fin-progress-pct');
  if (pctEl) pctEl.innerText = pct.toFixed(1) + '%';
}

function renderIncomeSimulator() {
  const dailyRate = state.finance.income.dailyRate;
  const daysPerWeek = state.finance.income.daysPerWeek;
  const income = finMonthlyIncome();

  const slider = document.getElementById('fin-days-slider');
  const daysLabel = document.getElementById('fin-days-value');
  const rateInput = document.getElementById('fin-daily-rate');

  if (slider && +slider.value !== daysPerWeek) slider.value = daysPerWeek;
  if (daysLabel) daysLabel.innerText = daysPerWeek;
  if (rateInput && +rateInput.value !== dailyRate) rateInput.value = dailyRate;

  const incEl = document.getElementById('fin-income');
  if (incEl) incEl.innerText = '£' + Math.round(income).toLocaleString();

  const daysEl = document.getElementById('fin-income-days');
  if (daysEl) daysEl.innerText = '~' + (daysPerWeek * 4.33).toFixed(1) + ' days';

  const tflEl = document.getElementById('fin-tfl');
  if (tflEl) tflEl.innerText = state.finance.expenses.tfl.toFixed(2);
  const snEl = document.getElementById('fin-snacks');
  if (snEl) snEl.innerText = state.finance.expenses.snacks;

  const availEl = document.getElementById('fin-available');
  if (availEl) availEl.innerText = '£' + Math.round(finMonthlySurplus()).toLocaleString();
}

function renderFinanceAccounts() {
  const wrap = document.getElementById('fin-accounts-list');
  if (!wrap) return;
  wrap.innerHTML = '';

  const sorted = state.finance.accounts.slice().sort((a, b) => a.priority - b.priority);
  const cntEl = document.getElementById('fin-account-count');
  if (cntEl) cntEl.innerText = sorted.length + ' ACCOUNTS';

  sorted.forEach(acc => {
    const cleared = acc.balance <= 0;
    const paidPct = acc.originalBalance > 0
      ? Math.min(100, ((acc.originalBalance - Math.max(0, acc.balance)) / acc.originalBalance) * 100)
      : 0;

    const card = document.createElement('div');
    card.className = 'account-card' + (cleared ? ' cleared' : '');
    card.innerHTML =
      '<div class="account-priority">' + acc.priority + '</div>' +
      '<div class="account-name">' + escapeHtml(acc.name) + '</div>' +
      '<div class="account-type">' + escapeHtml(acc.type) + ' - ' + escapeHtml(acc.note) + '</div>' +
      '<div class="flex items-end justify-between mt-3 gap-3">' +
        '<div class="account-balance ' + (cleared ? 'clear' : '') + '">' +
          (cleared ? '£0.00' : finMoney(acc.balance)) +
        '</div>' +
        '<div class="text-[10px] font-tech uppercase tracking-widest text-[#D3D3D3]/60 text-right">' +
          'of ' + finMoney(acc.originalBalance) + '<br>' +
          '<span class="text-[#DC143C]">' + paidPct.toFixed(0) + '% paid</span>' +
        '</div>' +
      '</div>' +
      '<div class="account-bar mt-3">' +
        '<div class="account-bar-fill ' + (cleared ? 'clear' : '') + '" style="width:' + paidPct + '%"></div>' +
      '</div>' +
      '<div class="flex gap-2 mt-3">' +
        '<input type="number" min="0" step="0.01" placeholder="£ payment" id="pay-' + acc.id + '" class="flex-1 !text-[11px] !py-1.5">' +
        '<button onclick="finApplyPayment(\'' + acc.id + '\')" class="px-3 py-1.5 text-[10px] font-tech uppercase bg-[#DC143C]/20 border border-[#DC143C]/50 rounded hover:bg-[#DC143C]/40 transition-all text-white cursor-pointer">Pay</button>' +
      '</div>';
    wrap.appendChild(card);
  });
}

function finApplyPayment(accountId) {
  const input = document.getElementById('pay-' + accountId);
  if (!input) return;
  const amount = parseFloat(input.value);
  if (!amount || amount <= 0) return;

  const acc = state.finance.accounts.find(a => a.id === accountId);
  if (!acc) return;

  const before = acc.balance;
  acc.balance = Math.max(0, acc.balance - amount);
  input.value = '';

  finAddXP(50);
  if (amount > 100) finAddXP(100);
  if (before > 0 && acc.balance === 0) finAddXP(500);

  saveState();
  renderFinance();
}

function renderFinancePlanner() {
  const wrap = document.getElementById('fin-planner');
  if (!wrap) return;
  wrap.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'planner-header';
  header.innerHTML =
    '<span>Month</span>' +
    '<span style="text-align:right">Cap1</span>' +
    '<span style="text-align:right">Rent</span>' +
    '<span style="text-align:right">NatWest</span>' +
    '<span style="text-align:right">Small</span>';
  wrap.appendChild(header);

  state.finance.planner.forEach((row, idx) => {
    const el = document.createElement('div');
    el.className = 'planner-row';
    const cap1 = row.payments['capital-one'] || 0;
    const rent = row.payments['rent'] || 0;
    const nat = row.payments['natwest'] || 0;
    const small = (row.payments['metro'] || 0) + (row.payments['other'] || 0);
    el.innerHTML =
      '<span class="month-label">' + escapeHtml(row.month) + '</span>' +
      '<input type="number" min="0" step="0.01" value="' + cap1 + '" onchange="finUpdatePlan(' + idx + ', \'capital-one\', this.value)">' +
      '<input type="number" min="0" step="0.01" value="' + rent + '" onchange="finUpdatePlan(' + idx + ', \'rent\', this.value)">' +
      '<input type="number" min="0" step="0.01" value="' + nat + '" onchange="finUpdatePlan(' + idx + ', \'natwest\', this.value)">' +
      '<input type="number" min="0" step="0.01" value="' + small + '" onchange="finUpdatePlan(' + idx + ', \'small\', this.value)">';
    wrap.appendChild(el);
  });
}

function finUpdatePlan(idx, key, value) {
  const row = state.finance.planner[idx];
  if (!row) return;
  const v = parseFloat(value) || 0;

  if (key === 'small') {
    row.payments['metro'] = v / 2;
    row.payments['other'] = v / 2;
  } else {
    row.payments[key] = v;
  }
  saveState();
  renderFinanceChart();
}

function finAddMonth() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const last = state.finance.planner[state.finance.planner.length - 1];
  if (!last) {
    state.finance.planner.push({
      month: 'Oct 2026',
      payments: { 'capital-one': 300, 'rent': 86.25, 'natwest': 0, 'metro': 0, 'other': 0 }
    });
  } else {
    const parts = last.month.split(' ');
    let mIdx = months.indexOf(parts[0]);
    let year = parseInt(parts[1]);
    mIdx = (mIdx + 1) % 12;
    if (mIdx === 0) year++;
    state.finance.planner.push({
      month: months[mIdx] + ' ' + year,
      payments: { 'capital-one': 0, 'rent': 0, 'natwest': 0, 'metro': 0, 'other': 0 }
    });
  }
  saveState();
  renderFinancePlanner();
  renderFinanceChart();
}

function renderFinanceChart() {
  const svg = document.getElementById('fin-chart');
  if (!svg) return;

  const surplus = finMonthlySurplus();
  let total = finTotalDebt();
  const points = [total];
  for (let m = 0; m < 12; m++) {
    total = Math.max(0, total - surplus);
    points.push(total);
    if (total === 0) {
      while (points.length < 13) points.push(0);
      break;
    }
  }

  const max = Math.max.apply(null, points.concat([1]));
  const Wc = 400, Hc = 220;
  const padX = 10, padY = 10;
  const innerW = Wc - padX * 2;
  const innerH = Hc - padY * 2;

  const coords = points.map((v, i) => ({
    x: padX + (i / (points.length - 1)) * innerW,
    y: padY + (1 - v / max) * innerH
  }));

  const line = coords.map((c, i) => (i === 0 ? 'M ' + c.x + ' ' + c.y : 'L ' + c.x + ' ' + c.y)).join(' ');
  const area = line + ' L ' + coords[coords.length - 1].x + ' ' + (Hc - padY) + ' L ' + coords[0].x + ' ' + (Hc - padY) + ' Z';

  svg.innerHTML =
    '<defs>' +
      '<linearGradient id="finChartGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#DC143C" stop-opacity="0.5"/>' +
        '<stop offset="100%" stop-color="#DC143C" stop-opacity="0"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="' + area + '" fill="url(#finChartGrad)"/>' +
    '<path d="' + line + '" fill="none" stroke="#DC143C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="filter: drop-shadow(0 0 6px rgba(220,20,60,0.8))"/>' +
    coords.map((c, i) => i % 2 === 0 ? '<circle cx="' + c.x + '" cy="' + c.y + '" r="2.5" fill="#DC143C"/>' : '').join('');
}

function renderFinanceXP() {
  const xp = state.finance.xp || 0;
  const lvl = finLevelForXP(xp);

  const xpEl = document.getElementById('fin-xp');
  if (xpEl) xpEl.innerText = xp.toLocaleString();

  const lvlEl = document.getElementById('fin-level');
  if (lvlEl) lvlEl.innerText = lvl.name;

  const bar = document.getElementById('fin-xp-bar');
  if (bar) {
    const pct = Math.min(100, (xp / lvl.next) * 100);
    bar.style.width = pct + '%';
  }

  const nextEl = document.getElementById('fin-xp-next');
  if (nextEl) nextEl.innerText = (lvl.next - xp).toLocaleString() + ' to next';

  const streakEl = document.getElementById('fin-streak');
  if (streakEl) streakEl.innerText = (state.finance.streak || 0) + ' day streak';
}

function finLogDay() {
  const workedEl = document.getElementById('fin-worked');
  const spentEl = document.getElementById('fin-spent');
  const paidEl = document.getElementById('fin-paid-today');

  const worked = workedEl && workedEl.value === 'yes';
  const spent = spentEl ? (parseFloat(spentEl.value) || 0) : 0;
  const paid = paidEl ? (parseFloat(paidEl.value) || 0) : 0;

  let xp = 10;
  if (worked) xp += 20;
  if (paid > 0) xp += 50;
  if (paid > 100) xp += 100;
  if (spent === 0) xp += 25;

  const entry = {
    date: new Date().toISOString(),
    worked: worked,
    spent: spent,
    paid: paid,
    xp: xp
  };
  state.finance.checkins.unshift(entry);
  if (state.finance.checkins.length > 60) state.finance.checkins.pop();

  const today = new Date().toDateString();
  const lastDate = state.finance._lastCheckinDate;
  if (lastDate !== today) {
    const yest = new Date(Date.now() - 86400000).toDateString();
    state.finance.streak = (lastDate === yest) ? (state.finance.streak || 0) + 1 : 1;
    state.finance._lastCheckinDate = today;
  }

  if (paid > 0) {
    const sorted = state.finance.accounts.slice()
      .filter(a => a.balance > 0)
      .sort((a, b) => a.priority - b.priority);
    if (sorted[0]) {
      const acc = sorted[0];
      const before = acc.balance;
      acc.balance = Math.max(0, acc.balance - paid);
      if (before > 0 && acc.balance === 0) xp += 500;
    }
  }

  finAddXP(xp);

  if (spentEl) spentEl.value = '0';
  if (paidEl) paidEl.value = '0';
  if (workedEl) workedEl.value = 'no';

  saveState();
  renderFinance();
}

function renderFinanceCheckins() {
  const feed = document.getElementById('fin-checkin-feed');
  if (!feed) return;
  feed.innerHTML = '';

  if (!state.finance.checkins.length) {
    feed.innerHTML = '<p class="text-[10px] text-[#D3D3D3]/50 uppercase tracking-widest font-tech p-3">No check-ins yet.</p>';
    return;
  }

  state.finance.checkins.slice(0, 20).forEach(c => {
    const d = new Date(c.date);
    const el = document.createElement('div');
    el.className = 'checkin-row';
    el.innerHTML =
      '<span class="text-[#D3D3D3]/70">' + d.toLocaleDateString() + ' - ' + (c.worked ? 'WORKED' : 'REST') + '</span>' +
      '<span class="text-[#DC143C] font-bold">+' + c.xp + ' XP</span>' +
      '<span class="text-[#D3D3D3]/50">£' + c.spent.toFixed(2) + ' spent - £' + c.paid.toFixed(2) + ' paid</span>';
    feed.appendChild(el);
  });
}

/* ============================================================
   19. UTILITIES
   ============================================================ */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   20. INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  // Wire health + hevy file inputs
  const healthFileInput = document.getElementById('health-file-input');
  if (healthFileInput) {
    healthFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        let parsed;
        if (/\.json$/i.test(file.name) || text.trim().charAt(0) === '{') {
          parsed = parseAppleHealthJSON(JSON.parse(text));
        } else {
          parsed = parseAppleHealthXML(text);
        }
        state.health = parsed;
        saveState();
        renderHealthMetrics();
      } catch (err) {
        console.error(err);
        alert('Failed to parse Apple Health file: ' + err.message);
      } finally {
        e.target.value = '';
      }
    });
  }

  const hevyCsvInput = document.getElementById('hevy-csv-input');
  if (hevyCsvInput) {
    hevyCsvInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        state.hevyWorkouts = parseHevyCSV(text);
        saveState();
        renderHevyUI();
      } catch (err) {
        console.error(err);
        alert('Failed to parse Hevy CSV: ' + err.message);
      } finally {
        e.target.value = '';
      }
    });
  }

  const inlineKey = document.getElementById('hevy-inline-key');
  if (inlineKey) {
    const saved = localStorage.getItem('tolu_hevy_key');
    if (saved) inlineKey.value = saved;
  }

  // Wire finance sliders
  const slider = document.getElementById('fin-days-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      state.finance.income.daysPerWeek = parseInt(e.target.value);
      saveState();
      renderFinance();
    });
  }
  const rateInput = document.getElementById('fin-daily-rate');
  if (rateInput) {
    rateInput.addEventListener('change', (e) => {
      state.finance.income.dailyRate = parseFloat(e.target.value) || 50;
      saveState();
      renderFinance();
    });
  }

  // Prime all panels
  updateStreakOnLoad();
  renderHeaderStats();
  initDashboard();
  updateTimerDisplay();
  switchTab('dashboard');
  renderHealthMetrics();
  renderHevyUI();
  renderBodyFitnessItems();
  renderFinance();

  // Boot voice layer
  startListening();
});
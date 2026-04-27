// ─── Data Store ───────────────────────────────────────────────────────────────
const COLORS = ['#22c9a0','#4d9de0','#f5a623','#9b7fee','#e85c5c','#5de0b3'];
const EMOJIS = ['💊','💉','🫀','🧬','🩺','🔬'];

let medications = [
  {
    id: 1, name: 'Metformin', dose: '500mg', freq: 'twice',
    times: ['08:00','20:00'], food: 'With food',
    pills: 18, totalPills: 30, notes: 'For type 2 diabetes management',
    color: '#22c9a0', emoji: '💊'
  },
  {
    id: 2, name: 'Lisinopril', dose: '10mg', freq: 'once',
    times: ['09:00'], food: 'Any time',
    pills: 25, totalPills: 30, notes: 'ACE inhibitor for blood pressure',
    color: '#4d9de0', emoji: '💊'
  },
  {
    id: 3, name: 'Atorvastatin', dose: '20mg', freq: 'once',
    times: ['21:00'], food: 'After food',
    pills: 8, totalPills: 30, notes: 'Statin for cholesterol control',
    color: '#f5a623', emoji: '💊'
  },
  {
    id: 4, name: 'Vitamin D3', dose: '2000 IU', freq: 'once',
    times: ['08:00'], food: 'With food',
    pills: 45, totalPills: 60, notes: 'Bone health supplement',
    color: '#9b7fee', emoji: '💊'
  },
  {
    id: 5, name: 'Aspirin', dose: '75mg', freq: 'once',
    times: ['09:00'], food: 'After food',
    pills: 60, totalPills: 90, notes: 'Antiplatelet therapy',
    color: '#e85c5c', emoji: '💊'
  },
];

// Today's schedule: key = "medId-timeStr", value = "taken"|"pending"|"missed"
let todayDoses = {};

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Mock weekly adherence data
const weeklyData = {
  1: ['taken','taken','taken','missed','taken','taken','pending'],
  2: ['taken','taken','missed','taken','taken','taken','pending'],
  3: ['taken','taken','taken','taken','taken','missed','pending'],
  4: ['taken','taken','taken','taken','taken','taken','pending'],
  5: ['taken','missed','taken','taken','taken','taken','pending'],
};

let chatHistory = [];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDateDisplay();
  initTodayDoses();
  renderAll();
  setupNav();
  setupChat();
  scheduleReminderCheck();
  startClock();
});

function setDateDisplay() {
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('today-date').textContent = now.toLocaleDateString('en-IN', opts);
}

function initTodayDoses() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  medications.forEach(med => {
    med.times.forEach(t => {
      const [h, m] = t.split(':').map(Number);
      const doseMinutes = h * 60 + m;
      const key = `${med.id}-${t}`;
      if (!todayDoses[key]) {
        if (doseMinutes < currentMinutes - 30) {
          // Past by more than 30 min with ~60% taken
          todayDoses[key] = Math.random() > 0.35 ? 'taken' : 'missed';
        } else if (doseMinutes <= currentMinutes + 30) {
          todayDoses[key] = 'pending';
        } else {
          todayDoses[key] = 'upcoming';
        }
      }
    });
  });
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ─── Render All ───────────────────────────────────────────────────────────────
function renderAll() {
  renderStats();
  renderDoseList();
  renderUpcoming();
  renderStockAlerts();
  renderTimeline();
  renderMedGrid();
  renderAdherence();
  renderChatChips();
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function renderStats() {
  const doses = getAllTodayDoses();
  const taken = doses.filter(d => d.status === 'taken').length;
  const missed = doses.filter(d => d.status === 'missed').length;
  const pending = doses.filter(d => d.status === 'pending' || d.status === 'upcoming').length;
  const total = doses.length;

  document.getElementById('stat-taken').textContent = taken;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-missed').textContent = missed;
  document.getElementById('stat-streak').textContent = '12';

  const pct = total ? Math.round(taken / total * 100) : 0;
  document.getElementById('taken-bar').style.width = pct + '%';
  document.getElementById('pending-bar').style.width = (total ? Math.round(pending/total*100) : 0) + '%';
  document.getElementById('missed-bar').style.width = (total ? Math.round(missed/total*100) : 0) + '%';
  document.getElementById('streak-bar').style.width = '80%';

  document.getElementById('today-progress').textContent = `${taken} / ${total}`;

  const badge = document.getElementById('overall-status');
  if (pct >= 80) {
    badge.textContent = '✓ On track today';
    badge.style.cssText = 'background:rgba(34,201,160,0.12);color:#22c9a0;border:1px solid rgba(34,201,160,0.2);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;';
  } else if (missed > 0) {
    badge.textContent = '⚠ Doses missed';
    badge.style.cssText = 'background:rgba(232,92,92,0.12);color:#e85c5c;border:1px solid rgba(232,92,92,0.2);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;';
  } else {
    badge.textContent = '○ Pending doses';
    badge.style.cssText = 'background:rgba(245,166,35,0.12);color:#f5a623;border:1px solid rgba(245,166,35,0.2);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;';
  }
}

function getAllTodayDoses() {
  const result = [];
  medications.forEach(med => {
    med.times.forEach(t => {
      result.push({ med, time: t, status: todayDoses[`${med.id}-${t}`] || 'upcoming' });
    });
  });
  result.sort((a, b) => a.time.localeCompare(b.time));
  return result;
}

// ─── Dose List ────────────────────────────────────────────────────────────────
function renderDoseList() {
  const doses = getAllTodayDoses();
  const list = document.getElementById('dose-list');

  list.innerHTML = doses.map(({ med, time, status }) => {
    const fmt = formatTime(time);
    let actionHtml = '';
    if (status === 'pending') {
      actionHtml = `<button class="dose-action take" onclick="markDose(${med.id},'${time}','taken')">Take now</button>`;
    } else if (status === 'upcoming') {
      actionHtml = `<span class="dose-status status-upcoming">Upcoming</span>`;
    } else if (status === 'taken') {
      actionHtml = `<span class="dose-status status-taken">✓ Taken</span>`;
    } else if (status === 'missed') {
      actionHtml = `<button class="dose-action missed-btn" onclick="markDose(${med.id},'${time}','taken')">Mark taken</button>`;
    }
    const statusClass = status === 'pending' ? 'status-pending' : '';
    return `
      <div class="dose-item" id="dose-${med.id}-${time.replace(':','')}">
        <div class="dose-dot" style="background:${med.color}"></div>
        <div class="dose-info">
          <div class="dose-name">${med.name} <span style="color:var(--text2);font-weight:400">${med.dose}</span></div>
          <div class="dose-detail">${med.food} · ${med.notes}</div>
        </div>
        <span class="dose-time" style="color:${med.color}">${fmt}</span>
        ${actionHtml}
      </div>`;
  }).join('');
}

function markDose(medId, time, status) {
  const key = `${medId}-${time}`;
  todayDoses[key] = status;
  const med = medications.find(m => m.id === medId);
  if (med && status === 'taken') {
    med.pills = Math.max(0, med.pills - 1);
    showToast(`✓ ${med.name} marked as taken`, 'success');
  }
  renderAll();
}

// ─── Upcoming ─────────────────────────────────────────────────────────────────
function renderUpcoming() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = [];

  medications.forEach(med => {
    med.times.forEach(t => {
      const [h, m] = t.split(':').map(Number);
      const doseMin = h * 60 + m;
      if (doseMin > currentMinutes) {
        upcoming.push({ med, time: t, minutesLeft: doseMin - currentMinutes });
      }
    });
  });

  upcoming.sort((a, b) => a.minutesLeft - b.minutesLeft);
  const top5 = upcoming.slice(0, 5);

  document.getElementById('upcoming-list').innerHTML = top5.map(({ med, time, minutesLeft }) => {
    const hrs = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;
    const left = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
    return `<div class="upcoming-item">
      <div class="upcoming-dot" style="background:${med.color}"></div>
      <span class="upcoming-name">${med.name} ${med.dose}</span>
      <span class="upcoming-time">${formatTime(time)} · ${left}</span>
    </div>`;
  }).join('') || '<p style="color:var(--text3);font-size:13px;">No more doses today 🎉</p>';
}

// ─── Stock Alerts ─────────────────────────────────────────────────────────────
function renderStockAlerts() {
  const lowStock = medications.filter(m => m.pills <= 15);
  const el = document.getElementById('stock-alerts');
  if (!lowStock.length) {
    el.innerHTML = '<p style="font-size:12.5px;color:var(--text3);">All medications well stocked.</p>';
    return;
  }
  el.innerHTML = lowStock.map(med => {
    const critical = med.pills <= 5;
    return `<div class="stock-item ${critical ? 'critical' : ''}">
      <span class="stock-icon">${critical ? '🔴' : '🟡'}</span>
      <div class="stock-text">
        <div style="font-size:12.5px;font-weight:500;">${med.name}</div>
        <div style="font-size:11px;color:var(--text2)">${med.pills} pills remaining</div>
      </div>
      <span class="stock-days">${critical ? 'Critical!' : `~${med.pills} days`}</span>
    </div>`;
  }).join('');
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function renderTimeline() {
  const doses = getAllTodayDoses();
  const tl = document.getElementById('timeline');

  tl.innerHTML = `<div class="timeline-track"></div>` + doses.map(({ med, time, status }) => {
    const dotColor = status === 'taken' ? '#22c9a0' : status === 'missed' ? '#e85c5c' : status === 'pending' ? '#f5a623' : '#4d9de0';
    const cardClass = status === 'taken' ? 'taken' : status === 'missed' ? 'missed' : status === 'pending' ? 'pending' : '';
    const badge = status === 'taken'
      ? '<span class="dose-status status-taken">✓ Taken</span>'
      : status === 'missed'
        ? '<span class="dose-status status-missed">Missed</span>'
        : status === 'pending'
          ? `<button class="dose-action take" onclick="markDose(${med.id},'${time}','taken');switchToTab('dashboard')">Take now</button>`
          : '<span class="dose-status status-upcoming">Upcoming</span>';

    return `
      <div class="timeline-block">
        <div class="timeline-time">${formatTime(time)}</div>
        <div class="timeline-dot" style="border-color:${dotColor};background:var(--bg)"></div>
        <div class="timeline-card ${cardClass}">
          <div class="dose-dot" style="background:${med.color};width:10px;height:10px;border-radius:50%;"></div>
          <div class="timeline-med">
            <div class="timeline-med-name">${med.name} — ${med.dose}</div>
            <div class="timeline-med-detail">${med.food} · ${med.notes}</div>
          </div>
          ${badge}
        </div>
      </div>`;
  }).join('');
}

function switchToTab(tab) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ─── Medication Grid ──────────────────────────────────────────────────────────
function renderMedGrid() {
  const grid = document.getElementById('med-grid');
  grid.innerHTML = medications.map(med => {
    const pct = Math.round(med.pills / med.totalPills * 100);
    const barColor = pct > 40 ? med.color : pct > 20 ? '#f5a623' : '#e85c5c';
    const times = med.times.map(formatTime).join(', ');

    return `
      <div class="med-card">
        <div class="med-card-top">
          <div class="med-pill-icon" style="background:${med.color}22">${med.emoji}</div>
          <button class="med-card-menu" onclick="deleteMed(${med.id})">✕ remove</button>
        </div>
        <div class="med-name">${med.name}</div>
        <div class="med-dose">${med.dose}</div>
        <div class="med-tags">
          <span class="med-tag">${freqLabel(med.freq)}</span>
          <span class="med-tag">${med.food}</span>
          <span class="med-tag">${times}</span>
        </div>
        <div class="med-refill-bar">
          <div class="med-refill-label">
            <span>Stock</span>
            <span style="color:${barColor}">${med.pills} / ${med.totalPills} pills</span>
          </div>
          <div class="med-refill-track">
            <div class="med-refill-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
        </div>
        ${med.notes ? `<div style="font-size:11.5px;color:var(--text3);margin-top:10px;">${med.notes}</div>` : ''}
      </div>`;
  }).join('');
}

function deleteMed(id) {
  if (!confirm('Remove this medication?')) return;
  medications = medications.filter(m => m.id !== id);
  Object.keys(todayDoses).forEach(k => { if (k.startsWith(id + '-')) delete todayDoses[k]; });
  renderAll();
  showToast('Medication removed', 'warning');
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearForm();
}
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function clearForm() {
  ['f-name','f-dose','f-time','f-pills','f-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'f-time' ? '08:00' : '';
  });
}

function addMedication() {
  const name = document.getElementById('f-name').value.trim();
  const dose = document.getElementById('f-dose').value.trim();
  if (!name || !dose) { showToast('Please fill in name and dosage', 'warning'); return; }

  const freq = document.getElementById('f-freq').value;
  const time = document.getElementById('f-time').value;
  const food = document.getElementById('f-food').value;
  const pills = parseInt(document.getElementById('f-pills').value) || 30;
  const notes = document.getElementById('f-notes').value.trim();

  let times = [time];
  if (freq === 'twice') {
    const [h, m] = time.split(':').map(Number);
    const h2 = (h + 12) % 24;
    times.push(`${String(h2).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  } else if (freq === 'thrice') {
    const [h, m] = time.split(':').map(Number);
    times.push(`${String((h+8)%24).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    times.push(`${String((h+16)%24).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }

  const newMed = {
    id: Date.now(), name, dose, freq, times, food,
    pills, totalPills: pills, notes,
    color: COLORS[medications.length % COLORS.length],
    emoji: '💊'
  };
  medications.push(newMed);

  // Init today doses
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  times.forEach(t => {
    const [h, m] = t.split(':').map(Number);
    todayDoses[`${newMed.id}-${t}`] = (h*60+m) < currentMin ? 'pending' : 'upcoming';
  });

  closeModalDirect();
  renderAll();
  showToast(`✓ ${name} added to your medications`, 'success');
}

// ─── Adherence ────────────────────────────────────────────────────────────────
function renderAdherence() {
  // Weekly chart
  const wc = document.getElementById('weekly-chart');
  const headerRow = `<div class="adh-header">
    <div></div>
    ${WEEK_DAYS.map(d => `<div class="adh-day-label">${d}</div>`).join('')}
  </div>`;

  const rows = medications.map(med => {
    const days = weeklyData[med.id] || Array(7).fill('future');
    return `<div class="adherence-row">
      <div class="adherence-med-name">${med.name}</div>
      ${days.map(s => {
        const cls = s === 'taken' ? 'adh-taken' : s === 'missed' ? 'adh-missed' : s === 'partial' ? 'adh-partial' : 'adh-future';
        const txt = s === 'taken' ? '✓' : s === 'missed' ? '✕' : s === 'partial' ? '~' : '·';
        return `<div class="adh-day ${cls}" title="${s}">${txt}</div>`;
      }).join('')}
    </div>`;
  }).join('');

  wc.innerHTML = headerRow + rows;

  // Monthly heatmap
  const mg = document.getElementById('month-grid');
  const daysInMonth = 26; // April so far
  let monthHtml = '';
  for (let i = 1; i <= daysInMonth; i++) {
    const pct = Math.random();
    let bg, color;
    if (i > 25) { bg = '#1a1e28'; color = '#5a5f72'; }
    else if (pct > 0.85) { bg = 'rgba(232,92,92,0.15)'; color = '#e85c5c'; }
    else if (pct > 0.6) { bg = 'rgba(245,166,35,0.15)'; color = '#f5a623'; }
    else { bg = 'rgba(34,201,160,0.15)'; color = '#22c9a0'; }
    monthHtml += `<div class="month-day" style="background:${bg};color:${color}" title="April ${i}">${i}</div>`;
  }
  mg.innerHTML = monthHtml;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
const CHAT_CHIPS = [
  'Side effects of Metformin',
  'Can I skip a dose?',
  'Best time to take statins',
  'Drug interactions check',
  'How to improve adherence?',
  'What is Lisinopril for?',
];

function renderChatChips() {
  document.getElementById('chat-chips').innerHTML = CHAT_CHIPS
    .map(c => `<button class="chip" onclick="sendChip('${c}')">${c}</button>`)
    .join('');
}

function setupChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  sendBtn.addEventListener('click', sendChat);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
}

function sendChip(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendBubble('user', text);
  const typingId = appendTyping();

  const medSummary = medications.map(m =>
    `${m.name} ${m.dose} (${freqLabel(m.freq)}, ${m.food})`
  ).join('; ');

  const systemPrompt = `You are a knowledgeable and caring medication assistant. The patient is taking: ${medSummary}. 
Give clear, practical, and empathetic advice about medications, side effects, interactions, and adherence. 
Keep answers concise (2-4 sentences). Always recommend consulting a doctor for serious concerns.
Never provide dosage changes without doctor consultation.`;

  chatHistory.push({ role: 'user', content: text });

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: chatHistory.slice(-10)
      })
    });
    const data = await resp.json();
    const reply = data.content?.find(c => c.type === 'text')?.text || 'Sorry, I could not process that. Please try again.';
    chatHistory.push({ role: 'assistant', content: reply });
    removeTyping(typingId);
    appendBubble('assistant', reply);
  } catch (err) {
    removeTyping(typingId);
    appendBubble('assistant', 'I\'m having trouble connecting right now. Please check your connection and try again.');
  }
}

function appendBubble(role, text) {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.innerHTML = `
    <div class="bubble-avatar">${role === 'assistant' ? 'AI' : 'RK'}</div>
    <div class="bubble-text">${escapeHtml(text)}</div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function appendTyping() {
  const win = document.getElementById('chat-window');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-bubble assistant';
  div.id = id;
  div.innerHTML = `<div class="bubble-avatar">AI</div>
    <div class="bubble-text" style="color:var(--text2)">
      <span class="typing-dot">●</span> <span class="typing-dot">●</span> <span class="typing-dot">●</span>
    </div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── Reminder Check ───────────────────────────────────────────────────────────
function scheduleReminderCheck() {
  setInterval(() => {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    medications.forEach(med => {
      med.times.forEach(t => {
        const [h, m] = t.split(':').map(Number);
        const doseMin = h * 60 + m;
        const key = `${med.id}-${t}`;
        // When a dose becomes due (within 1 minute window)
        if (Math.abs(doseMin - currentMin) === 0 && todayDoses[key] === 'upcoming') {
          todayDoses[key] = 'pending';
          showToast(`⏰ Time to take ${med.name} ${med.dose}`, 'warning');
          renderAll();
        }
        // Auto-mark as missed after 45 min
        if (doseMin < currentMin - 45 && todayDoses[key] === 'pending') {
          todayDoses[key] = 'missed';
          renderAll();
        }
      });
    });
  }, 30000); // check every 30s
}

function startClock() {
  // Re-render stats every minute
  setInterval(() => { renderStats(); renderUpcoming(); }, 60000);
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function freqLabel(freq) {
  return { once:'Once daily', twice:'Twice daily', thrice:'3× daily', weekly:'Weekly' }[freq] || freq;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function showToast(msg, type='success') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
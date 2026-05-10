/* ============================================================
   app.js — UI logic, rendering, and user interactions
   API calls are handled in api.js
   ============================================================ */

// ── STATE ─────────────────────────────────────────────────────
let quizData  = [];
let score     = 0;
let ollamaUrl = 'http://localhost:11434';

const loadingMsgs = [
  'Reading your notes…',
  'Identifying key concepts…',
  'Crafting quiz questions…',
  'Formatting your materials…'
];
let loadingTimer;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set default URL in input
  document.getElementById('ollamaUrl').value = ollamaUrl;
});

// ── OLLAMA STATUS CHECK ───────────────────────────────────────
async function checkStatus() {
  const urlInput = document.getElementById('ollamaUrl').value.trim() || ollamaUrl;
  ollamaUrl = urlInput;

  const pill = document.getElementById('statusPill');
  pill.className = 'status-pill unknown';
  pill.innerHTML = '⏳ Checking…';

  const { online, models } = await checkOllamaStatus(ollamaUrl);

  if (online) {
    pill.className = 'status-pill online';
    const modelList = models.length ? models.join(', ') : 'none pulled yet';
    pill.innerHTML = `✅ Online — models: ${modelList}`;
  } else {
    pill.className = 'status-pill offline';
    pill.innerHTML = '❌ Offline — is Ollama running?';
  }
}

// ── CHIP TOGGLE ───────────────────────────────────────────────
function toggleChip(cb, id) {
  document.getElementById(id).classList.toggle('active', cb.checked);
}

// ── TABS ──────────────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ── ERROR ─────────────────────────────────────────────────────
function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorBox').classList.add('visible');
}
function hideError() {
  document.getElementById('errorBox').classList.remove('visible');
}

// ── LOADING ───────────────────────────────────────────────────
function startLoading() {
  let i = 0;
  const el = document.getElementById('loadingMsg');
  el.textContent = loadingMsgs[0];
  loadingTimer = setInterval(() => {
    i = (i + 1) % loadingMsgs.length;
    el.textContent = loadingMsgs[i];
  }, 1800);
  document.getElementById('loadingState').classList.add('visible');
}
function stopLoading() {
  clearInterval(loadingTimer);
  document.getElementById('loadingState').classList.remove('visible');
}

// ── HTML ESCAPE ───────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── GENERATE ──────────────────────────────────────────────────
async function generate() {
  hideError();

  const text         = document.getElementById('studyText').value.trim();
  const wantSummary  = document.querySelector('#chip-summary input').checked;
  const wantConcepts = document.querySelector('#chip-concepts input').checked;
  const wantQuiz     = document.querySelector('#chip-quiz input').checked;
  ollamaUrl          = document.getElementById('ollamaUrl').value.trim() || ollamaUrl;

  // Validate
  if (!text)                  { showError('Please paste some study material first.'); return; }
  if (text.split(' ').length < 15) { showError('Please paste at least a few sentences for better results.'); return; }
  if (!wantSummary && !wantConcepts && !wantQuiz) { showError('Please select at least one output type.'); return; }

  const btn = document.getElementById('genBtn');
  btn.disabled = true;
  document.getElementById('results').style.display = 'none';
  document.getElementById('results').classList.remove('visible');
  startLoading();

  try {
    // api.js handles all AI logic
    const parsed = await generateStudyMaterials(text, wantSummary, wantConcepts, wantQuiz, ollamaUrl);
    stopLoading();
    renderResults(parsed, wantSummary, wantConcepts, wantQuiz);

  } catch (err) {
    stopLoading();
    const msg = err.message || 'Something went wrong.';
    // Give a helpful hint if Ollama is not running
    if (msg.includes('fetch') || msg.includes('Failed') || msg.includes('NetworkError')) {
      showError('Cannot reach Ollama. Make sure it is running: open a terminal and run "ollama serve", then try again.');
    } else {
      showError(msg);
    }
  }

  btn.disabled = false;
}

// ── RENDER RESULTS ────────────────────────────────────────────
function renderResults(data, wantSummary, wantConcepts, wantQuiz) {

  // Summary
  if (wantSummary && data.summary) {
    document.getElementById('summary-text').textContent = data.summary;
  }

  // Key concepts table
  if (wantConcepts && Array.isArray(data.concepts)) {
    const tbody = document.getElementById('concepts-body');
    tbody.innerHTML = '';
    data.concepts.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(c.term        || '')}</td>
        <td>${esc(c.definition  || '')}</td>
        <td>${esc(c.importance  || '')}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Quiz
  if (wantQuiz && Array.isArray(data.quiz)) {
    quizData = data.quiz;
    score    = 0;
    renderQuiz();
  }

  // Show results section
  const resultsEl = document.getElementById('results');
  resultsEl.style.display = 'block';
  setTimeout(() => resultsEl.classList.add('visible'), 10);

  // Switch to the first selected tab
  const first   = wantSummary ? 'summary' : wantConcepts ? 'concepts' : 'quiz';
  const tabMap  = { summary: 0, concepts: 1, quiz: 2 };
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + first).classList.add('active');
  tabBtns[tabMap[first]].classList.add('active');

  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── RENDER QUIZ ───────────────────────────────────────────────
function renderQuiz() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  document.getElementById('scoreDisplay').textContent  = score;
  document.getElementById('totalDisplay').textContent  = quizData.length;

  quizData.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.id        = 'qcard-' + qi;

    const choices = (q.choices || []).map((ch, ci) => {
      const letter = String.fromCharCode(65 + ci);
      return `<button class="choice" onclick="answer(${qi},'${letter}',this)">${esc(ch)}</button>`;
    }).join('');

    card.innerHTML = `
      <div class="q-num">Question ${qi + 1} of ${quizData.length}</div>
      <div class="q-text">${esc(q.question || '')}</div>
      <div class="choices">${choices}</div>
      <div class="explanation" id="exp-${qi}">
        💡 <strong>Explanation:</strong> ${esc(q.explanation || '')}
      </div>
    `;
    container.appendChild(card);
  });
}

// ── ANSWER QUESTION ───────────────────────────────────────────
function answer(qi, letter, btn) {
  const q       = quizData[qi];
  const card    = document.getElementById('qcard-' + qi);
  const correct = (q.answer || '').trim().charAt(0).toUpperCase();

  // Disable all buttons, highlight correct one
  card.querySelectorAll('.choice').forEach((b, ci) => {
    b.disabled = true;
    if (String.fromCharCode(65 + ci) === correct) b.classList.add('reveal');
  });

  const ok = letter === correct;
  btn.classList.remove('reveal');
  btn.classList.add(ok ? 'correct' : 'wrong');
  card.classList.add(ok ? 'correct-card' : 'wrong-card');
  document.getElementById('exp-' + qi).classList.add('visible');

  if (ok) score++;
  document.getElementById('scoreDisplay').textContent = score;
}

// ── RESET QUIZ ────────────────────────────────────────────────
function resetQuiz() {
  score = 0;
  renderQuiz();
}

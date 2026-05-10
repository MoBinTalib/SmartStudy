/* ============================================================
   api.js — Llama 3 via Ollama (open-source, runs locally)
   No API key required. Free forever.

   HOW IT WORKS:
   - Ollama runs Llama locally on your machine
   - This file sends requests to http://localhost:11434
   - The Ollama API is compatible with the browser fetch API
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
const OLLAMA_URL    = 'http://localhost:11434';        // default Ollama address
const OLLAMA_MODEL  = 'llama3.2';                      // model to use
const MAX_TOKENS    = 2048;
const TEMPERATURE   = 0.4;

// ── CHECK IF OLLAMA IS RUNNING ───────────────────────────────
/**
 * Pings Ollama to verify the server is reachable.
 * @returns {Promise<{online: boolean, models: string[]}>}
 */
async function checkOllamaStatus(baseUrl = OLLAMA_URL) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false, models: [] };
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    return { online: true, models };
  } catch {
    return { online: false, models: [] };
  }
}

// ── BUILD PROMPT ─────────────────────────────────────────────
/**
 * Builds the structured JSON prompt sent to Llama.
 * @param {string} text        - raw study material from user
 * @param {boolean} wantSummary
 * @param {boolean} wantConcepts
 * @param {boolean} wantQuiz
 * @returns {string} prompt string
 */
function buildPrompt(text, wantSummary, wantConcepts, wantQuiz) {
  const parts = [];
  if (wantSummary)
    parts.push('"summary": "<3 to 5 sentence plain-language summary>"');
  if (wantConcepts)
    parts.push('"concepts": [{"term":"...","definition":"...","importance":"..."}]  // 5-7 items');
  if (wantQuiz)
    parts.push('"quiz": [{"question":"...","choices":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."}]  // exactly 5 questions');

  return `You are an expert study assistant. Analyze the study material below.
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after. Just raw JSON.

Required JSON structure:
{
  ${parts.join(',\n  ')}
}

Rules:
- "answer" must be exactly one letter: A, B, C, or D
- Each choice must start with the letter: "A) ...", "B) ...", etc.
- Return nothing except the JSON object

Study material:
"""
${text.slice(0, 4000)}
"""`;
}

// ── CALL LLAMA VIA OLLAMA ────────────────────────────────────
/**
 * Sends a prompt to Llama 3 via the local Ollama server.
 * @param {string} prompt
 * @param {string} baseUrl  - Ollama server URL
 * @returns {Promise<string>} raw model response text
 */
async function callLlama(prompt, baseUrl = OLLAMA_URL) {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: TEMPERATURE,
        num_predict: MAX_TOKENS
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Ollama error (${res.status})`);
  }

  const data = await res.json();
  const raw = data?.response || '';
  if (!raw) throw new Error('Empty response from Llama. Please try again.');
  return raw;
}

// ── PARSE JSON RESPONSE ──────────────────────────────────────
/**
 * Safely extracts JSON from model output (strips fences if present).
 * @param {string} raw - raw model response
 * @returns {object} parsed JSON object
 */
function parseModelResponse(raw) {
  // Strip markdown code fences if the model added them anyway
  let clean = raw.replace(/```json|```/gi, '').trim();

  // Extract first { ... } block if there's extra text around it
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) clean = jsonMatch[0];

  return JSON.parse(clean);
}

// ── MAIN GENERATE FUNCTION ───────────────────────────────────
/**
 * Full pipeline: build prompt → call Llama → parse JSON → return result.
 * @param {string} text
 * @param {boolean} wantSummary
 * @param {boolean} wantConcepts
 * @param {boolean} wantQuiz
 * @param {string} baseUrl
 * @returns {Promise<object>} parsed study material object
 */
async function generateStudyMaterials(text, wantSummary, wantConcepts, wantQuiz, baseUrl = OLLAMA_URL) {
  const prompt = buildPrompt(text, wantSummary, wantConcepts, wantQuiz);
  const raw    = await callLlama(prompt, baseUrl);
  const parsed = parseModelResponse(raw);
  return parsed;
}

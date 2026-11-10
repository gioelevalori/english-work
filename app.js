"use strict";
/* ============ Utility ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const DAY = 86400000;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const dayStr = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const key = en => String(en).toLowerCase().trim();
const isSentence = en => en.trim().split(/\s+/).length >= 4;

/* ============ Stato salvato ============ */
const STORE = "english-work-v1";
const DEFAULTS = {
  xp: 0, streak: 0, best: 0, lastDay: null, days: {}, done: {}, srs: {}, notebook: [], journal: [],
  settings: { goal: 30, accent: "en-US", rate: 0.9, autoSave: true, speak: true, sound: true }
};
const clone = o => JSON.parse(JSON.stringify(o));
let S = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    if (s) return { ...clone(DEFAULTS), ...s, settings: { ...DEFAULTS.settings, ...(s.settings || {}) } };
  } catch (e) {}
  return clone(DEFAULTS);
}
function save() { localStorage.setItem(STORE, JSON.stringify(S)); }
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ============ Contenuti ============ */
const LEVELS = ["A1", "A2", "B1", "B2"];
COURSE.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
const ALL = [];
COURSE.forEach(u => {
  u.words.forEach(([en, it]) => ALL.push({ en, it, kind: "word", unit: u.id }));
  u.sentences.forEach(([en, it]) => ALL.push({ en, it, kind: "sentence", unit: u.id }));
});
function lessonsOf(u) {
  const W = ALL.filter(i => i.unit === u.id && i.kind === "word");
  const X = ALL.filter(i => i.unit === u.id && i.kind === "sentence");
  const h = Math.ceil(W.length / 2);
  return [
    { name: "Parole 1", ic: "🔤", items: W.slice(0, h), opts: { intro: true, perWord: 2, match: true } },
    { name: "Parole 2", ic: "🔠", items: W.slice(h), opts: { intro: true, perWord: 2, match: true } },
    { name: "Frasi", ic: "💬", items: X, opts: { perSent: 2, max: 14 } },
    { name: "Ripasso", ic: "⭐", items: [...W, ...X], opts: { perWord: 1, perSent: 1, max: 16, match: true } }
  ];
}
function notebookItems() { return S.notebook.map(n => ({ en: n.en, it: n.it, kind: isSentence(n.en) ? "sentence" : "word", unit: "nb" })); }
function pool() { return [...ALL, ...notebookItems()]; }

/* ============ SRS (ripetizione dilazionata) ============ */
const INTERVALS = [0, 1, 2, 4, 8, 16, 35]; // giorni
function srsUpdate(en, ok) {
  const k = key(en), r = S.srs[k] || { b: 0, d: 0, c: 0, w: 0 };
  if (ok) { r.b = Math.min(r.b + 1, 6); r.c++; } else { r.b = Math.max(0, r.b - 2); r.w++; }
  r.d = Date.now() + INTERVALS[r.b] * DAY - 3600000;
  S.srs[k] = r;
}
const isDue = en => { const r = S.srs[key(en)]; return !r || r.d <= Date.now(); };
const boxOf = en => (S.srs[key(en)] || {}).b || 0;

/* ============ Voce ============ */
let voices = [], lastUtt = null, hintShown = false;
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
// iOS 17+: fa suonare l'audio anche con il tasto silenzioso attivo
try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
function audioHint() {
  if (hintShown) return; hintShown = true;
  toast("Non senti l'audio? Disattiva la modalità silenziosa (tasto laterale) e alza il volume.", 5000);
}
/* Audio registrato (file MP3 con voci neurali), letto dal normale lettore audio:
   funziona su iPhone anche dove la sintesi vocale del browser resta muta.
   Per i testi senza file (es. parole aggiunte da te) si usa la voce del telefono. */
const player = new Audio();
player.preload = "auto";
player.setAttribute("playsinline", "");
let playToken = 0;
const spokenText = t => String(t).replace(/ \/ /g, ", ").replace(/\s+/g, " ").trim();
// Deve restare identico a audioId() in tools/collect-audio.js
function audioId(voice, text) {
  const s = voice + "|" + spokenText(text).toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
function hasAudio(text, voice = "f") { return typeof AUDIO_IDS !== "undefined" && AUDIO_IDS.has(audioId(voice, text)); }
function stopAudio() {
  playToken++;
  try { player.pause(); } catch (e) {}
  if (window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
}
function say(text, slow, opts = {}) {
  const tok = ++playToken;
  let ended = false;
  const done = () => { if (ended || tok !== playToken) return; ended = true; if (opts.onend) opts.onend(); };
  let voice = opts.voice || "f";
  if (!hasAudio(text, voice) && hasAudio(text, "f")) voice = "f";
  if (hasAudio(text, voice)) {
    if (window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
    const rate = slow ? 0.7 : ({ 0.7: 0.8, 0.9: 1, 1: 1.1, 1.1: 1.2 }[S.settings.rate] || 1);
    player.onended = done;
    player.onerror = () => { if (tok === playToken) speakDevice(text, slow, { ...opts, onend: done }); };
    player.src = "audio/" + audioId(voice, text) + ".mp3";
    player.defaultPlaybackRate = rate; player.playbackRate = rate;
    player.preservesPitch = true; player.webkitPreservesPitch = true;
    const p = player.play();
    if (p && p.catch) p.catch(err => {
      if (tok !== playToken || err.name === "AbortError") return;
      speakDevice(text, slow, { ...opts, onend: done });
    });
    return;
  }
  speakDevice(text, slow, { ...opts, onend: done });
}
function speakDevice(text, slow, opts = {}) {
  const synth = window.speechSynthesis;
  if (!synth) { audioHint(); if (opts.onend) setTimeout(opts.onend, 800); return; }
  const u = new SpeechSynthesisUtterance(String(text).replace(/ \/ /g, ", "));
  const acc = S.settings.accent, norm = v => v.lang.replace("_", "-");
  // Su iPhone le voci "premium/enhanced" possono essere elencate ma non scaricate (= silenzio):
  // lì lasciamo scegliere a iOS la voce di sistema per la lingua.
  if (!IS_IOS) {
    const v = voices.find(v => norm(v) === acc && /natural|neural|google/i.test(v.name)) || voices.find(v => norm(v) === acc) || voices.find(v => /^en/i.test(v.lang));
    if (v) u.voice = v;
  }
  u.lang = acc;
  u.rate = slow ? 0.55 : S.settings.rate;
  if (opts.pitch) u.pitch = opts.pitch;
  if (opts.onend) { u.onend = opts.onend; u.onerror = opts.onend; }
  u.volume = 1;
  lastUtt = u; // evita che iOS perda il riferimento all'audio
  let started = false;
  u.onstart = () => { started = true; };
  const go = () => {
    if (synth.paused) synth.resume();
    synth.speak(u);
    setTimeout(() => { if (!started && lastUtt === u && !synth.speaking) audioHint(); }, 3000);
  };
  // speak() deve partire subito dentro il tocco, altrimenti iOS lo blocca
  if (synth.speaking || synth.pending) synth.cancel();
  go();
}
// Tocca una parola inglese per ascoltarla (e vedere la traduzione se la conosciamo)
function tapText(text, sentence) {
  if (!sentence) return `<span class="tw" data-w="${esc(text)}">${esc(text)}</span>`;
  return String(text).split(/(\s+)/).map(p => /\s/.test(p) || !p ? p : `<span class="tw" data-w="${esc(p.replace(/[.,!?;:]/g, ""))}">${esc(p)}</span>`).join("");
}
function lookup(w) {
  const k = key(w); if (!k) return "";
  const hit = pool().find(x => x.kind === "word" && (key(x.en) === k || key(x.en) === "to " + k || x.en.split(" / ").some(v => key(v) === k)));
  return hit ? hit.it : "";
}
document.addEventListener("click", e => {
  const w = e.target.closest("[data-w]");
  if (!w) return;
  e.stopPropagation();
  pauseDialogue(); pauseScene();
  say(w.dataset.w);
  if (w.closest(".bubble, .sent")) { const t = lookup(w.dataset.w); if (t) toast(`${w.dataset.w} = ${t}`); }
}, true);
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/* ============ Suoni ============ */
let actx;
function beep(ok) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [660, 990] : [260, 200];
    notes.forEach((f, i) => {
      const t = actx.currentTime + i * 0.11, o = actx.createOscillator(), g = actx.createGain();
      o.type = ok ? "sine" : "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.25);
    });
  } catch (e) {}
}

/* ============ Controllo risposte ============ */
const CONTR = { "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is", "it's": "it is", "we're": "we are", "they're": "they are",
  "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "cannot", "won't": "will not", "i'll": "i will", "we'll": "we will",
  "you'll": "you will", "she'll": "she will", "he'll": "he will", "they'll": "they will", "i'd": "i would", "we'd": "we would", "you'd": "you would",
  "let's": "let us", "isn't": "is not", "aren't": "are not", "wasn't": "was not", "what's": "what is", "that's": "that is", "there's": "there is",
  "where's": "where is", "i've": "i have", "we've": "we have", "you've": "you have", "couldn't": "could not", "wouldn't": "would not", "shouldn't": "should not" };
function norm(s) {
  s = String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.,!?;:"()¿¡…]/g, " ").replace(/\s+/g, " ").trim();
  return s.split(" ").map(w => CONTR[w] || w).join(" ").replace(/\bcan not\b/g, "cannot").replace(/\bmrs?\b/g, m => m);
}
function variants(en) { return en.split(" / ").flatMap(v => { const n = norm(v); return n.startsWith("to ") ? [n, n.slice(3)] : [n]; }); }
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let p = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
  return p[n];
}
function judgeText(input, item) {
  const a = norm(input);
  if (!a) return { ok: false };
  const same = pool().filter(x => x.it === item.it).map(x => x.en);
  const targets = [...new Set([item.en, ...same].flatMap(variants))];
  if (targets.includes(a)) return { ok: true };
  const close = targets.some(t => t.length > 3 && lev(a, t) <= Math.max(1, Math.floor(t.length / 12)));
  return close ? { ok: true, typo: true } : { ok: false };
}

/* ============ Generazione esercizi ============ */
function distract(item, field, n) {
  const seen = new Set([key(item[field])]); const out = [];
  const cands = shuffle(pool().filter(x => x.kind === item.kind)).sort((a, b) => (b.unit === item.unit) - (a.unit === item.unit));
  for (const c of cands) { const t = key(c[field]); if (!seen.has(t) && c.it !== item.it && key(c.en) !== key(item.en)) { seen.add(t); out.push(c[field]); } if (out.length >= n) break; }
  return out;
}
const tilesOf = en => en.replace(/[.,!?…]/g, "").split(/\s+/).filter(Boolean);
function buildExercises(items, o = {}) {
  const words = items.filter(i => i.kind === "word"), sents = items.filter(i => i.kind === "sentence");
  const intro = o.intro ? words.filter(w => !S.srs[key(w.en)]).map(item => ({ t: "intro", item })) : [];
  let wT = ["mc_en_it", "mc_it_en", "listen_mc", "type_word", "listen_type"];
  let sT = ["build", "build_listen", "type_sent", "mc_sent", "build"];
  if (S.settings.speak && SR) sT.push("speak");
  if (o.listen) { wT = ["listen_mc", "listen_type"]; sT = ["build_listen", "listen_type_sent"]; }
  if (o.speakOnly) { wT = []; sT = ["speak"]; }
  let body = [];
  words.forEach(w => { if (wT.length) pick(wT, o.perWord || 1).forEach(t => body.push({ t, item: w })); });
  sents.forEach(s => pick(sT, Math.min(o.perSent || 1, sT.length)).forEach(t => body.push({ t, item: s })));
  if (o.speakOnly) body = pick(items, 10).map(item => ({ t: "speak", item }));
  body = shuffle(body);
  if (o.max) body = body.slice(0, o.max);
  if (o.match && words.length >= 4 && !o.listen) body.splice(Math.min(body.length, 4 + Math.floor(Math.random() * 4)), 0, { t: "match", items: pick(words, Math.min(5, words.length)) });
  return [...intro, ...body];
}

/* ============ Motore lezione ============ */
let L = null;
const overlay = $("#overlay");
let overlayTimer = null;
function showOverlay() {
  clearTimeout(overlayTimer);
  if (overlay.hidden || overlay.classList.contains("leaving")) {
    overlay.classList.remove("leaving"); overlay.hidden = false;
    overlay.classList.remove("entering"); void overlay.offsetWidth; overlay.classList.add("entering");
  }
  document.body.style.overflow = "hidden";
}
function hideOverlay() {
  if (overlay.hidden) return;
  overlay.classList.remove("entering"); overlay.classList.add("leaving");
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlay.hidden = true; overlay.classList.remove("leaving"); overlay.innerHTML = ""; }, REDUCED ? 0 : 230);
  document.body.style.overflow = "";
}
function startLesson(cfg) {
  if (!cfg.exercises.length) return toast("Nessun esercizio disponibile qui.");
  L = { ...cfg, queue: cfg.exercises, pos: 0, first: 0, wrong: 0, answered: 0, results: {}, map: {}, tries: new Map(), pct: 0 };
  showOverlay();
  renderEx();
}
function closeLesson() { L = null; stopDialogue(); stopScene(); stopAudio(); hideOverlay(); render({ anim: true }); }
function record(item, ok) {
  const k = key(item.en); L.map[k] = item;
  L.results[k] = (L.results[k] ?? true) && ok;
}
function renderEx() {
  const ex = L.queue[L.pos];
  if (!ex) return finishLesson();
  const pct = Math.round((L.pos / L.queue.length) * 100);
  const saved = ex.item && S.notebook.some(n => key(n.en) === key(ex.item.en));
  overlay.innerHTML = `<div class="lesson">
    <div class="lesson-top">
      <button class="x" id="quit" aria-label="Esci">✕</button>
      <div class="bar"><i style="width:${L.pct}%"></i></div>
      ${ex.item ? `<button class="star-btn ${saved ? "on" : ""}" id="star" aria-label="Salva parola">${saved ? "★" : "☆"}</button>` : `<span style="width:36px"></span>`}
    </div>
    <div class="ex-body ex-in" id="exBody"></div>
    <div class="ex-foot" id="exFoot"><button class="btn primary block" id="check" disabled>Verifica</button></div>
  </div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const b = $(".lesson-top .bar i"); if (b) b.style.width = pct + "%"; }));
  L.pct = pct;
  $("#quit").onclick = () => { if (L.answered < 2 || confirm("Vuoi uscire dalla lezione? I progressi di questa lezione andranno persi.")) closeLesson(); };
  const st = $("#star");
  if (st) st.onclick = () => { const added = addToNotebook(ex.item.en, ex.item.it, "", "esercizio"); st.textContent = "★"; st.classList.add("on"); toast(added ? "Salvata nelle tue parole ⭐" : "Già nelle tue parole"); };
  L.check = null;
  EX[ex.t](ex, $("#exBody"));
  if ($("#check")) $("#check").onclick = () => doCheck();
}
function ready(on) { const b = $("#check"); if (b) b.disabled = !on; }
function doCheck() {
  const ex = L.queue[L.pos];
  if (!L.check) return;
  const res = L.check(); if (!res) return;
  L.answered++;
  const tk = L.tries.get(ex) || 0; L.tries.set(ex, tk + 1);
  if ((res.ok || res.skip) && tk === 0 && !ex.retry) L.first++;
  if (!res.ok && !res.skip) L.wrong++;
  if (ex.item && !res.skip) record(ex.item, res.ok);
  if (!res.ok && !res.skip) L.queue.push({ ...ex, retry: true });
  showFeedback(res, ex);
}
function showFeedback(res, ex) {
  beep(res.ok || res.skip);
  const f = $("#exFoot");
  const praise = ["Ottimo!", "Perfetto!", "Esatto!", "Bravo!", "Grande!", "Benissimo!"];
  f.className = "ex-foot " + (res.ok || res.skip ? "ok" : "bad");
  let html;
  if (res.skip) html = `<div class="fb-title">Saltato</div><div class="fb-text">${esc(ex.item.en)} — <span class="muted">${esc(ex.item.it)}</span></div>`;
  else if (res.ok) html = `<div class="fb-title">${praise[Math.floor(Math.random() * praise.length)]}${res.typo ? " (attento all'ortografia)" : ""}</div>
    ${res.show ? `<div class="fb-text">${res.show}</div>` : ""}`;
  else html = `<div class="fb-title">Risposta corretta:</div><div class="fb-text">${res.correct}</div>`;
  f.innerHTML = html + `<button class="btn ${res.ok || res.skip ? "ok" : "bad"} block" id="next">Continua</button>`;
  $$("#exBody button, #exBody input, #exBody textarea").forEach(b => b.disabled = true);
  $$("#exBody .speaker").forEach(b => b.disabled = false);
  if (!res.ok && ex.item) $("#exBody").classList.add("shake");
  $("#next").onclick = () => { L.pos++; renderEx(); };
  setTimeout(() => $("#next") && $("#next").focus(), 50);
}

/* --- Pezzi riutilizzabili --- */
function speakerBtns(text, big) {
  const id = "sp" + Math.random().toString(36).slice(2, 7);
  setTimeout(() => {
    const a = document.getElementById(id), b = document.getElementById(id + "s");
    if (a) a.onclick = () => say(text); if (b) b.onclick = () => say(text, true);
  });
  return `<button class="speaker" id="${id}" aria-label="Ascolta">🔊</button>${big ? `<button class="speaker slow" id="${id}s" aria-label="Ascolta lentamente">🐢</button>` : ""}`;
}
function options(el, list, onSel, speakEach) {
  el.insertAdjacentHTML("beforeend", `<div class="options">${list.map((t, i) => `<button class="opt" data-i="${i}">${esc(t)}</button>`).join("")}</div>`);
  let sel = null;
  $$(".opt", el).forEach(b => b.onclick = () => {
    $$(".opt", el).forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = list[+b.dataset.i];
    if (speakEach) say(sel); onSel(sel); ready(true);
  });
  return () => sel;
}
function markOptions(el, correct, chosen) {
  $$(".opt", el).forEach(b => { if (b.textContent === correct) b.classList.add("right"); else if (b.textContent === chosen) b.classList.add("wrong"); });
}
function textInput(el, multiline, ph) {
  el.insertAdjacentHTML("beforeend", multiline
    ? `<textarea class="answer" rows="3" placeholder="${ph}" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>`
    : `<input class="answer" placeholder="${ph}" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off">`);
  const inp = $(".answer", el);
  inp.oninput = () => ready(inp.value.trim().length > 0);
  inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); if (inp.value.trim()) doCheck(); } };
  setTimeout(() => inp.focus(), 80);
  return inp;
}
function tileBuilder(el, item) {
  const correct = tilesOf(item.en);
  const lower = new Set(correct.map(w => w.toLowerCase()));
  const extra = shuffle(pool().filter(x => x.kind === "sentence" && x.en !== item.en).flatMap(x => tilesOf(x.en)))
    .filter(w => !lower.has(w.toLowerCase())).filter((w, i, a) => a.findIndex(z => z.toLowerCase() === w.toLowerCase()) === i).slice(0, Math.min(4, Math.ceil(correct.length / 2)));
  const tiles = shuffle([...correct, ...extra]).map((w, i) => ({ w, i }));
  el.insertAdjacentHTML("beforeend", `<div class="answer-line" id="line"></div><div class="bank" id="bank">${tiles.map(t => `<button class="tile" data-i="${t.i}">${esc(t.w)}</button>`).join("")}</div>`);
  const chosen = [];
  const line = $("#line", el);
  $$("#bank .tile", el).forEach(b => b.onclick = () => {
    const t = tiles[+b.dataset.i]; say(t.w); chosen.push(t); b.classList.add("used");
    const nb = document.createElement("button"); nb.className = "tile"; nb.textContent = t.w;
    nb.onclick = () => { say(t.w); chosen.splice(chosen.indexOf(t), 1); nb.remove(); b.classList.remove("used"); ready(chosen.length > 0); };
    line.appendChild(nb); ready(true);
  });
  return () => chosen.map(t => t.w).join(" ");
}

/* --- Tipi di esercizio --- */
const EX = {
  intro(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Nuova parola ✨</div>
      <div class="card intro-card">${speakerBtns(item.en, true).replace('class="speaker"', 'class="speaker" style="margin:0 auto"').replace('class="speaker slow"', 'class="speaker slow" style="margin:8px auto 0"')}
      <div class="en">${tapText(item.en)}</div><div class="it">${esc(item.it)}</div></div>
      <p class="muted small" style="text-align:center">Ascoltala e ripetila ad alta voce. Tocca ☆ in alto per salvarla subito.</p>`;
    say(item.en);
    const f = $("#exFoot"); f.innerHTML = `<button class="btn primary block" id="next">Ho capito</button>`;
    $("#next").onclick = () => { L.pos++; renderEx(); };
  },
  mc_en_it(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Cosa significa?</div><div class="prompt">${speakerBtns(item.en)}<div class="big">${tapText(item.en)}</div></div>`;
    say(item.en);
    const list = shuffle([item.it, ...distract(item, "it", 3)]);
    const get = options(el, list, () => {});
    L.check = () => { const c = get(); markOptions(el, item.it, c); return { ok: c === item.it, correct: esc(item.it) }; };
  },
  mc_it_en(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Come si dice in inglese?</div><div class="prompt"><div class="bubble">${esc(item.it)}</div></div>`;
    const list = shuffle([item.en, ...distract(item, "en", 3)]);
    const get = options(el, list, () => {}, true);
    L.check = () => { const c = get(); markOptions(el, item.en, c); return { ok: c === item.en, correct: esc(item.en) }; };
  },
  listen_mc(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Cosa hai sentito?</div><div class="listen-big">${speakerBtns(item.en, true)}</div>`;
    say(item.en);
    const list = shuffle([item.en, ...distract(item, "en", 3)]);
    const get = options(el, list, () => {}, true);
    L.check = () => { const c = get(); markOptions(el, item.en, c); return { ok: c === item.en, correct: `${esc(item.en)} — <span class="muted">${esc(item.it)}</span>`, show: `${esc(item.en)} = ${esc(item.it)}` }; };
  },
  listen_type(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Scrivi quello che senti</div><div class="listen-big">${speakerBtns(item.en, true)}</div>`;
    say(item.en);
    const inp = textInput(el, false, "Scrivi in inglese…");
    L.check = () => { const r = judgeText(inp.value, item); return { ...r, correct: `${esc(item.en)} — <span class="muted">${esc(item.it)}</span>`, show: `${esc(item.en)} = ${esc(item.it)}` }; };
  },
  listen_type_sent(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Scrivi la frase che senti</div><div class="listen-big">${speakerBtns(item.en, true)}</div>`;
    say(item.en);
    const inp = textInput(el, true, "Scrivi in inglese…");
    L.check = () => { const r = judgeText(inp.value, item); return { ...r, correct: `${esc(item.en)}<br><span class="muted">${esc(item.it)}</span>`, show: esc(item.it) }; };
  },
  type_word(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Traduci in inglese</div><div class="prompt"><div class="bubble">${esc(item.it)}</div></div>`;
    const inp = textInput(el, false, "Scrivi in inglese…");
    L.check = () => { const r = judgeText(inp.value, item); if (r.ok) say(item.en); return { ...r, correct: esc(item.en), show: r.typo ? esc(item.en) : "" }; };
  },
  type_sent(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Traduci questa frase</div><div class="prompt"><div class="bubble">${esc(item.it)}</div></div>`;
    const inp = textInput(el, true, "Scrivi in inglese…");
    L.check = () => { const r = judgeText(inp.value, item); say(item.en); return { ...r, correct: esc(item.en), show: r.typo ? esc(item.en) : "" }; };
  },
  mc_sent(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Scegli la traduzione giusta</div><div class="prompt">${speakerBtns(item.en)}<div class="bubble">${tapText(item.en, true)}</div></div>`;
    say(item.en);
    const list = shuffle([item.it, ...distract(item, "it", 2)]);
    const get = options(el, list, () => {});
    L.check = () => { const c = get(); markOptions(el, item.it, c); return { ok: c === item.it, correct: esc(item.it) }; };
  },
  build(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Componi la frase in inglese</div><div class="prompt"><div class="bubble">${esc(item.it)}</div></div>`;
    const get = tileBuilder(el, item);
    L.check = () => { const ok = norm(get()) === norm(item.en); say(item.en); return { ok, correct: esc(item.en) }; };
  },
  build_listen(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Ascolta e componi la frase</div><div class="listen-big" style="margin:4px 0 18px">${speakerBtns(item.en, true)}</div>`;
    say(item.en);
    const get = tileBuilder(el, item);
    L.check = () => { const ok = norm(get()) === norm(item.en); return { ok, correct: `${esc(item.en)}<br><span class="muted">${esc(item.it)}</span>`, show: esc(item.it) }; };
  },
  speak(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Leggi ad alta voce</div>
      <div class="prompt">${speakerBtns(item.en)}<div class="bubble">${tapText(item.en, true)}</div></div>
      <p class="muted small">${esc(item.it)}</p>
      <button class="mic" id="mic" aria-label="Parla">🎤</button><div class="heard" id="heard">Tocca il microfono e parla</div>
      <div style="text-align:center;margin-top:14px"><button class="btn ghost sm" id="skip">Non posso parlare ora</button></div>`;
    let heard = "", result = null;
    $("#skip", el).onclick = () => { L.check = () => ({ skip: true }); doCheck(); };
    $("#mic", el).onclick = () => {
      const rec = new SR(); rec.lang = S.settings.accent; rec.interimResults = true; rec.maxAlternatives = 3;
      const mic = $("#mic", el); mic.classList.add("rec"); $("#heard", el).textContent = "Ti ascolto…";
      rec.onresult = e => {
        const alts = [...e.results].map(r => [...r].map(a => a.transcript));
        heard = alts.map(a => a[0]).join(" ");
        $("#heard", el).textContent = "“" + heard + "”";
        const target = norm(item.en).split(" ");
        const best = Math.max(...(alts[alts.length - 1] || [heard]).map(t => { const got = new Set(norm(t).split(" ")); return target.filter(w => got.has(w)).length / target.length; }), 0);
        result = best;
        if (e.results[e.results.length - 1].isFinal) ready(true);
      };
      rec.onerror = ev => { mic.classList.remove("rec"); $("#heard", el).textContent = ev.error === "not-allowed" ? "Microfono non autorizzato. Puoi saltare l'esercizio." : "Non ho sentito bene, riprova."; };
      rec.onend = () => { mic.classList.remove("rec"); if (heard) ready(true); };
      try { rec.start(); } catch (e) { $("#heard", el).textContent = "Riconoscimento vocale non disponibile qui."; }
    };
    L.check = () => {
      const ok = (result || 0) >= 0.7;
      return { ok, correct: `${esc(item.en)}<br><span class="muted">Ho capito: “${esc(heard)}”</span>`, show: `Ho capito: “${esc(heard)}”` };
    };
  },
  match(ex, el) {
    const items = ex.items;
    const left = shuffle(items.map((it, i) => ({ t: it.en, i }))), right = shuffle(items.map((it, i) => ({ t: it.it, i })));
    el.innerHTML = `<div class="ex-label">Abbina le coppie</div><div class="match">${left.map((l, r) => `
      <button class="opt" data-s="L" data-i="${l.i}">${esc(l.t)}</button><button class="opt" data-s="R" data-i="${right[r].i}">${esc(right[r].t)}</button>`).join("")}</div>`;
    let selL = null, selR = null, left_n = items.length, mistakes = 0;
    $("#exFoot").innerHTML = `<button class="btn primary block" id="check" disabled>Abbina tutte le coppie</button>`;
    const tryPair = () => {
      if (!selL || !selR) return;
      const a = selL, b = selR; selL = selR = null;
      if (a.dataset.i === b.dataset.i) {
        [a, b].forEach(x => { x.classList.remove("sel"); x.classList.add("right"); setTimeout(() => { x.classList.remove("right"); x.classList.add("gone"); x.disabled = true; }, 300); });
        beep(true); record(items[+a.dataset.i], true);
        if (--left_n === 0) { L.check = () => ({ ok: mistakes === 0 || true, show: mistakes ? `${mistakes} errori, ma ce l'hai fatta!` : "" }); setTimeout(doCheck, 350); }
      } else {
        mistakes++; [a, b].forEach(x => { x.classList.remove("sel"); x.classList.add("wrong"); setTimeout(() => x.classList.remove("wrong"), 450); });
        beep(false); record(items[+a.dataset.i], false);
      }
    };
    $$(".match .opt", el).forEach(b => b.onclick = () => {
      if (b.dataset.s === "L") { say(items[+b.dataset.i].en); if (selL) selL.classList.remove("sel"); selL = b; }
      else { if (selR) selR.classList.remove("sel"); selR = b; }
      b.classList.add("sel"); tryPair();
    });
  }
};

function finishLesson() {
  const keys = Object.keys(L.results);
  keys.forEach(k => srsUpdate(L.map[k].en, L.results[k]));
  const total = L.queue.filter(e => !e.retry && e.t !== "intro").length || 1;
  const acc = Math.max(0, Math.round((L.first / total) * 100));
  const xp = Math.max(5, Math.min(30, L.first + (acc === 100 ? 5 : 0)));
  addXP(xp);
  if (L.doneKey) S.done[L.doneKey] = (S.done[L.doneKey] || 0) + 1;
  let savedN = 0;
  if (S.settings.autoSave && L.autoSave !== false) keys.forEach(k => { const it = L.map[k]; if (it.unit !== "nb" && it.kind === "word" && addToNotebook(it.en, it.it, "", "lezione", true)) savedN++; });
  save();
  const pr = progressToday();
  beep(true);
  overlay.innerHTML = `<div class="lesson"><div class="ex-body done-screen">
    <div class="trophy">${acc >= 90 ? "🏆" : acc >= 60 ? "🎉" : "💪"}</div>
    <h2>${acc >= 90 ? "Lezione perfetta!" : acc >= 60 ? "Lezione completata!" : "Continua così, migliorerai!"}</h2>
    <p class="muted">${esc(L.title)}</p>
    <div class="stats"><div class="stat"><b>+${xp}</b><span>XP</span></div><div class="stat"><b>${acc}%</b><span>Precisione</span></div><div class="stat"><b>🔥 ${S.streak}</b><span>Serie</span></div></div>
    ${savedN ? `<p>📒 ${savedN} nuove parole salvate nel tuo vocabolario</p>` : ""}
    <div class="card"><div class="row"><div class="grow"><b>Obiettivo di oggi</b><div class="bar" style="margin-top:8px"><i style="width:${pr.pct}%"></i></div></div><b>${pr.xp}/${S.settings.goal}</b></div></div>
  </div><div class="ex-foot">
    ${L.again ? `<button class="btn ghost block" id="again" style="margin-bottom:10px">${L.endless ? "Altri esercizi ➜" : "Ripeti"}</button>` : ""}
    <button class="btn primary block" id="close">Continua</button></div></div>`;
  const again = L.again;
  $("#close").onclick = closeLesson;
  if ($("#again")) $("#again").onclick = () => { L = null; again(); };
}

/* ============ XP, serie, obiettivo ============ */
function addXP(n) {
  const t = dayStr();
  S.xp += n; S.days[t] = (S.days[t] || 0) + n;
  if (S.lastDay !== t) {
    const y = dayStr(new Date(Date.now() - DAY));
    S.streak = S.lastDay === y ? S.streak + 1 : 1;
    S.lastDay = t; S.best = Math.max(S.best || 0, S.streak);
  }
}
function currentStreak() { const y = dayStr(new Date(Date.now() - DAY)); return S.lastDay === dayStr() || S.lastDay === y ? S.streak : 0; }
function progressToday() { const xp = S.days[dayStr()] || 0; return { xp, pct: Math.min(100, Math.round((xp / S.settings.goal) * 100)) }; }

/* ============ Vocabolario ============ */
function addToNotebook(en, it, note, src, quiet) {
  en = String(en).trim(); it = String(it).trim();
  if (!en || !it) return false;
  if (S.notebook.some(n => key(n.en) === key(en))) return false;
  S.notebook.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), en, it, note: note || "", src, t: Date.now() });
  if (!quiet) save();
  return true;
}
async function translate(text, from, to) {
  const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
  const j = await r.json();
  const t = j && j.responseData && j.responseData.translatedText;
  if (!t || /MYMEMORY WARNING|INVALID/i.test(t)) throw new Error("no");
  return t;
}

/* ============ UI generica ============ */
let toastT;
function toast(msg, ms) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms || 2200); }
function modal(html, onMount) {
  const m = $("#modal"); m.innerHTML = `<div class="sheet">${html}</div>`; m.hidden = false;
  m.onclick = e => { if (e.target === m) closeModal(); };
  onMount && onMount($(".sheet", m));
}
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; }

/* ============ Viste ============ */
let tab = localStorage.getItem("ew-tab") || "learn";
let wordFilter = "all", wordQuery = "";
const TAB_ORDER = ["learn", "talk", "review", "words", "profile"];
$$("#tabs button").forEach(b => b.onclick = () => {
  const prev = tab; tab = b.dataset.tab; localStorage.setItem("ew-tab", tab);
  if (prev === tab) { window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" }); return; }
  window.scrollTo(0, 0);
  render({ anim: true, dir: TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(prev) ? 1 : -1 });
});

function render(o = {}) {
  if (!VIEWS[tab]) tab = "learn";
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  const pr = progressToday();
  $("#topbar").innerHTML = `<div class="brand">English <b>Work</b></div>
    <div class="pills"><span class="pill" title="Serie di giorni">🔥 ${currentStreak()}</span><span class="pill" title="XP di oggi">⚡ ${pr.xp}/${S.settings.goal}</span></div>`;
  const v = $("#view");
  VIEWS[tab](v);
  if (o.anim) animatePage(v, o.dir || 0);
}

function nextLesson() {
  for (const u of COURSE) { const ls = lessonsOf(u); for (let i = 0; i < ls.length; i++) if (!S.done[u.id + "-" + i]) return { u, i, l: ls[i] }; }
  const u = COURSE[Math.floor(Math.random() * COURSE.length)]; return { u, i: 3, l: lessonsOf(u)[3] };
}
function openLesson(u, i) {
  const l = lessonsOf(u)[i];
  const run = () => startLesson({ title: `${u.title} · ${l.name}`, exercises: buildExercises(l.items, l.opts), doneKey: u.id + "-" + i, again: run });
  run();
}
function showTip(u) {
  modal(`<h2>${u.icon} ${esc(u.title)}</h2><div class="tip">${u.tip}</div>
    <div class="section-title">Vocaboli dell'unità</div>
    <div>${u.words.map(([en, it]) => `<div class="word-row"><div class="grow"><div class="en">${tapText(en)}</div><div class="it">${esc(it)}</div></div><button class="iconbtn" data-say="${esc(en)}">🔊</button></div>`).join("")}</div>
    <button class="btn primary block" style="margin-top:14px" id="mclose">Chiudi</button>`, s => {
    $$("[data-say]", s).forEach(b => b.onclick = () => say(b.dataset.say));
    $("#mclose", s).onclick = closeModal;
  });
}

const VIEWS = {
  learn(v) {
    const pr = progressToday();
    const nx = nextLesson();
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = navigator.standalone || matchMedia("(display-mode: standalone)").matches;
    let html = "";
    if (isIOS && !standalone && !localStorage.getItem("ew-hide-install")) html += `<div class="card install"><div class="row"><div class="grow small"><b>Installa l'app sull'iPhone</b><br>In Safari tocca <b>Condividi</b> <span style="font-size:16px">⬆️</span> e poi <b>“Aggiungi alla schermata Home”</b>.</div><button class="iconbtn" id="hideInst">✕</button></div></div>`;
    html += `<div class="card"><div class="goal"><div class="ring" style="--p:${pr.pct}"><div>${pr.pct}%</div></div>
      <div class="grow"><b>Obiettivo giornaliero</b><div class="muted small">${pr.xp} di ${S.settings.goal} XP oggi · serie 🔥 ${currentStreak()} giorni</div></div></div></div>
      <button class="card continue block" id="cont" style="width:100%;text-align:left"><div class="row"><div class="unit-icon" style="background:rgba(255,255,255,.18)">${nx.u.icon}</div>
      <div class="grow"><div class="small muted">Continua da qui</div><b style="font-size:18px">${esc(nx.u.title)}</b><div class="small muted">${nx.l.name}</div></div><span style="font-size:26px">▶</span></div></button>
      <button class="card" id="goScenes"><div class="row"><div class="unit-icon">🎬</div>
      <div class="grow"><b>Scene da serie TV</b><div class="small muted">Ascolta, poi scrivi cosa hai capito · anche da YouTube</div></div><span class="muted">›</span></div></button>
      <div class="section-title">Percorso · tutte le unità sono sbloccate</div>`;
    let lastLevel = "";
    COURSE.forEach(u => {
      if (u.level !== lastLevel) { lastLevel = u.level; html += `<div class="section-title">Livello ${u.level} ${u.level === "A1" ? "· Base" : u.level === "A2" ? "· Elementare" : u.level === "B1" ? "· Intermedio" : "· Intermedio avanzato"}</div>`; }
      const ls = lessonsOf(u); const nDone = ls.filter((_, i) => S.done[u.id + "-" + i]).length;
      html += `<div class="card"><div class="unit-head"><div class="unit-icon">${u.icon}</div>
        <div class="grow"><b>${esc(u.title)}</b><div class="small muted"><span class="badge">${u.level}</span>${nDone}/4 lezioni · ${u.words.length} parole</div>
        <div class="bar" style="margin-top:6px;height:6px"><i style="width:${nDone * 25}%"></i></div></div>
        <button class="iconbtn" data-tip="${u.id}" aria-label="Guida">📖</button></div>
        <div class="lessons">${ls.map((l, i) => { const c = S.done[u.id + "-" + i] || 0; return `<button class="lesson-btn ${c ? "done" : ""}" data-u="${u.id}" data-l="${i}">${c ? `<span class="cnt">✓${c > 1 ? c : ""}</span>` : ""}<span class="ic">${l.ic}</span>${l.name}</button>`; }).join("")}</div></div>`;
    });
    v.innerHTML = html;
    if ($("#hideInst")) $("#hideInst").onclick = () => { localStorage.setItem("ew-hide-install", "1"); render(); };
    $("#cont").onclick = () => openLesson(nx.u, nx.i);
    $("#goScenes").onclick = () => $('#tabs [data-tab="talk"]').click();
    $$("[data-tip]", v).forEach(b => b.onclick = () => showTip(COURSE.find(u => u.id === b.dataset.tip)));
    $$(".lesson-btn", v).forEach(b => b.onclick = () => openLesson(COURSE.find(u => u.id === b.dataset.u), +b.dataset.l));
  },

  review(v) {
    const seen = ALL.filter(i => S.srs[key(i.en)]);
    const due = pool().filter(i => (S.srs[key(i.en)] && isDue(i.en)) || (i.unit === "nb" && isDue(i.en)));
    const dedupe = a => a.filter((x, i) => a.findIndex(y => key(y.en) === key(x.en)) === i);
    const dueU = dedupe(due);
    const nb = notebookItems();
    const cards = [
      { id: "smart", ic: "🧠", t: "Ripasso intelligente", d: dueU.length ? `${dueU.length} elementi da ripassare adesso` : seen.length ? "Tutto ripassato! Ripassa comunque i più deboli" : "Fai qualche lezione: qui ripasserai ciò che studi", on: true },
      { id: "flash", ic: "🃏", t: "Flashcard delle mie parole", d: S.notebook.length ? `${S.notebook.length} parole nel tuo vocabolario` : "Salva qualche parola per usarle", on: S.notebook.length > 0 },
      { id: "nbquiz", ic: "📒", t: "Quiz sulle mie parole", d: nb.length >= 4 ? "Esercizi creati dal tuo vocabolario" : `Servono almeno 4 parole salvate (ne hai ${nb.length})`, on: nb.length >= 4 },
      { id: "listen", ic: "🎧", t: "Allenamento ascolto", d: "Capire l'inglese parlato", on: true },
      { id: "speak", ic: "🎤", t: "Pronuncia", d: SR ? "Leggi frasi ad alta voce" : "Non supportato da questo browser", on: !!SR },
      { id: "free", ic: "♾️", t: "Allenamento libero", d: "Esercizi misti senza fine", on: true }
    ];
    v.innerHTML = `<div class="section-title">Ripasso</div>` + cards.map(c => `<button class="card" data-m="${c.id}" ${c.on ? "" : "disabled"}>
      <div class="row"><div class="unit-icon">${c.ic}</div><div class="grow"><b>${c.t}</b><div class="small muted">${c.d}</div></div><span class="muted">›</span></div></button>`).join("")
      + `<p class="muted small" style="text-align:center">Il ripasso usa la ripetizione dilazionata: ciò che sbagli torna presto, ciò che sai torna più avanti.</p>`;
    const base = seen.length >= 6 ? seen : ALL.filter(i => ["u1", "u2", "u3"].includes(i.unit));
    const modes = {
      smart: () => { const weak = pool().filter(i => S.srs[key(i.en)] && !dueU.some(d => key(d.en) === key(i.en))).sort((a, b) => boxOf(a.en) - boxOf(b.en)); let items = [...dueU, ...weak].slice(0, 12); if (items.length < 6) items = [...items, ...pick(base, 6 - items.length)]; items = items.slice(0, 12); startLesson({ title: "Ripasso intelligente", exercises: buildExercises(items, { perWord: 1, perSent: 1, match: true }), again: modes.smart, autoSave: false }); },
      flash: () => startFlash(),
      nbquiz: () => startLesson({ title: "Quiz sulle mie parole", exercises: buildExercises(pick(nb, 12), { perWord: 1, perSent: 1, match: true }), again: modes.nbquiz, endless: true, autoSave: false }),
      listen: () => startLesson({ title: "Allenamento ascolto", exercises: buildExercises(pick(base, 10), { listen: true }), again: modes.listen, endless: true }),
      speak: () => startLesson({ title: "Pronuncia", exercises: buildExercises(pick(base.filter(i => i.kind === "sentence").concat(pick(base, 4)), 10), { speakOnly: true }), again: modes.speak, endless: true }),
      free: () => startLesson({ title: "Allenamento libero", exercises: buildExercises(pick(base, 12), { perWord: 1, perSent: 1, match: true }), again: modes.free, endless: true })
    };
    $$("[data-m]", v).forEach(b => b.onclick = () => modes[b.dataset.m]());
  },

  words(v) {
    const q = wordQuery.toLowerCase();
    let list = S.notebook.filter(n => !q || n.en.toLowerCase().includes(q) || n.it.toLowerCase().includes(q) || (n.note || "").toLowerCase().includes(q));
    if (wordFilter === "due") list = list.filter(n => isDue(n.en));
    if (wordFilter === "learned") list = list.filter(n => boxOf(n.en) >= 4);
    if (wordFilter === "mine") list = list.filter(n => n.src !== "lezione");
    if (wordFilter === "az") list = [...list].sort((a, b) => a.en.localeCompare(b.en));
    const dots = en => { const b = boxOf(en); return `<span class="dots" title="Livello di memoria">${[1, 2, 3, 4, 5, 6].map(i => `<i class="${i <= b ? "f" : ""}"></i>`).join("")}</span>`; };
    v.innerHTML = `<div class="section-title">Il mio vocabolario · ${S.notebook.length}</div>
      <button class="btn primary block" id="add">＋ Aggiungi parola o frase</button>
      <div style="margin-top:12px"><input class="search" id="q" placeholder="🔍 Cerca in inglese o italiano" value="${esc(wordQuery)}" autocapitalize="off" autocorrect="off"></div>
      <div class="chips">${[["all", "Tutte"], ["due", "Da ripassare"], ["learned", "Imparate"], ["mine", "Aggiunte da me"], ["az", "A → Z"]].map(([k, t]) => `<button class="chip ${wordFilter === k ? "on" : ""}" data-f="${k}">${t}</button>`).join("")}</div>
      ${list.length ? `<div class="card list-card">${list.map(n => `<div class="word-row">
        <button class="iconbtn" data-say="${esc(n.en)}">🔊</button>
        <div class="grow"><div class="en">${tapText(n.en)}${dots(n.en)}</div><div class="it">${esc(n.it)}</div>${n.note ? `<div class="note">${esc(n.note)}</div>` : ""}</div>
        <button class="iconbtn" data-edit="${n.id}" aria-label="Modifica">✏️</button></div>`).join("")}</div>`
        : `<div class="empty"><div class="e">📒</div><p>${S.notebook.length ? "Nessun risultato." : "Qui troverai le parole che impari.<br>Si salvano da sole al termine delle lezioni, oppure toccando ☆ durante un esercizio. Puoi anche aggiungerle a mano."}</p></div>`}
      ${S.notebook.length >= 4 ? `<div class="row" style="margin-top:4px"><button class="btn block" id="fl">🃏 Flashcard</button><button class="btn block" id="csv">⬇️ Esporta CSV</button></div>` : ""}`;
    const qi = $("#q");
    qi.oninput = () => { wordQuery = qi.value; const pos = qi.selectionStart; VIEWS.words(v); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); };
    $$("[data-f]", v).forEach(b => b.onclick = () => { wordFilter = b.dataset.f; VIEWS.words(v); });
    $$("[data-say]", v).forEach(b => b.onclick = () => say(b.dataset.say));
    $$("[data-edit]", v).forEach(b => b.onclick = () => wordForm(S.notebook.find(n => n.id === b.dataset.edit)));
    $("#add").onclick = () => wordForm();
    if ($("#fl")) $("#fl").onclick = startFlash;
    if ($("#csv")) $("#csv").onclick = exportCSV;
  },

  profile(v) {
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * DAY); return { k: dayStr(d), l: ["D", "L", "M", "M", "G", "V", "S"][d.getDay()] }; });
    const max = Math.max(S.settings.goal, ...days.map(d => S.days[d.k] || 0));
    const lessonsDone = Object.values(S.done).reduce((a, b) => a + b, 0);
    const learned = Object.values(S.srs).filter(r => r.b >= 4).length;
    const st = S.settings;
    const sw = (id, on) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? "checked" : ""}><i></i></label>`;
    v.innerHTML = `<div class="section-title">Statistiche</div>
      <div class="stats" style="margin:0 0 14px"><div class="stat"><b>🔥 ${currentStreak()}</b><span>Serie (record ${S.best || 0})</span></div><div class="stat"><b>⚡ ${S.xp}</b><span>XP totali</span></div><div class="stat"><b>${lessonsDone}</b><span>Lezioni</span></div>
      <div class="stat"><b>${S.notebook.length}</b><span>Parole salvate</span></div><div class="stat"><b>${learned}</b><span>Memorizzate</span></div><div class="stat"><b>${Object.keys(S.srs).length}</b><span>Viste</span></div></div>
      <div class="card"><b>Ultimi 7 giorni</b><div class="week">${days.map((d, i) => `<div class="d ${i === 6 ? "today" : ""}"><span>${S.days[d.k] || ""}</span><i style="height:${Math.round(((S.days[d.k] || 0) / max) * 80)}%"></i>${d.l}</div>`).join("")}</div></div>
      <div class="section-title">Impostazioni</div>
      <div class="card" style="padding:4px 16px">
        <div class="setting"><span>Obiettivo giornaliero</span><select id="goal">${[[10, "Rilassato · 10 XP"], [20, "Normale · 20 XP"], [30, "Serio · 30 XP"], [50, "Intenso · 50 XP"], [100, "Estremo · 100 XP"]].map(([x, t]) => `<option value="${x}" ${st.goal == x ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="setting"><span>Accento</span><select id="accent"><option value="en-US" ${st.accent === "en-US" ? "selected" : ""}>🇺🇸 Americano</option><option value="en-GB" ${st.accent === "en-GB" ? "selected" : ""}>🇬🇧 Britannico</option></select></div>
        <div class="setting"><span>Velocità voce</span><select id="rate">${[[0.7, "Lenta"], [0.9, "Normale"], [1, "Naturale"], [1.1, "Veloce"]].map(([x, t]) => `<option value="${x}" ${st.rate == x ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="setting"><span>Salva automaticamente le parole delle lezioni</span>${sw("autoSave", st.autoSave)}</div>
        <div class="setting"><span>Esercizi di pronuncia</span>${sw("speak", st.speak)}</div>
        <div class="setting"><span>Effetti sonori</span>${sw("sound", st.sound)}</div>
        <div class="setting"><span>Prova la voce</span><button class="btn sm" id="testv">🔊 Hello!</button></div>
      </div>
      <div class="section-title">Backup</div>
      <div class="card"><p class="small muted" style="margin-top:0">I dati restano solo su questo telefono. Fai un backup ogni tanto per non perderli.</p>
        <div class="row"><button class="btn block" id="exp">⬇️ Esporta backup</button><label class="btn block ghost">⬆️ Importa<input type="file" id="imp" accept=".json,application/json" hidden></label></div>
        <button class="btn ghost block" id="reset" style="margin-top:10px;color:var(--bad)">Azzera tutti i progressi</button></div>
      <p class="muted small" style="text-align:center">English Work · gratis e senza limiti · funziona anche offline</p>`;
    $("#goal").onchange = e => { st.goal = +e.target.value; save(); render(); };
    $("#accent").onchange = e => { st.accent = e.target.value; save(); say("Hello! Nice to meet you."); };
    $("#rate").onchange = e => { st.rate = +e.target.value; save(); say("This is the new speed."); };
    ["autoSave", "speak", "sound"].forEach(id => $("#" + id).onchange = e => { st[id] = e.target.checked; save(); });
    $("#testv").onclick = () => say("Hello! Welcome to your English course.");
    $("#exp").onclick = () => download(`english-work-backup-${dayStr()}.json`, JSON.stringify(S, null, 1), "application/json");
    $("#imp").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const d = JSON.parse(await f.text()); if (!d || !Array.isArray(d.notebook)) throw 0; if (!confirm("Sostituire i dati attuali con quelli del backup?")) return; S = { ...clone(DEFAULTS), ...d, settings: { ...DEFAULTS.settings, ...(d.settings || {}) } }; save(); render(); toast("Backup ripristinato ✅"); }
      catch (err) { toast("File di backup non valido"); }
    };
    $("#reset").onclick = () => { if (confirm("Cancellare TUTTI i progressi e le parole salvate? L'operazione non si può annullare.")) { S = clone(DEFAULTS); save(); render(); toast("Progressi azzerati"); } };
  }
};

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportCSV() {
  const q = s => `"${String(s).replace(/"/g, '""')}"`;
  download(`mie-parole-${dayStr()}.csv`, "﻿Inglese;Italiano;Note\n" + S.notebook.map(n => [n.en, n.it, n.note].map(q).join(";")).join("\n"), "text/csv");
}

function wordForm(n) {
  const edit = !!n;
  modal(`<h2>${edit ? "Modifica parola" : "Nuova parola"}</h2>
    <label class="field"><span>Inglese</span><input id="fen" value="${esc(n?.en)}" placeholder="es. deadline" autocapitalize="off" autocorrect="off"></label>
    <label class="field"><span>Italiano</span><input id="fit" value="${esc(n?.it)}" placeholder="es. scadenza"></label>
    <button class="btn ghost block sm" id="tr" style="margin:-4px 0 12px">🌐 Traduci automaticamente</button>
    <label class="field"><span>Nota o esempio (facoltativo)</span><textarea id="fnote" rows="2" placeholder="es. The deadline is Friday">${esc(n?.note)}</textarea></label>
    <div class="row"><button class="btn ghost block" id="cancel">Annulla</button><button class="btn primary block" id="ok">${edit ? "Salva" : "Aggiungi"}</button></div>
    ${edit ? `<div class="row" style="margin-top:10px"><button class="btn block sm" id="say">🔊 Ascolta</button><button class="btn ghost block sm" id="del" style="color:var(--bad)">Elimina</button></div>` : ""}`, s => {
    const en = $("#fen", s), it = $("#fit", s), note = $("#fnote", s);
    if (!edit) setTimeout(() => en.focus(), 100);
    $("#cancel", s).onclick = closeModal;
    $("#tr", s).onclick = async () => {
      const b = $("#tr", s);
      try {
        b.textContent = "Traduco…";
        if (en.value.trim() && !it.value.trim()) it.value = await translate(en.value.trim(), "en", "it");
        else if (it.value.trim() && !en.value.trim()) en.value = await translate(it.value.trim(), "it", "en");
        else if (en.value.trim()) it.value = await translate(en.value.trim(), "en", "it");
        else { toast("Scrivi prima una parola"); }
        b.textContent = "🌐 Traduci automaticamente";
      } catch (e) { b.textContent = "🌐 Traduci automaticamente"; toast("Traduzione non disponibile (sei offline?)"); }
    };
    $("#ok", s).onclick = () => {
      const E = en.value.trim(), I = it.value.trim();
      if (!E || !I) return toast("Compila inglese e italiano");
      if (edit) {
        if (key(E) !== key(n.en) && S.notebook.some(x => x !== n && key(x.en) === key(E))) return toast("Questa parola c'è già");
        Object.assign(n, { en: E, it: I, note: note.value.trim() }); save(); toast("Salvato ✅");
      } else {
        if (!addToNotebook(E, I, note.value.trim(), "manuale")) return toast("Questa parola c'è già");
        toast("Aggiunta al vocabolario ⭐");
      }
      closeModal(); render();
    };
    if (edit) {
      $("#say", s).onclick = () => say(n.en);
      $("#del", s).onclick = () => { if (confirm(`Eliminare “${n.en}” dal vocabolario?`)) { S.notebook = S.notebook.filter(x => x !== n); save(); closeModal(); render(); } };
    }
  });
}

/* ============ Flashcard ============ */
function startFlash() {
  if (!S.notebook.length) return toast("Aggiungi prima qualche parola");
  const deck = [...S.notebook].sort((a, b) => ((S.srs[key(a.en)] || {}).d || 0) - ((S.srs[key(b.en)] || {}).d || 0)).slice(0, 20);
  let i = 0, known = 0, front = Math.random() < 0.5 ? "en" : "it";
  showOverlay();
  const draw = () => {
    if (i >= deck.length) {
      if (known) addXP(Math.min(20, known)); save();
      overlay.innerHTML = `<div class="lesson"><div class="ex-body done-screen"><div class="trophy">🃏</div><h2>Mazzo completato!</h2>
        <p class="muted">Sapevi ${known} parole su ${deck.length}</p></div><div class="ex-foot"><button class="btn ghost block" id="again" style="margin-bottom:10px">Altro giro</button><button class="btn primary block" id="close">Fine</button></div></div>`;
      $("#close").onclick = closeLesson; $("#again").onclick = startFlash; return;
    }
    const n = deck[i]; front = S.settings.flashFront || (Math.random() < 0.6 ? "en" : "it");
    const f = front === "en" ? n.en : n.it, b = front === "en" ? n.it : n.en;
    overlay.innerHTML = `<div class="lesson"><div class="lesson-top"><button class="x" id="quit">✕</button><div class="bar"><i style="width:${(i / deck.length) * 100}%"></i></div><span class="muted small">${i + 1}/${deck.length}</span></div>
      <div class="ex-body"><div class="ex-label">${front === "en" ? "Cosa significa?" : "Come si dice in inglese?"}</div>
      <div class="flash" id="card"><div class="flash-inner"><div class="flash-face"><div class="w">${esc(f)}</div><p class="muted small">Tocca per girare</p></div>
      <div class="flash-face back"><div class="w">${esc(b)}</div><p class="muted">${esc(front === "en" ? n.en : n.it)}</p>${n.note ? `<p class="small muted"><i>${esc(n.note)}</i></p>` : ""}<button class="speaker" id="sp">🔊</button></div></div></div></div>
      <div class="ex-foot" id="foot"><button class="btn primary block" id="flip">Mostra risposta</button></div></div>`;
    $("#quit").onclick = closeLesson;
    if (front === "en") say(n.en);
    const flip = () => {
      $("#card").classList.add("flip"); if (front === "it") say(n.en);
      $("#foot").innerHTML = `<div class="grade"><button class="btn bad" data-g="0">Non la so</button><button class="btn" data-g="1">Difficile</button><button class="btn ok" data-g="2">La so</button></div>`;
      $$("[data-g]").forEach(x => x.onclick = () => { const g = +x.dataset.g; if (g === 2) known++; if (g !== 1) srsUpdate(n.en, g === 2); else { const r = S.srs[key(n.en)]; if (r) r.d = Date.now() + DAY; } if (g === 0) deck.push(n); i++; save(); draw(); });
    };
    $("#card").onclick = e => { if (e.target.id === "sp") return say(n.en); if (!$("#card").classList.contains("flip")) flip(); };
    $("#flip").onclick = flip;
  };
  draw();
}

/* ============ Animazioni ============ */
let revealObs = null;
function animatePage(v, dir) {
  if (REDUCED) return;
  v.classList.remove("page-in", "from-right", "from-left", "from-none");
  void v.offsetWidth; // riavvia l'animazione
  v.classList.add("page-in", dir > 0 ? "from-right" : dir < 0 ? "from-left" : "from-none");
  // Effetto di scorrimento: gli elementi sotto lo schermo compaiono quando ci arrivi
  if (revealObs) revealObs.disconnect();
  const els = $$(":scope > .card, :scope > .reveal", v);
  if (!("IntersectionObserver" in window)) return;
  revealObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
  }), { rootMargin: "0px 0px -20px 0px" });
  let n = 0;
  els.forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) { el.classList.add("pop-in"); el.style.animationDelay = Math.min(n++, 7) * 45 + "ms"; }
    else { el.classList.add("rv"); revealObs.observe(el); }
  });
}

/* ============ Dialoghi ============ */
let D = null;
function pauseDialogue() { if (D && D.playing) { D.playing = false; D.token++; stopAudio(); markPlaying(-1); updatePlayBtn(); } }
function stopDialogue() { if (D) { D.playing = false; D.token++; } D = null; }
function markPlaying(i) { $$(".msg", overlay).forEach(m => m.classList.toggle("speaking", +m.dataset.i === i)); }
function updatePlayBtn() { const b = $("#playAll"); if (b && D) b.textContent = D.playing ? "⏸ Pausa" : "▶ Ascolta tutto"; }
function playLine(i, token) {
  if (!D || token !== D.token || !D.playing) return;
  const lines = D.d.lines;
  if (i >= lines.length) { D.playing = false; markPlaying(-1); updatePlayBtn(); return; }
  const [who, en] = lines[i];
  markPlaying(i);
  const m = $(`.msg[data-i="${i}"]`, overlay);
  if (m) m.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
  let moved = false;
  const next = () => { if (moved) return; moved = true; clearTimeout(fallback); setTimeout(() => playLine(i + 1, token), 350); };
  // se il telefono non segnala la fine dell'audio, andiamo avanti comunque
  const fallback = setTimeout(next, (hasAudio(en, who === "A" ? "m" : "f") ? 4000 : 1500) + en.split(" ").length * 650);
  say(en, false, { voice: who === "A" ? "m" : "f", pitch: who === "A" ? 1.05 : 0.8, onend: next });
}
function openDialogue(d) {
  stopDialogue();
  D = { d, playing: false, showIt: false, token: 0 };
  showOverlay();
  drawDialogue();
}
function drawDialogue() {
  const { d } = D, done = S.done["d-" + d.id];
  overlay.innerHTML = `<div class="lesson"><div class="lesson-top"><button class="x" id="quit" aria-label="Chiudi">✕</button>
    <div class="grow"><b>${d.icon} ${esc(d.title)}</b><div class="small muted"><span class="badge">${d.level}</span>${done ? "✓ completato" : "Tocca un messaggio per la traduzione"}</div></div></div>
    <div class="ex-body ex-in"><p class="muted small" style="margin-top:0">${esc(d.context)}</p>
    <div class="chat">${d.lines.map(([who, en, it], i) => `<div class="msg ${who === "A" ? "me" : "them"}" data-i="${i}">
      <div class="sent">${tapText(en, true)}</div><div class="tr" ${D.showIt ? "" : "hidden"}>${esc(it)}</div>
      <button class="mini" data-play="${i}" aria-label="Ascolta">🔊</button></div>`).join("")}</div></div>
    <div class="ex-foot"><div class="row" style="margin-bottom:10px"><button class="btn block" id="playAll">▶ Ascolta tutto</button>
    <button class="btn ghost block" id="trT">${D.showIt ? "Nascondi" : "Mostra"} 🇮🇹</button></div>
    <button class="btn primary block" id="dq">Esercizi sul dialogo ➜</button></div></div>`;
  $("#quit").onclick = closeLesson;
  $$(".msg", overlay).forEach(m => m.onclick = e => {
    const p = e.target.closest("[data-play]");
    if (p) { pauseDialogue(); say(D.d.lines[+p.dataset.play][1], false, { voice: D.d.lines[+p.dataset.play][0] === "A" ? "m" : "f", pitch: D.d.lines[+p.dataset.play][0] === "A" ? 1.05 : 0.8 }); return; }
    const t = $(".tr", m); t.hidden = !t.hidden;
  });
  $("#playAll").onclick = () => {
    if (D.playing) return pauseDialogue();
    D.playing = true; D.token++; updatePlayBtn(); playLine(0, D.token);
  };
  $("#trT").onclick = () => { D.showIt = !D.showIt; $$(".tr", overlay).forEach(t => t.hidden = !D.showIt); $("#trT").textContent = (D.showIt ? "Nascondi" : "Mostra") + " 🇮🇹"; };
  $("#dq").onclick = () => startDialogueQuiz(d);
}
function startDialogueQuiz(d) {
  pauseDialogue();
  const items = d.lines.map(([, en, it]) => ({ en, it, kind: "sentence", unit: "dlg" }))
    .filter(x => { const n = x.en.split(" ").length; return n >= 4 && n <= 14 && !/\d|[A-Z]-[A-Z]/.test(x.en); });
  const ex = [
    ...d.quiz.map(q => ({ t: "quiz", ...q })),
    ...pick(items, 3).map((item, i) => ({ t: ["build_listen", "build", "mc_sent"][i % 3], item }))
  ];
  const run = () => { D = null; startLesson({ title: "Dialogo · " + d.title, exercises: shuffle(ex).map(e => ({ ...e })), doneKey: "d-" + d.id, again: run, autoSave: false }); };
  run();
}
EX.quiz = (ex, el) => {
  el.innerHTML = `<div class="ex-label">${esc(ex.q)}</div><p class="muted small" style="margin-top:-8px">Domanda sul dialogo</p>`;
  const get = options(el, shuffle(ex.o), () => {});
  const right = ex.o[ex.a];
  L.check = () => { const c = get(); markOptions(el, right, c); return { ok: c === right, correct: esc(right) }; };
};

/* ============ Vista "Conversa": dialoghi + frasario ============ */
const openCats = new Set();
VIEWS.talk = v => {
  const saved = en => S.notebook.some(n => key(n.en) === key(en));
  v.innerHTML = scenesHTML() + `<div class="section-title">Dialoghi di lavoro</div>
    ${DIALOGUES.map(d => `<button class="card dlg" data-d="${d.id}" style="width:100%;text-align:left"><div class="row"><div class="unit-icon">${d.icon}</div>
      <div class="grow"><b>${esc(d.title)}</b><div class="small muted"><span class="badge">${d.level}</span>${S.done["d-" + d.id] ? "✓ completato" : d.lines.length + " battute"}</div></div><span class="muted">›</span></div></button>`).join("")}
    <div class="section-title">Frasi pronte da usare</div>
    ${PHRASEBOOK.map((c, ci) => `<div class="card cat ${openCats.has(ci) ? "open" : ""}" data-c="${ci}">
      <button class="cat-head row" style="width:100%;text-align:left"><span style="font-size:22px">${c.icon}</span><b class="grow">${esc(c.title)}</b><span class="muted small">${c.items.length}</span><span class="chev">⌄</span></button>
      <div class="cat-body"><div>${c.items.map(([en, it], pi) => `<div class="word-row"><button class="iconbtn" data-say="${esc(en)}">🔊</button>
        <div class="grow"><div class="en">${esc(en)}</div><div class="it">${esc(it)}</div></div>
        <button class="star-btn ${saved(en) ? "on" : ""}" data-sv="${ci}-${pi}" aria-label="Salva">${saved(en) ? "★" : "☆"}</button></div>`).join("")}</div></div></div>`).join("")}`;
  bindScenes(v);
  $$("[data-d]", v).forEach(b => b.onclick = () => openDialogue(DIALOGUES.find(d => d.id === b.dataset.d)));
  $$(".cat-head", v).forEach(h => h.onclick = () => {
    const c = h.closest(".cat"), ci = +c.dataset.c;
    c.classList.toggle("open"); if (c.classList.contains("open")) openCats.add(ci); else openCats.delete(ci);
  });
  $$("[data-say]", v).forEach(b => b.onclick = () => say(b.dataset.say));
  $$("[data-sv]", v).forEach(b => b.onclick = () => {
    const [ci, pi] = b.dataset.sv.split("-").map(Number), [en, it] = PHRASEBOOK[ci].items[pi];
    if (addToNotebook(en, it, "", "frasario")) { b.textContent = "★"; b.classList.add("on"); toast("Salvata nelle tue parole ⭐"); }
    else toast("È già nelle tue parole");
  });
};

/* ============ Scene da serie TV ============ */
let SC = null;
const foldText = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'");
const nameOf = n => n.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
function pauseScene() { if (SC && SC.playing) { SC.playing = false; SC.token++; stopAudio(); updateTV(); } }
function stopScene() { if (SC) { SC.playing = false; SC.token++; } SC = null; }

function scenesHTML() {
  const last = id => S.journal.find(j => j.scene === id);
  return `<div class="section-title">Scene da serie TV</div>
    <p class="muted small" style="margin:-4px 4px 10px">Ascolta la scena come se fossi davanti alla TV, poi scrivi cosa hai capito.</p>
    ${SCENES.map(s => { const l = last(s.id); return `<button class="card" data-s="${s.id}" style="width:100%;text-align:left"><div class="row"><div class="unit-icon">${s.icon}</div>
      <div class="grow"><b>${esc(s.title)}</b><div class="small muted"><span class="badge">${s.level}</span>${esc(s.genre)}${l ? ` · ultimo: ${l.score}%` : ""}</div></div><span class="muted">›</span></div></button>`; }).join("")}
    <button class="card" id="ytNew" style="width:100%;text-align:left"><div class="row"><div class="unit-icon">▶️</div>
      <div class="grow"><b>La tua scena da YouTube</b><div class="small muted">Incolla il link di una scena della tua serie preferita</div></div><span class="muted">›</span></div></button>
    ${S.journal.length ? `<div class="card list-card reveal"><div class="section-title" style="margin:12px 0 4px">Il mio diario di ascolto</div>${S.journal.slice(0, 15).map(j => `
      <div class="word-row" data-j="${j.id}" style="cursor:pointer"><span style="font-size:22px">${j.type === "yt" ? "▶️" : (SCENES.find(s => s.id === j.scene) || {}).icon || "🎬"}</span>
      <div class="grow"><div class="en">${esc(j.title)}</div><div class="it" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(j.text)}</div></div>
      <span class="small muted">${j.type === "yt" ? "" : j.score + "%"}</span></div>`).join("")}</div>` : ""}`;
}
function bindScenes(v) {
  $$("[data-s]", v).forEach(b => b.onclick = () => openScene(SCENES.find(s => s.id === b.dataset.s)));
  $("#ytNew", v).onclick = () => openYouTube();
  $$("[data-j]", v).forEach(r => r.onclick = () => {
    const j = S.journal.find(x => x.id === r.dataset.j); if (!j) return;
    if (j.type === "yt") openYouTube(j); else openScene(SCENES.find(s => s.id === j.scene), j);
  });
}

function openScene(s, entry) {
  if (!s) return;
  stopDialogue(); stopScene();
  SC = { s, playing: false, token: 0, cur: -1, subs: 0, slow: false, played: false };
  showOverlay();
  overlay.innerHTML = `<div class="lesson"><div class="lesson-top"><button class="x" id="quit" aria-label="Chiudi">✕</button>
    <div class="grow"><b>${s.icon} ${esc(s.title)}</b><div class="small muted"><span class="badge">${s.level}</span>${esc(s.genre)}</div></div></div>
    <div class="ex-body ex-in" id="scBody">
      <p class="muted small" style="margin-top:0">🎬 ${esc(s.setting)}</p>
      <div class="tv"><div class="tv-screen"><div class="tv-who" id="tvWho">Premi ▶ per iniziare</div><div class="tv-sub" id="tvSub"></div><div class="tv-subit" id="tvSubIt"></div></div>
        <div class="tv-bar"><div class="tv-prog"><i id="tvProg"></i></div></div></div>
      <div class="tv-controls">
        <button class="btn" id="tvRestart" aria-label="Dall'inizio">⏮</button>
        <button class="btn primary" id="tvPlay" style="flex:1">▶ Guarda la scena</button>
        <button class="btn" id="tvSlow" aria-label="Lento">🐢</button>
      </div>
      <div class="chips" id="subChips">${["Senza sottotitoli", "Sottotitoli EN", "EN + IT"].map((t, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-sub="${i}">${t}</button>`).join("")}</div>
      <p class="muted small">Consiglio: la prima volta guardala senza sottotitoli. Puoi riascoltarla quante volte vuoi.</p>
      <label class="field"><span>✍️ Cosa hai capito? Scrivi in italiano (o in inglese)</span>
        <textarea id="scText" rows="5" placeholder="Es. Il capo arriva in ritardo e…">${esc(entry ? entry.text : "")}</textarea></label>
      <div id="scResult"></div>
    </div>
    <div class="ex-foot"><button class="btn primary block" id="scCheck">Controlla cosa ho capito</button></div></div>`;
  $("#quit").onclick = closeLesson;
  $("#tvPlay").onclick = () => { if (SC.playing) return pauseScene(); playScene(SC.cur >= 0 && SC.cur < s.lines.length - 1 ? SC.cur : 0); };
  $("#tvRestart").onclick = () => { pauseScene(); playScene(0); };
  $("#tvSlow").onclick = () => { SC.slow = !SC.slow; $("#tvSlow").classList.toggle("primary", SC.slow); toast(SC.slow ? "Velocità ridotta 🐢" : "Velocità normale"); };
  $$("[data-sub]", overlay).forEach(c => c.onclick = () => { SC.subs = +c.dataset.sub; $$("[data-sub]", overlay).forEach(x => x.classList.toggle("on", x === c)); updateTV(); });
  $("#scCheck").onclick = () => checkScene(s);
  if (entry) checkScene(s, true);
}
function updateTV() {
  if (!SC) return;
  const { s, cur } = SC, line = s.lines[cur];
  const who = $("#tvWho"), sub = $("#tvSub"), subIt = $("#tvSubIt"), play = $("#tvPlay"), prog = $("#tvProg");
  if (!who) return;
  play.textContent = SC.playing ? "⏸ Pausa" : SC.played ? "▶ Riprendi / riguarda" : "▶ Guarda la scena";
  if (prog) prog.style.width = (cur < 0 ? 0 : ((cur + 1) / s.lines.length) * 100) + "%";
  if (!line) { who.textContent = SC.played ? "Fine della scena" : "Premi ▶ per iniziare"; sub.textContent = ""; subIt.textContent = ""; return; }
  who.textContent = "🗣️ " + nameOf(line[0]);
  sub.textContent = SC.subs >= 1 ? line[1] : "";
  subIt.textContent = SC.subs === 2 ? line[2] : "";
  who.parentElement.classList.remove("flash"); void who.offsetWidth; who.parentElement.classList.add("flash");
}
function playScene(i) {
  if (!SC) return;
  SC.playing = true; SC.token++;
  const token = SC.token;
  const step = j => {
    if (!SC || token !== SC.token || !SC.playing) return;
    if (j >= SC.s.lines.length) { SC.playing = false; SC.played = true; SC.cur = SC.s.lines.length; updateTV(); return; }
    SC.cur = j; updateTV();
    const [who, en] = SC.s.lines[j], voice = SC.s.cast[who] || "f";
    let moved = false;
    const next = () => { if (moved) return; moved = true; clearTimeout(fb); setTimeout(() => step(j + 1), 450); };
    const fb = setTimeout(next, (hasAudio(en, voice) ? 4000 : 1500) + en.split(" ").length * (SC.slow ? 900 : 650));
    say(en, SC.slow, { voice, pitch: /m$/.test(voice) ? 0.85 : 1.1, onend: next });
  };
  step(i);
}
function checkScene(s, silent) {
  const txt = $("#scText").value.trim();
  if (txt.length < 15) { if (!silent) toast("Scrivi almeno una frase su cosa hai capito"); return; }
  pauseScene();
  const f = foldText(txt);
  const got = s.points.map(p => p.kw.some(k => f.includes(foldText(k))));
  const render = () => {
    const n = got.filter(Boolean).length, score = Math.round((n / s.points.length) * 100);
    $("#scResult").innerHTML = `<div class="card pop-in"><div class="row"><div class="ring" style="--p:${score}"><div>${score}%</div></div>
      <div class="grow"><b>${score >= 80 ? "Ottima comprensione! 🎉" : score >= 50 ? "Buona comprensione 👍" : "Riascoltala con i sottotitoli 💪"}</b>
      <div class="small muted">${n} punti chiave su ${s.points.length}. Tocca un punto per correggere la valutazione.</div></div></div>
      <div style="margin-top:10px">${s.points.map((p, i) => `<button class="point ${got[i] ? "ok" : ""}" data-pt="${i}">${got[i] ? "✅" : "⬜"} ${esc(p.it)}</button>`).join("")}</div></div>
      <div class="card"><b>📝 Riassunto</b><p style="margin:6px 0 0">${esc(s.summary)}</p></div>
      <div class="card"><b>🎬 Copione completo</b><p class="muted small" style="margin:4px 0 8px">Tocca una battuta per riascoltarla.</p>
      ${s.lines.map(([who, en, it], i) => `<div class="script-line" data-l="${i}"><div class="small muted">${esc(nameOf(who))}</div><div class="sent">${tapText(en, true)}</div><div class="it small muted">${esc(it)}</div></div>`).join("")}</div>`;
    $$("[data-pt]", overlay).forEach(b => b.onclick = () => { got[+b.dataset.pt] = !got[+b.dataset.pt]; render(); saveEntry(); });
    $$("[data-l]", overlay).forEach(l => l.onclick = () => { pauseScene(); const [who, en] = s.lines[+l.dataset.l]; say(en, false, { voice: s.cast[who] }); });
    return score;
  };
  let entryId = null;
  const saveEntry = () => {
    const score = Math.round((got.filter(Boolean).length / s.points.length) * 100);
    const old = S.journal.find(j => j.id === entryId || (j.scene === s.id && j.text === txt));
    if (old) Object.assign(old, { score, t: Date.now() }); else { entryId = Date.now().toString(36); S.journal.unshift({ id: entryId, type: "scene", scene: s.id, title: s.title, text: txt, score, t: Date.now() }); }
    S.journal = S.journal.slice(0, 100); save();
  };
  const score = render();
  if (!silent) {
    const firstTime = !S.done["s-" + s.id];
    saveEntry();
    S.done["s-" + s.id] = (S.done["s-" + s.id] || 0) + 1;
    addXP(firstTime ? 10 + Math.round(score / 10) : 5); save();
    beep(score >= 50);
    setTimeout(() => $("#scResult").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }), 60);
  }
  $("#scCheck").textContent = "Controlla di nuovo";
}

/* --- Scena da YouTube scelta da te --- */
function ytId(url) {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  if (!m) return null;
  const t = String(url).match(/[?&#]t=(?:(\d+)h)?(?:(\d+)m)?(\d+)s?/);
  const start = t ? (+(t[1] || 0)) * 3600 + (+(t[2] || 0)) * 60 + (+(t[3] || 0)) : 0;
  return { id: m[1], start };
}
function openYouTube(entry) {
  stopDialogue(); stopScene(); stopAudio();
  showOverlay();
  overlay.innerHTML = `<div class="lesson"><div class="lesson-top"><button class="x" id="quit" aria-label="Chiudi">✕</button>
    <div class="grow"><b>▶️ La tua scena da YouTube</b><div class="small muted">Guarda, poi scrivi cosa hai capito</div></div></div>
    <div class="ex-body ex-in">
      ${entry ? "" : `<div class="small muted" style="margin-bottom:6px"><b>1.</b> Cerca una scena su YouTube, copia il link (Condividi → Copia link) e torna qui:</div>
      <div class="chips" style="flex-wrap:wrap">${[["Friends", "friends scene"], ["How I Met Your Mother", "how i met your mother scene"], ["The Office", "the office us scene"], ["Modern Family", "modern family scene"], ["Brooklyn Nine-Nine", "brooklyn nine nine scene"], ["The Big Bang Theory", "big bang theory scene"], ["Suits", "suits scene"], ["Sherlock (UK)", "sherlock bbc scene"]]
        .map(([n, q]) => `<a class="chip" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q + " english subtitles")}">🔎 ${n}</a>`).join("")}</div>
      <div class="small muted" style="margin:6px 0"><b>2.</b> Incolla il link:</div>`}
      <label class="field"><span>Link del video</span><input id="ytUrl" placeholder="https://youtu.be/…" value="${esc(entry ? entry.url : "")}" autocapitalize="off" autocorrect="off" inputmode="url"></label>
      <div id="ytBox"></div>
      <label class="field"><span>Titolo (serie, episodio…)</span><input id="ytTitle" value="${esc(entry ? entry.title : "")}" placeholder="Es. Scena della riunione"></label>
      <label class="field"><span>✍️ Cosa hai capito?</span><textarea id="ytText" rows="5" placeholder="Scrivi cosa succede nella scena…">${esc(entry ? entry.text : "")}</textarea></label>
      <label class="field"><span>Parole o frasi nuove (facoltativo)</span><textarea id="ytWords" rows="2" placeholder="Es. to get fired = essere licenziato">${esc(entry ? entry.words || "" : "")}</textarea></label>
      <p class="muted small">Suggerimento: cerca su YouTube il nome della serie + "scene" e usa i canali ufficiali. Guardala prima senza sottotitoli, poi con i sottotitoli inglesi (icona CC del video) e confronta con quello che hai scritto.</p>
      ${entry ? `<button class="btn ghost block sm" id="ytDel" style="color:var(--bad)">Elimina dal diario</button>` : ""}
    </div>
    <div class="ex-foot"><button class="btn primary block" id="ytSave">Salva nel diario</button></div></div>`;
  const show = () => {
    const v = ytId($("#ytUrl").value), box = $("#ytBox");
    if (!v) { box.innerHTML = $("#ytUrl").value.trim() ? `<p class="small" style="color:var(--bad)">Link YouTube non riconosciuto.</p>` : ""; return; }
    if (box.dataset.vid === v.id) return;
    box.dataset.vid = v.id;
    box.innerHTML = `<div class="yt-frame"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?playsinline=1&rel=0&cc_lang_pref=en${v.start ? "&start=" + v.start : ""}" title="Video YouTube" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  };
  $("#ytUrl").oninput = show; show();
  $("#quit").onclick = closeLesson;
  if ($("#ytDel")) $("#ytDel").onclick = () => { if (confirm("Eliminare questa voce dal diario?")) { S.journal = S.journal.filter(j => j !== entry); save(); closeLesson(); } };
  $("#ytSave").onclick = () => {
    const url = $("#ytUrl").value.trim(), text = $("#ytText").value.trim();
    if (!ytId(url)) return toast("Incolla un link YouTube valido");
    if (text.length < 10) return toast("Scrivi cosa hai capito della scena");
    const data = { url, text, title: $("#ytTitle").value.trim() || "Scena da YouTube", words: $("#ytWords").value.trim(), t: Date.now() };
    if (entry) Object.assign(entry, data);
    else { S.journal.unshift({ id: Date.now().toString(36), type: "yt", ...data }); addXP(10); }
    save(); toast("Salvato nel diario ✅"); closeLesson();
  };
}

/* ============ Avvio ============ */
render({ anim: true });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

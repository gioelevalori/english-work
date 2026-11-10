"use strict";
/* ============ Utility ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const DAY = 86400000;
const dayStr = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const key = en => String(en).toLowerCase().trim();
const isSentence = en => en.trim().split(/\s+/).length >= 4;

/* ============ Stato salvato ============ */
const STORE = "english-work-v1";
const DEFAULTS = {
  xp: 0, streak: 0, best: 0, lastDay: null, days: {}, done: {}, srs: {}, notebook: [],
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
let voices = [];
function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function say(text, slow) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/ \/ /g, ", "));
  const acc = S.settings.accent, norm = v => v.lang.replace("_", "-");
  const v = voices.find(v => norm(v) === acc && /premium|enhanced|natural|neural/i.test(v.name))
    || voices.find(v => norm(v) === acc) || voices.find(v => /^en/i.test(v.lang));
  if (v) u.voice = v;
  u.lang = acc;
  u.rate = slow ? 0.55 : S.settings.rate;
  speechSynthesis.speak(u);
}
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
  s = String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.,!?;:"()¿¡]/g, " ").replace(/\s+/g, " ").trim();
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
  for (const c of cands) { const t = key(c[field]); if (!seen.has(t) && c.it !== item.it) { seen.add(t); out.push(c[field]); } if (out.length >= n) break; }
  return out;
}
const tilesOf = en => en.replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
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
function startLesson(cfg) {
  if (!cfg.exercises.length) return toast("Nessun esercizio disponibile qui.");
  L = { ...cfg, queue: cfg.exercises, pos: 0, first: 0, wrong: 0, answered: 0, results: {}, map: {}, tries: new Map() };
  overlay.hidden = false; document.body.style.overflow = "hidden";
  renderEx();
}
function closeLesson() { overlay.hidden = true; overlay.innerHTML = ""; document.body.style.overflow = ""; L = null; if (window.speechSynthesis) speechSynthesis.cancel(); render(); }
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
      <div class="bar"><i style="width:${pct}%"></i></div>
      ${ex.item ? `<button class="star-btn ${saved ? "on" : ""}" id="star" aria-label="Salva parola">${saved ? "★" : "☆"}</button>` : `<span style="width:36px"></span>`}
    </div>
    <div class="ex-body" id="exBody"></div>
    <div class="ex-foot" id="exFoot"><button class="btn primary block" id="check" disabled>Verifica</button></div>
  </div>`;
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
    const t = tiles[+b.dataset.i]; chosen.push(t); b.classList.add("used");
    const nb = document.createElement("button"); nb.className = "tile"; nb.textContent = t.w;
    nb.onclick = () => { chosen.splice(chosen.indexOf(t), 1); nb.remove(); b.classList.remove("used"); ready(chosen.length > 0); };
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
      <div class="en">${esc(item.en)}</div><div class="it">${esc(item.it)}</div></div>
      <p class="muted small" style="text-align:center">Ascoltala e ripetila ad alta voce. Tocca ☆ in alto per salvarla subito.</p>`;
    say(item.en);
    const f = $("#exFoot"); f.innerHTML = `<button class="btn primary block" id="next">Ho capito</button>`;
    $("#next").onclick = () => { L.pos++; renderEx(); };
  },
  mc_en_it(ex, el) {
    const { item } = ex;
    el.innerHTML = `<div class="ex-label">Cosa significa?</div><div class="prompt">${speakerBtns(item.en)}<div class="big">${esc(item.en)}</div></div>`;
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
    const get = options(el, list, () => {});
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
    el.innerHTML = `<div class="ex-label">Scegli la traduzione giusta</div><div class="prompt">${speakerBtns(item.en)}<div class="bubble">${esc(item.en)}</div></div>`;
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
      <div class="prompt">${speakerBtns(item.en)}<div class="bubble">${esc(item.en)}</div></div>
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
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2200); }
function modal(html, onMount) {
  const m = $("#modal"); m.innerHTML = `<div class="sheet">${html}</div>`; m.hidden = false;
  m.onclick = e => { if (e.target === m) closeModal(); };
  onMount && onMount($(".sheet", m));
}
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; }

/* ============ Viste ============ */
let tab = localStorage.getItem("ew-tab") || "learn";
let wordFilter = "all", wordQuery = "";
$$("#tabs button").forEach(b => b.onclick = () => { tab = b.dataset.tab; localStorage.setItem("ew-tab", tab); render(); window.scrollTo(0, 0); });

function render() {
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  const pr = progressToday();
  $("#topbar").innerHTML = `<div class="brand">English <b>Work</b></div>
    <div class="pills"><span class="pill" title="Serie di giorni">🔥 ${currentStreak()}</span><span class="pill" title="XP di oggi">⚡ ${pr.xp}/${S.settings.goal}</span></div>`;
  VIEWS[tab]($("#view"));
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
    <div>${u.words.map(([en, it]) => `<div class="word-row"><div class="grow"><div class="en">${esc(en)}</div><div class="it">${esc(it)}</div></div><button class="iconbtn" data-say="${esc(en)}">🔊</button></div>`).join("")}</div>
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
      <div class="section-title">Percorso · tutte le unità sono sbloccate</div>`;
    let lastLevel = "";
    COURSE.forEach(u => {
      if (u.level !== lastLevel) { lastLevel = u.level; html += `<div class="section-title">Livello ${u.level} ${u.level === "A1" ? "· Base" : u.level === "A2" ? "· Elementare" : "· Intermedio"}</div>`; }
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
      { id: "smart", ic: "🧠", t: "Ripasso intelligente", d: dueU.length ? `${dueU.length} elementi da ripassare adesso` : "Tutto ripassato! Ripassa comunque i più deboli", on: true },
      { id: "flash", ic: "🃏", t: "Flashcard delle mie parole", d: `${S.notebook.length} parole nel tuo vocabolario`, on: S.notebook.length > 0 },
      { id: "nbquiz", ic: "📒", t: "Quiz sulle mie parole", d: "Esercizi creati dal tuo vocabolario", on: nb.length >= 4 },
      { id: "listen", ic: "🎧", t: "Allenamento ascolto", d: "Capire l'inglese parlato", on: true },
      { id: "speak", ic: "🎤", t: "Pronuncia", d: SR ? "Leggi frasi ad alta voce" : "Non supportato da questo browser", on: !!SR },
      { id: "free", ic: "♾️", t: "Allenamento libero", d: "Esercizi misti senza fine", on: true }
    ];
    v.innerHTML = `<div class="section-title">Ripasso</div>` + cards.map(c => `<button class="card" data-m="${c.id}" ${c.on ? "" : "disabled style='opacity:.5'"} style="width:100%;text-align:left">
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
        <div class="grow"><div class="en">${esc(n.en)}${dots(n.en)}</div><div class="it">${esc(n.it)}</div>${n.note ? `<div class="note">${esc(n.note)}</div>` : ""}</div>
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
  overlay.hidden = false; document.body.style.overflow = "hidden";
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

/* ============ Avvio ============ */
render();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

// Raccoglie tutti i testi da leggere ad alta voce e scrive tools/audio-list.json
// Uso: node tools/collect-audio.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = vm.createContext({});
for (const f of ["data.js", "data2.js", "data3.js", "data4.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const { COURSE, DIALOGUES, PHRASEBOOK, SCENES } = vm.runInContext("({ COURSE, DIALOGUES, PHRASEBOOK, SCENES })", ctx);

// Deve restare identico a audioId() in app.js
const spoken = t => String(t).replace(/ \/ /g, ", ").replace(/\s+/g, " ").trim();
function audioId(voice, text) {
  const s = voice + "|" + spoken(text).toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
const out = new Map();
const add = (voice, text) => { const t = spoken(text); if (!t) return; const id = audioId(voice, t); if (!out.has(id)) out.set(id, { id, voice, text: t }); };
const tokens = s => s.split(/\s+/).map(w => w.replace(/[.,!?;:…"]/g, "")).filter(Boolean);

const sentences = [];
COURSE.forEach(u => { u.words.forEach(([en]) => add("f", en)); u.sentences.forEach(([en]) => { add("f", en); sentences.push(en); }); });
PHRASEBOOK.forEach(c => c.items.forEach(([en]) => { add("f", en); sentences.push(en); }));
DIALOGUES.forEach(d => d.lines.forEach(([who, en]) => { add(who === "A" ? "m" : "f", en); add("f", en); sentences.push(en); }));
SCENES.forEach(s => s.lines.forEach(([who, en]) => { add(s.cast[who], en); sentences.push(en); }));
sentences.forEach(s => tokens(s).forEach(w => add("f", w)));

fs.writeFileSync(path.join(__dirname, "audio-list.json"), JSON.stringify([...out.values()]));
console.log("testi:", out.size);

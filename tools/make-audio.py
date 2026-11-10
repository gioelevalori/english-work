"""Genera i file MP3 in audio/ (salta quelli già presenti) e scrive audio-index.js.
Uso: python tools/make-audio.py   (richiede: pip install edge-tts)"""
import asyncio, json, os, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {"f": "en-US-AvaNeural", "m": "en-US-AndrewNeural", "gf": "en-GB-SoniaNeural", "gm": "en-GB-RyanNeural"}
items = json.load(open(os.path.join(ROOT, "tools", "audio-list.json"), encoding="utf8"))
os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
sem = asyncio.Semaphore(8)
failed = []

async def one(it):
    dest = os.path.join(ROOT, "audio", it["id"] + ".mp3")
    if os.path.exists(dest) and os.path.getsize(dest) > 500:
        return
    async with sem:
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(it["text"], VOICES[it["voice"]]).save(dest + ".tmp"), timeout=40)
                os.replace(dest + ".tmp", dest)
                return
            except Exception as e:
                await asyncio.sleep(1.5 * (attempt + 1))
        failed.append(it)

async def main():
    tasks = [one(it) for it in items]
    done = 0
    for f in asyncio.as_completed(tasks):
        await f
        done += 1
        if done % 200 == 0:
            print(done, "/", len(items), flush=True)
    ok = sorted(it["id"] for it in items if os.path.exists(os.path.join(ROOT, "audio", it["id"] + ".mp3")))
    with open(os.path.join(ROOT, "audio-index.js"), "w", encoding="utf8") as fh:
        fh.write("// Generato da tools/make-audio.py: id dei file audio disponibili\nconst AUDIO_IDS = new Set(" + json.dumps(ok, separators=(",", ":")) + ");\n")
    print("ok:", len(ok), "falliti:", len(failed))
    for it in failed[:10]:
        print("  ", it)

asyncio.run(main())

Review splices. Not in the game until Ash confirms that file.

When Ash says "N ok":
1. That clip is confirmed. Move it to public/game/clock/N.mp4.
2. Add N to HOUR_INTRO_READY in src/game/GameCanvas.tsx.
3. It plays once when that hour starts. Skip closes it.

1–9 and 12 are in public/game/clock/. 10 and 11 from the old source were rejected.
Long 15s originals were removed from this folder.

New 6s Imagine take (top-down red crab, green brush): clock-10-11-bed.mp4
10-oclock.mp4 — 0.00s–2.50s. "It's ten o'clock." Waiting.
11-oclock.mp4 — 2.70s–4.70s. "It's eleven o'clock." Waiting.
time-for-bed.mp4 — 4.75s–6.04s. "It's time for bed." Waiting. Not wired to a level yet.

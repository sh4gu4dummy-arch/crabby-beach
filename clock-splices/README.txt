Review splices. Not in the game until Ash confirms that file.

When Ash says "N ok":
1. That clip is confirmed. Move it to public/game/clock/N.mp4.
2. Add N to HOUR_INTRO_READY in src/game/GameCanvas.tsx.
3. It plays once when that hour starts. Skip closes it. The level is already running underneath.
4. Cut hour N+1 into this folder for review.

1 — moved to public/game/clock/1.mp4. Plays at 1 o'clock.
2 — moved to public/game/clock/2.mp4. Plays at 2 o'clock.
3 — moved to public/game/clock/3.mp4. Plays at 3 o'clock.
4-oclock.mp4 — waiting. Cut 8.50s–9.90s of clock-1-6.mp4. "It's four o'clock" only.

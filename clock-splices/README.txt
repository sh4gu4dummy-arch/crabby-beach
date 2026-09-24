Review splices. Not in the game until Ash confirms that file.

When Ash says "N ok":
1. That clip is confirmed. Move it to public/game/clock/N.mp4.
2. Add N to HOUR_INTRO_READY in src/game/GameCanvas.tsx.
3. It plays once when that hour starts. Skip closes it. The level is already running underneath.
4. Cut hour N+1 into this folder for review.

1-oclock.mp4 — not confirmed. Cut 0.48s–1.72s.
2 — moved to public/game/clock/2.mp4. Plays at 2 o'clock.
3-oclock.mp4 — waiting. Cut 4.82s–7.75s of clock-1-6.mp4.

Review splices. Not in the game until Ash confirms that file.

When Ash says "N ok":
1. That clip is confirmed. Move it to public/game/clock/N.mp4.
2. Add N to HOUR_INTRO_READY in src/game/GameCanvas.tsx.
3. It plays once when that hour starts. Skip closes it. The level is already running underneath.
4. Cut hour N+1 into this folder for review.

1 — moved to public/game/clock/1.mp4. Plays at 1 o'clock.
2 — moved to public/game/clock/2.mp4. Plays at 2 o'clock.
3 — moved to public/game/clock/3.mp4. Plays at 3 o'clock.
4 — moved to public/game/clock/4.mp4. Plays at 4 o'clock.
5 — moved to public/game/clock/5.mp4. Plays at 5 o'clock.
6 — moved to public/game/clock/6.mp4. Plays at 6 o'clock.
7 — moved to public/game/clock/7.mp4. Plays at 7 o'clock.
8 — moved to public/game/clock/8.mp4. Plays at 8 o'clock.
9-oclock.mp4 — waiting. Cut 4.40s–6.15s of clock-7-12.mp4. "It's nine o'clock" only.
clock-1-6-original.mp4 — the full 15s source. Not a splice.


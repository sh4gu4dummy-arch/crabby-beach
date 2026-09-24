# Crabby brush canon

Original playable crab: `public/game/crabby/idle-red-0.png` (and walk-red-*).
He holds a paintbrush. That is the gold standard.

## Rule
Do not ship a loadout idle if the crab has empty claws.

- Recolor of the original (yellow) keeps the brush. Do not replace those with a new character.
- New drawings (green, blue) must be generated **holding a brush**, then **opened and looked at**.
- Hats stamp onto a frame that already has the brush. Never stamp a hat onto empty claws and call it done.
- Never copy one hat still onto every `idle-{paint}-*.png`. Each paint needs its own picture. See `scripts/loadout-brush.md`.

## Gate (both, every loadout art change)
1. Open `idle-0.png` for that color next to `idle-red-0.png`. If you cannot see a brush, it fails.
2. `python3 scripts/verify-crab-brush.py` must exit 0.

If either fails, do not commit as done. The script cannot see "held in the claw"; the picture check can.

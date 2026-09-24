# Loadout brush swap — do not skip this

Red crab changes brush by **swapping the whole picture**, not by tinting pixels.

`crab.paint` picks `assets.crab[paint]` or `assets.looks[body][hat][paint]`.
Files are `idle-{paint}-0.png` and `walk-{paint}-*.png`.

## When you replace a hat or a crab

Do **not** copy one still onto every `idle-{paint}-*.png`.
That leaves a green brush no matter which can he walks to. v.134 did this to red hats. v.129 did it to yellow hats.

For each paint (red, orange, yellow, green, blue, purple, pink):

1. Imagine I2I from the approved crab+hat still.
2. Prompt: same crab, hat sitting **on** the shell, change **only** the brush bristles to that color.
3. Open the picture. Fail if the hat floats, the crab changed, or the brush is the wrong color.
4. Pack that file into `idle-{paint}-0.png`, `idle-{paint}-1.png`, and `walk-{paint}-1..4.png`.
5. Leave `idle-0.png` as the loadout preview (usually the green brush).

Runtime tint is rejected. The user can see it.

## Gate

- `idle-red-0.png` brush is red. `idle-blue-0.png` brush is blue. Not the same file.
- Hat touches the shell.
- Brush is in the claw.

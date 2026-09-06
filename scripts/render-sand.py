#!/usr/bin/env python3
"""Sand-only ground. No ocean. The game draws moving water on top."""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path("/tmp/beach-original.jpg")
OUT = Path("/workspace/public/game/beach.jpg")
W, H = 1600, 900
SAND_FROM = 430


def clamp(n: int) -> int:
    return 0 if n < 0 else 255 if n > 255 else n


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    rng = random.Random(11)
    out = Image.new("RGB", (W, H))
    px = out.load()
    for y in range(SAND_FROM):
        t = y / SAND_FROM
        br, bg, bb = 186 + int(t * 40), 146 + int(t * 42), 96 + int(t * 30)
        for x in range(W):
            n = rng.randint(-16, 16)
            dune = int(8 * ((x // 90 + y // 70) % 3 - 1))
            px[x, y] = (clamp(br + n + dune), clamp(bg + n + dune), clamp(bb + n // 2 + dune // 2))

    out.paste(src.crop((0, SAND_FROM, W, H)), (0, SAND_FROM))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for _ in range(90):
        x, y = rng.randint(12, W - 12), rng.randint(20, SAND_FROM - 24)
        r = rng.randint(2, 7)
        d.ellipse(
            [x - r, y - r // 2, x + r, y + r // 2],
            fill=(rng.randint(140, 180), rng.randint(110, 145), rng.randint(80, 115), 180),
        )
    for _ in range(10):
        x, y = rng.randint(80, W - 80), rng.randint(80, SAND_FROM - 40)
        r = rng.randint(12, 26)
        d.ellipse([x - r, y - int(r * 0.48), x + r, y + int(r * 0.48)], fill=(160, 128, 98, 210))
        d.ellipse(
            [x - r + 4, y - int(r * 0.48) + 2, x + r - 5, y + int(r * 0.25)],
            fill=(186, 152, 118, 190),
        )
    out = Image.alpha_composite(out.convert("RGBA"), overlay).convert("RGB")
    soft = out.crop((0, 0, W, SAND_FROM - 8)).filter(ImageFilter.GaussianBlur(0.9))
    out.paste(soft, (0, 0))
    seam = out.crop((0, SAND_FROM - 18, W, SAND_FROM + 18)).filter(ImageFilter.GaussianBlur(6))
    out.paste(seam, (0, SAND_FROM - 18))
    out.save(OUT, quality=92)
    print("wrote", OUT, out.size)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Sand-only ground. No ocean, no foam stripe, no grid."""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game/beach.jpg")
W, H = 1600, 900


def clamp(n: int) -> int:
    return 0 if n < 0 else 255 if n > 255 else n


def main() -> None:
    rng = random.Random(23)
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        br = 202 + int(t * 26)
        bg = 162 + int(t * 28)
        bb = 110 + int(t * 20)
        for x in range(W):
            n = rng.randint(-5, 5)
            px[x, y] = (clamp(br + n), clamp(bg + n), clamp(bb + n // 2))

    img = img.filter(ImageFilter.GaussianBlur(0.8))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for _ in range(90):
        x, y = rng.randint(12, W - 12), rng.randint(16, H - 16)
        r = rng.randint(2, 5)
        d.ellipse(
            [x - r, y - max(1, r // 2), x + r, y + max(1, r // 2)],
            fill=(rng.randint(154, 182), rng.randint(122, 146), rng.randint(90, 112), 110),
        )
    for _ in range(12):
        x, y = rng.randint(80, W - 80), rng.randint(120, H - 80)
        r = rng.randint(9, 18)
        d.ellipse([x - r, y - int(r * 0.45), x + r, y + int(r * 0.45)], fill=(162, 130, 100, 150))

    out = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    out.save(OUT, quality=95)
    print("wrote", OUT, out.size)


if __name__ == "__main__":
    main()

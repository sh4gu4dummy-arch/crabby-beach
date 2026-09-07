#!/usr/bin/env python3
"""Sleeping Crabby, no brush. Two-frame breathe."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game")
SIZE = 512
BODY = (255, 72, 68)
BODY_D = (214, 42, 52)
BELLY = (255, 168, 140)
CHEEK = (255, 120, 130)
INK = (90, 30, 40)


def oval(d: ImageDraw.ImageDraw, x: float, y: float, rx: float, ry: float, fill, outline=None, w=1):
    d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=fill, outline=outline, width=w)


def draw(bob: float) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 268, 292 + bob * 6

    # pillow
    oval(d, 210, cy + 38, 120, 36, (232, 214, 176))
    oval(d, 200, cy + 32, 100, 26, (255, 242, 214))

    # limp legs along the back
    for i, (dx, dy, rx, ry) in enumerate(
        [(78, -8, 28, 16), (92, 18, 26, 15), (70, 44, 24, 14)]
    ):
        oval(d, cx + dx, cy + dy, rx, ry, BODY_D)
        oval(d, cx + dx - 4, cy + dy - 3, rx * 0.72, ry * 0.7, BODY)

    # tucked claw under cheek
    oval(d, cx - 108, cy + 8, 36, 26, BODY_D)
    oval(d, cx - 122, cy - 6, 22, 18, BODY)
    oval(d, cx - 96, cy - 10, 20, 16, BODY)

    # far claw relaxed
    oval(d, cx + 42, cy + 52, 32, 22, BODY_D)
    oval(d, cx + 58, cy + 42, 18, 14, BODY)
    oval(d, cx + 30, cy + 40, 16, 13, BODY)

    # body lying on side (wide)
    oval(d, cx - 8, cy, 108, 78, BODY_D)
    oval(d, cx - 12, cy - 8, 98, 70, BODY)
    oval(d, cx - 36, cy - 18, 36, 26, (255, 120, 110, 210))
    oval(d, cx - 4, cy + 18, 48, 28, BELLY)

    # eye bumps
    oval(d, cx - 58, cy - 58, 32, 34, BODY)
    oval(d, cx - 18, cy - 62, 32, 34, BODY)
    oval(d, cx - 58, cy - 60, 24, 26, (255, 255, 255))
    oval(d, cx - 18, cy - 64, 24, 26, (255, 255, 255))
    # closed lids
    for ex, ey in ((-58, -58), (-18, -62)):
        d.arc(
            [cx + ex - 16, cy + ey - 6, cx + ex + 16, cy + ey + 18],
            start=200,
            end=340,
            fill=INK,
            width=5,
        )
        d.arc(
            [cx + ex - 10, cy + ey + 2, cx + ex + 10, cy + ey + 10],
            start=20,
            end=160,
            fill=(255, 150, 160),
            width=3,
        )
    oval(d, cx - 72, cy - 36, 10, 7, CHEEK)
    oval(d, cx - 2, cy - 40, 10, 7, CHEEK)

    # sleepy smile
    d.arc(
        [cx - 44, cy - 12, cx - 8, cy + 16],
        start=20,
        end=160,
        fill=INK,
        width=4,
    )

    # blanket over hips
    d.rounded_rectangle(
        [cx - 10, cy + 28, cx + 118, cy + 78],
        radius=22,
        fill=(90, 140, 210, 230),
    )
    d.rounded_rectangle(
        [cx, cy + 34, cx + 108, cy + 70],
        radius=18,
        fill=(120, 168, 230, 200),
    )

    # zzz
    z = ImageDraw.Draw(img)
    for i, (zx, zy, s) in enumerate(((cx + 88, cy - 128, 18), (cx + 118, cy - 168, 24), (cx + 154, cy - 214, 30))):
        z.line([(zx, zy), (zx + s, zy), (zx, zy + s * 0.85), (zx + s, zy + s * 0.85)], fill=(200, 220, 255, 220), width=5)

    return img.filter(ImageFilter.SMOOTH)


def main() -> None:
    a = draw(0)
    b = draw(1)
    a.save(OUT / "crabby-sleep-0.png")
    b.save(OUT / "crabby-sleep-1.png")
    print("wrote", OUT / "crabby-sleep-0.png")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""High-res pearly cartoon shells, transparent PNGs."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game")
SIZE = 256
CX = CY = SIZE / 2


def new() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img, "RGBA")


def pearl(t: float) -> tuple[int, int, int, int]:
    t = max(0, min(1, t))
    r = int(255 * (0.92 + 0.08 * t))
    g = int(248 * (0.90 + 0.10 * t))
    b = int(236 * (0.88 + 0.12 * t))
    return (r, g, b, 255)


def scallop() -> Image.Image:
    img, d = new()
    fans = 11
    spread = math.radians(168)
    start = math.radians(-84)
    for i in range(fans - 1, -1, -1):
        a0 = start + spread * i / fans
        a1 = start + spread * (i + 1) / fans
        am = (a0 + a1) / 2
        r = 108
        lite = i % 2 == 0
        col = pearl(0.85 if lite else 0.35)
        ridge = pearl(1.0 if lite else 0.55)
        pts = [(CX, CY + 38)]
        steps = 10
        for s in range(steps + 1):
            a = a0 + (a1 - a0) * s / steps
            bump = math.sin(s / steps * math.pi) * 10
            pts.append((CX + math.sin(a) * (r + bump), CY + 10 - math.cos(a) * (r + bump)))
        d.polygon(pts, fill=col)
        d.line(
            [
                (CX, CY + 38),
                (CX + math.sin(am) * r, CY + 10 - math.cos(am) * r),
            ],
            fill=ridge,
            width=3,
        )
    d.ellipse([CX - 28, CY + 22, CX + 28, CY + 58], fill=pearl(0.7))
    d.ellipse([CX - 18, CY + 30, CX + 18, CY + 52], fill=pearl(0.95))
    return img.filter(ImageFilter.SMOOTH)


def conch() -> Image.Image:
    img, d = new()
    for i, (rx, ry, dx, dy, t) in enumerate(
        [
            (70, 86, 6, 8, 0.4),
            (58, 72, 2, 0, 0.7),
            (44, 54, -6, -10, 0.9),
            (28, 34, -14, -22, 0.6),
            (16, 18, -20, -32, 0.95),
        ]
    ):
        d.ellipse([CX + dx - rx, CY + dy - ry, CX + dx + rx, CY + dy + ry], fill=pearl(t))
    # spiral groove
    pts = []
    for i in range(40):
        a = i / 40 * math.pi * 2.6 + 0.4
        rad = 62 - i * 1.2
        pts.append((CX + math.cos(a) * rad * 0.7 - 4, CY + math.sin(a) * rad - 6))
    if len(pts) > 1:
        d.line(pts, fill=pearl(0.2), width=3)
    d.polygon(
        [(CX + 48, CY + 70), (CX + 86, CY + 92), (CX + 52, CY + 86)],
        fill=pearl(0.55),
    )
    return img.filter(ImageFilter.SMOOTH)


def clam() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 92, CY - 62, CX + 92, CY + 70], fill=pearl(0.55))
    d.ellipse([CX - 84, CY - 56, CX + 84, CY + 58], fill=pearl(0.9))
    for i in range(7):
        t = (i + 1) / 8
        rx, ry = 84 * (1 - t * 0.12), 56 * (1 - t * 0.18)
        d.ellipse(
            [CX - rx, CY - ry + 6, CX + rx, CY + ry + 6],
            outline=pearl(0.25 + 0.1 * (i % 2)),
            width=2,
        )
    d.arc([CX - 40, CY - 8, CX + 40, CY + 28], 200, 340, fill=(210, 188, 170, 220), width=3)
    return img.filter(ImageFilter.SMOOTH)


def cowrie() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 46, CY - 90, CX + 46, CY + 90], fill=pearl(0.45))
    d.ellipse([CX - 38, CY - 82, CX + 38, CY + 82], fill=pearl(0.92))
    d.ellipse([CX - 18, CY - 70, CX + 18, CY + 70], fill=(236, 226, 210, 255))
    d.rounded_rectangle([CX - 7, CY - 58, CX + 7, CY + 58], radius=7, fill=(255, 250, 244, 255))
    for y in range(-50, 52, 14):
        d.line([(CX - 5, CY + y), (CX + 5, CY + y)], fill=pearl(0.3), width=2)
    return img.filter(ImageFilter.SMOOTH)


def main() -> None:
    variants = [scallop, conch, clam, cowrie]
    for i, fn in enumerate(variants, 1):
        im = fn()
        path = OUT / f"shell-white-{i}.png"
        im.save(path)
        print("wrote", path, im.size)


if __name__ == "__main__":
    main()

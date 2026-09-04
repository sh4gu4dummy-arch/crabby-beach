#!/usr/bin/env python3
"""Bold, readable cartoon shells — cream with dark ridges, hard alpha."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game")
SIZE = 256
CX = CY = SIZE / 2
CREAM = (255, 214, 150, 255)
CREAM_LT = (255, 236, 190, 255)
RIDGE = (166, 96, 42, 255)
EDGE = (110, 58, 28, 255)
BELLY = (255, 244, 214, 255)


def new() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img, "RGBA")


def flatten(img: Image.Image) -> Image.Image:
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a > 40 else (0, 0, 0, 0)
    return img


def scallop() -> Image.Image:
    img, d = new()
    fans = 9
    spread = math.radians(170)
    start = math.radians(-85)
    hinge = (CX, CY + 52)
    for i in range(fans):
        a0 = start + spread * i / fans
        a1 = start + spread * (i + 1) / fans
        am = (a0 + a1) / 2
        r = 112
        fill = CREAM_LT if i % 2 == 0 else CREAM
        pts = [hinge]
        for s in range(12):
            a = a0 + (a1 - a0) * s / 11
            bump = math.sin(s / 11 * math.pi) * 14
            pts.append((CX + math.sin(a) * (r + bump), CY + 4 - math.cos(a) * (r + bump)))
        d.polygon(pts, fill=fill, outline=EDGE)
        d.line(
            [hinge, (CX + math.sin(am) * r, CY + 4 - math.cos(am) * r)],
            fill=RIDGE,
            width=4,
        )
    d.ellipse([CX - 34, CY + 32, CX + 34, CY + 78], fill=BELLY, outline=EDGE, width=4)
    return flatten(img.filter(ImageFilter.SMOOTH))


def conch() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 78, CY - 96, CX + 70, CY + 100], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 62, CY - 80, CX + 52, CY + 78], fill=CREAM_LT)
    pts = []
    for i in range(48):
        a = i / 48 * math.pi * 2.8 + 0.5
        rad = 70 - i * 1.15
        pts.append((CX + math.cos(a) * rad * 0.72 - 2, CY + math.sin(a) * rad - 4))
    d.line(pts, fill=RIDGE, width=5)
    d.polygon(
        [(CX + 40, CY + 78), (CX + 96, CY + 108), (CX + 48, CY + 100)],
        fill=CREAM,
        outline=EDGE,
    )
    d.ellipse([CX - 28, CY - 36, CX + 8, CY + 8], fill=BELLY, outline=RIDGE, width=3)
    return flatten(img.filter(ImageFilter.SMOOTH))


def clam() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 108, CY - 70, CX + 108, CY + 78], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 96, CY - 58, CX + 96, CY + 62], fill=CREAM_LT)
    for i in range(6):
        t = (i + 1) / 7
        rx, ry = 96 * (1 - t * 0.14), 58 * (1 - t * 0.2)
        d.ellipse(
            [CX - rx, CY - ry + 8, CX + rx, CY + ry + 8],
            outline=RIDGE,
            width=3,
        )
    d.arc([CX - 48, CY - 6, CX + 48, CY + 36], 200, 340, fill=EDGE, width=4)
    return flatten(img.filter(ImageFilter.SMOOTH))


def cowrie() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 58, CY - 108, CX + 58, CY + 108], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 46, CY - 96, CX + 46, CY + 96], fill=CREAM_LT)
    d.rounded_rectangle([CX - 10, CY - 70, CX + 10, CY + 70], radius=8, fill=BELLY, outline=EDGE, width=3)
    for y in range(-60, 64, 16):
        d.line([(CX - 7, CY + y), (CX + 7, CY + y)], fill=RIDGE, width=3)
    return flatten(img.filter(ImageFilter.SMOOTH))


def main() -> None:
    for i, fn in enumerate([scallop, conch, clam, cowrie], 1):
        path = OUT / f"shell-white-{i}.png"
        fn().save(path)
        print("wrote", path)


if __name__ == "__main__":
    main()

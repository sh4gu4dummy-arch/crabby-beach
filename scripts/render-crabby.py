#!/usr/bin/env python3
"""Top-down red Crabby with a paintbrush per color. Transparent PNGs."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game/crabby")
SIZE = 256
PAINTS = [
    ("red", (255, 59, 85)),
    ("orange", (255, 138, 18)),
    ("yellow", (255, 225, 74)),
    ("green", (46, 232, 106)),
    ("blue", (46, 200, 255)),
    ("purple", (196, 77, 255)),
    ("pink", (255, 94, 200)),
]


def lerp(a, b, t):
    return a + (b - a) * t


def draw_crab(bristle: tuple[int, int, int], walk: int, bob: float) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 128, 142
    cy += int(bob * 4)
    tilt = 0
    if walk:
        tilt = [-7, 5, -6, 8][walk - 1]
        cy += [2, -3, 2, -2][walk - 1]

    def rot(px, py, deg=tilt):
        import math

        r = math.radians(deg)
        x, y = px - cx, py - cy
        return (
            cx + x * math.cos(r) - y * math.sin(r),
            cy + x * math.sin(r) + y * math.cos(r),
        )

    def oval(x, y, rx, ry, fill, outline=None):
        pts = rot(x, y)
        d.ellipse(
            [pts[0] - rx, pts[1] - ry, pts[0] + rx, pts[1] + ry],
            fill=fill,
            outline=outline,
        )

    # legs — 3 per side, walk shifts them
    leg_shift = 0
    if walk:
        leg_shift = [-10, 10, -8, 12][walk - 1]
    body_r = (255, 72, 68)
    body_d = (214, 42, 52)
    for side in (-1, 1):
        for i, (dx, dy, rx, ry) in enumerate(
            [(58, 8, 18, 10), (62, 28, 17, 9), (52, 48, 16, 9)]
        ):
            ox = side * (dx + (leg_shift if (i + walk) % 2 else -leg_shift * 0.4))
            oval(cx + ox, cy + dy, rx, ry, body_d)
            oval(cx + ox * 0.92, cy + dy - 2, rx * 0.7, ry * 0.7, body_r)

    # left claw
    oval(cx - 70, cy - 8, 22, 16, body_d)
    oval(cx - 78, cy - 22, 14, 11, body_r)
    oval(cx - 62, cy - 24, 13, 10, body_r)

    # body
    oval(cx, cy, 58, 46, body_d)
    oval(cx, cy - 4, 54, 42, body_r)
    oval(cx - 10, cy - 12, 22, 16, (255, 120, 110, 200))

    # belly
    oval(cx, cy + 10, 28, 18, (255, 168, 140))

    # eyes
    oval(cx - 18, cy - 38, 18, 20, (255, 72, 68))
    oval(cx + 18, cy - 38, 18, 20, (255, 72, 68))
    oval(cx - 18, cy - 40, 14, 15, (255, 255, 255))
    oval(cx + 18, cy - 40, 14, 15, (255, 255, 255))
    oval(cx - 16, cy - 38, 6, 7, (40, 28, 24))
    oval(cx + 20, cy - 38, 6, 7, (40, 28, 24))
    oval(cx - 14, cy - 40, 2, 2, (255, 255, 255))
    oval(cx + 22, cy - 40, 2, 2, (255, 255, 255))

    # smile
    p0 = rot(cx - 12, cy - 6)
    p1 = rot(cx + 12, cy - 6)
    pm = rot(cx, cy + 4)
    d.arc(
        [pm[0] - 14, pm[1] - 10, pm[0] + 14, pm[1] + 8],
        start=20,
        end=160,
        fill=(90, 30, 40),
        width=3,
    )

    # right claw holding brush
    claw_x, claw_y = cx + 62, cy - 18
    oval(claw_x, claw_y + 10, 20, 14, body_d)
    oval(claw_x + 8, claw_y - 4, 13, 10, body_r)
    oval(claw_x - 6, claw_y - 6, 12, 10, body_r)

    # brush — handle behind/through claw, bristles up
    hx, hy = claw_x + 6, claw_y - 8
    tip = rot(hx + 8, hy - 58)
    ferr = rot(hx + 2, hy - 22)
    butt = rot(hx - 6, hy + 18)
    # handle
    d.line([butt, ferr], fill=(122, 64, 32), width=9)
    d.line([butt, ferr], fill=(196, 122, 58), width=5)
    # ferrule
    d.ellipse([ferr[0] - 8, ferr[1] - 6, ferr[0] + 8, ferr[1] + 6], fill=(232, 220, 196))
    d.ellipse([ferr[0] - 8, ferr[1] - 6, ferr[0] + 8, ferr[1] + 6], outline=(180, 168, 140))
    # bristles
    for ox, oy in ((-7, -8), (-3, -14), (0, -16), (3, -14), (7, -8)):
        end = rot(hx + 8 + ox, hy - 58 + oy)
        d.line([ferr, end], fill=bristle + (255,), width=4)
    d.ellipse([tip[0] - 10, tip[1] - 8, tip[0] + 10, tip[1] + 10], fill=bristle + (255,))

    return img.filter(ImageFilter.SMOOTH)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    cells = []
    for name, rgb in PAINTS:
        idle0 = draw_crab(rgb, 0, 0)
        idle1 = draw_crab(rgb, 0, 1)
        idle0.save(OUT / f"idle-{name}-0.png")
        idle1.save(OUT / f"idle-{name}-1.png")
        cells.append(idle0)
        for w in range(1, 5):
            draw_crab(rgb, w, 0).save(OUT / f"walk-{name}-{w}.png")
        print("wrote", name)

    # preview strip
    sheet = Image.new("RGBA", (SIZE * 7, SIZE), (0, 0, 0, 0))
    for i, cell in enumerate(cells):
        sheet.paste(cell, (i * SIZE, 0), cell)
    sheet.save(OUT / "sheet-idle.png")
    print("sheet", OUT / "sheet-idle.png")


if __name__ == "__main__":
    main()

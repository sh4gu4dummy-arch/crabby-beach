#!/usr/bin/env python3
"""Bake one full sprite per paint color for loadouts (same method as red Crabby)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/public/game/crabby")
PAINTS = [
    ("red", (255, 59, 85)),
    ("orange", (255, 138, 18)),
    ("yellow", (255, 225, 74)),
    ("green", (46, 232, 106)),
    ("blue", (46, 200, 255)),
    ("purple", (196, 77, 255)),
    ("pink", (255, 94, 200)),
]
FRAMES = ["idle-0", "idle-1", "walk-1", "walk-2", "walk-3", "walk-4"]


def is_wood(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    return r > 60 and r < 210 and g > 40 and g < 170 and b < 120 and r > g and g >= b - 15 and sat < 0.7


def is_body(r: int, g: int, b: int, body: str) -> bool:
    if body == "green":
        return g > r + 18 and g > b + 10 and g > 80
    if body == "blue":
        return b > r + 20 and b > 80 and b >= g - 30
    if body == "yellow":
        return r > 160 and g > 120 and b < 140
    return r > g + 18 and r > b + 18 and r > 70 and b < 160


def tint_brush(im: Image.Image, paint: tuple[int, int, int], body: str) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    hx = hy = hn = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40 or not is_wood(r, g, b):
                continue
            hx += x
            hy += y
            hn += 1
    cx = hx / hn if hn else w * 0.7
    cy = hy / hn if hn else h * 0.62
    rad2 = (max(w, h) * 0.24) ** 2
    tr, tg, tb = paint
    n = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40:
                continue
            if (x - cx) ** 2 + (y - cy) ** 2 > rad2:
                continue
            if is_wood(r, g, b) or is_body(r, g, b, body):
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            sat = 0 if mx == 0 else (mx - mn) / mx
            if sat < 0.2 or mx < 80:
                continue
            lum = (r * 0.3 + g * 0.5 + b * 0.2) / 255
            k = 0.5 + lum * 0.65
            px[x, y] = (
                min(255, int(tr * k)),
                min(255, int(tg * k)),
                min(255, int(tb * k)),
                a,
            )
            n += 1
    return im, n


def yellow_from_red(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40:
                op[x, y] = (r, g, b, a)
                continue
            if r > g + 18 and r > b + 18 and r > 70 and b < 160:
                lum = (r * 0.35 + g * 0.4 + b * 0.25) / 255
                k = 0.5 + lum * 0.75
                op[x, y] = (
                    min(255, int(248 * k)),
                    min(255, int(208 * k)),
                    min(255, int(38 * k)),
                    a,
                )
            else:
                op[x, y] = (r, g, b, a)
    return out


def save(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)


def bake_folder(src_dir: Path, body: str) -> None:
    for frame in FRAMES:
        src = src_dir / f"{frame}.png"
        if not src.exists():
            print("missing", src)
            continue
        base = Image.open(src)
        for name, rgb in PAINTS:
            dest = src_dir / f"{frame.split('-')[0]}-{name}-{frame.split('-')[1]}.png"
            # idle-0 -> idle-red-0, walk-1 -> walk-red-1
            kind, idx = frame.split("-")
            dest = src_dir / f"{kind}-{name}-{idx}.png"
            tinted, n = tint_brush(base.copy(), rgb, body)
            save(tinted, dest)
            print(n, dest.relative_to(ROOT))


def bake_yellow_from_red() -> None:
    dest_dir = ROOT / "yellow"
    for name, _rgb in PAINTS:
        for kind, n in (("idle", 2), ("walk", 4)):
            count = n
            for i in range(count):
                idx = i if kind == "idle" else i + 1
                src = ROOT / f"{kind}-{name}-{idx}.png"
                dest = dest_dir / f"{kind}-{name}-{idx}.png"
                if not src.exists():
                    print("missing red", src)
                    continue
                save(yellow_from_red(Image.open(src)), dest)
                print("yellow", dest.name)


def main() -> None:
    bake_folder(ROOT / "green", "green")
    bake_folder(ROOT / "blue", "blue")
    bake_yellow_from_red()
    for color in ("red", "blue", "yellow", "green"):
        for hat in ("bow", "bucket", "sailor"):
            bake_folder(ROOT / "looks" / color / hat, color)
    print("DONE")


if __name__ == "__main__":
    main()

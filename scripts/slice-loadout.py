#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ART = Path("/workspace/artifacts/imagine_images")
OUT = Path("/workspace/public/game/crabby")

BLUE = ART / "959a1a3c-54a7-491d-b3a7-f3b2e3fd9c37.jpg"
YELLOW = ART / "6d5504dd-45d9-469f-bb77-52085f85c34c.jpg"
HATS = ART / "33fbcceb-9557-400d-9b57-c79e64ed6a70.jpg"


def knock_white(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if min(r, g, b) > 232 and (r + g + b) > 720:
                px[x, y] = (r, g, b, 0)
            elif min(r, g, b) > 210:
                fade = (min(r, g, b) - 210) / 45
                px[x, y] = (r, g, b, int(a * (1 - min(1, fade))))
    return im


def tight(im: Image.Image, pad=0.1) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    bw, bh = x1 - x0, y1 - y0
    p = int(max(bw, bh) * pad)
    x0 = max(0, x0 - p)
    y0 = max(0, y0 - p)
    x1 = min(im.width, x1 + p)
    y1 = min(im.height, y1 + p)
    crop = im.crop((x0, y0, x1, y1))
    side = max(crop.width, crop.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2), crop)
    return canvas.resize((512, 512), Image.Resampling.LANCZOS)


def slice_grid(path: Path, dest: Path):
    dest.mkdir(parents=True, exist_ok=True)
    im = knock_white(Image.open(path))
    w, h = im.size
    cw, ch = w // 3, h // 2
    names = ["idle-0", "idle-1", "walk-1", "walk-2", "walk-3", "walk-4"]
    i = 0
    for row in range(2):
        for col in range(3):
            cell = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            out = tight(cell)
            out.save(dest / f"{names[i]}.png")
            print("wrote", dest / f"{names[i]}.png")
            i += 1


def slice_hats(path: Path):
    im = knock_white(Image.open(path))
    w, h = im.size
    names = ["hat-bow", "hat-bucket", "hat-sailor"]
    cw = w // 3
    for i, name in enumerate(names):
        cell = im.crop((i * cw, 0, (i + 1) * cw, h))
        out = tight(cell, pad=0.06)
        out.save(OUT / f"{name}.png")
        print("wrote", OUT / f"{name}.png")


if __name__ == "__main__":
    slice_grid(BLUE, OUT / "blue")
    slice_grid(YELLOW, OUT / "yellow")
    slice_hats(HATS)

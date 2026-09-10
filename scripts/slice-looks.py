#!/usr/bin/env python3
from collections import deque
from pathlib import Path
from PIL import Image

ART = Path("/workspace/artifacts/imagine_images")
OUT = Path("/workspace/public/game/crabby/looks")

SHEETS = {
    "red": ART / "07bb58a4-2f9e-402a-842d-93819f688c54.jpg",
    "blue": ART / "8030e3a0-9dcb-4e26-85fa-669f64989b56.jpg",
    "yellow": ART / "dcbd335e-7f37-4513-9041-f2cafbdd3a04.jpg",
}
HATS = ["bow", "bucket", "sailor"]
NAMES = ["idle-0", "idle-1", "walk-1", "walk-2", "walk-3", "walk-4"]


def flood_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = [bytearray(w) for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        r, g, b, a = px[x, y]
        mx, mn = max(r, g, b), min(r, g, b)
        sat = 0 if mx == 0 else (mx - mn) / mx
        if sat > 0.16 and mx > 70:
            seen[y][x] = 1
            continue
        seen[y][x] = 1
        px[x, y] = (r, g, b, 0)
        q.append((x + 1, y))
        q.append((x - 1, y))
        q.append((x, y + 1))
        q.append((x, y - 1))
    return im


def pack(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    crop = im.crop(bbox)
    pad = int(max(crop.size) * 0.08)
    side = max(crop.size) + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2), crop)
    return canvas.resize((512, 512), Image.Resampling.LANCZOS)


def slice_sheet(color: str, path: Path) -> None:
    im = Image.open(path)
    w, h = im.size
    cw, ch = w // 6, h // 3
    for hat_i, hat in enumerate(HATS):
        dest = OUT / color / hat
        dest.mkdir(parents=True, exist_ok=True)
        c0 = hat_i * 2
        cells = [
            (c0, 0),
            (c0 + 1, 0),
            (c0, 1),
            (c0 + 1, 1),
            (c0, 2),
            (c0 + 1, 2),
        ]
        for name, (col, row) in zip(NAMES, cells):
            cell = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            out = pack(flood_bg(cell))
            out.save(dest / f"{name}.png")
            print("wrote", dest / f"{name}.png")


if __name__ == "__main__":
    for color, path in SHEETS.items():
        slice_sheet(color, path)

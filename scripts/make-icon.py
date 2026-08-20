"""Build Crabby Beach app icons from the in-game crab sprite."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/workspace")
SRC = Image.open(ROOT / "public/game/crab-idle-1.png").convert("RGBA")
OUT = ROOT / "public/icons"
OUT.mkdir(parents=True, exist_ok=True)
SHELL = ROOT / "public/game/shell-white-1.png"


def squircle_mask(size: int, radius: float) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return m


def paintbrush(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # handle
    d.rounded_rectangle((size * 0.46, size * 0.42, size * 0.54, size * 0.92), radius=size * 0.03, fill=(122, 64, 32, 255))
    d.rounded_rectangle((size * 0.48, size * 0.46, size * 0.515, size * 0.88), radius=size * 0.02, fill=(196, 122, 58, 255))
    # ferrule
    d.rounded_rectangle((size * 0.40, size * 0.34, size * 0.60, size * 0.46), radius=size * 0.04, fill=(239, 230, 212, 255))
    d.rectangle((size * 0.40, size * 0.39, size * 0.60, size * 0.415), fill=(212, 196, 164, 255))
    # bristles
    d.polygon(
        [
            (size * 0.38, size * 0.36),
            (size * 0.28, size * 0.10),
            (size * 0.42, size * 0.04),
            (size * 0.50, size * 0.12),
            (size * 0.58, size * 0.04),
            (size * 0.72, size * 0.10),
            (size * 0.62, size * 0.36),
        ],
        fill=(93, 187, 99, 255),
    )
    return img.rotate(-28, resample=Image.BICUBIC, expand=True)


def make(size: int = 1024) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # sky
    for y in range(size):
        t = y / size
        r = int(126 + (78 - 126) * t)
        g = int(200 + (168 - 200) * t)
        b = int(227 + (201 - 227) * t)
        d.line([(0, y), (size, y)], fill=(r, g, b, 255))
    # sun glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((size * 0.18, size * -0.12, size * 0.82, size * 0.42), fill=(255, 226, 122, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.06))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    # sand dune
    d.ellipse((-size * 0.15, size * 0.62, size * 1.15, size * 1.35), fill=(246, 215, 160, 255))
    d.ellipse((size * 0.05, size * 0.70, size * 0.55, size * 0.92), fill=(255, 233, 200, 180))

    crab = SRC.copy()
    cw = int(size * 0.78)
    ratio = crab.height / crab.width
    ch = int(cw * ratio)
    crab = crab.resize((cw, ch), Image.LANCZOS)
    cx = (size - cw) // 2
    cy = int(size * 0.14)
    img.alpha_composite(crab, (cx, cy))

    brush = paintbrush(int(size * 0.42))
    bw = int(size * 0.38)
    bh = int(brush.height * (bw / brush.width))
    brush = brush.resize((bw, bh), Image.LANCZOS)
    img.alpha_composite(brush, (int(size * 0.58), int(size * 0.10)))

    if SHELL.exists():
        sh = Image.open(SHELL).convert("RGBA")
        sw = int(size * 0.18)
        sh = sh.resize((sw, int(sh.height * sw / sh.width)), Image.LANCZOS)
        img.alpha_composite(sh, (int(size * 0.10), int(size * 0.72)))
        sh2 = sh.resize((int(sw * 0.78), int(sh.height * 0.78)), Image.LANCZOS)
        img.alpha_composite(sh2, (int(size * 0.74), int(size * 0.76)))

    mask = squircle_mask(size, size * 0.22)
    img.putalpha(mask)
    return img


icon = make(1024)
icon.save(OUT / "icon-1024.png", "PNG")
for s in (512, 256, 192, 180, 128, 96, 72, 48):
    icon.resize((s, s), Image.LANCZOS).save(OUT / f"icon-{s}.png", "PNG")

# round android / pwa
round_mask = Image.new("L", (1024, 1024), 0)
ImageDraw.Draw(round_mask).ellipse((0, 0, 1023, 1023), fill=255)
rnd = make(1024)
rnd.putalpha(round_mask)
rnd.save(OUT / "icon-1024-round.png", "PNG")
rnd.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192-round.png", "PNG")

# copy common names
icon.resize((180, 180), Image.LANCZOS).save(ROOT / "public/apple-touch-icon.png", "PNG")
icon.resize((192, 192), Image.LANCZOS).save(ROOT / "public/icon-192.png", "PNG")
icon.resize((512, 512), Image.LANCZOS).save(ROOT / "public/icon-512.png", "PNG")
print("icons ok")

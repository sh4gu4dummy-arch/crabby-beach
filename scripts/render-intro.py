#!/usr/bin/env python3
"""Build intro.mp4 from game sprites + locked Crabby voice. Mouth open only while talking."""
from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/workspace")
GAME = ROOT / "public/game"
VOICE = ROOT / "public/voice/crabby/intro.mp3"
OUT = GAME / "intro.mp4"
W, H = 720, 1280
FPS = 24
DUR = 13.2
TALK = [(0.12, 2.15), (3.45, 4.95), (6.4, 8.2), (10.15, 12.55)]


def lerp(a: float, b: float, t: float) -> float:
    t = max(0, min(1, t))
    t = t * t * (3 - 2 * t)
    return a + (b - a) * t


def talking(t: float) -> bool:
    return any(a <= t < b for a, b in TALK)


def load(name: str) -> Image.Image:
    return Image.open(GAME / name).convert("RGBA")


def cover(src: Image.Image) -> Image.Image:
    s = max(W / src.width, H / src.height)
    nw, nh = int(src.width * s), int(src.height * s)
    im = src.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (nw - W) // 2
    y = max(0, nh - H) // 6
    return im.crop((x, y, x + W, y + H))


def with_mouth(crab: Image.Image, open_mouth: bool) -> Image.Image:
    im = crab.copy()
    if not open_mouth:
        return im
    d = ImageDraw.Draw(im)
    cx, cy = im.width * 0.5, im.height * 0.58
    d.ellipse([cx - 18, cy - 10, cx + 18, cy + 16], fill=(40, 28, 24, 255))
    d.ellipse([cx - 12, cy - 2, cx + 12, cy + 12], fill=(80, 36, 40, 255))
    return im


def main() -> None:
    beach = cover(load("beach.jpg"))
    idle = [load("crabby/idle-green-0.png"), load("crabby/idle-green-1.png")]
    walk = [load(f"crabby/walk-green-{i}.png") for i in range(1, 5)]
    shell = load("shell-white-1.png").resize((140, 140), Image.Resampling.LANCZOS)
    n = int(DUR * FPS)
    tmp = Path(tempfile.mkdtemp(prefix="crabby-intro-"))
    try:
        for i in range(n):
            t = i / FPS
            frame = beach.copy()
            # shell lands mid-right
            sx, sy = 430, 720
            painted = max(0.0, min(1.0, (t - 6.6) / 2.4))
            sh = shell.copy()
            if painted > 0:
                overlay = Image.new("RGBA", sh.size, (46, 232, 106, int(220 * painted)))
                mask = sh.split()[-1]
                sh = Image.alpha_composite(sh, Image.merge("RGBA", (*overlay.split()[:3], mask)))
            frame.alpha_composite(sh, (sx, sy))

            if t < 2.3:
                cx, cy = 280, 780
                spr = idle[i // 8 % 2]
            elif t < 6.4:
                u = (t - 2.3) / 4.1
                cx = lerp(280, 360, u)
                cy = lerp(780, 700, u)
                spr = walk[i // 5 % 4]
            else:
                cx, cy = 360, 700
                spr = idle[i // 8 % 2]
            crab = spr.resize((220, 220), Image.Resampling.LANCZOS)
            crab = with_mouth(crab, talking(t))
            frame.alpha_composite(crab, (int(cx), int(cy)))
            rgb = frame.convert("RGB")
            rgb.save(tmp / f"{i:04d}.jpg", quality=82)

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-framerate",
                str(FPS),
                "-i",
                str(tmp / "%04d.jpg"),
                "-i",
                str(VOICE),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-shortest",
                "-movflags",
                "+faststart",
                str(OUT),
            ],
            check=True,
        )
        print("wrote", OUT, OUT.stat().st_size)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()

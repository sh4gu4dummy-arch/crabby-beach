#!/usr/bin/env python3
"""Loadout brush gate.

Failure this caught: green Crabby shipped with empty claws.

Canon original (idle-red-0.png) has a brush. Recolors of that keep it.
NEW drawings (blue/green Imagine crabs) must show a non-body accent
(the tool). This script fails those if the accent is missing.

Also: you still have to OPEN idle-0.png and look. The script cannot
see "held in the claw."

  python3 scripts/verify-crab-brush.py
"""
from __future__ import annotations

import colorsys
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace/public/game/crabby")

NEW_DRAWINGS = [
    ROOT / "blue" / "idle-0.png",
    ROOT / "green" / "idle-0.png",
]
for color in ("blue", "green"):
    for hat in ("bow", "bucket", "sailor"):
        NEW_DRAWINGS.append(ROOT / "looks" / color / hat / "idle-0.png")

MUST_EXIST = [
    ROOT / "idle-red-0.png",
    ROOT / "yellow" / "idle-0.png",
    ROOT / "green" / "idle-0.png",
    ROOT / "blue" / "idle-0.png",
]


def accent_count(path: Path) -> int:
    arr = np.array(Image.open(path).convert("RGBA"))
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    m = a > 40
    if not m.any():
        return 0
    hues = []
    acc = 0
    ys, xs = np.where(m)
    for y, x in zip(ys, xs):
        h, s, v = colorsys.rgb_to_hsv(r[y, x] / 255, g[y, x] / 255, b[y, x] / 255)
        if s > 0.22 and v > 0.22:
            hues.append(h * 360)
    if not hues:
        return 0
    hues.sort()
    dom = hues[len(hues) // 2]
    for y, x in zip(ys, xs):
        h, s, v = colorsys.rgb_to_hsv(r[y, x] / 255, g[y, x] / 255, b[y, x] / 255)
        d = abs(h * 360 - dom) % 360
        d = min(d, 360 - d)
        if s > 0.28 and v > 0.25 and d > 35:
            acc += 1
    return acc


def main() -> int:
    failed = 0
    for p in MUST_EXIST:
        if not p.is_file():
            print("MISSING", p)
            failed += 1
    for p in NEW_DRAWINGS:
        if not p.is_file():
            print("MISSING", p)
            failed += 1
            continue
        n = accent_count(p)
        ok = n >= 80
        print(("OK" if ok else "NO BRUSH"), n, p.relative_to(ROOT))
        if not ok:
            failed += 1
    print("canon original", ROOT.joinpath("idle-red-0.png").is_file())
    if failed:
        print("FAIL", failed)
        return 1
    print("PASS new-drawn crabs show a brush-like accent; original file present")
    return 0


if __name__ == "__main__":
    sys.exit(main())

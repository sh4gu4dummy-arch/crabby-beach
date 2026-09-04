#!/usr/bin/env python3
"""Bake new Crabby lines in the locked canon voice. Does not overwrite intro."""
from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path("/workspace")
CANON = ROOT / "public/voice/crabby/canon.json"
OUT = ROOT / "public/voice/crabby"
LOCKED = {"intro", "intro-raw"}


def load_canon() -> dict:
    return json.loads(CANON.read_text())


async def speak(text: str, dest: Path, spec: dict) -> None:
    import edge_tts

    comm = edge_tts.Communicate(text, spec["voice"], rate=spec["rate"], pitch=spec["pitch"])
    raw = dest.with_name(dest.stem + "-raw" + dest.suffix)
    await comm.save(str(raw))
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(raw),
            "-af",
            spec["ffmpeg"],
            str(dest),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def main() -> int:
    parser = argparse.ArgumentParser(description="Bake Crabby canon voice lines")
    parser.add_argument("name", help="clip id, e.g. yay")
    parser.add_argument("text", nargs="+", help="words Crabby says")
    args = parser.parse_args()
    if args.name in LOCKED:
        print("refusing to overwrite locked clip:", args.name, file=sys.stderr)
        return 2
    spec = load_canon()
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{args.name}.mp3"
    text = " ".join(args.text)
    await speak(text, dest, spec)
    spec.setdefault("lines", {})[args.name] = text
    CANON.write_text(json.dumps(spec, indent=2) + "\n")
    print("wrote", dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

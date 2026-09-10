#!/usr/bin/env python3
"""Method C stills: session JWT → /v1/images/generations → write --out now.

Never prints the token. Never writes ~/.grok/auth.json.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.x.ai/v1/images/generations"
MODEL = "grok-imagine-image-2.0"


def jwt() -> str:
    p = Path.home() / ".grok" / "auth.json"
    if not p.is_file():
        sys.exit("missing ~/.grok/auth.json")
    raw = json.loads(p.read_text())
    objs: list[dict] = []
    if isinstance(raw, list):
        objs = [x for x in raw if isinstance(x, dict)]
    elif isinstance(raw, dict):
        if "key" in raw:
            objs = [raw]
        else:
            objs = [v for v in raw.values() if isinstance(v, dict)]
    key = None
    for obj in objs:
        key = obj.get("key") or obj.get("token") or obj.get("access_token")
        if key:
            break
    if not key:
        sys.exit("auth.json has no key")
    return str(key)


def post_image(prompt: str, aspect: str) -> str:
    body = json.dumps(
        {"model": MODEL, "prompt": prompt, "n": 1, "aspect_ratio": aspect}
    ).encode()
    req = urllib.request.Request(
        API,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {jwt()}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            payload = json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"generations HTTP {e.code}")
    data = payload.get("data") or []
    if not data or not data[0].get("url"):
        sys.exit("no image url in response")
    return str(data[0]["url"])


def download(url: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "crabby-beach"})
    with urllib.request.urlopen(req, timeout=60) as res:
        blob = res.read()
    if len(blob) < 1000:
        sys.exit(f"tiny download {len(blob)} bytes")
    out.write_bytes(blob)
    print(f"wrote {out} {len(blob)} bytes")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--aspect", default="16:9")
    args = ap.parse_args()
    url = post_image(args.prompt, args.aspect)
    download(url, Path(args.out))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Method B video: session JWT → /v1/videos/generations → write --out now.

Never prints the token. Never writes ~/.grok/auth.json.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.x.ai/v1/videos/generations"
POLL = "https://api.x.ai/v1/videos"
MODEL = "grok-imagine-video"


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


def headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {jwt()}", "Content-Type": "application/json"}


def post_start(prompt: str, seconds: int, image_url: str | None) -> dict:
    body: dict = {
        "model": MODEL,
        "prompt": prompt,
        "duration": seconds,
        "aspect_ratio": "16:9",
    }
    if image_url:
        body["image"] = {"url": image_url}
        body.pop("aspect_ratio", None)
    req = urllib.request.Request(API, data=json.dumps(body).encode(), method="POST", headers=headers())
    try:
        with urllib.request.urlopen(req, timeout=180) as res:
            return json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:800]
        sys.exit(f"generations HTTP {e.code} {err}")


def pick_url(payload: dict) -> str | None:
    if payload.get("url"):
        return str(payload["url"])
    data = payload.get("data")
    if isinstance(data, list) and data and isinstance(data[0], dict) and data[0].get("url"):
        return str(data[0]["url"])
    video = payload.get("video")
    if isinstance(video, dict) and video.get("url"):
        return str(video["url"])
    return None


def poll(request_id: str) -> str:
    url = f"{POLL}/{request_id}"
    for _ in range(80):
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {jwt()}"})
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                payload = json.loads(res.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (202, 409):
                time.sleep(3)
                continue
            sys.exit(f"poll HTTP {e.code}")
        got = pick_url(payload)
        if got:
            return got
        status = str(payload.get("status") or payload.get("state") or "")
        if status.lower() in {"failed", "error"}:
            sys.exit(f"video failed {status}")
        time.sleep(3)
    sys.exit("video poll timeout")


def download(url: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "crabby-beach"})
    with urllib.request.urlopen(req, timeout=180) as res:
        blob = res.read()
    if len(blob) < 2000:
        sys.exit(f"tiny download {len(blob)} bytes")
    out.write_bytes(blob)
    print(f"wrote {out} {len(blob)} bytes")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--seconds", type=int, default=6)
    ap.add_argument("--image-url", default="")
    args = ap.parse_args()
    payload = post_start(args.prompt, args.seconds, args.image_url or None)
    url = pick_url(payload)
    if not url:
        rid = payload.get("id") or payload.get("request_id")
        if not rid:
            sys.exit(f"no url or id in {list(payload)}")
        url = poll(str(rid))
    download(url, Path(args.out))


if __name__ == "__main__":
    main()

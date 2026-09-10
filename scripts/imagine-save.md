# Imagine stills — Method C

The Imagine *tool* often generates but cannot write `/workspace/artifacts` (FUSE). Do not remount that folder. Do not loop the tool.

Need a file on disk this turn:

```
python3 scripts/imagine-image.py --prompt "..." --out public/game/_sheets/name.jpg --aspect 16:9
```

Uses session JWT in `~/.grok/auth.json` (never print). Model `grok-imagine-image-2.0`. Downloads the temp `imgen.x.ai` URL immediately into `--out`.

App URLs stay under `public/`.

## Add to the Palabra/ClassNest guide

These are the only extras from Crabby Beach v.102. The rest of that guide is fine.

1. **auth.json is not always a list / first object.** On this box it was a dict keyed by issuer (`"https://auth.x.ai::<id>"` → `{ key, refresh_token, ... }`). `raw[0]` or `raw["key"]` yields nothing, then `/v1/models` returns 400 `Incorrect API key`. Walk values until you find a `key`. Never print it.

2. **16:9 stills work** (guide already had 1:1 and 3:4). Sprite sheets still often ignore the exact grid (asked 8×3, got 6×3). Slice the grid that actually arrived.

3. **Magenta is not always #FF00FF.** After chroma, flood leftover pink/pale from the edges or the cutout keeps a halo.

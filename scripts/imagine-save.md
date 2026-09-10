# Imagine stills — Method C

The Imagine *tool* often generates but cannot write `/workspace/artifacts` (FUSE). Do not remount that folder. Do not loop the tool.

Need a file on disk this turn:

```
python3 scripts/imagine-image.py --prompt "..." --out public/game/_sheets/name.jpg --aspect 16:9
```

Uses session JWT in `~/.grok/auth.json` (never print). Model `grok-imagine-image-2.0`. Downloads the temp `imgen.x.ai` URL immediately into `--out`.

App URLs stay under `public/`.

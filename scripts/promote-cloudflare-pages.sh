#!/usr/bin/env bash
# Promote current tree to Cloudflare Pages production branch `public`.
# Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (Riverbrook secrets).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node scripts/build-pages.mjs cloudflare
npx wrangler pages deploy dist-pages --project-name=crabby-beach --branch=public --commit-dirty=true
echo "Promoted → https://crabby-beach.pages.dev"

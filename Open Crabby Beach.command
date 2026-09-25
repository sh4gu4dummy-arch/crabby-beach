#!/bin/bash
# Double-click this in Finder (Mac) to run Crabby Beach locally on port 8154.
set -e
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display alert "Crabby Beach" message "Node/npm not found. Install Node LTS from https://nodejs.org then try again."' 2>/dev/null || echo "Node/npm not found. Install Node LTS from https://nodejs.org"
  read -r -p "Press Enter to close…"
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "First run — installing dependencies…"
  npm install
fi
echo "Starting Crabby Beach at http://127.0.0.1:8154"
echo "(Leave this window open while you play. Ctrl+C to stop.)"
npm run local

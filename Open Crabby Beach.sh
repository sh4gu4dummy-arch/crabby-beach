#!/usr/bin/env bash
# Double-click or run: ./Open\ Crabby\ Beach.sh  — local viewer on port 8154.
set -e
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "Node/npm not found. Install Node LTS from https://nodejs.org then try again."
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

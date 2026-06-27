#!/usr/bin/env bash
# Build, commit, sync, and push myalicia.com in one step.
# Usage:  ./publish.sh "your commit message"
# If no message is given, a default is used.
set -e
cd "$(dirname "$0")"

echo "→ Building (verifying the site compiles)…"
npm run build

echo "→ Committing…"
git add -A
git commit -m "${1:-Update site}" || echo "  (nothing new to commit)"

echo "→ Syncing with remote (rebase)…"
git pull --rebase origin main

echo "→ Pushing…"
git push
echo "✓ Pushed. The deploy will pick it up shortly."

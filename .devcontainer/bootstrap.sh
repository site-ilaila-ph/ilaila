#!/bin/sh
set -e

DEST="/workspaces/project"
REPO_URL="https://github.com/site-ilaila-ph/ilaila.git"
MARKER="$DEST/.tmp/setup-done-marker"

if [ ! -d "$DEST/.git" ]; then
  echo "No repo at $DEST — cloning..."
  rmdir "$DEST" 2>/dev/null || true
  git clone "$REPO_URL" "$DEST"
else
  echo "Repo already present at $DEST — skipping clone."
fi

cd "$DEST" || exit

if [ -f "$MARKER" ]; then
  echo "Setup already done — skipping install/dev:setup."
  exit 0
fi

pnpm install --frozen-lockfile
INSTALL_EXIT_CODE=$?

if [ "$INSTALL_EXIT_CODE" -ne 0 ]; then
  echo "Retrying with approve-builds..."
  pnpm approve-builds
  pnpm install --frozen-lockfile
fi

pnpm run dev:setup

mkdir -p "$(dirname "$MARKER")"
touch "$MARKER"
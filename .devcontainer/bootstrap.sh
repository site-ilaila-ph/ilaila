#!/bin/sh
set -e

DEST="/workspaces/project"
REPO_URL="https://github.com/site-ilaila-ph/ilaila.git"

if [ ! -d "$DEST/.git" ]; then
  echo "No repo at $DEST — cloning..."
  TMP="$(mktemp -d)"
  git clone "$REPO_URL" "$TMP"
  mv "$TMP" "$DEST"
else
  echo "Repo already present at $DEST — skipping clone."
fi

cd "$DEST"
pnpm run dev:setup
pnpm run dev:seed || true
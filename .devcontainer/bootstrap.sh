#!/bin/sh
set -e

DEST="/workspace/app"
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
pnpm install
pnpm exec prisma db push
pnpm exec prisma generate
pnpm exec prisma db seed || true
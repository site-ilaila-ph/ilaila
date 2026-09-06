#!/bin/sh
DEST="/workspaces/project"
REPO_URL="https://github.com/site-ilaila-ph/ilaila.git"

if [ ! -d "$DEST/.git" ]; then
  echo "No repo at $DEST — cloning..."
  # remove empty dir if present so git can clone directly into it
  rmdir "$DEST" 2>/dev/null || true
  git clone "$REPO_URL" "$DEST"
else
  echo "Repo already present at $DEST — skipping clone."
fi

cd "$DEST" || exit

SETUP_EXIT_CODE=$(pnpm install --frozen-lockfile)

if [ "$SETUP_EXIT_CODE" -ne 0 ]; then
  echo "Retrying with approve-builds..."
  pnpm approve-builds
  pnpm install --frozen-lockfile
fi

pnpm run dev:setup
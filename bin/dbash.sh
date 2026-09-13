#!/usr/bin/bash

# bin/dbash.sh -- developer bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$HOME/.nvm/nvm.sh"

set -a
source "$SCRIPT_DIR/../.env"
set +a

cd "$SCRIPT_DIR/.."

nvm use > /dev/null

exec bash "$@"
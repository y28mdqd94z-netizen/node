#!/usr/bin/env bash
set -euo pipefail

node .agent-os/scripts/validate-primitives.mjs >/dev/null

echo "validate-primitives.test.sh: ok"

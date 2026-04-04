#!/usr/bin/env bash
set -euo pipefail

node .agent-os/scripts/check-freshness.mjs >/dev/null

echo "check-freshness.test.sh: ok"

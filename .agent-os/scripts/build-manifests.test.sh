#!/usr/bin/env bash
set -euo pipefail

node .agent-os/scripts/build-manifests.mjs >/dev/null

node - <<'NODE'
const fs = require('fs');
const check = (p) => {
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const required = ['core', 'skills', 'workflows', 'references', 'anti_patterns', 'evals', 'templates'];
  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`Missing ${key} in ${p}`);
    }
  }
};
check('.agent-os/manifests/design-manifest.json');
check('.agent-os/manifests/engineering-manifest.json');
NODE

echo "build-manifests.test.sh: ok"

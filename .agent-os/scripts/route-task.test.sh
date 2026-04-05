#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .agent-os/scripts/route-task.mjs ]]; then
  echo "route-task.mjs not found" >&2
  exit 1
fi

if [[ ! -f .agent-os/orchestrator/routing.yaml ]]; then
  echo "routing.yaml not found" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node not available for route-task test" >&2
  exit 1
fi

output=$(node .agent-os/scripts/route-task.mjs \
  --command design-feature \
  --title "Routing test" \
  --risk-level low \
  --config .agent-os/orchestrator/routing.yaml \
  --repo-map memory/repo_map.json)

if ! grep -q "^agents=" <<< "$output"; then
  echo "route-task output missing agents" >&2
  exit 1
fi

if ! grep -q "^skills=" <<< "$output"; then
  echo "route-task output missing skills" >&2
  exit 1
fi

override_output=$(node .agent-os/scripts/route-task.mjs \
  --command design-feature \
  --title "Routing test" \
  --risk-level low \
  --config .agent-os/orchestrator/routing.yaml \
  --repo-map memory/repo_map.json \
  --skills "+performance-check,-market-analysis" \
  --agents "+documentation-agent,-ux-systems-lead")

if ! grep -q "skills=.*performance-check" <<< "$override_output"; then
  echo "override did not add performance-check" >&2
  exit 1
fi

if grep -q "skills=.*market-analysis" <<< "$override_output"; then
  echo "override did not remove market-analysis" >&2
  exit 1
fi

if grep -q "agents=.*ux-systems-lead" <<< "$override_output"; then
  echo "override did not remove ux-systems-lead" >&2
  exit 1
fi

echo "route-task.test.sh: ok"

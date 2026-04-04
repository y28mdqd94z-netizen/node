#!/usr/bin/env bash
set -euo pipefail

if ! rg -n "start-new-project" .agent-os/agent >/dev/null; then
  echo "start-new-project not found in .agent-os/agent" >&2
  exit 1
fi

if ! rg -n "start-new-project\\)" .agent-os/agent >/dev/null; then
  echo "start-new-project case not found in .agent-os/agent" >&2
  exit 1
fi

if ! rg -n "start-new-project\\s+Kick off new project intake" .agent-os/agent >/dev/null; then
  echo "start-new-project usage line not found in .agent-os/agent" >&2
  exit 1
fi

echo "agent-start-new-project.test.sh: ok"

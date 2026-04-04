# Agent OS Source

This directory is the single source of truth for the engineering + design layers.
Author here, then generate manifests (and optional provider-specific outputs) from these files.

- Source files live under `source/`.
- Generated indexes live under `manifests/`.
- Legacy skill folders remain in `.agent-os/design/` for backward compatibility.

Build manifests:
- `node .agent-os/scripts/build-manifests.mjs`

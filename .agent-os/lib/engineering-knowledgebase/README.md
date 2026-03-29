# Engineering Knowledgebase

A modular, ranked, and overrideable knowledgebase for modern web application engineering. It is designed for retrieval-first use by AI agents and humans.

## How to use
- Retrieve only the relevant files using `taxonomy.yaml` and `manifest.json`.
- Prefer `stable_core` entries when uncertain.
- For `volatile` entries, verify live before implementation.
- Apply P0 strictly, P1 by default, adapt P2/P3 with context and justification.

## Schema
Each entry includes priority, confidence, evidence, volatility, override rules, impacts, and sources. See `ranking-model.yaml`, `override-model.yaml`, and `freshness-model.yaml`.

## Updating
Use the review cadences and triggers in `12_maintenance/`. Update `changelog.md` and regenerate `manifest.json` after edits.

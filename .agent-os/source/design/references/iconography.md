---
id: iconography
title: Iconography
rank: P2
overrideable: true
tags: [iconography, icons, design-system]
---
Purpose:
- Standardize icon usage, sizing, stroke, and accessibility.

Use when:
- Selecting or placing icons in UI components.

Rules (short list):
- Use lucide-react for React implementations; do not mix icon libraries.
- Map icon size to `icon.size.*` tokens; map stroke width to `icon.stroke.*` tokens.
- Pair icons with text for primary actions; icon-only controls need accessible labels.
- Use outline icons for actions; filled only for status.

Source of truth:
- .agent-os/lib/ux-ui-knowledgebase/08_primitives/01_design-system/iconography.yaml
- .agent-os/tokens/base.json
- .agent-os/tokens/semantic.json

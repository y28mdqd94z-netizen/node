---
name: design-context
description: "Gather and persist design context for this repo before any UI/UX work."
argument-hint: "[scope]"
user-invocable: true
---
Gather missing design context and write it to `memory/design_context.yaml`.

## Steps
1. Scan the repo for product cues (README, docs, design system files).
2. Ask the user only for missing required fields.
3. Summarize the chosen direction and write the context file.

Required fields:
- product purpose
- target users + usage context
- brand personality + tone
- design principles (3-5)
- interaction preferences + platform constraints
- accessibility expectations
- visual style direction
- motion philosophy
- content tone + UX writing constraints
- differentiation goals

Use template:
- `templates/design_context.yaml`

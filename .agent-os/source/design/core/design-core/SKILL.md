---
name: design-core
description: "Establish design context and aesthetic direction before any UI/UX work."
argument-hint: "[scope]"
user-invocable: true
---
You are the design core. Do not proceed without confirmed design context.

## Context Gating (Required)
1. Read `memory/design_context.yaml`.
2. If required fields are missing, run `design-context` workflow.
3. Confirm the aesthetic direction and 3-5 design principles for this task.

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

## Direction
Commit to a clear aesthetic direction. Avoid generic or safe layouts. State why the direction fits the context.

## Guardrails (Non-Negotiable)
- Accessibility baseline (contrast, keyboard, focus).
- One primary action per view by default.
- Reuse components and tokens unless justified.

## Required References
- `references/typography.md`
- `references/color-contrast.md`
- `references/spatial-design.md`
- `references/interaction-model.md`
- `references/ux-writing.md`

## Anti-Pattern Check
- Review `anti-patterns/core.yaml` and ensure none apply.

## Output Expectations
- State the chosen aesthetic direction.
- Cite any principle overrides and mitigations.
- Deliver concrete UX/UI decisions, not vague advice.

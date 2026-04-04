# Pattern Selection Guide

Use this guide to choose patterns before composing components.

## Steps
1. Identify the workflow type (navigation, CRUD, onboarding, analytics).
2. Match the workflow to a pattern in `08_primitives/03_patterns`.
3. Confirm the shell compatibility for the target product context.
4. Apply selection rules from `08_primitives/00_meta/selection-rules.yaml`.

## Heuristics
- Prefer one primary pattern per screen.
- Use list-detail for record exploration and CRUD flows.
- Use overlays for short secondary tasks only.

## Context hints
- B2B SaaS and admin portals favor `navigation`, `data-heavy`, and `settings-admin` patterns.
- Builders favor `builder` and `overlays` patterns with a `builder-shell`.
- Mobile-first utilities favor `overlays` and `onboarding` patterns with sheet-first shells.


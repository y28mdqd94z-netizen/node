# Design System Philosophy

Purpose:
- Provide a modular, retrieval-friendly design operating system for AI-assisted UI/UX work.
- Keep decisions explicit, ranked, and overrideable.

Commitments:
- Structure over decoration; hierarchy is earned through typography and spacing first.
- Accessibility is baseline, not a feature.
- Patterns before screens; reuse beats novelty unless differentiation is required.
- Intentional aesthetics over safe defaults; avoid generic AI output.

Sources of truth:
- UX laws, patterns, components, and evaluation checklists live in `.agent-os/lib/ux-ui-knowledgebase/`.
- Tokens live in `.agent-os/tokens/` and `memory/design_system.json`.

Design direction rule:
- Every design task must commit to a clear aesthetic direction and document its rationale.

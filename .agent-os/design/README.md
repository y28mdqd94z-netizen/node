# Agent OS Design Layer

This folder provides a modular design operating system for AI-assisted product and interface design.
It is additive to the existing UX/UI knowledgebase and tokens. The source of truth for deep UX laws,
patterns, and checklists remains in `.agent-os/lib/ux-ui-knowledgebase/`.

Core goals:
- Stronger first-pass UI and UX (distinctive, intentional, non-generic)
- Clear, modular references with low token cost
- Explicit anti-patterns to prevent AI-slop
- Command-style workflows for critique/audit/polish
- Portable, provider-agnostic skill structure

Authoring source of truth:
- `.agent-os/source/design`

Generated manifests:
- `.agent-os/manifests/design-manifest.json`
- `.agent-os/design/manifest.json` (legacy compatibility)

Primary context file:
- `memory/design_context.yaml`

If you update the knowledgebase, follow the existing process:
- `./.agent-os/agent kb-update`

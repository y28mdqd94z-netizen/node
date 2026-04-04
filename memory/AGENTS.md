# Agent OS + Codex (VS Code) Instructions

## Mandatory bootstrap (always first)
- Read `.agent-os/system.md` before doing any work.
- If a task involves UX/UI decisions, consult `.agent-os/lib/ux-ui-knowledgebase` and cite file + id/title.
- Orchestrator is mandatory: include routing notes and phase gate status in outputs.

## Workflow
- Use `./.agent-os/agent` commands to create task logs and output templates.
- If you edit the knowledgebase, run `./.agent-os/agent kb-update`.

## Testing Requirements
- When creating new features or code, also create or update test files to maximize coverage.
- Run relevant tests at the end of each completed prompt and report results. If tests cannot be run, explain why.

## Market Analysis Rules
- Infer the industry from chat context when none is stated.
- If competitors are provided, use them and add 3–5 additional best‑in‑class examples.
- If required inputs are missing, explicitly ask before proceeding.

## Scope
These instructions apply to the entire repository.

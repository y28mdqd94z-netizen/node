---
name: security-review
description: "Review features for security risks and mitigations."
argument-hint: "[scope]"
user-invocable: true
---
Invoke `engineering-core` first.

## Focus
- Check auth boundaries, data exposure, and dependency risks.

## Required References
- `references/security-baseline.md`
- `.agent-os/lib/engineering-knowledgebase/11_agent-layer/audit-checklists.yaml`

## Output
- Risk list + mitigations
- P0/P1 items first

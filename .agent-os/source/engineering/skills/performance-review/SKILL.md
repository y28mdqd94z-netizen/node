---
name: performance-review
description: "Identify performance bottlenecks and remediation paths."
argument-hint: "[scope]"
user-invocable: true
---
Invoke `engineering-core` first.

## Focus
- Look for hot paths, N+1 queries, and heavy rendering loops.

## Required References
- `references/performance-baseline.md`
- `.agent-os/lib/engineering-knowledgebase/09_system-quality/performance.yaml`

## Output
- Bottleneck list + prioritized fixes

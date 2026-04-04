---
name: engineering-context
description: "Gather and persist engineering context before implementation."
argument-hint: "[scope]"
user-invocable: true
---
Gather missing engineering context and write it to `memory/engineering_context.yaml`.

## Steps
1. Scan repo for stack, conventions, tests, and deployment.
2. Ask the user only for missing required fields.
3. Summarize constraints, risks, and test expectations.

Required fields:
- stack + runtime
- repo conventions (lint, formatting, structure)
- test setup + required suites
- deployment environment
- data sensitivity + auth model
- performance expectations

Use template:
- `templates/engineering_context.yaml`

---
name: engineering-core
description: "Establish engineering context, constraints, and validation gates before implementation."
argument-hint: "[scope]"
user-invocable: true
---
You are the engineering core. Do not implement without confirmed engineering context.

## Context Gating (Required)
1. Read `memory/engineering_context.yaml`.
2. If required fields are missing, run `engineering-context` workflow.
3. Confirm repo conventions, risks, and test expectations.

Required fields:
- stack + runtime
- repo conventions (lint, formatting, structure)
- test setup + required suites
- deployment environment
- data sensitivity + auth model
- performance expectations

## Guardrails (Non-Negotiable)
- Follow repo conventions.
- Validate inputs at system boundaries.
- Add tests for behavior changes.

## Required References
- `references/engineering-principles.md`
- `references/security-baseline.md`
- `references/testing-baseline.md`

## Anti-Pattern Check
- Review `anti-patterns/core.yaml` and ensure none apply.

## Output Expectations
- State design constraints, risks, and test coverage plan.
- Document any overrides with justification.

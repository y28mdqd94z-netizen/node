# Component Selection Guide

Use this guide to choose components once a pattern is selected.

## Steps
1. Identify the task and data type.
2. Choose the lowest-complexity component that solves the task.
3. Confirm states (loading, empty, error) before implementation.
4. Bind component tokens from `.agent-os/tokens/components.json`.

## Heuristics
- Use `select` for <= 15 options; use `combobox` for larger or dynamic sets.
- Use `dialog` for short confirmations; use `sheet` for longer tasks.
- Prefer `table` for comparison, `list` for scanning.

## Context hints
- Admin portals favor `table`, `toolbar`, `pagination`.
- Mobile-first utilities favor `sheet`, `button`, and `input` with larger sizes.


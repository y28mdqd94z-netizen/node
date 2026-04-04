# Portable Agent OS - Operating Spec

## Core Objective
DESIGN -> THINK -> RESEARCH -> ARCHITE -> BUILD -> VALIDATE -> SECURE -> REFINE -> DOCUMENT

Outputs must be production-quality, secure-by-default, and usable directly in a repo.

## Mandatory Execution Phases (Strict Order)
1. Discovery: clarify intent, user goals, constraints, risks; infer domain/category, target users, and key flows/features when unspecified; document assumptions; require confirmation for high-risk domains
2. Market Analysis: research industry examples/competitors; extract patterns, features, components, and styling; cite sources; identify gaps/opportunities; compare findings against UX knowledgebase before selection
3. UX Design: flows, 1-2 actions per task, apply Hick/Fitts/Miller/Jakob/Tesler, define states/transitions/feedback/empty/error/loading; align with market analysis + knowledgebase
4. System Architecture: boundaries, data flow, API contracts, state ownership
5. Implementation: real code (React + Tailwind default), clear component structure, predictable state, minimal abstraction
6. Validation: type safety, input validation, error handling, edge cases
7. Security Review (Gate): data exposure, auth weaknesses, API vulnerabilities, frontend risks, dependency risks
8. UX Refinement: reduce cognitive load, improve clarity, remove friction
9. Documentation: update memory files, log decisions, log risks

## Output Format (Strict)
1. SUMMARY
2. MARKET ANALYSIS
3. DESIGN DECISION
4. ARCHITECTURE
5. IMPLEMENTATION
6. SECURITY REVIEW
7. NEXT ACTIONS

## Agent Architecture
- Core agents defined in `.agent-os/agents.json`
- Specialist micro-skills defined in `.agent-os/skills.json`

## Orchestration (Mandatory)
- The Orchestrator must be invoked at the start of every task
- Orchestrator decides routing to core agents and enforces phase order
- Outputs must include Orchestrator routing notes
- If Orchestrator is not invoked, stop and request a re-run with Orchestrator

## UX/UI Knowledgebase (Local)
- Location: `.agent-os/lib/ux-ui-knowledgebase`
- Use taxonomy to map **laws → principles → patterns → components**
- For UX decisions, cite knowledgebase entries by file + id/title
- Prefer evaluation checklists in `02_design-evaluation/` for UX audits
- Use selection/critique rules in `06_agent-application/` for pattern/component choices
- After KB edits, run `kb-update` to refresh the index + manifest

## Governance Rules
- Risk levels: LOW -> proceed, MEDIUM -> log + proceed, HIGH -> require confirmation
- Never expose secrets, break functionality silently, or introduce unsafe dependencies

## Security and Compliance (Non-Negotiable)
- Never expose secrets client-side
- Always validate inputs, enforce auth boundaries, sanitize inputs, minimize data collection
- Must check: PII handling, token storage, API exposure, logging leaks, XSS, dependency risks

## Failure Mode Design
Define failure points, fallback UX, retry logic, safe error messages for each feature.

## Observability
Include privacy-safe logging, error tracking hooks, and performance awareness.

## MCP Integration
Use filesystem/git/terminal/browser when available; degrade gracefully otherwise.

## Bootstrap Flow
When asked to "Set up project": scan repo, detect stack, generate repo map + architecture + design system baseline, create memory files, register agents + skills.

## Self-Improving System
After each task, identify inefficiencies, repeated logic, UX inconsistencies, and code smells. Update skills/patterns/components and refactor shared utilities/design system.

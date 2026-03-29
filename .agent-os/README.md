# Portable Agent OS

This folder is self-contained and safe to drop into any repo. It does not modify existing source files, install dependencies, or access the network.

## Usage

```bash
./.agent-os/agent help
./.agent-os/agent bootstrap-project
./.agent-os/agent scan-repo
```

Commands may be prefixed with `/` (e.g. `/.agent-os/agent /scan-repo`).

## Agents and Skills

- Core agents: `.agent-os/agents.json`
- Specialist micro-skills: `.agent-os/skills.json`
- UX/UI knowledgebase: `.agent-os/lib/ux-ui-knowledgebase` (laws, principles, patterns, components, evaluation checklists)
- Operating spec: `.agent-os/system.md`

## Outputs

Feature commands create a structured output template in `memory/outputs/` that follows the required format:

1. SUMMARY  
2. DESIGN DECISION  
3. ARCHITECTURE  
4. IMPLEMENTATION  
5. SECURITY REVIEW  
6. NEXT ACTIONS  

## Risk Gating

- `--risk-level low|medium|high` (default: `low`)
- `--confirm-high-risk` required for high risk
- `--title "Your task title"` to name the task/output

## Commands

- `bootstrap-project`  Create memory files and scan repo
- `scan-repo`          Update `memory/repo_map.json` only
- `sync-docs`          Ensure memory files exist (no overwrite)
- `design-feature`     Log a design task stub
- `architect-feature`  Log an architecture task + decision stub
- `build-ui`           Log a UI build task stub
- `implement-feature`  Log an implementation task + decision + risk stub
- `refine-ui`          Log a UI refinement task stub
- `ux-audit`           Log a UX audit task + risk stub
- `security-review`    Log a security review task + risk stub
- `kb-update`          Re-index UX/UI knowledgebase + update manifest
- `compress-context`   Log a context compression task stub
- `help`               Show help
- `version`            Show version

## Portability

To remove the system, delete `.agent-os/` and `memory/`. No other files are touched.

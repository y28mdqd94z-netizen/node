# Agent OS Update PRP

Goal: Update `.agent-os` in the current repo to the latest version from the source below, preserving repo-specific data.

Source (canonical):
`git@github.com:y28mdqd94z-netizen/study-tool.git`

Preconditions:
- You are in the target repo root.
- Repo contains `.agent-os` and `AGENTS.md`.
- `git` is available and SSH access to the source is configured.

Preserve list (default):
- `.agent-os/tokens`

Orchestrator requirement:
- Invoke Orchestrator at the start.
- Include routing notes and phase gate status in outputs.

Execution steps:
1. Read `.agent-os/system.md` and confirm Orchestrator requirement is met.
2. Create a task log: `./.agent-os/agent implement-feature --title "Update Agent OS"`.
3. Record current version from `.agent-os/agents.json` field `version`.
4. Create a backup: move `.agent-os` to `.agent-os._backup_<YYYYMMDDHHMM>`.
5. Clone source to a temp dir (example: `/tmp/agent-os-update-<YYYYMMDDHHMM>`).
6. Copy the new `.agent-os` from the clone into the repo root.
7. Restore preserved paths from the backup into the new `.agent-os`.
8. Run `./.agent-os/agent kb-update`.
9. Run `./.agent-os/agent scan-repo`.
10. Summarize the update: old version, new version, paths touched, and any preserved items.

Validation:
- `./.agent-os/agent help` runs successfully.
- `memory/ux_kb_index.json` updated if the knowledgebase changed.
- `memory/repo_map.json` updated by `scan-repo`.

Rollback:
1. Remove the updated `.agent-os`.
2. Restore `.agent-os._backup_<YYYYMMDDHHMM>` to `.agent-os`.
3. Re-run `./.agent-os/agent scan-repo`.

Notes:
- If the SSH clone fails, ask the user for an HTTPS URL or a local path.
- If `.agent-os` does not exist, stop and ask for confirmation before proceeding.

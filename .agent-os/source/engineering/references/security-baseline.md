# Security Baseline (Short-Form)

Rules:
- Validate inputs at the boundary.
- Never expose secrets client-side.
- Use least privilege for auth and data access.
- Log safely (no PII or secrets).

Checks:
- AuthZ is enforced server-side.
- Rate limits on sensitive endpoints.

Deeper reference:
- `.agent-os/lib/engineering-knowledgebase/06_security/security-best-practices.yaml`
- `.agent-os/lib/engineering-knowledgebase/06_security/auth-patterns.yaml`

# Performance Baseline (Short-Form)

Rules:
- Avoid premature optimization; measure first.
- Cache only where it reduces real bottlenecks.
- Prefer async/batching for heavy operations.

Checks:
- No N+1 queries in new code paths.
- Long operations moved to background jobs.

Deeper reference:
- `.agent-os/lib/engineering-knowledgebase/09_system-quality/performance.yaml`

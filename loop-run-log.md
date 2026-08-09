# Loop Run Log

| Run | Job | Stage | Decision | Reason | Attempts | QA | Timestamp |
|---|---|---|---|---|---:|---:|---|
| bootstrap-v1 | n/a | initialized | continue | Loop Engineering primitives installed | 0 | n/a | 2026-08-09 |
| durable-queue-smoke | vj_b8d4b7e1160d4be3a3e36e33e78c2910 | qa_passed | continue | Supabase enqueue → atomic claim → worker report passed | 1 | 91 | 2026-08-09 |

## Runtime now implemented

- Durable Supabase queue: `public.video_os_jobs`.
- RPC-only access; direct anon/authenticated table access revoked.
- Per-job access token for safe status lookup.
- Atomic worker lease with `FOR UPDATE SKIP LOCKED`.
- 15-minute worker lock and retry budget.
- Circuit breaker routes exhausted jobs to `needs_review`.
- Deterministic Viral Score fallback before render.
- Local worker bridge performs ffprobe QA before reporting success.

## Logging rule
Every automated retry, gate rejection, human escalation, publish decision, and learned result must be recorded by the runtime job store. This Markdown file remains the rollout ledger and audit reference; it is not the production database.

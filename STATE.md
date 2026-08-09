# Loop State

This file defines the durable state contract. Runtime state must ultimately live in durable storage; this document is the source-of-truth schema until the database-backed job store lands.

## Current rollout
- Phase: Loop Engineering v1
- Autopublish: OFF
- Render worker: DHP Video Studio local/remote
- Cloud controller: Affiliate Content Factory / Vercel
- Persistent database job store: TODO next

## Job contract
```json
{
  "id": "job_xxx",
  "stage": "scripted",
  "sourceApp": "affiliate-content-factory",
  "niche": "",
  "keyword": "",
  "viralScore": null,
  "renderAttempts": 0,
  "assetRegenerations": 0,
  "qaScore": null,
  "platforms": [],
  "createdAt": "",
  "updatedAt": "",
  "lastError": null
}
```

## Allowed stages
`discovered`, `scored`, `selected`, `scripted`, `directed`, `assets_ready`, `rendering`, `qa_failed`, `qa_passed`, `scheduled`, `published`, `measured`, `learned`, `needs_review`.

## Invariant
Every transition must be explicit and auditable. No agent may silently skip a gate or reset retry counters.

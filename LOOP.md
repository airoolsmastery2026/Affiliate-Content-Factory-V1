# Autonomous Video Loop v1

## Goal
Turn niche/content discovery into a controlled video-production loop that can run repeatedly without losing state, exceeding budget, or publishing unverified output.

## State machine
DISCOVERED → SCORED → SELECTED → SCRIPTED → DIRECTED → ASSETS_READY → RENDERING → QA_PASSED → SCHEDULED → PUBLISHED → MEASURED → LEARNED

Failure paths:
- QA failure → QA_FAILED → retry within budget
- Retry budget exhausted → NEEDS_REVIEW
- Viral score below threshold → stay SCRIPTED; do not render

## Loop responsibilities
1. Market loop: discover, score, rank.
2. Content loop: select, write hook/script/CTA, assign viral score.
3. Production loop: direct scenes, prepare assets, voice, render.
4. QA loop: independent verification; director cannot self-approve.
5. Publish loop: package, schedule, publish, verify.
6. Learning loop: ingest platform metrics and update future scoring.

## Gates
- Title required.
- Script must contain at least 50 characters before handoff.
- At least one target platform required.
- Viral score, when supplied, must be >= 65 before render.
- Maximum 3 render attempts per job.
- QA score must be >= 80 before publish.

## Human gate
Autopublish remains disabled until QA + publisher + analytics are production-tested. Jobs that exhaust retry budget move to `needs_review`.

## Runtime principle
Cloud controller owns orchestration and durable job state. Local/remote Video Studio workers perform TTS/FFmpeg/render. A worker must never infer missing business state from chat history.

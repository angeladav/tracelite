# Future Improvements

Use this file to track production-hardening ideas and performance improvements worth implementing later.

## How to Add a New Improvement

Copy this template for each new item:

```md
## <Short improvement title>

### Potential slowdown/problem
- <What can go wrong or get slower>
- <How/when it shows up>

### Where to find it
- File(s): `<path/to/file>`
- Function(s)/query(ies): `<symbol or SQL section>`
- Trigger path: `<cron/job/request path>`

### Suggestions to improve/fix
- <Option 1>
- <Option 2>
- <Preferred option + why>

### Validation plan
- <How to measure before/after>
- <Expected result>

### Notes
- Status: `todo | in progress | done`
- Priority: `low | medium | high`
- Owner: `<name>`
- Date added: `<YYYY-MM-DD>`
```

---

## Aggregation write path: delete+createMany can become expensive

### Potential slowdown/problem
- Current aggregation writes are `deleteMany(period, periodStart)` followed by `createMany(...)` for the whole bucket.
- This rewrites all rows in the bucket each rerun, even unchanged rows, which increases write amplification and index churn as data cardinality grows.
- In high-cardinality buckets (many org/apiKey/endpoint combinations), this can increase lock time and total worker runtime.

### Where to find it
- File(s): `services/worker/src/aggregation/aggregation.service.ts`
- Function(s)/query(ies): `aggregateBucketOrgRollup()`
- Trigger path: minute/hour/day cron aggregation jobs in the same service.

### Suggestions to improve/fix
- Move from delete+reinsert to a single bulk upsert SQL statement:
  - `INSERT ... ON CONFLICT (...) DO UPDATE ...`
- Ensure conflict keys handle nullable dimensions safely:
  - Prefer Postgres 15 `UNIQUE NULLS NOT DISTINCT` on `(organizationId, apiKeyId, endpoint, period, periodStart)`, or
  - Introduce normalized non-null rollup key columns.
- Keep `GROUPING SETS` for computing org/org+apiKey/org+endpoint rows in one read query.

### Validation plan
- Capture baseline metrics:
  - rows processed per run
  - aggregation job duration
  - DB write latency/CPU during aggregation windows
- Compare against bulk-upsert implementation under similar data volume.
- Expected result: lower total write cost and shorter aggregation runtime, especially at larger row counts.

### Notes
- Status: `todo`
- Priority: `medium`
- Owner: `<unassigned>`
- Date added: `2026-04-13`

---

## Nullable unique key semantics can allow duplicate rollups

### Potential slowdown/problem
- The logical identity for rollup rows is `(organizationId, apiKeyId, endpoint, period, periodStart)`.
- When nullable dimensions are part of uniqueness, standard unique behavior can treat `NULL` values as distinct, which can allow duplicate org-level or endpoint-level rollup rows in some write patterns.
- Duplicates can skew analytics outputs and increase storage/query cost over time.

### Where to find it
- File(s): `packages/db/prisma/schema.prisma`, `services/worker/src/aggregation/aggregation.service.ts`
- Function(s)/query(ies): `AggregatedMetric @@unique([organizationId, apiKeyId, endpoint, period, periodStart])`, `aggregateBucketOrgRollup()`
- Trigger path: any aggregation rerun/backfill/retry that writes the same logical bucket multiple times.

### Suggestions to improve/fix
- Add DB-level null-safe uniqueness:
  - Postgres 15+: unique index with `NULLS NOT DISTINCT` for the rollup identity columns.
- Alternative if DB/version constraints apply:
  - Add non-null normalized rollup dimensions (e.g., sentinel values or a `rollupLevel` + normalized keys) and enforce uniqueness on those columns.
- Keep application logic simple and rely on DB constraints for final correctness guarantees.

### Validation plan
- Create fixtures that intentionally rerun identical aggregation windows for:
  - org-level (`apiKeyId = null`, `endpoint = null`)
  - org+apiKey (`endpoint = null`)
  - org+endpoint (`apiKeyId = null`)
- Assert row counts remain exactly one per logical identity after repeated runs.
- Expected result: duplicates are impossible at the database constraint layer.

### Notes
- Status: `done`
- Priority: `high`
- Owner: `<unassigned>`
- Date added: `2026-04-13`

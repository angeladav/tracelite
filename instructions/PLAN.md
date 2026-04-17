# TraceLite — Day-by-Day Build Plan

> Based on the full project instructions. ~1–2 hours per day.
> Each day produces something working and testable.

---

## Day 1 — Infrastructure verified & migrated
**Phase 1 complete**

- [ ] Run `docker compose up -d` (Postgres, Redis, LocalStack)
- [ ] Copy `.env.example` → `.env`, fill in `JWT_SECRET`
- [ ] Run `npm run db:migrate` to apply the full schema
- [ ] Confirm `curl http://localhost:3000/health` returns `{ "status": "ok", "db": "connected" }`

> ✅ Checkpoint: database is live and API connects to it.

---

## Day 2 — Auth (signup + login + JWT)
**Phase 2a**

- [ ] Install: `@nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs`
- [ ] Install types: `@types/bcryptjs @types/passport-jwt`
- [ ] Create `src/auth/` module with:
  - `POST /v1/auth/signup` — hash password, create User
  - `POST /v1/auth/login` — verify password, return JWT
  - `JwtStrategy` + `JwtAuthGuard`
- [ ] Wire `AuthModule` into `AppModule`

```bash
# Verify
curl -X POST localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

curl -X POST localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
# Should return { "access_token": "..." }
```

---

## Day 3 — Organizations + API Keys
**Phase 2b**

- [ ] Create `src/organizations/` module:
  - `POST /v1/organizations` — create org (JWT protected)
  - `GET /v1/organizations` — list user's orgs
- [ ] Create `src/api-keys/` module:
  - `POST /v1/organizations/:orgId/api-keys` — generate key (`tl_live_<32hex>`)
  - `GET /v1/organizations/:orgId/api-keys` — list keys
  - `DELETE /v1/organizations/:orgId/api-keys/:id` — revoke key
- [ ] Add global `ValidationPipe` and `helmet` in `main.ts`
- [ ] Add global `ExceptionFilter` for consistent error shape

```bash
# Verify (use JWT from Day 2)
curl -X POST http://localhost:3000/v1/organizations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGU1ZDNmYS05ZTk5LTRiYzctYjk2Ny0yNmZmNGJkNDc3YTgiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3NzYwMjIwMTMsImV4cCI6MTc3NjYyNjgxM30.6imB6kuURxMct_g-NNQHeAw0JslaOvINBc3fHtoyESA" \
     -H "Content-Type: application/json" \
     --data-raw '{"name":"My Org","slug":"my-org"}'

curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGU1ZDNmYS05ZTk5LTRiYzctYjk2Ny0yNmZmNGJkNDc3YTgiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3NzYwMjIwMTMsImV4cCI6MTc3NjYyNjgxM30.6imB6kuURxMct_g-NNQHeAw0JslaOvINBc3fHtoyESA" \
-H "Content-Type: application/json" \
  -X POST localhost:3000/v1/organizations/7da45ce4-2b72-4a3d-86ce-6f1a529d3436/api-keys \
  -d '{"name":"prod-key"}'
# Should return key starting with tl_live_
tl_live_5071b4b8ab6348bd26c0f3f973286a13
```

npx prisma studio --schema=packages/db/prisma/schema.prisma

---

## Day 4 — Tracking endpoint + API key guard
**Phase 3a**

- [ ] Create `src/tracking/` module with `POST /v1/track`
- [ ] Create `ApiKeyGuard` — reads `X-API-Key` header, validates against DB, attaches org to request
- [ ] Use `TrackEventDto` from `@tracelite/common` for validation
- [ ] For now: write `RequestLog` directly to DB (queue comes Day 5)
- [ ] Return `202 Accepted` with `{ "status": "accepted", "eventId": "..." }`

```bash
# Verify
curl -X POST localhost:3000/v1/track \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGU1ZDNmYS05ZTk5LTRiYzctYjk2Ny0yNmZmNGJkNDc3YTgiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3NzYwMjIwMTMsImV4cCI6MTc3NjYyNjgxM30.6imB6kuURxMct_g-NNQHeAw0JslaOvINBc3fHtoyESA" \
  -H "X-API-Key: tl_live_5071b4b8ab6348bd26c0f3f973286a13" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/users","statusCode":200,"latencyMs":42, "organizationId":"7da45ce4-2b72-4a3d-86ce-6f1a529d3436"}'
# Should return 202
```

---

## Day 5 — Queue (Redis + QueueService)
**Phase 3b**

- [ ] Install: `ioredis bullmq @nestjs/bullmq`
- [ ] Create `src/queue/` module with `QueueService`:
  - `enqueue(event)` → pushes to Redis Stream (local) or SQS (prod) based on `QUEUE_DRIVER` env
  - Fallback: if queue fails, push to `tracelite:fallback:events` Redis list
  - Final fallback: write directly to DB
- [ ] Update `TrackingService` to call `QueueService.enqueue()` instead of writing to DB directly
- [ ] Add rate limiting with `@nestjs/throttler` backed by Redis (per plan tier)

> ✅ Checkpoint: `/v1/track` returns 202 and event is visible in Redis.

---

## Day 6 — Worker service (consumer + persistence)
**Phase 4**

- [ ] Scaffold `services/worker` as a new NestJS app (copy `services/api` structure)
- [ ] Add `worker` to root `package.json` workspaces (update `npm run dev` to support both)
- [ ] Create `src/consumer/` module — polls Redis Stream, processes events:
  - Idempotency check: skip if `idempotencyKey` already exists
  - Batch insert `RequestLog` rows (batch of 100 or every 1s)
  - Dead letter: after 3 retries, log and skip
- [ ] Periodically drain `tracelite:fallback:events` list
- [ ] Worker health endpoint on port 3001

```bash
# Verify
npx prisma studio --schema=packages/db/prisma/schema.prisma
# Should see RequestLog rows after sending tracking events
```

---

## Day 7 — Aggregation cron jobs
**Phase 5**

- [ ] Install: `@nestjs/schedule`
- [ ] Create `src/aggregation/` module in worker:
  - Every minute: upsert `AggregatedMetric` rows for `MINUTE` period
  - Every hour: upsert for `HOUR` period
  - Daily at midnight: upsert for `DAY` period
- [ ] Compute: `totalRequests`, `errorCount`, `avgLatencyMs`, `p95LatencyMs`, `p99LatencyMs`
- [ ] Use `@@unique` constraint for safe upserts (re-runnable without duplicates)
- [ ] Add retention cron (daily): delete `RequestLog` rows older than plan limit (FREE=7d, PRO=30d, ENTERPRISE=90d)

> ✅ Checkpoint: `AggregatedMetric` table fills with data after sending events.

---

## Day 8 — Analytics API
**Phase 6**

- [ ] Create `src/analytics/` module in API service
- [ ] `GET /v1/analytics/overview` — total requests, error rate, avg latency (last 24h), scoped to JWT user's org
- [ ] `GET /v1/analytics/requests` — paginated `RequestLog` with filters (endpoint, status, date range)
- [ ] `GET /v1/analytics/endpoints` — per-endpoint breakdown, top 10 by volume
- [ ] `GET /v1/analytics/timeseries` — time-bucketed chart data (query params: `period`, `from`, `to`)
- [ ] Add Redis caching (60s TTL) for overview and timeseries responses

```bash
# Verify
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGU1ZDNmYS05ZTk5LTRiYzctYjk2Ny0yNmZmNGJkNDc3YTgiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3NzYwMjIwMTMsImV4cCI6MTc3NjYyNjgxM30.6imB6kuURxMct_g-NNQHeAw0JslaOvINBc3fHtoyESA" localhost:3000/v1/analytics/overview?organizationId=7da45ce4-2b72-4a3d-86ce-6f1a529d3436 \

curl -i \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGU1ZDNmYS05ZTk5LTRiYzctYjk2Ny0yNmZmNGJkNDc3YTgiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3NzYwMjIwMTMsImV4cCI6MTc3NjYyNjgxM30.6imB6kuURxMct_g-NNQHeAw0JslaOvINBc3fHtoyESA" \
  "http://localhost:3000/v1/analytics/overview?organizationId=7da45ce4-2b72-4a3d-86ce-6f1a529d3436"

curl -H "Authorization: Bearer <jwt>" localhost:3000/v1/analytics/timeseries?period=HOUR
```

---

## Day 9 — Next.js dashboard scaffold + auth pages
**Phase 7a**

- [ ] Scaffold `dashboard/` with Next.js 14 + Tailwind + shadcn/ui
- [ ] Install: `recharts lucide-react`
- [ ] Set up dark theme CSS tokens (see color palette in project instructions)
- [ ] Build auth pages (login + signup) — centered card layout, no sidebar
- [ ] Create `dashboard/src/lib/api.ts` — API client that calls Next.js API routes (proxy to avoid CORS)
- [ ] Create Next.js API routes that proxy to `localhost:3000`

---

## Day 10 — Dashboard: Overview page
**Phase 7b**

- [ ] Build fixed sidebar layout (240px, responsive)
- [ ] Overview page:
  - 4 metric cards: Total Requests, Error Rate, Avg Latency, Active Keys
  - Area chart (Recharts) for request volume with 24h/7d/30d toggle
  - Top 5 endpoints list
  - Status code breakdown (2xx/4xx/5xx)
- [ ] Empty state for new users with curl snippet

---

## Day 11 — Dashboard: Requests + Endpoints pages
**Phase 7c**

- [ ] Requests Explorer page:
  - Filterable table (endpoint search, status filter, date range)
  - Expandable rows with full request detail
  - Pagination (25 per page)
  - Method + status badges (color-coded)
- [ ] Endpoints Breakdown page:
  - Sortable table with latency percentiles
  - Color-coded error rate and latency cells

---

## Day 12 — Dashboard: Settings page + polish
**Phase 7d**

- [ ] Settings page:
  - Org name, slug, plan display
  - API key list (masked `tl_live_****<last4>`)
  - Create key modal (shows full key once with copy button)
  - Revoke with confirmation dialog
- [ ] Responsive behavior (tablet/mobile)
- [ ] Empty states on all pages

> ✅ Checkpoint: Full end-to-end flow works in browser.

---

## Day 13 — Dockerfiles
**Phase 9**

- [ ] `services/api/Dockerfile` — multi-stage build (build → production)
- [ ] `services/worker/Dockerfile` — multi-stage build
- [ ] `dashboard/Dockerfile` (optional, since dashboard deploys to Vercel)
- [ ] Update `docker-compose.yml` to include `api` and `worker` services
- [ ] Verify full stack starts with `docker compose up`

---

## Day 14 — Terraform: Core AWS infra
**Phase 10a**

- [ ] Set up AWS CLI and Terraform
- [ ] Create `terraform/` directory
- [ ] Write `main.tf` — AWS provider, S3 backend for state
- [ ] Write `ecr.tf` — two ECR repos (api, worker)
- [ ] Write `variables.tf` + `environments/dev.tfvars`
- [ ] `terraform init && terraform plan`
- [ ] Push Docker images to ECR

---

## Day 15 — Terraform: Database, Redis, SQS
**Phase 10b**

- [ ] `rds.tf` — PostgreSQL RDS (db.t3.micro), VPC, subnet group
- [ ] `elasticache.tf` — Redis cluster (cache.t3.micro)
- [ ] `sqs.tf` — main queue + dead letter queue
- [ ] `terraform apply` to create resources
- [ ] Run `prisma migrate deploy` against RDS

---

## Day 16 — Terraform: ECS Fargate + API Gateway
**Phase 10c**

- [ ] `ecs.tf` — Fargate cluster, task definitions for api and worker, service definitions
- [ ] `api-gateway.tf` — API Gateway in front of ECS (rate limiting at edge)
- [ ] `outputs.tf` — API URL, RDS endpoint, Redis endpoint
- [ ] Deploy both services to ECS
- [ ] Verify `curl https://api.tracelite.dev/health`

---

## Day 17 — Deploy dashboard + end-to-end test
**Final phase**

- [ ] Deploy `dashboard/` to Vercel, set env vars pointing to production API
- [ ] Full smoke test:
  1. Sign up → login → create org → create API key
  2. Send tracking event to production API
  3. Verify event appears in dashboard
  4. Check aggregated metrics populate
- [ ] Review deployment checklist from project instructions (HTTPS, CORS, secrets in Secrets Manager)

> 🎉 TraceLite is live.

---

## Reference

| Phase | Days | Deliverable |
|---|---|---|
| 1 — Foundation | 1 | Docker + DB running |
| 2 — Auth + Orgs + Keys | 2–3 | Users can sign up and generate keys |
| 3 — Tracking + Queue | 4–5 | Events are accepted and queued |
| 4 — Worker | 6 | Events persisted to DB |
| 5 — Aggregation | 7 | Metrics pre-computed |
| 6 — Analytics API | 8 | Dashboard data endpoints ready |
| 7 — Dashboard | 9–12 | Visual UI working end-to-end |
| 9 — Docker | 13 | Services containerised |
| 10 — AWS/Terraform | 14–16 | Infrastructure as code, deployed |
| Final | 17 | Production live, smoke tested |

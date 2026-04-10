# TraceLite — API Observability Platform

## Complete Project Instructions & Context

> **What this document is:** A self-contained blueprint for building TraceLite, a lightweight SaaS that tracks API usage and provides analytics. Any developer (or AI agent) reading this should have full context to implement any phase of the project, understand every architectural decision, and know how all the pieces connect.

---

## 1. Project Overview

### What TraceLite Does

TraceLite is an API observability platform for small developers and teams. Users sign up, create an organization, generate API keys, and embed a lightweight SDK or HTTP call into their applications. Every API request their app makes gets logged, processed asynchronously, and visualized in a dashboard.

**Core user flow:**

```
Developer signs up → Creates org → Generates API key → Instruments their app
→ Their app sends tracking events to TraceLite → TraceLite queues & processes events
→ Developer views traffic, errors, and latency in a dashboard
```

### Why This Project Exists

- Learn containers, AWS, cloud infrastructure, and backend system design
- Build a real, multi-service distributed system (not a CRUD app)
- Deploy a publicly accessible SaaS product with real users
- Demonstrate production engineering skills (resume project)

### Design Philosophy

- **Backend-focused** — frontend is minimal, system design is the star
- **Iterative** — ship a working system early, improve later
- **No overengineering** — every service and tool earns its place
- **Production patterns** — rate limiting, retries, idempotency, graceful degradation

---

## 2. Architecture

### System Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Developer   │──────▶│   API Service     │──────▶│  SQS Queue  │
│  (SDK/HTTP)  │       │   (NestJS)        │       │             │
└─────────────┘       └──────────────────┘       └──────┬──────┘
                             │                           │
                             │ auth, rate limit,         │ async consume
                             │ validate, enqueue         │
                             ▼                           ▼
                      ┌──────────────┐          ┌──────────────┐
                      │    Redis     │          │   Worker      │
                      │  - rate limit│          │   (NestJS)    │
                      │  - cache     │          │  - process    │
                      │  - fallback  │          │  - aggregate  │
                      └──────────────┘          └──────┬───────┘
                                                       │
                                                       ▼
                                                ┌──────────────┐
                      ┌──────────────┐          │  PostgreSQL   │
                      │  Dashboard   │◀─────────│  (RDS)        │
                      │  (Next.js)   │  via API │              │
                      └──────────────┘          └──────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Monorepo** | npm workspaces | Shared types, single install, atomic changes across services |
| **API framework** | NestJS | DI, guards, interceptors, modules — all needed for multi-tenant SaaS |
| **ORM** | Prisma | Type-safe queries, migrations, shared db package across services |
| **Queue** | AWS SQS (prod), Redis Streams (local) | Decouples ingestion from processing; Redis locally avoids AWS dependency |
| **Cache + Rate Limit** | Redis | Already in stack, proven for both use cases |
| **Database** | PostgreSQL (RDS) | Relational data model, partitioning support, TimescaleDB extension path |
| **Dashboard** | Next.js on Vercel | SSR, API routes (proxy = no CORS), edge middleware for auth |
| **IaC** | Terraform | Reproducible infra, version-controlled, resume-impressive |
| **Container orchestration** | AWS ECS Fargate | Serverless containers, no EC2 management |

---

## 3. Tech Stack (Complete)

### Runtime & Language

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime for all backend services |
| TypeScript | 5.x | Type safety across the entire monorepo |

### Backend

| Tool | Purpose |
|---|---|
| NestJS 10 | API + Worker framework (modules, DI, guards, interceptors) |
| Prisma 5 | ORM, migrations, type-safe database access |
| `@nestjs/bull` + BullMQ | Local job processing (wraps Redis Streams) |
| `@aws-sdk/client-sqs` | SQS producer (API) and consumer (Worker) in production |
| `class-validator` + `class-transformer` | Request DTO validation and sanitization |
| `@nestjs/passport` + `passport-jwt` | JWT authentication for user accounts |
| `@nestjs/throttler` | Rate limiting (backed by Redis store) |
| `helmet` | HTTP security headers |
| `uuid` | API key generation |
| `bcrypt` | Password hashing |
| `ioredis` | Redis client for caching, rate limiting, fallback buffer |

### Infrastructure

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local development (Postgres, Redis, LocalStack) |
| AWS ECS Fargate | Container orchestration (production) |
| AWS ECR | Container image registry |
| AWS RDS (PostgreSQL 15) | Production database |
| AWS ElastiCache (Redis 7) | Production cache + rate limiting |
| AWS SQS | Production event queue |
| AWS CloudWatch | Logging and monitoring |
| AWS API Gateway | Edge rate limiting, API key validation, WAF integration |
| Terraform | Infrastructure as Code for all AWS resources |

### Frontend

| Tool | Purpose |
|---|---|
| Next.js 14 | Dashboard (SSR, API routes as backend proxy) |
| Tailwind CSS | Styling |
| Recharts | Charting library for analytics visualizations |
| Vercel | Dashboard hosting |

### Development Tools

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Linting and formatting |
| Jest | Unit + integration testing |
| Supertest | HTTP endpoint testing |
| LocalStack | Local AWS service emulation (SQS) |

---

## 4. Monorepo Structure

```
tracelite/
├── package.json                    # Root: workspaces config, global scripts
├── tsconfig.base.json              # Shared TS compiler options
├── docker-compose.yml              # Local dev: Postgres + Redis + LocalStack
├── .env                            # Root env vars (DATABASE_URL, REDIS_URL, etc.)
├── .env.example                    # Template for env vars (committed to git)
├── .gitignore
├── README.md
├── terraform/                      # Infrastructure as Code
│   ├── main.tf                     #   AWS provider, backend config
│   ├── ecs.tf                      #   ECS Fargate services
│   ├── rds.tf                      #   PostgreSQL RDS instance
│   ├── sqs.tf                      #   SQS queues
│   ├── elasticache.tf              #   Redis cluster
│   ├── ecr.tf                      #   Container registries
│   ├── api-gateway.tf              #   API Gateway config
│   ├── variables.tf                #   Input variables
│   ├── outputs.tf                  #   Output values
│   └── environments/
│       ├── dev.tfvars
│       └── prod.tfvars
├── packages/
│   ├── db/                         # Shared Prisma database package
│   │   ├── package.json            #   name: @tracelite/db
│   │   ├── prisma/
│   │   │   ├── schema.prisma       #   Full data model
│   │   │   └── migrations/         #   Migration history
│   │   └── src/
│   │       ├── index.ts            #   Public exports
│   │       └── prisma.service.ts   #   NestJS PrismaService
│   └── common/                     # Shared types, DTOs, validation, constants
│       ├── package.json            #   name: @tracelite/common
│       └── src/
│           ├── index.ts
│           ├── dto/                #   Shared DTOs (CreateEventDto, etc.)
│           ├── types/              #   Shared TypeScript interfaces
│           ├── constants/          #   API versions, limits, error codes
│           └── validation/         #   Shared validation rules
├── services/
│   ├── api/                        # NestJS API service
│   │   ├── package.json
│   │   ├── tsconfig.json           #   Path aliases to @tracelite/*
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── main.ts             #   Bootstrap, global pipes, helmet
│   │       ├── app.module.ts       #   Root module
│   │       ├── auth/               #   JWT auth, signup, login
│   │       ├── api-keys/           #   API key CRUD + validation guard
│   │       ├── tracking/           #   POST /v1/track — the core endpoint
│   │       ├── analytics/          #   GET /v1/analytics/* — dashboard queries
│   │       ├── organizations/      #   Org CRUD, multi-tenant scoping
│   │       ├── health/             #   GET /health — liveness + DB check
│   │       ├── common/
│   │       │   ├── guards/         #   ApiKeyGuard, JwtAuthGuard, RateLimitGuard
│   │       │   ├── interceptors/   #   LoggingInterceptor, TimeoutInterceptor
│   │       │   ├── filters/        #   GlobalExceptionFilter
│   │       │   └── decorators/     #   @CurrentUser, @ApiKeyOrg
│   │       └── queue/              #   SQS/Redis producer service
│   └── worker/                     # NestJS Worker service
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── src/
│           ├── main.ts
│           ├── worker.module.ts
│           ├── consumer/           #   SQS/Redis consumer, event processing
│           ├── aggregation/        #   Cron-based metrics computation
│           └── health/             #   Worker health check
└── dashboard/                      # Next.js frontend
    ├── package.json
    ├── next.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx            #   Landing / login
        │   ├── dashboard/          #   Analytics views
        │   └── settings/           #   API keys, org management
        ├── components/
        └── lib/
            └── api.ts              #   API client (calls Next.js API routes)
```

---

## 5. Database Schema

### Full Prisma Schema

This goes in `packages/db/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ──────────────────────────────────────────
// Multi-tenant: Users & Organizations
// ──────────────────────────────────────────

model User {
  id             String         @id @default(uuid())
  email          String         @unique
  passwordHash   String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  memberships    Membership[]
}

model Organization {
  id          String       @id @default(uuid())
  name        String
  slug        String       @unique
  plan        PlanType     @default(FREE)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  memberships Membership[]
  apiKeys     ApiKey[]
}

model Membership {
  id             String       @id @default(uuid())
  role           MemberRole   @default(MEMBER)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  createdAt      DateTime     @default(now())

  @@unique([userId, organizationId])
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum PlanType {
  FREE
  PRO
  ENTERPRISE
}

// ──────────────────────────────────────────
// API Keys
// ──────────────────────────────────────────

model ApiKey {
  id             String       @id @default(uuid())
  key            String       @unique
  name           String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  revoked        Boolean      @default(false)
  createdAt      DateTime     @default(now())

  requestLogs    RequestLog[]

  @@index([key])
  @@index([organizationId])
}

// ──────────────────────────────────────────
// Request Tracking (raw events)
// ──────────────────────────────────────────

model RequestLog {
  id            String   @id @default(uuid())
  apiKey        ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)
  apiKeyId      String
  method        String
  endpoint      String
  statusCode    Int
  latencyMs     Int
  userAgent     String?
  ipAddress     String?
  metadata      Json?
  idempotencyKey String?  @unique
  timestamp     DateTime @default(now())

  @@index([apiKeyId, timestamp])
  @@index([timestamp])
  @@index([apiKeyId, endpoint, timestamp])
}

// ──────────────────────────────────────────
// Aggregated Metrics (computed by worker)
// ──────────────────────────────────────────

model AggregatedMetric {
  id             String          @id @default(uuid())
  organizationId String
  apiKeyId       String?
  endpoint       String?
  period         AggPeriod
  periodStart    DateTime
  totalRequests  Int             @default(0)
  errorCount     Int             @default(0)
  avgLatencyMs   Float           @default(0)
  p95LatencyMs   Float           @default(0)
  p99LatencyMs   Float           @default(0)
  createdAt      DateTime        @default(now())

  @@unique([organizationId, apiKeyId, endpoint, period, periodStart])
  @@index([organizationId, periodStart])
  @@index([organizationId, period, periodStart])
}

enum AggPeriod {
  MINUTE
  HOUR
  DAY
}
```

### Schema Design Rationale

| Decision | Why |
|---|---|
| `apiKeyId` directly on `RequestLog` | Avoids joining through Organization for every query — the primary access pattern is "all logs for this key in this time range" |
| `idempotencyKey` on `RequestLog` | Prevents duplicate events when SQS retries delivery |
| Composite index `(apiKeyId, timestamp)` | Optimizes the most common query: "show me recent requests for this key" |
| Composite index `(apiKeyId, endpoint, timestamp)` | Optimizes per-endpoint drill-down queries |
| `AggregatedMetric` as separate table | Pre-computed rollups — dashboard reads this instead of scanning raw logs |
| `@@unique` constraint on AggregatedMetric | Ensures upsert-safe aggregation (worker can re-run without duplicates) |
| `Membership` join table | Supports multi-user orgs with role-based access |

### Data Retention Strategy

Raw `RequestLog` data grows fast. Implement a retention policy:

- **FREE plan**: 7 days retention
- **PRO plan**: 30 days retention
- **ENTERPRISE plan**: 90 days retention
- **Worker cron job**: Runs daily, deletes expired `RequestLog` rows based on org plan
- **Aggregated metrics**: Kept indefinitely (small footprint)

---

## 6. API Design

### Base URL

```
Production: https://api.tracelite.dev/v1
Local:      http://localhost:3000/v1
```

**All endpoints are versioned under `/v1`** — this is non-negotiable. Adding versioning later is painful.

### Public Endpoints (no auth)

```
POST   /v1/auth/signup          # Create account
POST   /v1/auth/login           # Get JWT token
GET    /health                   # Liveness check
```

### Protected Endpoints (JWT auth — dashboard)

```
GET    /v1/organizations                    # List user's orgs
POST   /v1/organizations                    # Create org
GET    /v1/organizations/:orgId/api-keys    # List API keys
POST   /v1/organizations/:orgId/api-keys    # Create API key
DELETE /v1/organizations/:orgId/api-keys/:id # Revoke API key
GET    /v1/analytics/overview               # Dashboard overview
GET    /v1/analytics/requests               # Request log with pagination
GET    /v1/analytics/endpoints              # Per-endpoint breakdown
GET    /v1/analytics/timeseries             # Time-bucketed chart data
```

### Tracking Endpoint (API key auth — external clients)

```
POST   /v1/track                # Log an API request event
```

**Request body:**
```json
{
  "method": "GET",
  "endpoint": "/api/users",
  "statusCode": 200,
  "latencyMs": 45,
  "metadata": { "region": "us-east-1" },
  "idempotencyKey": "req_abc123"          // optional, prevents duplicates
}
```

**Headers:**
```
X-API-Key: tl_live_xxxxxxxxxxxx
Content-Type: application/json
```

**Response (202 Accepted):**
```json
{ "status": "accepted", "eventId": "evt_xxxxxx" }
```

The tracking endpoint returns `202` (not `200`) because processing is async — the event is queued, not yet persisted.

### Rate Limiting

| Tier | Tracking endpoint | Dashboard API |
|---|---|---|
| FREE | 100 req/min | 30 req/min |
| PRO | 1,000 req/min | 100 req/min |
| ENTERPRISE | 10,000 req/min | 500 req/min |

Rate limit state stored in Redis. Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699900000
```

---

## 7. Event Pipeline (Detailed)

### Flow

```
Client POST /v1/track
  → ApiKeyGuard validates key, resolves org
  → RateLimitGuard checks Redis counter
  → ValidationPipe validates DTO
  → TrackingController accepts event
  → QueueService.enqueue(event) → SQS (prod) / Redis Stream (local)
  → Return 202 Accepted

Worker polls queue
  → Deserialize event
  → Check idempotencyKey (skip if duplicate)
  → Insert into RequestLog
  → Ack message
```

### Graceful Degradation

If the queue (SQS/Redis) is unreachable:

1. **Fallback to Redis list** (if SQS is down but Redis is up): Push to `tracelite:fallback:events` list
2. **Fallback to synchronous write** (if both are down): Write directly to PostgreSQL (slower but data isn't lost)
3. **Log the degradation** to CloudWatch with alert

The worker periodically checks the Redis fallback list and reprocesses those events.

### Idempotency

- If the client provides an `idempotencyKey`, the worker checks for an existing `RequestLog` with that key before inserting
- SQS has at-least-once delivery — without idempotency, retries create duplicates
- The `@@unique` constraint on `idempotencyKey` is the final safety net (insert fails gracefully)

---

## 8. Implementation Phases

Build the project in this order. Each phase produces a working, testable system.

---

### Phase 1: Foundation (Monorepo + Database + Docker)

**Goal:** Working monorepo with Prisma, Postgres, Redis, all running locally.

**What to build:**
1. Root `package.json` with workspaces: `["packages/*", "services/*"]`
2. `tsconfig.base.json` with shared compiler options (strict, ES2022, paths)
3. `packages/db` — Prisma schema (full schema from Section 5), PrismaService, exports
4. `packages/common` — shared DTOs, types, constants, validation rules
5. `docker-compose.yml` — Postgres 15, Redis 7, LocalStack (for SQS emulation)
6. `.env` + `.env.example`
7. Run `prisma migrate dev` to verify schema works

**Verify:** `docker compose up -d` starts all services. Prisma can connect and migrate.

**Key files:**
- `/package.json` — root workspaces config
- `/tsconfig.base.json` — shared TS config
- `/docker-compose.yml`
- `/packages/db/prisma/schema.prisma`
- `/packages/db/src/prisma.service.ts`
- `/packages/db/src/index.ts`
- `/packages/common/src/index.ts`
- `/packages/common/src/dto/track-event.dto.ts`
- `/packages/common/src/types/index.ts`
- `/packages/common/src/constants/index.ts`

---

### Phase 2: API Service — Auth + Org + API Keys

**Goal:** Users can sign up, log in, create orgs, and generate API keys.

**What to build:**
1. Scaffold NestJS API in `services/api` (or build on existing TraceLite scaffold)
2. Configure path aliases in `tsconfig.json` for `@tracelite/db` and `@tracelite/common`
3. `auth` module — signup, login, JWT strategy, JwtAuthGuard
4. `organizations` module — CRUD, scoped to authenticated user via Membership
5. `api-keys` module — generate, list, revoke. Key format: `tl_live_<random32hex>`
6. `health` module — `GET /health` returns DB connectivity status
7. Global exception filter, validation pipe, helmet middleware
8. Wire everything in `app.module.ts`

**Verify:**
```bash
curl -X POST localhost:3000/v1/auth/signup -d '{"email":"test@test.com","password":"test1234"}'
curl -X POST localhost:3000/v1/auth/login -d '{"email":"test@test.com","password":"test1234"}'
# Use JWT to create org and API key
curl -H "Authorization: Bearer <jwt>" -X POST localhost:3000/v1/organizations -d '{"name":"My Org","slug":"my-org"}'
curl -H "Authorization: Bearer <jwt>" -X POST localhost:3000/v1/organizations/<orgId>/api-keys -d '{"name":"prod-key"}'
```

---

### Phase 3: Tracking Endpoint + Queue

**Goal:** External clients can POST events via API key, events are queued.

**What to build:**
1. `tracking` module — `POST /v1/track` endpoint
2. `ApiKeyGuard` — validates `X-API-Key` header, resolves org, attaches to request
3. `QueueService` — abstraction over SQS (prod) and Redis Streams (local)
4. Rate limiting with `@nestjs/throttler` backed by Redis store
5. Request validation with `class-validator` (TrackEventDto from common package)
6. Return `202 Accepted` with event ID

**Verify:**
```bash
curl -X POST localhost:3000/v1/track \
  -H "X-API-Key: tl_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/users","statusCode":200,"latencyMs":42}'
# Should return 202
# Check Redis stream or SQS for queued message
```

---

### Phase 4: Worker Service

**Goal:** Events are consumed from the queue and persisted to PostgreSQL.

**What to build:**
1. Scaffold NestJS worker in `services/worker`
2. `consumer` module — polls SQS (prod) or Redis Stream (local), processes events
3. Idempotency check — skip if `idempotencyKey` already exists in RequestLog
4. Batch inserts — collect events for 1 second or 100 events, then bulk insert
5. Dead letter handling — failed events go to DLQ after 3 retries
6. Worker health endpoint on a different port (e.g., 3001)

**Verify:**
```bash
# Send tracking event via API
curl -X POST localhost:3000/v1/track -H "X-API-Key: tl_live_xxxx" -d '...'
# Check database for the persisted RequestLog
npx prisma studio --schema=packages/db/prisma/schema.prisma
```

---

### Phase 5: Aggregation System

**Goal:** Pre-computed metrics for fast dashboard queries.

**What to build:**
1. `aggregation` module in worker — cron-based computation
2. Runs every minute: compute MINUTE-level aggregations for last 2 minutes
3. Runs every hour: compute HOUR-level aggregations for last 2 hours
4. Runs every day at midnight: compute DAY-level aggregations for yesterday
5. Uses `@@unique` constraint for upsert-safe aggregation (re-runnable)
6. Computes: totalRequests, errorCount, avgLatencyMs, p95LatencyMs, p99LatencyMs

**Verify:** After sending multiple tracking events, check `AggregatedMetric` table for computed rollups.

---

### Phase 6: Analytics API

**Goal:** Dashboard can query pre-computed analytics.

**What to build:**
1. `analytics` module in API service
2. `GET /v1/analytics/overview` — total requests, error rate, avg latency (last 24h)
3. `GET /v1/analytics/requests` — paginated RequestLog with filters (endpoint, status, date range)
4. `GET /v1/analytics/endpoints` — per-endpoint breakdown (top 10 by volume)
5. `GET /v1/analytics/timeseries` — time-bucketed data for charts (query params: period, from, to)
6. All endpoints scoped to user's organization via JWT
7. Redis caching for overview and timeseries (TTL: 60 seconds)

**Verify:** All endpoints return correct data for the authenticated user's org.

---

### Phase 7: Dashboard (Next.js)

**Goal:** Visual analytics dashboard.

**What to build:**
1. Next.js app in `dashboard/` directory
2. Auth pages — login, signup (calls Next.js API routes → TraceLite API)
3. Dashboard layout — sidebar navigation, org selector
4. Overview page — key metrics cards (total requests, error rate, avg latency, uptime)
5. Traffic page — time-series chart (Recharts), filterable by endpoint and date range
6. Requests page — table of recent requests with search and filters
7. Settings page — API key management (create, revoke, copy)
8. API routes in Next.js proxy requests to TraceLite API (avoids CORS)

**Verify:** Dashboard renders real data. User can log in, see analytics, manage API keys.

---

### Phase 8: Data Retention + Cleanup

**Goal:** System doesn't grow unbounded.

**What to build:**
1. Cron job in worker: daily cleanup of expired `RequestLog` rows
2. Retention based on org plan (FREE=7d, PRO=30d, ENTERPRISE=90d)
3. Batch deletion (delete in chunks of 1000 to avoid long-running transactions)
4. Log deletion counts to CloudWatch

---

### Phase 9: Dockerize Services

**Goal:** Both services run as containers.

**What to build:**
1. `services/api/Dockerfile` — multi-stage build (build → production)
2. `services/worker/Dockerfile` — multi-stage build
3. Update `docker-compose.yml` to include api and worker services
4. Verify both services start and communicate with Postgres/Redis/LocalStack

**Dockerfile pattern (for both services):**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY packages/ packages/
COPY services/<service-name>/ services/<service-name>/
RUN npm ci --workspace=@tracelite/db --workspace=@tracelite/common --workspace=<service-name>
RUN npm run build --workspace=<service-name>

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/<service-name>/dist ./dist
COPY --from=build /app/packages/db/prisma ./prisma
CMD ["node", "dist/main.js"]
```

---

### Phase 10: Terraform + AWS Deployment

**Goal:** Entire infrastructure defined as code and deployed to AWS.

**What to build:**
1. `terraform/` directory with modules for each AWS resource
2. ECS Fargate cluster with API and Worker task definitions
3. RDS PostgreSQL instance (db.t3.micro for dev)
4. ElastiCache Redis cluster
5. SQS queue + dead letter queue
6. ECR repositories for API and Worker images
7. API Gateway in front of ECS (rate limiting at edge)
8. CloudWatch log groups and alarms
9. VPC, subnets, security groups
10. Separate `dev.tfvars` and `prod.tfvars` for environments

**Verify:** `terraform plan` shows expected resources. `terraform apply` creates working infrastructure.

---

## 9. Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tracelite"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="generate-a-strong-random-string-here"
JWT_EXPIRATION="7d"

# Queue (local dev uses Redis, prod uses SQS)
QUEUE_DRIVER="redis"                        # "redis" | "sqs"
SQS_QUEUE_URL=""                            # Only needed when QUEUE_DRIVER=sqs
SQS_REGION="us-east-1"                      # Only needed when QUEUE_DRIVER=sqs

# Rate Limiting
RATE_LIMIT_TTL=60                           # Window in seconds
RATE_LIMIT_DEFAULT=100                      # Default requests per window

# Worker
AGGREGATION_CRON_MINUTE="*/1 * * * *"       # Every minute
AGGREGATION_CRON_HOUR="0 * * * *"           # Every hour
AGGREGATION_CRON_DAY="0 0 * * *"            # Every day at midnight
RETENTION_CRON="0 2 * * *"                  # Daily at 2am

# Environment
NODE_ENV="development"
PORT=3000
WORKER_PORT=3001
```

---

## 10. Docker Compose (Full — Local Development)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tracelite
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=sqs
      - DEFAULT_REGION=us-east-1
    volumes:
      - localstack_data:/var/lib/localstack

volumes:
  pgdata:
  localstack_data:
```

---

## 11. Key Patterns & Code Conventions

### API Key Format
```
tl_live_<32 hex characters>
tl_test_<32 hex characters>
```

Prefix tells you the environment. Generate with:
```ts
import { randomBytes } from 'crypto';
const key = `tl_live_${randomBytes(16).toString('hex')}`;
```

### Guard Execution Order
```
RateLimitGuard → ApiKeyGuard (or JwtAuthGuard) → ValidationPipe → Controller
```

### Error Response Format
All errors follow this shape:
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Retry after 60 seconds.",
  "retryAfter": 60
}
```

### Logging
Use NestJS built-in Logger:
```ts
private readonly logger = new Logger(TrackingService.name);
this.logger.log(`Event queued: ${eventId}`);
this.logger.warn(`Queue fallback activated`);
this.logger.error(`Failed to process event`, error.stack);
```

---

## 12. Testing Strategy

### Unit Tests
- Every service, guard, and interceptor gets unit tests
- Mock Prisma, Redis, and SQS in unit tests
- Framework: Jest (included with NestJS)

### Integration Tests
- Test full HTTP request → response cycles
- Use Supertest with a real test database (separate Postgres DB or testcontainers)
- Test API key validation, rate limiting, event tracking flow

### E2E Test (smoke test)
- Docker Compose up all services
- Sign up → login → create org → create API key → send tracking event → verify in DB → check analytics endpoint
- Run as CI pipeline step

---

## 13. Deployment Checklist

Before going live:

- [ ] All environment variables set in ECS task definitions
- [ ] Database migrated (`prisma migrate deploy`)
- [ ] Prisma client generated in Docker build
- [ ] Redis accessible from ECS tasks (security groups)
- [ ] SQS queue created with DLQ configured
- [ ] API Gateway configured with rate limiting and API key plan
- [ ] CloudWatch log groups created
- [ ] Health check endpoints responding
- [ ] HTTPS configured (ACM certificate + API Gateway)
- [ ] CORS configured for dashboard domain
- [ ] Secrets stored in AWS Secrets Manager (not env vars)

---

## 14. Dashboard UI Specification

### Design System

| Property | Value |
|---|---|
| **Theme** | Dark mode only |
| **Component library** | shadcn/ui (Tailwind-based) |
| **Charting** | Recharts |
| **Font** | Inter (headings + body) or Geist (modern alternative) |
| **Border radius** | 8px (cards, buttons, inputs) |
| **Color palette** | Dark gray background, subtle borders, accent color for primary actions |
| **Layout** | Fixed sidebar (240px) + scrollable main content area |

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0b` | Page background |
| `--bg-card` | `#141416` | Card/panel backgrounds |
| `--bg-hover` | `#1c1c1f` | Hover states, active nav items |
| `--border` | `#27272a` | Card borders, dividers |
| `--text-primary` | `#fafafa` | Headings, primary content |
| `--text-secondary` | `#a1a1aa` | Labels, descriptions, timestamps |
| `--accent` | `#3b82f6` | Primary buttons, active states, links (blue) |
| `--success` | `#22c55e` | Healthy status, 2xx codes |
| `--warning` | `#eab308` | Elevated error rates, 4xx codes |
| `--error` | `#ef4444` | Errors, 5xx codes, critical alerts |
| `--chart-1` | `#3b82f6` | Primary chart line (requests) |
| `--chart-2` | `#ef4444` | Secondary chart line (errors) |
| `--chart-3` | `#8b5cf6` | Tertiary chart line (latency) |

### Global Layout

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (240px, fixed)   │  Main Content (fluid)     │
│                          │                            │
│  [Logo: TraceLite]       │  ┌─ Page Header ─────────┐ │
│                          │  │ Page Title    [Actions]│ │
│  NAVIGATION              │  └───────────────────────┘ │
│  ● Overview              │                            │
│  ○ Requests              │  ┌─ Content Area ────────┐ │
│  ○ Endpoints             │  │                       │ │
│  ○ Settings              │  │  (page-specific)      │ │
│                          │  │                       │ │
│                          │  │                       │ │
│                          │  └───────────────────────┘ │
│  ─────────────           │                            │
│  [Org Selector ▾]        │                            │
│  user@email.com          │                            │
│  [Logout]                │                            │
└──────────────────────────────────────────────────────┘
```

### Sidebar
- **Width:** 240px, fixed position, full height
- **Background:** `--bg-card` with right border (`--border`)
- **Logo:** "TraceLite" text in `--text-primary`, 18px bold, top-left with small lightning bolt icon
- **Nav items:** Icon + label, 14px, `--text-secondary` default, `--text-primary` + `--bg-hover` background + left accent bar (3px `--accent`) when active
- **Nav icons:** Lucide icon set — LayoutDashboard, ListOrdered, BarChart3, Settings
- **Bottom section:** Org selector dropdown (shows org name, click to switch), user email in `--text-secondary`, logout link

### Page 1: Overview (Default/Home)

This is the first page users see after login. Provides a high-level snapshot of the last 24 hours.

**Layout:**
```
┌─ Metric Cards (4 across) ────────────────────────────┐
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│ │ Total Req  │ │ Error Rate │ │ Avg Latency│ │ Active Keys  │ │
│ │ 24,891     │ │ 2.4%       │ │ 127ms      │ │ 3            │ │
│ │ ↑ 12.3%    │ │ ↓ 0.8%    │ │ ↓ 15ms     │ │ — same       │ │
│ └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────┘

┌─ Request Volume (main chart) ────────────────────────┐
│  [24h] [7d] [30d]                     Requests ── Errors │
│                                                       │
│  ╭──────╮     ╭───╮                                   │
│  │      ╰─────╯   ╰──────────╮    ╭──                │
│  │                            ╰────╯                  │
│  ──────────────────────────────────────────────────   │
│  12am   4am   8am   12pm   4pm   8pm   12am          │
└──────────────────────────────────────────────────────┘

┌─ Top Endpoints ──────────────┐ ┌─ Status Breakdown ──────┐
│  /api/users        8,421 req │ │    ██████████ 2xx: 87%   │
│  /api/orders       4,102 req │ │    ██         4xx: 10%   │
│  /api/products     3,890 req │ │    █          5xx:  3%   │
│  /api/auth/login   2,340 req │ │                          │
│  /api/search       1,988 req │ │                          │
└──────────────────────────────┘ └──────────────────────────┘
```

**Metric Cards:**
- Background: `--bg-card`, 1px `--border`, 8px radius
- Title: `--text-secondary`, 12px uppercase tracking-wide
- Value: `--text-primary`, 28px bold
- Trend indicator: Small text below value. Green arrow up + percentage if positive trend is good (requests up = good). Red if bad (error rate up = bad). Gray dash if unchanged.

**Request Volume Chart:**
- Area chart with gradient fill under the line
- Primary line (`--chart-1`) for total requests
- Secondary line (`--chart-2`) for errors (optional toggle)
- Time range selector: pill buttons (24h, 7d, 30d) top-left of chart
- X-axis: time labels. Y-axis: request count
- Tooltip on hover: shows exact values for that time point

**Top Endpoints:**
- Simple ranked list, 5 items
- Endpoint path on left, request count on right
- Subtle horizontal bar behind each row showing relative volume

**Status Breakdown:**
- Horizontal stacked bar or donut chart
- 2xx (green), 4xx (yellow), 5xx (red)
- Percentages labeled

### Page 2: Requests Explorer

A searchable, filterable table of raw request logs.

**Layout:**
```
┌─ Filters Bar ────────────────────────────────────────┐
│ [Search endpoint...]  [Status ▾]  [Date Range ▾]  [Clear] │
└──────────────────────────────────────────────────────┘

┌─ Request Table ──────────────────────────────────────┐
│ Timestamp          Method  Endpoint       Status  Latency │
│ ──────────────────────────────────────────────────── │
│ Apr 5, 12:41:03    GET     /api/users     200     42ms    │
│ Apr 5, 12:41:02    POST    /api/orders    201     187ms   │
│ Apr 5, 12:40:58    GET     /api/search    500     2,104ms │
│ Apr 5, 12:40:55    GET     /api/users/1   404     12ms    │
│ ...                                                       │
│                                                           │
│              ◀ 1  2  3  ... 47  ▶    Showing 1-25 of 1,168 │
└──────────────────────────────────────────────────────┘

┌─ Expanded Row Detail ────────────────────────────────┐
│  Request ID:  req_a1b2c3d4                            │
│  API Key:     tl_live_****7f2a                        │
│  User Agent:  axios/1.6.0                             │
│  IP Address:  192.168.1.42                            │
│  Metadata:    { "region": "us-east-1" }               │
└──────────────────────────────────────────────────────┘
```

**Filters:**
- Search input: filters by endpoint path (debounced, 300ms)
- Status dropdown: All, 2xx, 3xx, 4xx, 5xx (multi-select)
- Date range: preset options (Last hour, Last 24h, Last 7d, Custom range)
- Clear button resets all filters

**Table:**
- Columns: Timestamp, Method, Endpoint, Status Code, Latency
- Status code: color-coded badge (green=2xx, yellow=4xx, red=5xx)
- Method: subtle badge (GET=blue, POST=green, PUT=yellow, DELETE=red)
- Rows are clickable — expand to show full detail below the row
- Sortable by clicking column headers (default: newest first)
- Pagination: 25 rows per page

### Page 3: Endpoints Breakdown

Per-endpoint analytics table with performance metrics.

**Layout:**
```
┌─ Time Range ─────────────────────────────────────────┐
│ [24h] [7d] [30d]                                      │
└──────────────────────────────────────────────────────┘

┌─ Endpoints Table ────────────────────────────────────┐
│ Endpoint          Requests  Error%  Avg    P95    P99 │
│ ──────────────────────────────────────────────────── │
│ /api/users        8,421     1.2%    45ms   120ms  340ms │
│ /api/orders       4,102     3.8%    187ms  450ms  1.2s  │
│ /api/products     3,890     0.5%    32ms   89ms   210ms │
│ /api/auth/login   2,340     8.1%    95ms   280ms  890ms │
│ /api/search       1,988     2.1%    210ms  800ms  2.4s  │
└──────────────────────────────────────────────────────┘
```

**Table:**
- Sortable by any column (default: highest request count)
- Error% cell: color gradient background (green at 0%, yellow at 5%, red at 10%+)
- Latency cells: color gradient (green < 100ms, yellow < 500ms, red > 500ms)
- Click row to see that endpoint's time-series chart (inline expand or modal)

### Page 4: Settings

API key management and organization settings.

**Layout:**
```
┌─ Organization ───────────────────────────────────────┐
│  Org Name:   My Startup                               │
│  Slug:       my-startup                               │
│  Plan:       FREE (upgrade →)                         │
│  Created:    Mar 15, 2026                              │
└──────────────────────────────────────────────────────┘

┌─ API Keys ───────────────────────────────────────────┐
│  [+ Create New Key]                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Production Key          tl_live_****7f2a          │ │
│  │ Created: Apr 1, 2026    Last used: 2 min ago      │ │
│  │                         [Copy] [Revoke]           │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Staging Key             tl_live_****a3b1          │ │
│  │ Created: Apr 2, 2026    Last used: 3 hours ago    │ │
│  │                         [Copy] [Revoke]           │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**API Key interactions:**
- "Create New Key" → modal with name input → shows full key ONCE (with copy button) → warn "you won't see this again"
- Keys display masked: `tl_live_****<last4>`
- Copy copies the masked version (full key only shown at creation)
- Revoke → confirmation dialog → marks key as revoked (shown with strikethrough + "Revoked" badge)

### Auth Pages (Login / Signup)

**Layout:** Centered card on dark background, no sidebar.

```
┌─────────────────────────────────────┐
│                                     │
│         ⚡ TraceLite                 │
│                                     │
│    ┌─ Login Card ─────────────┐     │
│    │  Email                   │     │
│    │  [________________]      │     │
│    │  Password                │     │
│    │  [________________]      │     │
│    │                          │     │
│    │  [  Log In  ]            │     │
│    │                          │     │
│    │  Don't have an account?  │     │
│    │  Sign up →               │     │
│    └──────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

- Card: `--bg-card`, 1px `--border`, max-width 400px, centered vertically and horizontally
- Inputs: dark input fields with subtle border, focus ring in `--accent`
- Button: `--accent` background, white text, full width
- Error states: red border on input + error message below

### Empty States

Every page needs an empty state for new users with no data:

- **Overview (no data):** Illustration or icon + "No data yet. Send your first tracking event to see analytics here." + code snippet showing `curl` command with their API key
- **Requests (no data):** "No requests recorded. Integrate TraceLite into your app to start tracking."
- **Endpoints (no data):** Same pattern
- **Settings (no API keys):** "Create your first API key to start tracking API requests." + prominent "Create Key" button

### Responsive Behavior

- **≥1024px:** Full sidebar + content layout
- **768–1023px:** Sidebar collapses to icon-only (48px wide), expands on hover
- **<768px:** Sidebar becomes bottom tab bar (4 icons), content full width
- Metric cards stack to 2x2 grid on tablet, single column on mobile
- Tables become horizontally scrollable on mobile

---

## 15. Future Enhancements (Post-MVP)

These are explicitly out of scope for the initial build but documented for future reference:

- **TimescaleDB** — Convert `RequestLog` to hypertable for massive performance gains
- **Webhooks** — Notify users when error rate exceeds threshold
- **SDK packages** — npm/pip packages that auto-instrument API calls
- **Team management** — Invite users to organizations, role-based permissions
- **Billing integration** — Stripe for PRO/ENTERPRISE plans
- **Export** — CSV/JSON export of request logs
- **Real-time** — WebSocket stream of incoming events in dashboard
- **Multi-region** — Deploy to multiple AWS regions

---

## Glossary

| Term | Meaning |
|---|---|
| **Tracking event** | A single API request log sent by the client to `POST /v1/track` |
| **API key** | Authentication token for the tracking endpoint (not JWT) |
| **Organization** | Multi-tenant boundary — all data is scoped to an org |
| **Aggregation** | Pre-computed metrics (per minute/hour/day) for fast dashboard queries |
| **DLQ** | Dead Letter Queue — where failed messages go after max retries |
| **Idempotency key** | Client-provided unique ID to prevent duplicate event processing |
| **Retention** | Automatic deletion of old `RequestLog` data based on org plan tier |

# TraceLite

A production-style backend monorepo using NestJS + Prisma + PostgreSQL + Redis.

## Setup

1. Start Docker services:
   ```bash
   docker compose up -d
   ```

2. Run database migration:
   ```bash
   npm run db:migrate
   ```

3. Start the API:
   ```bash
   npm run dev
   ```

4. Test health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

## Structure

```
tracelite/
├── package.json
├── docker-compose.yml
├── .env
├── packages/db        # Shared Prisma client
├── services/api       # NestJS API
└── services/worker    # Worker service (future)
```

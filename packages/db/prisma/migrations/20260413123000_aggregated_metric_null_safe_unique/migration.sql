-- Enforce null-safe uniqueness for rollup identity.
-- Requires PostgreSQL 15+ for `NULLS NOT DISTINCT`.

-- Remove duplicate logical rollups first so the unique index can be created safely.
WITH ranked AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "organizationId", "apiKeyId", "endpoint", "period", "periodStart"
            ORDER BY "createdAt" DESC, "id" DESC
        ) AS rn
    FROM "AggregatedMetric"
)
DELETE FROM "AggregatedMetric" am
USING ranked r
WHERE am."id" = r."id"
  AND r.rn > 1;

DROP INDEX IF EXISTS "AggregatedMetric_organizationId_apiKeyId_endpoint_period_pe_key";

CREATE UNIQUE INDEX "AggregatedMetric_organizationId_apiKeyId_endpoint_period_pe_key"
ON "AggregatedMetric" (
    "organizationId",
    "apiKeyId",
    "endpoint",
    "period",
    "periodStart"
) NULLS NOT DISTINCT;

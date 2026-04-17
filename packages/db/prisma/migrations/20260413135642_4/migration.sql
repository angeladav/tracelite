-- AddForeignKey
ALTER TABLE "AggregatedMetric" ADD CONSTRAINT "AggregatedMetric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

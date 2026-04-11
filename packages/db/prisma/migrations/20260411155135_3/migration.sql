/*
  Warnings:

  - Added the required column `organizationId` to the `RequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

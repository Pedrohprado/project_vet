-- CreateEnum
CREATE TYPE "FunnelStep" AS ENUM ('ENTRADA', 'CHECKOUT', 'ENTERED');

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL,
    "step" "FunnelStep" NOT NULL,
    "path" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FunnelEvent_step_idx" ON "FunnelEvent"("step");

-- CreateIndex
CREATE INDEX "FunnelEvent_createdAt_idx" ON "FunnelEvent"("createdAt");

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- CreateEnum
CREATE TYPE "ConnectionPurpose" AS ENUM ('CONNECTION', 'SUPPORT');

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" TEXT NOT NULL,
    "purpose" "ConnectionPurpose" NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectionRequest_createdAt_idx" ON "ConnectionRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ConnectionRequest_purpose_idx" ON "ConnectionRequest"("purpose");

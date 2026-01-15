-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QrType" ADD VALUE 'INDIVIDUAL';
ALTER TYPE "QrType" ADD VALUE 'TEAM';

-- CreateTable
CREATE TABLE "QrCodeRecipient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCodeId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "QrCodeRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QrCodeRecipient_qrCodeId_idx" ON "QrCodeRecipient"("qrCodeId");

-- CreateIndex
CREATE INDEX "QrCodeRecipient_staffId_idx" ON "QrCodeRecipient"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "QrCodeRecipient_qrCodeId_staffId_key" ON "QrCodeRecipient"("qrCodeId", "staffId");

-- AddForeignKey
ALTER TABLE "QrCodeRecipient" ADD CONSTRAINT "QrCodeRecipient_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCodeRecipient" ADD CONSTRAINT "QrCodeRecipient_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

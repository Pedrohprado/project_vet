-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('NONE', 'PIX', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Clinic" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

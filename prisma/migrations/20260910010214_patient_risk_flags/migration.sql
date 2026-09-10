-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[];

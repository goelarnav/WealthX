-- AlterTable
ALTER TABLE "stock_recommendations" ADD COLUMN     "targetPrice" DECIMAL(10,2),
ADD COLUMN     "stopLoss" DECIMAL(10,2),
ADD COLUMN     "holdingPeriod" TEXT;

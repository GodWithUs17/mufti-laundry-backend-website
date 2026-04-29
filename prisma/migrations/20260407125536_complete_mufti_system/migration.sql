/*
  Warnings:

  - The values [RECEIVED_AT_SHOP,WASHING,IRONING] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackingCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pickupDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupSlot` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('REQUESTED', 'PICKED_UP', 'BILLED', 'PROCESSING', 'READY', 'DELIVERED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "applyHandlingFee" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "handlingFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 200,
ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pickupNotes" TEXT,
ADD COLUMN     "pickupSlot" TEXT NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "trackingCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";

-- CreateIndex
CREATE UNIQUE INDEX "Order_trackingCode_key" ON "Order"("trackingCode");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

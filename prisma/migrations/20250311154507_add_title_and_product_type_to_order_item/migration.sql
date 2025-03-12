/*
  Warnings:

  - Added the required column `productType` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productType" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

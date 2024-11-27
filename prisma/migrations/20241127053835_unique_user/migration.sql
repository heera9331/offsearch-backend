/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PaymentMethod_userId_key` ON `PaymentMethod`(`userId`);

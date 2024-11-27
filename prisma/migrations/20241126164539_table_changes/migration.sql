/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PaymentMethod_id_key` ON `PaymentMethod`(`id`);

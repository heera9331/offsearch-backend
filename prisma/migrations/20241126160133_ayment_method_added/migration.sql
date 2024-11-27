/*
  Warnings:

  - You are about to drop the column `nankName` on the `paymentmethod` table. All the data in the column will be lost.
  - Added the required column `bankName` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paymentmethod` DROP COLUMN `nankName`,
    ADD COLUMN `bankName` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PaymentMethod` ADD CONSTRAINT `PaymentMethod_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

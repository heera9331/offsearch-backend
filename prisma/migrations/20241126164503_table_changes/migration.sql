-- DropIndex
DROP INDEX `PaymentMethod_bankNumber_key` ON `paymentmethod`;

-- DropIndex
DROP INDEX `PaymentMethod_upiId_key` ON `paymentmethod`;

-- AlterTable
ALTER TABLE `paymentmethod` MODIFY `bankNumber` VARCHAR(191) NULL,
    MODIFY `ifscCode` VARCHAR(191) NULL,
    MODIFY `holderName` VARCHAR(191) NULL,
    MODIFY `upiId` VARCHAR(191) NULL,
    MODIFY `paypalEmail` VARCHAR(191) NULL,
    MODIFY `bankName` VARCHAR(191) NULL;

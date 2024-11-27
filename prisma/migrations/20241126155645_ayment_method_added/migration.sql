-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `nankName` VARCHAR(191) NOT NULL,
    `bankNumber` VARCHAR(191) NOT NULL,
    `ifscCode` VARCHAR(191) NOT NULL,
    `holderName` VARCHAR(191) NOT NULL,
    `upiId` VARCHAR(191) NOT NULL,
    `paypalEmail` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PaymentMethod_bankNumber_key`(`bankNumber`),
    UNIQUE INDEX `PaymentMethod_upiId_key`(`upiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

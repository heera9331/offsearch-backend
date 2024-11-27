/*
  Warnings:

  - A unique constraint covering the columns `[userId,createdAt]` on the table `Record` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Record_createdAt_key` ON `record`;

-- DropIndex
DROP INDEX `Record_impression_key` ON `record`;

-- AlterTable
ALTER TABLE `record` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Record_userId_createdAt_key` ON `Record`(`userId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

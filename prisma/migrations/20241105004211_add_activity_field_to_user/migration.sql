/*
  Warnings:

  - You are about to drop the column `last_active_or_logout` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `last_active_or_logout`,
    ADD COLUMN `last_active` DATETIME(3) NULL,
    ADD COLUMN `last_logout` DATETIME(3) NULL;

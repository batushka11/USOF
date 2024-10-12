/*
  Warnings:

  - A unique constraint covering the columns `[confirm_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_confirm_token_key` ON `User`(`confirm_token`);

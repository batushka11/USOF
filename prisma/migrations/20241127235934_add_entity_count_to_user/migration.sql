/*
  Warnings:

  - Added the required column `comments_count` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_count` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reactions_count` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `comments_count` INTEGER NOT NULL,
    ADD COLUMN `post_count` INTEGER NOT NULL,
    ADD COLUMN `reactions_count` INTEGER NOT NULL;

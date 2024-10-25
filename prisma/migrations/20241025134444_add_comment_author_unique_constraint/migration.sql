/*
  Warnings:

  - A unique constraint covering the columns `[comment_id,author_id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Like_comment_id_author_id_key` ON `Like`(`comment_id`, `author_id`);

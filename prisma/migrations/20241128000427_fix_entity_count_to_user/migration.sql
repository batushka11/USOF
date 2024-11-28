-- AlterTable
ALTER TABLE `User` MODIFY `comments_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `post_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `reactions_count` INTEGER NOT NULL DEFAULT 0;

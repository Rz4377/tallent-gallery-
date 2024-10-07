/*
  Warnings:

  - A unique constraint covering the columns `[uid,projectTitle]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_uid_projectTitle_key" ON "Post"("uid", "projectTitle");

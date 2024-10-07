/*
  Warnings:

  - You are about to drop the column `postId` on the `Comment` table. All the data in the column will be lost.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postContent` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `PostDescription` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `PostReaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectTitle]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId]` on the table `PostDescription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectTitle` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `PostDescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `PostReaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostDescription" DROP CONSTRAINT "PostDescription_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostReaction" DROP CONSTRAINT "PostReaction_postId_fkey";

-- DropIndex
DROP INDEX "PostDescription_postId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "postId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP CONSTRAINT "Post_pkey",
DROP COLUMN "postContent",
DROP COLUMN "postId",
ADD COLUMN     "projectId" SERIAL NOT NULL,
ADD COLUMN     "projectTitle" TEXT NOT NULL,
ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("projectId");

-- AlterTable
ALTER TABLE "PostDescription" DROP COLUMN "postId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "postId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_projectId_key" ON "Post"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_projectTitle_key" ON "Post"("projectTitle");

-- CreateIndex
CREATE UNIQUE INDEX "PostDescription_projectId_key" ON "PostDescription"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- AddForeignKey
ALTER TABLE "PostDescription" ADD CONSTRAINT "PostDescription_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Post"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Post"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Post"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

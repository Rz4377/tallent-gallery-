/*
  Warnings:

  - You are about to drop the column `postLink` on the `PostDescription` table. All the data in the column will be lost.
  - Added the required column `description` to the `PostDescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostDescription" DROP COLUMN "postLink",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "githubLink" TEXT,
ADD COLUMN     "liveLink" TEXT;

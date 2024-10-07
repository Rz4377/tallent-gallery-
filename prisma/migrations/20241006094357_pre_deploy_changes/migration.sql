-- DropForeignKey
ALTER TABLE "PostDescription" DROP CONSTRAINT "PostDescription_projectId_fkey";

-- AddForeignKey
ALTER TABLE "PostDescription" ADD CONSTRAINT "PostDescription_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Post"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

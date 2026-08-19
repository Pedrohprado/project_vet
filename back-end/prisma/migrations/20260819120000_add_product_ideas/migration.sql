-- CreateEnum
CREATE TYPE "ProductIdeaStatus" AS ENUM ('TODO', 'DOING', 'DONE');

-- CreateTable
CREATE TABLE "ProductIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProductIdeaStatus" NOT NULL DEFAULT 'TODO',
    "position" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductIdea_status_position_idx" ON "ProductIdea"("status", "position");

-- CreateIndex
CREATE INDEX "ProductIdea_authorId_idx" ON "ProductIdea"("authorId");

-- AddForeignKey
ALTER TABLE "ProductIdea" ADD CONSTRAINT "ProductIdea_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "content" TEXT,
ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'VIDEO',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "youtubeVideoId" TEXT;

-- CreateTable
CREATE TABLE "ChapterFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChapterFile" ADD CONSTRAINT "ChapterFile_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

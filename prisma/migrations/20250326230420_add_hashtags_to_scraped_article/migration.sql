-- AlterTable
ALTER TABLE "ScrapedArticle" ADD COLUMN     "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[];

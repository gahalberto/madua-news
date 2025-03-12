-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" INTEGER DEFAULT 0,
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[];

/*
  Warnings:

  - You are about to drop the column `learningObjectives` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "learningObjectives",
ADD COLUMN     "learningPoints" TEXT[] DEFAULT ARRAY[]::TEXT[];

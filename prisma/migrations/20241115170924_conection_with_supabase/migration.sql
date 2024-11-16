/*
  Warnings:

  - You are about to drop the column `path` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "path",
ADD COLUMN     "url" TEXT NOT NULL DEFAULT 'default_value';

/*
  Warnings:

  - You are about to drop the column `antonyms` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `contextualDefinition` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `synonyms` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "antonyms",
DROP COLUMN "contextualDefinition",
DROP COLUMN "synonyms";

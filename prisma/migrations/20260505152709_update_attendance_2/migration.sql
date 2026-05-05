/*
  Warnings:

  - You are about to drop the column `created_at` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "tap_in_at" SET DEFAULT CURRENT_TIMESTAMP;

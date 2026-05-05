/*
  Warnings:

  - Made the column `tap_in_at` on table `attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "updated_at" TIMESTAMPTZ(6),
ALTER COLUMN "tap_in_at" SET NOT NULL;

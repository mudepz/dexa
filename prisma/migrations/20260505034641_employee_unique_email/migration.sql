/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `employee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "employee_phone_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

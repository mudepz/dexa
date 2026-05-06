-- CreateTable
CREATE TABLE "employee_log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" BIGINT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,

    CONSTRAINT "employee_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employee_log" ADD CONSTRAINT "employee_log_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

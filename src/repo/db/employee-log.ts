import { Prisma, PrismaClient } from "@prisma/client";
import { BaseDb } from "./db.base";
import { InfraService } from "../../infra/infra.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmployeeLog extends BaseDb<PrismaClient["employee_log"], Prisma.employee_logCreateInput, Prisma.employee_logUpdateInput, Prisma.employee_logGetPayload<{}>> {
    constructor(infra: InfraService) {
        super(infra, "employee_log");
    }
}
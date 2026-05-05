import { Prisma, PrismaClient } from "@prisma/client";
import { BaseDb } from "./db.base";
import { InfraService } from "../../infra/infra.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class Employee extends BaseDb<PrismaClient["employee"], Prisma.employeeCreateInput, Prisma.employeeUpdateInput, Prisma.employeeGetPayload<{}>> {
    constructor(infra: InfraService) {
        super(infra, "employee");
    }

    async findByEmail(tx: Prisma.TransactionClient, email: string) {
        const model = this.infra.prisma.getModel(tx);
        return model.employee.findFirst({
            where: {
                deleted_at: null,
                email,
            },
            include: {
                role: true,
            },
        })
    }
}
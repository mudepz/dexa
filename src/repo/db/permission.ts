import { Injectable, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { InfraService } from "../../infra/infra.service";
import { BaseDb } from "./db.base";

@Injectable()
export class Permission extends BaseDb<PrismaClient["permission"], Prisma.permissionCreateInput, Prisma.permissionUpdateInput, Prisma.permissionGetPayload<{}>, number> {
    constructor(infra: InfraService) {
        super(infra, "permission");
    }

    async getByName(tx: Prisma.TransactionClient, name: string) {
        const model = this.infra.prisma.getModel(tx);
        try {
            return model.permission.findUnique({
                where: { name }
            })
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'R-DB-P-GBN-1')
            throw e;
        }
    }
}
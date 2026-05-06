import { Injectable, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { InfraService } from "../../infra/infra.service";
import { BaseDb } from "./db.base";

@Injectable()
export class Role extends BaseDb<PrismaClient["role"], Prisma.roleCreateInput, Prisma.roleUpdateInput, Prisma.roleGetPayload<{}>, number> {
    constructor(infra: InfraService) {
        super(infra, "role");
    }

    async getByName(tx: Prisma.TransactionClient, name: string) {
        const model = this.infra.prisma.getModel(tx);
        try {
            return model.role.findUnique({
                where: { name }
            })
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'R-DB-R-GBN-1')
            throw e;
        }
    }
}
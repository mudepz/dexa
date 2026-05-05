import { Injectable, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { InfraService } from "../../infra/infra.service";
import { BaseDb } from "./db.base";

@Injectable()
export class RolePermission extends BaseDb<PrismaClient["role_permission"], Prisma.role_permissionCreateInput, Prisma.role_permissionUpdateInput, Prisma.role_permissionGetPayload<{}>, number> {
    constructor(infra: InfraService) {
        super(infra, "role_permission");
    }

    async getByRoleAndPermissionId(tx: Prisma.TransactionClient, roleId: number, permissionId: number) {
        const model = this.infra.prisma.getModel(tx);
        try {
            return model.role_permission.findFirst({
                where: {
                    role_id: roleId,
                    permission_id: permissionId,
                }
            })
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'R-DB-RP-GBRAP-1')
            throw e;
        }
    }
}
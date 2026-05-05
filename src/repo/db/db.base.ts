import { Prisma, PrismaClient } from "@prisma/client";
import { InfraService } from "../../infra/infra.service";

export class BaseDb<
    TModelDelegate extends {
        create: (args: any) => Promise<any>;
        update: (args: any) => Promise<any>;
        findUnique: (args: any) => Promise<any>;
    },
    TCreateInput,
    TUpdateInput,
    TEntity,
    TId extends number | bigint = bigint
> {
    constructor(
        protected readonly infra: InfraService,
        private readonly modelName: keyof PrismaClient
    ) {
    }

    private getModel(tx: Prisma.TransactionClient | PrismaClient): TModelDelegate {
        return (this.infra.prisma.getModel(tx) as any)[this.modelName] as TModelDelegate;
    }

    async insert(tx: Prisma.TransactionClient | PrismaClient, data: TCreateInput): Promise<TEntity> {
        return this.getModel(tx).create({ data });
    }

    async update(tx: Prisma.TransactionClient | PrismaClient, id: TId, data: TUpdateInput): Promise<TEntity> {
        return this.getModel(tx).update({
            where: { id },
            data,
        });
    }

    async findById(tx: Prisma.TransactionClient | PrismaClient, id: TId): Promise<TEntity | null> {
        const model = this.getModel(tx);
        return (model as any).findUnique({
            where: { id },
        });
    }
}
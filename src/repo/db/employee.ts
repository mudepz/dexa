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

    async findByParam(param: {
        tx?: Prisma.TransactionClient,
        page: number,
        limit: number,
        keyword: string,
    }) {
        {
            const model = this.infra.prisma.getModel(param.tx);
            const where: Prisma.employeeWhereInput = {
                role: {
                    name: {
                        not: {
                            contains: 'admin',
                        },
                        mode: Prisma.QueryMode.insensitive,
                    }
                }
            }

            let take: number = undefined
            let skip: number = undefined
            if (param.limit > 0) {
                take = param.limit

                if (param.page > 0) {
                    skip = param.limit * (param.page - 1)
                }
            }

            if (param.keyword.length) {
                where.full_name = {
                    contains: param.keyword,
                    mode: Prisma.QueryMode.insensitive,
                }
            }

            const [data, count] = await Promise.all([
                model.employee.findMany({
                    where,
                    orderBy: {
                        created_at: Prisma.SortOrder.desc,
                    },

                    take: take,
                    skip: skip,
                }),
                model.employee.count({ where }),
            ]);

            return { data, count }
        }
    }
}
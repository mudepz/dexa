import { Prisma, PrismaClient } from "@prisma/client";
import { BaseDb } from "./db.base";
import { InfraService } from "../../infra/infra.service";
import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";

@Injectable()
export class Attendance extends BaseDb<PrismaClient["attendance"], Prisma.attendanceCreateInput, Prisma.attendanceUpdateInput, Prisma.attendanceGetPayload<{}>> {
    constructor(infra: InfraService) {
        super(infra, "attendance");
    }

    async findByParam(param: {
        tx: Prisma.TransactionClient,
        page: number,
        limit: number,
        employeeId: bigint,
        startDate: Date,
        endDate: Date,
    }) {
        {
            console.log('param:', param)
            const model = this.infra.prisma.getModel(param.tx);
            const where: Prisma.attendanceWhereInput = {}

            let take: number = undefined
            let skip: number = undefined
            if (param.limit > 0) {
                take = param.limit

                if (param.page > 0) {
                    skip = param.limit * (param.page - 1)
                }
            }

            if (param.startDate && param.endDate) {
                where.tap_in_at = {
                    gte: dayjs(param.startDate).startOf('day').toDate(),
                    lte: dayjs(param.endDate).endOf('day').toDate(),
                };
            }

            if (param.employeeId > 0) {
                where.employee_id = param.employeeId
            }

            const [data, count] = await Promise.all([
                model.attendance.findMany({
                    where,
                    orderBy: {
                        tap_in_at: Prisma.SortOrder.desc,
                    },

                    take: take,
                    skip: skip,
                }),
                model.attendance.count({ where }),
            ]);

            return { data, count }
        }
    }
}
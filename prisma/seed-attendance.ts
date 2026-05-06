import { Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

export async function seedAttendance(prisma: PrismaClient) {
    const employees = await prisma.employee.findMany({
        where: {
            role: {
                name: {
                    equals: 'employee',
                    mode: Prisma.QueryMode.insensitive,
                }
            }
        }
    })

    for (const employee of employees) {
        for (let i = 6; i >= 0; i--) {
            const targetDate = dayjs().subtract(i, 'day');
            const dayOfWeek = targetDate.day();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }

            const tapInAt = targetDate
                .set('hour', 8)
                .set('minute', Math.floor(Math.random() * 30) + 15)
                .set('second', Math.floor(Math.random() * 60))
                .toDate();

            const tapOutAt = targetDate
                .set('hour', 17)
                .set('minute', Math.floor(Math.random() * 30))
                .set('second', Math.floor(Math.random() * 60))
                .toDate();

            await prisma.attendance.create({
                data: {
                    employee_id: employee.id,
                    tap_in_at: tapInAt,
                    tap_out_at: tapOutAt,
                },
            });
        }
    }

    Logger.debug('seed done', 'seed.seedAttendance');
}
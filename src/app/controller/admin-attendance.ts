import { BadRequestException, Controller, Get, HttpStatus, InternalServerErrorException, Logger, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { InfraService } from "../../infra/infra.service";
import { RepoService } from "../../repo/repo.service";
import { ApiTokenGuard } from "../middleware/guard";
import dayjs from "dayjs";
import { AttendanceGetQuery } from "../dto/attendance";
import { DecodedJwt } from "../dto/middleware";
import { GetDecoded } from "../middleware/decoded.decorator";
import { RoleGuard } from "../middleware/role.guard";
import { Permission } from "../middleware/permission.decorator";
import { AdminAttendanceGetQuery } from "../dto/admin-attendance";

@ApiBearerAuth()
@Controller('admin/attendance')
@UseGuards(ApiTokenGuard)
export class AdminAttendanceController {
    constructor(private readonly repo: RepoService) {
    }

    @Get()
    @Permission('ADMIN_ATTENDANCE_GET')
    @UseGuards(RoleGuard)
    async get(@Query() query: AdminAttendanceGetQuery) {
        Logger.debug(`query: ${JSON.stringify(query, null, 2)}`, 'AAC-G-02')
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            let startDate: Date = dayjs().startOf('month').toDate()
            let endDate: Date = dayjs().endOf('day').toDate()

            if (query.startDate && query.endDate) {
                if (query.startDate > query.endDate) {
                    throw new BadRequestException('Start Date can not greater than End Date', 'AAC-G-03')
                }

                startDate = dayjs(query.startDate).startOf('day').toDate()
                endDate = dayjs(query.endDate).endOf('day').toDate()
            }

            const attendances = await this.repo.db.attendance.findByParam({
                page,
                limit,
                startDate,
                endDate,
                employeeName: query.employeeName || '',
            })

            return {
                statusCode: HttpStatus.OK,
                data: attendances.data.map(data => ({
                    ...data,
                    tap_in_at_format: dayjs(data.tap_in_at).format("YYYY-MM-DD HH:mm"),
                    tap_out_at_format: dayjs(data.tap_out_at).format("YYYY-MM-DD HH:mm"),
                })),
                meta: {
                    page,
                    limit,
                    total_data: attendances.count,
                    total_page: Math.ceil(attendances.count / limit)
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AAC-G-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AAC-G-01')
        }
    }
}
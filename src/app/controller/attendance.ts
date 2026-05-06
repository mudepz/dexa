import { BadRequestException, Controller, Get, HttpStatus, InternalServerErrorException, Logger, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { InfraService } from "../../infra/infra.service";
import { RepoService } from "../../repo/repo.service";
import { ApiTokenGuard } from "../middleware/guard";
import { DecodedJwt } from "../dto/middleware";
import { GetDecoded } from "../middleware/decoded.decorator";
import { RoleGuard } from "../middleware/role.guard";
import { Permission } from "../middleware/permission.decorator";
import dayjs from "dayjs";
import { AttendanceGetQuery } from "../dto/attendance";

@ApiBearerAuth()
@Controller('attendance')
@UseGuards(ApiTokenGuard)
export class AttendanceController {
    constructor(private readonly repo: RepoService, private readonly infra: InfraService,) {
    }

    @Get()
    @Permission('ATTENDANCE_GET')
    @UseGuards(RoleGuard)
    async get(@GetDecoded() decoded: DecodedJwt, @Query() query: AttendanceGetQuery) {
        Logger.debug(`query: ${JSON.stringify(query, null, 2)}`, 'AC-G-02')
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            let startDate: Date = dayjs().startOf('month').toDate()
            let endDate: Date = dayjs().endOf('day').toDate()

            if (query.startDate && query.endDate) {
                if (query.startDate > query.endDate) {
                    throw new BadRequestException('Start Date can not greater than End Date', 'AC-G-03')
                }

                startDate = dayjs(query.startDate).startOf('day').toDate()
                endDate = dayjs(query.endDate).endOf('day').toDate()
            }

            const attendances = await this.repo.db.attendance.findByParam({
                page,
                limit,
                employeeId: decoded.id,
                startDate,
                endDate
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

            Logger.error(e instanceof Error ? e.stack : e, 'AC-G-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AC-G-01')
        }
    }

    @Post()
    @Permission('ATTENDANCE_TAP_IN')
    @UseGuards(RoleGuard)
    async tapIn(@GetDecoded() decoded: DecodedJwt) {
        try {
            const attendanceToday = await this.repo.db.attendance.findByParam({
                tx: undefined,
                page: 0,
                limit: 0,
                employeeId: decoded.id,
                startDate: dayjs().toDate(),
                endDate: dayjs().toDate()
            })
            if (attendanceToday.count) {
                throw new BadRequestException('already tapped in', 'AC-TI-02')
            }

            const attendance = await this.repo.db.attendance.insert(null, {
                employee: {
                    connect: {
                        id: decoded.id
                    }
                },
            })

            return {
                statusCode: HttpStatus.OK,
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AC-TI-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AC-TI-01')
        }
    }

    @Put()
    @Permission('ATTENDANCE_TAP_OUT')
    @UseGuards(RoleGuard)
    async tapOut(@GetDecoded() decoded: DecodedJwt) {
        try {
            const attendanceToday = await this.repo.db.attendance.findByParam({
                tx: undefined,
                page: 0,
                limit: 0,
                employeeId: decoded.id,
                startDate: dayjs().toDate(),
                endDate: dayjs().toDate()
            })
            if (!attendanceToday.count) {
                throw new BadRequestException('not yet tap in', 'AC-TO-02')
            }

            if (attendanceToday.data[0].tap_out_at) {
                throw new BadRequestException('already tapped out', 'AC-TO-03')
            }

            const attendance = await this.repo.db.attendance.update(null, attendanceToday.data[0].id, {
                tap_out_at: dayjs().toDate(),
            })

            return {
                statusCode: HttpStatus.OK,
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AC-TO-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AC-TO-01')
        }
    }
}
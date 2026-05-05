import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Logger, Param, Patch, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { InfraService } from "../../infra/infra.service";
import { RepoService } from "../../repo/repo.service";
import { ApiTokenGuard } from "../middleware/guard";
import { EmployeeUpdateBody, EmployeeUpdateFile } from "../dto/employee";
import { DecodedJwt } from "../dto/middleware";
import { GetDecoded } from "../middleware/decoded.decorator";
import { Permission } from "../middleware/permission.decorator";
import { RoleGuard } from "../middleware/role.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";


@ApiBearerAuth()
@Controller('employee')
@UseGuards(ApiTokenGuard)
export class EmployeeController {
    constructor(private readonly repo: RepoService, private readonly infra: InfraService,) {
    }

    @Get()
    @Permission('EMPLOYEE_GET_DETAIL')
    @UseGuards(RoleGuard)
    async getDetail(@GetDecoded() decoded: DecodedJwt) {
        Logger.debug(`decoded: ${JSON.stringify(decoded, null, 2)}`, 'EC-GD-02')
        try {
            const employee = await this.repo.db.employee.findById(undefined, decoded.id);
            if (!employee) {
                throw new BadRequestException('employee not found', 'EC-GD-03')
            }

            const { salt, password, ...employeeData } = employee
            const attendanceToday = await this.repo.db.attendance.findByParam({
                tx: undefined,
                page: 0,
                limit: 0,
                employeeId: employee.id,
                startDate: dayjs().toDate(),
                endDate: dayjs().toDate()
            })
            return {
                statusCode: HttpStatus.OK,
                data: {
                    ...employeeData,
                    photo_url: await this.infra.bucket.getUrl(employeeData.photo_key),
                    attendance_today: attendanceToday.data,
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'EC-GD-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'EC-GD-01')
        }
    }

    @Patch()
    @Permission('EMPLOYEE_UPDATE')
    @UseGuards(RoleGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: EmployeeUpdateFile })
    async update(@GetDecoded() decoded: DecodedJwt, @Body() body: EmployeeUpdateBody, @UploadedFile() file: Express.Multer.File) {
        Logger.debug(`body: ${JSON.stringify(body, null, 2)}`, 'EC-U-03')
        let photoKey: string
        try {
            const employee = await this.repo.db.employee.findById(null, decoded.id);
            if (!employee) {
                throw new BadRequestException('employee not found', 'EC-U-04')
            }

            if (file) {
                photoKey = await this.infra.bucket.uploadBase64(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, `employee/${employee.id}/${Math.floor(Date.now() / 1000)}-${this.infra.helper.general.generateRandomString(10)}`)
            }

            const updateData: Prisma.employeeUpdateInput = {
                photo_key: photoKey ?? undefined,
                phone_number: body.phoneNumber ?? undefined,
            }

            if (body.password) {
                updateData.password = this.infra.helper.general.generatePassword(employee.salt, body.password)
            }

            await this.repo.db.employee.update(null, employee.id, updateData)
            const employeeNew = await this.repo.db.employee.findById(null, employee.id);

            const { salt, password, ...employeeData } = employeeNew
            return {
                statusCode: HttpStatus.OK,
                data: {
                    ...employeeData,
                    photo_url: await this.infra.bucket.getUrl(employeeData.photo_key)
                }
            }
        } catch (e) {
            if (photoKey) {
                this.infra.bucket.deleteKey(photoKey).then(() => Logger.debug(`photo ${photoKey} deleted`, 'EC-U-02')).catch(err => Logger.error(`failed to delete ${photoKey}: ${err.message}`, 'EC-U-02'));
            }

            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'EC-U-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'EC-U-01')
        }
    }
}
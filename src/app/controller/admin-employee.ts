import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Logger, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { InfraService } from "../../infra/infra.service";
import { RepoService } from "../../repo/repo.service";
import { ApiTokenGuard } from "../middleware/guard";
import dayjs from "dayjs";
import { AdminEmployeeCreateBody, AdminEmployeeCreateFile, AdminEmployeeGetDetailParam, AdminEmployeeGetQuery, AdminEmployeeUpdateBody, AdminEmployeeUpdateFile } from "../dto/admin-employee";
import { DecodedJwt } from "../dto/middleware";
import { GetDecoded } from "../middleware/decoded.decorator";
import { RoleGuard } from "../middleware/role.guard";
import { Permission } from "../middleware/permission.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

@ApiBearerAuth()
@Controller('admin/employee')
@UseGuards(ApiTokenGuard)
export class AdminEmployeeController {
    constructor(private readonly repo: RepoService, private readonly infra: InfraService,) {
    }

    @Get()
    @Permission('ADMIN_EMPLOYEE_GET')
    @UseGuards(RoleGuard)
    async get(@GetDecoded() decoded: DecodedJwt, @Query() query: AdminEmployeeGetQuery) {
        Logger.debug(`query: ${JSON.stringify(query, null, 2)}`, 'AEC-G-02')
        try {
            const keyword = query.keyword || ''
            const page = query.page || 1;
            const limit = query.limit || 10;

            const employees = await this.repo.db.employee.findByParam({
                page,
                limit,
                keyword,
            })

            return {
                statusCode: HttpStatus.OK,
                data: await Promise.all(employees.data.map(async data => ({
                    ...data,
                    photo_url: data.photo_key ? await this.infra.bucket.getUrl(data.photo_key) : '',
                }))),
                meta: {
                    page,
                    limit,
                    total_data: employees.count,
                    total_page: Math.ceil(employees.count / limit)
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AEC-G-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AEC-G-01')
        }
    }

    @Post()
    @Permission('ADMIN_EMPLOYEE_CREATE')
    @UseGuards(RoleGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: AdminEmployeeCreateFile })
    async create(@GetDecoded() decoded: DecodedJwt, @Body() body: AdminEmployeeCreateBody, @UploadedFile() file: Express.Multer.File) {
        Logger.debug(`body: ${JSON.stringify(body, null, 2)}`, 'AEC-U-03')
        let photoKey: string
        try {
            const email = await this.repo.db.employee.findByEmail(null, body.email)
            if (email) {
                throw new BadRequestException('Email already exists', 'AEC-U-04')
            }

            if (file) {
                photoKey = await this.infra.bucket.uploadBase64(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, `employee/${this.infra.helper.general.maskEmail(body.email)}/${Math.floor(Date.now() / 1000)}-${this.infra.helper.general.generateRandomString(10)}`)
            }
            const role = await this.repo.db.role.getByName(null, 'Employee')
            const salt = randomUUID()
            const employee = await this.repo.db.employee.insert(null, {
                email: body.email,
                salt,
                password: this.infra.helper.general.generatePassword(salt, body.password),
                full_name: body.fullName,
                role: {
                    connect: {
                        id: role.id
                    }
                },
                position: body.position ?? undefined,
                photo_key: photoKey ?? undefined,
                phone_number: body.phoneNumber ?? undefined,
                created_by: {
                    connect: {
                        id: decoded.id,
                    }
                }
            })
            const { salt: removeSalt, password, ...employeeData } = employee

            return {
                statusCode: HttpStatus.OK,
                data: {
                    ...employeeData,
                    photo_url: employeeData.photo_key ? await this.infra.bucket.getUrl(employeeData.photo_key) : ''
                }
            }
        } catch (e) {
            if (photoKey) {
                this.infra.bucket.deleteKey(photoKey).then(() => Logger.debug(`photo ${photoKey} deleted`, 'AEC-U-02')).catch(err => Logger.error(`failed to delete ${photoKey}: ${err.message}`, 'AEC-U-02'));
            }

            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AEC-U-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AEC-U-01')
        }
    }

    @Patch()
    @Permission('ADMIN_EMPLOYEE_UPDATE')
    @UseGuards(RoleGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: AdminEmployeeUpdateFile })
    async update(@GetDecoded() decoded: DecodedJwt, @Body() body: AdminEmployeeUpdateBody, @UploadedFile() file: Express.Multer.File) {
        Logger.debug(`body: ${JSON.stringify(body, null, 2)}`, 'AEC-U-03')
        let photoKey: string
        try {
            const employee = await this.repo.db.employee.findById(null, decoded.id);
            if (!employee) {
                throw new BadRequestException('employee not found', 'AEC-U-04')
            }

            if (file) {
                photoKey = await this.infra.bucket.uploadBase64(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, `employee/${employee.id}/${Math.floor(Date.now() / 1000)}-${this.infra.helper.general.generateRandomString(10)}`)
            }

            const updateData: Prisma.employeeUpdateInput = {
                position: body.position ?? undefined,
                full_name: body.fullName ?? undefined,
                photo_key: photoKey ?? undefined,
                phone_number: body.phoneNumber ?? undefined,
                updated_at: dayjs().toDate(),
            }

            if (body.password) {
                updateData.password = this.infra.helper.general.generatePassword(employee.salt, body.password)
            }

            const employeeNew = await this.repo.db.employee.update(null, employee.id, updateData)
            const { salt, password, ...newEmployee } = employeeNew;

            return {
                statusCode: HttpStatus.OK,
                data: {
                    ...newEmployee,
                    photo_url: newEmployee.photo_key ? await this.infra.bucket.getUrl(newEmployee.photo_key) : ''
                }
            }
        } catch (e) {
            if (photoKey) {
                this.infra.bucket.deleteKey(photoKey).then(() => Logger.debug(`photo ${photoKey} deleted`, 'AEC-U-02')).catch(err => Logger.error(`failed to delete ${photoKey}: ${err.message}`, 'AEC-U-02'));
            }

            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AEC-U-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AEC-U-01')
        }
    }

    @Get(':id')
    @Permission('ADMIN_EMPLOYEE_GET_DETAIL')
    @UseGuards(RoleGuard)
    async getDetail(@Param() param: AdminEmployeeGetDetailParam) {
        Logger.debug(`param: ${JSON.stringify(param, null, 2)}`, 'AEC-GD-02')
        try {
            const employee = await this.repo.db.employee.findById(undefined, param.id);
            if (!employee) {
                throw new BadRequestException('employee not found', 'AEC-GD-03')
            }

            const { salt, password, ...employeeData } = employee

            return {
                statusCode: HttpStatus.OK,
                data: {
                    ...employeeData,
                    photo_url: employeeData.photo_key ? await this.infra.bucket.getUrl(employeeData.photo_key) : '',
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AEC-GD-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AEC-GD-01')
        }
    }
}
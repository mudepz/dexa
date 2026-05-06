import { BadRequestException, Body, Controller, HttpStatus, InternalServerErrorException, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RepoService } from "../../repo/repo.service";
import { InfraService } from "../../infra/infra.service";
import { AuthLoginBody } from "../dto/auth";
import dayjs from "dayjs";

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly repo: RepoService, private readonly infra: InfraService,) {
    }

    @Post('/login-employee')
    async loginEmployee(@Body() body: AuthLoginBody) {
        Logger.debug(`body: ${JSON.stringify(body, null, 2)}`, 'AC-LE-02')
        try {
            const employee = await this.repo.db.employee.findByEmail(undefined, body.email);
            if (!employee) {
                throw new BadRequestException('employee not found', 'AC-LE-03')
            }

            if (!employee.role.name.toLowerCase().includes('employee')) {
                throw new BadRequestException('invalid role', 'AC-LE-04')
            }

            const pass = this.infra.helper.general.generatePassword(employee.salt, body.password)
            if (pass != employee.password) {
                throw new BadRequestException('wrong password', 'AC-LE-05')
            }

            const { salt, password, ...employeeData } = employee
            const token = this.infra.json.jwt.encode(employeeData, '1d')

            return {
                statusCode: HttpStatus.OK,
                data: {
                    user: employeeData,
                    token
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AC-LE-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AC-LE-01')
        }
    }

    @Post('/login-admin')
    async loginAdmin(@Body() body: AuthLoginBody) {
        Logger.debug(`body: ${JSON.stringify(body, null, 2)}`, 'AC-LA-02')
        try {
            const admin = await this.repo.db.employee.findByEmail(undefined, body.email);
            if (!admin) {
                throw new BadRequestException('admin not found', 'AC-LA-03')
            }

            if (!admin.role.name.toLowerCase().includes('admin')) {
                throw new BadRequestException('invalid role', 'AC-LA-04')
            }

            const pass = this.infra.helper.general.generatePassword(admin.salt, body.password)
            if (pass != admin.password) {
                throw new BadRequestException('wrong password', 'AC-LA-05')
            }

            const { salt, password, ...adminData } = admin
            const token = this.infra.json.jwt.encode(adminData, '1d')

            return {
                statusCode: HttpStatus.OK,
                data: {
                    user: adminData,
                    token
                }
            }
        } catch (e) {
            if (e instanceof BadRequestException) throw e;

            Logger.error(e instanceof Error ? e.stack : e, 'AC-LA-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'AC-LA-01')
        }
    }
}
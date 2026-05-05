import { Injectable } from "@nestjs/common";
import { ConstService } from "./const/const.service";
import { HelperService } from "./helper/helper.service";
import { JsonService } from "./json/json.service";
import { CustomLoggerService } from "./logger/logger.service";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class InfraService {
    constructor(
        readonly constS: ConstService,
        readonly helper: HelperService,
        readonly json: JsonService,
        readonly prisma: PrismaService,
        readonly logger: CustomLoggerService,
    ) {
    }
}
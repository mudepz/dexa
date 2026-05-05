import { Module } from "@nestjs/common";
import { ConstModule } from "./const/const.module";
import { InfraService } from "./infra.service";
import { HelperModule } from "./helper/helper.module";
import { JsonModule } from "./json/json.module";
import { PrismaService } from "./prisma/prisma.service";
import { CustomLoggerService } from "./logger/logger.service";

@Module({
    providers: [
        PrismaService,
        CustomLoggerService,
        InfraService,
    ],
    imports: [
        ConstModule,
        HelperModule,
        JsonModule,
    ],
    exports: [
        InfraService
    ],
})
export class InfraModule {
}
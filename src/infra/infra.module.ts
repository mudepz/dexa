import { Module } from "@nestjs/common";
import { ConstModule } from "./const/const.module";
import { InfraService } from "./infra.service";
import { HelperModule } from "./helper/helper.module";
import { JsonModule } from "./json/json.module";
import { PrismaService } from "./prisma/prisma.service";
import { CustomLoggerService } from "./logger/logger.service";
import { BucketService } from "./bucket/bucket.service";
import { WebsocketService } from "./websocket/websocket.service";

@Module({
    providers: [
        PrismaService,
        CustomLoggerService,
        BucketService,
        WebsocketService,
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
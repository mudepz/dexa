import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { Employee } from "./employee";
import { QueueService } from "./queue.service";
import { InfraModule } from "../../infra/infra.module";
import { InfraService } from "../../infra/infra.service";

@Module({
    providers: [
        Employee,
        QueueService],
    imports: [
        BullModule.forRootAsync({
            useFactory: async (infra: InfraService) => ({
                connection: {
                    host: infra.constS.config.redis.host,
                    password: infra.constS.config.redis.password,
                    port: infra.helper.general.toNumber(infra.constS.config.redis.port),
                }
            }),
            inject: [InfraService],
            imports: [InfraModule],
        }),
        BullModule.registerQueue({ name: 'employee' }),
    ],
    exports: [QueueService],
})

export class QueueModule {
    constructor() {
    }
}
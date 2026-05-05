import { Module } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ConstService } from "./const.service";

@Module({
    providers: [
        ConfigService,
        ConstService,
    ],
    exports: [ConstService]
})

export class ConstModule {
}
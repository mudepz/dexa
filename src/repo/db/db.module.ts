import { Module } from "@nestjs/common";
import { InfraModule } from "../../infra/infra.module";
import { DbService } from "./db.service";

@Module({
    providers: [
        DbService
    ],
    imports: [InfraModule],
    exports: [DbService],
})
export class DbModule {
}
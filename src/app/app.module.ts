import { Module } from "@nestjs/common";
import { InfraModule } from "../infra/infra.module";
import { RepoModule } from "../repo/repo.module";
import { AuthController } from "./controller/auth";
import { EmployeeController } from "./controller/employee";
import { AttendanceController } from "./controller/attendance";
import { ProcessorModule } from "./processor/processor.module";

@Module({
    controllers: [
        AuthController,
        EmployeeController,
        AttendanceController,
    ],
    imports: [
        InfraModule,
        RepoModule,
        ProcessorModule,
    ],
    exports: [
        InfraModule,
        RepoModule,
    ],
    providers: [
    ],
})

export class AppModule {
}
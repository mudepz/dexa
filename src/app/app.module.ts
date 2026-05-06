import { Module } from "@nestjs/common";
import { InfraModule } from "../infra/infra.module";
import { RepoModule } from "../repo/repo.module";
import { AuthController } from "./controller/auth";
import { EmployeeController } from "./controller/employee";
import { AttendanceController } from "./controller/attendance";
import { ProcessorModule } from "./processor/processor.module";
import { AdminEmployeeController } from "./controller/admin-employee";
import { AdminAttendanceController } from "./controller/admin-attendance";

@Module({
    controllers: [
        AuthController,
        EmployeeController,
        AttendanceController,
        AdminEmployeeController,
        AdminAttendanceController,
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
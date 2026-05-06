import { Module } from "@nestjs/common";
import { InfraModule } from "../../infra/infra.module";
import { DbService } from "./db.service";
import { Employee } from "./employee";
import { RolePermission } from "./role_permission";
import { Permission } from "./permission";
import { Attendance } from "./attendance";
import { EmployeeLog } from "./employee-log";
import { Role } from "./role";

@Module({
    providers: [
        Employee,
        Permission,
        RolePermission,
        Attendance,
        EmployeeLog,
        Role,
        DbService,
    ],
    imports: [InfraModule],
    exports: [DbService],
})
export class DbModule {
}
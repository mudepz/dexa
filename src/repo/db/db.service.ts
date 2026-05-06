import { Injectable } from "@nestjs/common";
import { Employee } from "./employee";
import { RolePermission } from "./role_permission";
import { Permission } from "./permission";
import { Attendance } from "./attendance";
import { EmployeeLog } from "./employee-log";
import { Role } from "./role";

@Injectable()
export class DbService {
    constructor(
        readonly employee: Employee,
        readonly permission: Permission,
        readonly rolePermission: RolePermission,
        readonly attendance: Attendance,
        readonly employeeLog: EmployeeLog,
        readonly role: Role,
    ) {
    }
}
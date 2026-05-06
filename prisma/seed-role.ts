import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

export async function seedRole(prisma: PrismaClient) {
    const adminRole = await prisma.role.upsert({
        where: { name: 'HR Admin' },
        update: {},
        create: { name: 'HR Admin' },
    })
    const adminPermissions = await Promise.all([
        'ADMIN_EMPLOYEE_GET',
        'ADMIN_EMPLOYEE_GET_DETAIL',
        'ADMIN_EMPLOYEE_CREATE',
        'ADMIN_EMPLOYEE_UPDATE',
        'ADMIN_ATTENDANCE_GET',
    ].map(permissionName =>
        prisma.permission.upsert({
            where: { name: permissionName },
            update: {},
            create: { name: permissionName },
        })
    ));
    for (const adminPermission of adminPermissions) {
        await prisma.role_permission.upsert({
            where: {
                role_id_permission_id: {
                    role_id: adminRole.id,
                    permission_id: adminPermission.id
                }
            },
            update: {},
            create: {
                role_id: adminRole.id,
                permission_id: adminPermission.id,
            },
        });
    }

    const employeeRole = await prisma.role.upsert({
        where: { name: 'Employee' },
        update: {},
        create: { name: 'Employee' },
    })
    const employeePermissions = await Promise.all([
        'EMPLOYEE_GET_DETAIL',
        'EMPLOYEE_UPDATE',
        'ATTENDANCE_TAP_IN',
        'ATTENDANCE_TAP_OUT',
        'ATTENDANCE_GET',
    ].map(permissionName =>
        prisma.permission.upsert({
            where: { name: permissionName },
            update: {},
            create: { name: permissionName },
        })
    ));
    for (const employeePermission of employeePermissions) {
        await prisma.role_permission.upsert({
            where: {
                role_id_permission_id: {
                    role_id: employeeRole.id,
                    permission_id: employeePermission.id
                }
            },
            update: {},
            create: {
                role_id: employeeRole.id,
                permission_id: employeePermission.id,
            },
        });
    }

    Logger.debug('seed done', 'seed.seedRole');
    return {
        admin: adminRole,
        employee: employeeRole,
    }
}
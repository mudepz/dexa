import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { seedRole } from "./seed-role";
import crypto, { randomUUID } from "crypto";

const prisma = new PrismaClient();


async function main() {
    if (process.env.SEED_ROLE === 'true') {
        const role = await seedRole(prisma);

        for (const employee of [
            {
                email: 'admin@dexagroup.com',
                role_id: role.admin.id,
                full_name: 'Admin HR 1',
                password: 'admin1', // for test purpose only
            },
            {
                email: 'employee1@dexagroup.com',
                role_id: role.employee.id,
                full_name: 'Karyawan 1',
                password: 'employee1', // for test purpose only
            },
        ]) {
            // Check if there's a non-deleted user with the same email
            const existingUser = await prisma.employee.findFirst({
                where: {
                    deleted_at: null,
                    email: employee.email,
                },
            });

            if (!existingUser) {
                const salt = randomUUID()
                await prisma.employee.create({
                    data: {
                        email: employee.email,
                        salt,
                        role_id: employee.role_id,
                        password: crypto.createHash('sha1').update(salt + employee.password).digest('hex'),
                        full_name: employee.full_name,
                    },
                });
            }
        }

        Logger.debug('seed done', 'seed.main');
    }
}

main().catch((e) => {
    Logger.error(e, 'seed.main');
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
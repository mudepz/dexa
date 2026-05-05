import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {
    Logger.debug('seed done', 'seed.main');

}

main().catch((e) => {
    Logger.error(e, 'seed.main');
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
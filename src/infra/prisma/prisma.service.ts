import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {Prisma, PrismaClient} from "@prisma/client";
import {ConstService} from "../const/const.service";

@Injectable()
export class PrismaService implements OnModuleInit {
    private client: PrismaClient;

    constructor(private readonly constS: ConstService) {
    }

    async onModuleInit() {
        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: this.constS.config.databaseUrl,
                },
            },
            log: this.constS.config.debug ? ['query'] : [],
        });

        try {
            await this.client.$connect();
        } catch (error) {
            Logger.error('Database connection error:', error, 'PrismaService.onModuleInit');
            throw new Error('Unable to connect to database');
        }
    }

    getModel(tx?: Prisma.TransactionClient): PrismaClient | Prisma.TransactionClient {
        return tx ?? this.client;
    }

    transaction(callback: (tx: Prisma.TransactionClient) => Promise<any>) {
        return this.client.$transaction(callback, {timeout: 10000});
    }
}
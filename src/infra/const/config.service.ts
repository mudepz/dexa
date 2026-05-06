import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    readonly cors: {
        domains: string,
        methods: string
    }
    readonly databaseUrl: string;
    readonly debug: boolean
    readonly environment: string;
    readonly jwtSecret: string;
    readonly logDir: string;
    readonly minio: {
        bucketName: string;
        endpoint: string;
        password: string;
        region: string;
        user: string;
    };
    readonly port: string;
    readonly redis: {
        host: string,
        password: string,
        port: string,
    }

    constructor() {
        this.cors = {
            domains: process.env.CORS_DOMAINS,
            methods: process.env.CORS_METHODS
        }

        this.databaseUrl = process.env.DATABASE_URL
        this.debug = process.env.DEBUG == 'true'
        this.environment = process.env.ENVIRONMENT
        this.jwtSecret = process.env.JWT_SECRET
        this.logDir = process.env.LOG_DIR

        this.minio = {
            bucketName: process.env.MINIO_BUCKET_NAME,
            endpoint: process.env.MINIO_ENDPOINT,
            password: process.env.MINIO_PASSWORD,
            region: process.env.MINIO_REGION,
            user: process.env.MINIO_USER
        }

        this.port = process.env.PORT

        this.redis = {
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT,
        }
    }
}
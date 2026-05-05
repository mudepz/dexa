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
    readonly logDir: string;
    readonly jwtSecret: string;
    readonly port: string;

    constructor() {
        this.cors = {
            domains: process.env.CORS_DOMAINS || '',
            methods: process.env.CORS_METHODS || ''
        }

        this.databaseUrl = process.env.DATABASE_URL || ''
        this.debug = process.env.DEBUG == 'true'
        this.environment = process.env.ENVIRONMENT || ''

        this.logDir = process.env.LOG_DIR || ''
        
        this.jwtSecret = process.env.JWT_SECRET || ''
        this.port = process.env.PORT || ''
    }
}
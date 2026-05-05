import {Injectable, LoggerService} from '@nestjs/common';
import * as winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import {ConstService} from "../const/const.service";

@Injectable()
export class CustomLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor(private readonly constS: ConstService) {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp({format: 'DD/MM/YYYY, h:mm:ss A'}),
                winston.format.printf(({timestamp, level, message, context}) => {
                    const pid = process.pid;
                    const ctx = context || 'App'; // default context if not set
                    return `[Nest] ${pid}  - ${timestamp}     ${level.toUpperCase()} [${ctx}] ${message}`;
                })
            ),
            transports: [
                // Log untuk level 'log', 'error', 'warn' dalam satu file
                new winstonDaily({
                    level: 'info',  // Menggabungkan log, error, warn dalam satu file
                    datePattern: 'YYYY-MM-DD',
                    dirname: this.constS.config.logDir,  // Folder yang sama
                    filename: 'error.%DATE%.log',  // File untuk log, error, warn
                    maxFiles: '7d',
                    zippedArchive: true,
                    auditFile: `${this.constS.config.logDir}/audit/info-audit.json`,
                }),

                // Log untuk level 'debug', 'verbose' dalam satu file
                new winstonDaily({
                    level: 'debug',  // Menggabungkan debug dan verbose dalam satu file
                    datePattern: 'YYYY-MM-DD',
                    dirname: this.constS.config.logDir,  // Folder yang sama
                    filename: 'debug.%DATE%.log',  // File untuk debug dan verbose
                    maxFiles: '7d',
                    zippedArchive: true,
                    auditFile: `${this.constS.config.logDir}/audit/debug-audit.json`,
                }),

                new winston.transports.Console({level: 'debug'}),
            ],
        });

        this.logger.on('error', (err) => {
            console.error('Logger error:', err);
        });
    }

    log(message: string, context?: string) {
        this.logger.info(message, {context});
    }

    error(message: string, trace: string, context?: string) {
        this.logger.error(`${message} - ${trace}`, {context});
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, {context});
    }

    debug(message: string, context?: string, query?: string) {
        const logMessage = query ? `${message} - Query: ${query}` : message;
        this.logger.debug(logMessage, {context});
    }

    verbose(message: string, context?: string) {
        this.logger.verbose(message, {context});
    }
}
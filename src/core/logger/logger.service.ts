
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
                // Add file transports or others here
            ],
        });
    }

    log(message: any, ...optionalParams: any[]) {
        this.logger.info(message, { ...optionalParams });
    }

    error(message: any, ...optionalParams: any[]) {
        this.logger.error(message, { ...optionalParams });
    }

    warn(message: any, ...optionalParams: any[]) {
        this.logger.warn(message, { ...optionalParams });
    }

    debug?(message: any, ...optionalParams: any[]) {
        this.logger.debug(message, { ...optionalParams });
    }

    verbose?(message: any, ...optionalParams: any[]) {
        this.logger.verbose(message, { ...optionalParams });
    }
}

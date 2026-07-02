import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

const env = process.env.NODE_ENV || 'development';

const logLevel = (() => {
  switch (env) {
    case 'production':
      return 'warn';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
})();

const winstonInstance = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({
            timestamp,
            level,
            message,
            context,
          }: {
            timestamp?: string;
            level: string;
            message: string;
            context?: string;
          }) => {
            const gray = '\x1b[90m';
            const yellow = '\x1b[33m';
            const reset = '\x1b[0m';
            return `${gray}${timestamp}${reset} [${level}] ${yellow}[${context || 'APP'}]${reset} ${message}`;
          },
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

@Injectable()
export class AppLogger implements LoggerService {
  private logger = winstonInstance;

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  fatal(message: string, context?: string) {
    this.logger.error(message, { context });
  }
}

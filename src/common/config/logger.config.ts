import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
  }),
);

// JSON format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console transport - always active
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: consoleFormat,
    }),

    // Error log file
    new winston.transports.File({
      filename: join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file (all levels)
    new winston.transports.File({
      filename: join(process.cwd(), 'logs', 'combined.log'),
      level: isProduction ? 'info' : 'debug',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
};

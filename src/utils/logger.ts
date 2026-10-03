/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  }),
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  }),
);

const log = createLogger({
  level: 'info',
  format: fileFormat,
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default log;

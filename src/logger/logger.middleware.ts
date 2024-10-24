import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        res.on('finish', () => {
            const { method, url } = req;
            const { statusCode } = res;
            const responseTime = Date.now() - start;

            const logMessage = `${method} ${url} ${statusCode} - ${responseTime}ms\n`;

            const logDirectory = path.join(__dirname, '..', 'logs');
            const logFilePath = path.join(logDirectory, 'access.log');

            if (!fs.existsSync(logDirectory)) {
                fs.mkdirSync(logDirectory);
            }

            // Append the log message to the log file
            fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf8' });
        });

        next();
    }
}

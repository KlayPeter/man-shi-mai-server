import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, header } = req;
    const startTime = Date.now();
    const userAgent = header['user-agent'] || '';

    // 记录请求开始
    this.logger.log(`${method} ${originalUrl}-${ip} -  ${userAgent}`);

    // 监听响应完成事件
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const logLevel =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

      // 记录请求完成
      this.logger[logLevel](
        `${method} ${originalUrl}-${statusCode} ${responseTime}ms - ${ip}`,
      );
    });

    next();
  }
}

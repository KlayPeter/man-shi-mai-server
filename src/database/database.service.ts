import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbConfig: any,
    private readonly configService: ConfigService,
  ) {
    console.log('数据库配置:', this.dbConfig);
  }

  getConnectionInfo(): string {
    return this.configService.getOrThrow<string>('MONGODB_URI');
  }

  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }
}

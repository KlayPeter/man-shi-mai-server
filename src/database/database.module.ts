import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'mongodb';
        if (dbType === 'mongodb') {
          return {
            type: 'mongodb',
            uri: configService.get('MONGODB_URI'),
          };
        } else if (dbType === 'postgres') {
          return {
            type: 'postgres',
            uri: configService.get('POSTGRES_URI'),
            port: parseInt(
              configService.get<string>('POSTGRES_PORT') || '5432',
              10,
            ),
            database: configService.get('POSTGRES_DB'),
          };
        }

        throw new Error(`不支持的数据库类型: ${dbType}`);
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: ['DATABASE_CONNECTION', DatabaseService],
})
export class DatabaseModule {}

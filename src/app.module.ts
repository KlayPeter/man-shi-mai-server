import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { InterviewModule } from './interview/interview.module';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { configValidationSchema } from './config/config.schema';
import { CommonModule } from './common/common.module';
import { WechatController } from './wechat/wechat.controller';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 根据环境变量加载不同的配置文件
      isGlobal: true,
      validationSchema: configValidationSchema, // 添加验证模式
      validationOptions: {
        // 可选：自定义验证选项
        // allowUnknown: false, // 不允许未知的环境变量
        abortEarly: true, // 在第一个错误时中止验证
      },
    }), // 全局模块，可以任何地方使用
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule,
        UserModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'mmx-secret-key',
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
        }),
      ],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/mainshimai',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    InterviewModule,
    DatabaseModule,
    CommonModule,
    WechatModule,
  ],
  controllers: [AppController, WechatController],
  providers: [
    AppService,
    LoggerMiddleware,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { InterviewModule } from './interview/interview.module';
import { PaymentModule } from './payment/payment.module';
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
import { PassportModule } from '@nestjs/passport';
import { getTokenExpirationSeconds } from './common/utils/jwt.util';

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

    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/manshimai',
    ),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory:async (configService: ConfigService) => {
        const expirationSeconds = getTokenExpirationSeconds();
        return {
          secret: configService.get<string>('JWT_SECRET') || 'wwzhidao-secret',
          signOptions: {
            expiresIn: expirationSeconds,
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    UserModule,
    InterviewModule,
    PaymentModule,
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

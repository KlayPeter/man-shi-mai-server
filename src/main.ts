import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除DTO中没有定义声明的字段
      forbidNonWhitelisted: true, // 如果有多余的字段，抛出错误
      transform: true, // 自动转换请求参数到DTO定义的类型
      transformOptions: {
        enableImplicitConversion: true, // 允许隐式类型转换
      },
    }),
  ); // this is to validate the data coming in
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

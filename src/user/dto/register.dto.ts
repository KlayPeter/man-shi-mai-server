import { IsEmail, isEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto{
  @ApiProperty({
    description: '用户名，最少3位字符，用于显示和识别用户',
    example: 'zhangsan',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: '用户邮箱，用于登录和接收通知，必须是有效的邮箱格式',
    example: 'zhangsan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '用户密码，最少6位字符，建议包含字母和数字',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: '用户昵称，用于显示',
    example: '张三',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '用户头像URL地址',
    example: 'https://example.oss.com/avatars/user123.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: '用户邮箱，必须是有效的邮箱格式',
    example: 'newemail@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '用户手机号',
    example: '13800138000',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

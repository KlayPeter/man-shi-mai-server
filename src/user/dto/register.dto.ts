import { IsEmail, isEmail, IsString, MinLength } from "class-validator";

export class RegisterDto{
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
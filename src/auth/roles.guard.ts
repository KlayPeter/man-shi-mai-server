import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles); // 自定义装饰器，用于设置角色元数据

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    ); // 获取角色元数据
    if (!requiredRoles) {
      return true; // 如果没有设置角色要求，则默认允许访问
    }
    const user = context.switchToHttp().getRequest().user;
    if (!user || !user.roles) {
      return false; // 如果用户没有角色信息，则拒绝访问
    }
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}

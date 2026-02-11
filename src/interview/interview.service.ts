import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class InterviewService {
  constructor(private readonly userService: UserService) {}

  async createInterview(userId: string, interviewData: any) {
    // 验证用户是否存在
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new Error(`用户ID: ${userId} 不存在`);
    }

    // TODO: 创建面试记录
  }
}


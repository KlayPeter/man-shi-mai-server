import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InterviewService } from './interview/services/interview.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('系统')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly interviewService: InterviewService,
  ) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/mock-interview-count')
  @ApiOperation({ summary: '获取实时模拟面试人数' })
  async getMockInterviewCount() {
    const count = await this.interviewService.getActiveMockInterviewCount();
    return { count };
  }
}

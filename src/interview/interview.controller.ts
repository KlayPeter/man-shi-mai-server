import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from './services/interview.service';
import { ResumeQuizDto } from './dto/resume-quiz.dto';
import type { Response } from 'express';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) { }
  
  @Post('/analyze-resume')
  @UseGuards(JwtAuthGuard)
  async analyzeResume(@Body() body: {
    resume: string; jobDescription: string; position: string
  },
  @Request() req: any,
  ) {
    const result = await this.interviewService.analyzeResume(
      req.user.userId, body.resume, body.jobDescription, body.jobDescription);
    return {
      code: 200,
      data:result
    }

  }

  // 继续对话接口
  @Post('/continue-conversation')
  async continueConversation(@Body() body: {
    sessionId: string; question: string
  }) {
    const result = await this.interviewService.continueConversation(
      body.sessionId, body.question);
    return {
      code: 200,
      data: {
        response: result
      }
    }
  }

  // 简历押题接口
  @Post('resume/quiz/stream')
  @UseGuards(JwtAuthGuard)
  async resumeQuizStream(@Body() dto: ResumeQuizDto, @Request() req: any, @Res() res:Response) {
    const userId = req.user.userId
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用nginx缓存
    // 订阅进度事件
    const subscription = this.interviewService.generateResumeQuizWithProgress(userId, dto).subscribe({
      next: (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ type:'error', error: err.message })}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      },
    })

    // 客户端断开连接时取消订阅
    req.on('close', () => {
      subscription.unsubscribe();
    })
  }
}

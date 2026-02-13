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
import { response } from 'express';

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
}

import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  Res,
  Sse,
  Param,
  Get,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from './services/interview.service';
import { ResumeQuizDto } from './dto/resume-quiz.dto';
import {
  AnswerMockInterviewDto,
  StartMockInterviewDto,
} from './dto/mock-interview.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { ExchangePackageDto } from './dto/exchange-package.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('面试管理')
@ApiBearerAuth()
@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /**
   * 8.3-LangChain 实战-分析报告
   * @param body
   * @returns
   */
  @Post('/analyze-resume')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '分析简历' })
  async analyzeResume(
    @Body() body: { position: string; resume: string; jobDescription: string },
    @Request() req: any,
  ) {
    const result = await this.interviewService.analyzeResume(
      req.user.userId,
      body.position,
      body.resume,
      body.jobDescription,
    );

    return {
      code: 200,
      data: result,
    };
  }

  /**
   * 8.4-对话历史和上下文管理
   * @param body
   * @returns
   */
  @Post('/continue-conversation')
  @ApiOperation({ summary: '继续对话' })
  async continueConversation(
    @Body() body: { sessionId: string; question: string },
  ) {
    const result = await this.interviewService.continueConversation(
      body.sessionId,
      body.question,
    );

    return {
      code: 200,
      data: {
        response: result,
      },
    };
  }

  /**
   * 简历押题的接口
   */
  @Post('resume/quiz/stream')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '简历押题（流式响应）' })
  async resumeQuizStream(
    @Body() dto: ResumeQuizDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
    // 订阅进度事件
    const subscription = this.interviewService
      .generateResumeQuizWithProgress(userId, dto)
      .subscribe({
        next: (event) => {
          // 发送 SSE 事件
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        },
        error: (error) => {
          // 发送错误事件
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message,
            })}\n\n`,
          );
          res.end();
        },
        complete: () => {
          // 发送完成事件
          res.write(
            `data: ${JSON.stringify({
              type: 'complete',
            })}\n\n`,
          );
          // 完成后关闭连接
          res.end();
        },
      });

    // 客户端断开连接时取消订阅
    req.on('close', () => {
      subscription.unsubscribe();
    });
  }

  /**
   * 开始模拟面试 - SSE流式响应
   */
  @Post('mock/start')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '开始模拟面试（流式响应）' })
  async startMockInterview(
    @Body() dto: StartMockInterviewDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;

    // 设置 SSE 响应头
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
    res.setHeader('Access-Control-Allow-Origin', '*'); // 如果需要CORS

    // 发送初始注释，保持连接活跃
    res.write(': connected\n\n');
    // flush 数据（如果可用）
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    // 订阅进度事件
    const subscription = this.interviewService
      .startMockInterviewWithStream(userId, dto)
      .subscribe({
        next: (event) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
          // flush 数据（如果可用）
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        },
        error: (error) => {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message,
            })}\n\n`,
          );
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
          res.end();
        },
        complete: () => {
          res.end();
        },
      });

    // 客户端断开连接时取消订阅
    req.on('close', () => {
      subscription.unsubscribe();
    });
  }

  /**
   * 回答面试问题 - SSE流式响应
   */
  @Post('mock/answer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '回答面试问题（流式响应）' })
  async answerMockInterview(
    @Body() dto: AnswerMockInterviewDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;

    // 设置 SSE 响应头
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
    res.setHeader('Access-Control-Allow-Origin', '*'); // 如果需要CORS

    // 发送初始注释，保持连接活跃
    res.write(': connected\n\n');
    // flush 数据（如果可用）
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    // 订阅进度事件
    const subscription = this.interviewService
      .answerMockInterviewWithStream(userId, dto.sessionId, dto.answer)
      .subscribe({
        next: (event) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
          // flush 数据（如果可用）
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        },
        error: (error) => {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message,
            })}\n\n`,
          );
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
          res.end();
        },
        complete: () => {
          res.end();
        },
      });

    // 客户端断开连接时取消订阅
    req.on('close', () => {
      subscription.unsubscribe();
    });
  }

  /**
   * 结束面试（用户主动结束）
   */
  @Post('mock/end/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '结束面试' })
  async endMockInterview(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    await this.interviewService.endMockInterview(req.user.userId, resultId);

    return ResponseUtil.success({ resultId }, '面试已结束，正在生成分析报告');
  }

  /**
   * 暂停面试
   */
  @Post('mock/pause/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '暂停面试' })
  async pauseMockInterview(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const result = await this.interviewService.pauseMockInterview(
      req.user.userId,
      resultId,
    );

    return ResponseUtil.success(result, '面试已暂停，进度已保存');
  }

  /**
   * 恢复面试
   */
  @Post('mock/resume/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '恢复面试' })
  async resumeMockInterview(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const result = await this.interviewService.resumeMockInterview(
      req.user.userId,
      resultId,
    );

    return ResponseUtil.success(result, '面试已恢复，可以继续回答');
  }

  /**
   * 获取分析报告
   * 统一接口，根据 resultId 自动识别类型（简历押题/专项面试/综合面试）
   */
  @Get('analysis/report/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取分析报告' })
  async getAnalysisReport(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const report = await this.interviewService.getAnalysisReport(
      req.user.userId,
      resultId,
    );

    return ResponseUtil.success(report, '查询成功');
  }

  /**
   * 获取简历押题历史记录
   */
  @Get('resume/quiz/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取简历押题历史记录' })
  async getResumeQuizHistory(@Request() req: any) {
    const history = await this.interviewService.getResumeQuizHistory(
      req.user.userId,
    );
    return ResponseUtil.success(history, '获取成功');
  }

  /**
   * 获取专项面试历史记录
   */
  @Get('special/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取专项面试历史记录' })
  async getSpecialInterviewHistory(@Request() req: any) {
    const history = await this.interviewService.getSpecialInterviewHistory(
      req.user.userId,
    );
    return ResponseUtil.success(history, '获取成功');
  }

  /**
   * 获取综合面试历史记录
   */
  @Get('behavior/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取综合面试历史记录' })
  async getBehaviorInterviewHistory(@Request() req: any) {
    const history = await this.interviewService.getBehaviorInterviewHistory(
      req.user.userId,
    );
    return ResponseUtil.success(history, '获取成功');
  }

  /**
   * 获取简历押题结果详情
   */
  @Get('resume/quiz/result/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取简历押题结果详情' })
  async getResumeQuizResult(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const result = await this.interviewService.getResumeQuizResult(
      req.user.userId,
      resultId,
    );
    return ResponseUtil.success(result, '获取成功');
  }

  /**
   * 获取模拟面试问答列表
   */
  @Get('mock/result/:resultId/qa')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取模拟面试问答列表' })
  async getMockInterviewQA(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const qaList = await this.interviewService.getMockInterviewQA(
      req.user.userId,
      resultId,
    );
    return ResponseUtil.success(qaList, '获取成功');
  }

  /**
   * 获取模拟面试详情
   */
  @Get('mock/history/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取模拟面试详情' })
  async getMockInterviewHistory(
    @Param('resultId') resultId: string,
    @Request() req: any,
  ) {
    const result = await this.interviewService.getMockInterviewHistory(
      req.user.userId,
      resultId,
    );
    return ResponseUtil.success(result, '获取成功');
  }

  /**
   * 获取未完成的模拟面试
   */
  @Get('mock/unfinished')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取未完成的模拟面试' })
  async getUnfinishedMockInterviews(@Request() req: any) {
    const interviews = await this.interviewService.getUnfinishedMockInterviews(
      req.user.userId,
    );
    return ResponseUtil.success(interviews, '获取成功');
  }


  /**
   * 使用小麦币兑换套餐
   */
  @Post('exchange-package')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '使用小麦币兑换套餐' })
  async exchangePackage(@Body() dto: ExchangePackageDto, @Request() req: any) {
    const result = await this.interviewService.exchangePackage(
      req.user.userId,
      dto.packageType,
    );

    return ResponseUtil.success(result, result.message);
  }
}



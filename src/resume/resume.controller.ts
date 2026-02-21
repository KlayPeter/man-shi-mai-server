import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseUtil } from '../common/utils/response.util';
import { UploadResumeDto, DeleteResumeDto, UpdateResumeNameDto } from './dto/resume.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('简历管理')
@ApiBearerAuth()
@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get('getInterviewResumeList')
  @ApiOperation({ summary: '获取面试简历列表' })
  async getInterviewResumeList(@Request() req: any) {
    const resumes = await this.resumeService.getInterviewResumeList(req.user.userId);
    return ResponseUtil.success(resumes, '获取成功');
  }

  @Post('uploadResume')
  @ApiOperation({ summary: '上传简历' })
  async uploadResume(@Request() req: any, @Body() dto: UploadResumeDto) {
    const resume = await this.resumeService.uploadResume(req.user.userId, dto);
    return ResponseUtil.success(resume, '上传成功');
  }

  @Post('deleteResume')
  @ApiOperation({ summary: '删除简历' })
  async deleteResume(@Request() req: any, @Body() dto: DeleteResumeDto) {
    await this.resumeService.deleteResume(req.user.userId, dto.resumeId);
    return ResponseUtil.success(null, '删除成功');
  }

  @Post('updateResumeName')
  @ApiOperation({ summary: '更新简历名称' })
  async updateResumeName(@Request() req: any, @Body() dto: UpdateResumeNameDto) {
    const resume = await this.resumeService.updateResumeName(
      req.user.userId,
      dto.resumeId,
      dto.resumeName,
    );
    return ResponseUtil.success(resume, '更新成功');
  }
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadResumeDto {
  @ApiProperty({
    description: '简历文件的 URL 地址，通常是上传到 OSS 后返回的地址',
    example: 'https://example.oss.com/resumes/resume-123.pdf',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: '简历名称，用于在列表中显示和识别',
    example: '张三-前端开发-3年经验.pdf',
  })
  @IsString()
  @IsNotEmpty()
  resumeName: string;

  @ApiProperty({
    description: '上传时间，ISO 8601 格式',
    example: '2026-02-22T04:00:00.000Z',
  })
  @IsString()
  @IsNotEmpty()
  uploadTime: string;
}

export class DeleteResumeDto {
  @ApiProperty({
    description: '要删除的简历 ID',
    example: '507f1f77bcf86cd799439011',
  })
  resumeId: string;
}

export class UpdateResumeNameDto {
  @ApiProperty({
    description: '要更新的简历 ID',
    example: '507f1f77bcf86cd799439011',
  })
  resumeId: string;

  @ApiProperty({
    description: '新的简历名称',
    example: '张三-高级前端开发-5年经验.pdf',
  })
  resumeName: string;
}

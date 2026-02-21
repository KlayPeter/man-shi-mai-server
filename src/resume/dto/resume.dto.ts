import { IsString, IsNotEmpty } from 'class-validator';

export class UploadResumeDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  resumeName: string;

  @IsString()
  @IsNotEmpty()
  uploadTime: string;
}

export class DeleteResumeDto {
  resumeId: string;
}

export class UpdateResumeNameDto {
  resumeId: string;
  resumeName: string;
}

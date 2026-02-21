export class UploadResumeDto {
  url: string;
  resumeName: string;
  uploadTime: string;
}

export class DeleteResumeDto {
  resumeId: string;
}

export class UpdateResumeNameDto {
  resumeId: string;
  resumeName: string;
}

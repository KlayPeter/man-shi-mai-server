import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { UploadResumeDto, UpdateResumeNameDto } from './dto/resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: Model<ResumeDocument>,
  ) {}

  async getInterviewResumeList(userId: string) {
    return await this.resumeModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async uploadResume(userId: string, dto: UploadResumeDto) {
    console.log('uploadResume - userId:', userId);
    console.log('uploadResume - dto:', JSON.stringify(dto));
    const resume = new this.resumeModel({
      userId,
      resumeName: dto.resumeName,
      url: dto.url,
      uploadTime: new Date(dto.uploadTime),
    });
    return await resume.save();
  }

  async deleteResume(userId: string, resumeId: string) {
    const result = await this.resumeModel.findOneAndDelete({ _id: resumeId, userId });
    if (!result) {
      throw new NotFoundException('简历不存在');
    }
    return result;
  }

  async updateResumeName(userId: string, resumeId: string, resumeName: string) {
    const resume = await this.resumeModel.findOneAndUpdate(
      { _id: resumeId, userId },
      { resumeName },
      { new: true },
    );
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }
    return resume;
  }
}

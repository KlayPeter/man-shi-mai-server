import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './services/interview.service';
import { AIModule } from 'src/ai/ai.module';
import { ResumeAnalysisService } from './services/resume-analysis.service';
import { ConversationContinuationService } from './services/conversation-continuation.service';

@Module({
  imports: [
    AIModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService, ResumeAnalysisService, ConversationContinuationService],
  exports: [InterviewService],
})
export class InterviewModule {}

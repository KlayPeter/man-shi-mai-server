import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionManager } from 'src/ai/services/session.manager';
import { ResumeAnalysisService } from './resume-analysis.service';
import { ConversationContinuationService } from './conversation-continuation.service';
import { RESUME_ANALYSIS_SYSTEM_MESSAGE } from '../prompts/resume-analysis.prompts';

/**
 * 面试服务
 * 
 * 这个服务只关心业务逻辑和流程编排
 * 1. 创建会话
 * 2. 调用具体的分析服务（简历分析、对话继续等）
 * 3. 管理会话历史
 * 
 * 不关心具体的AI实现细节，那些交给专门的分析服务
*/
@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  constructor(
    private configService: ConfigService,
    private sessionManager: SessionManager,
    private resumeAnalysisService: ResumeAnalysisService,
    private conversationContinuationService: ConversationContinuationService,
    
  ) { }
  /**
   * 分析简历(首轮，创建会话)
   * 
   * @param userId - 用户ID
   * @param position - 职位
   * @param resumeContent - 简历内容
   * @param jobDescription - 岗位要求
   * @returns - 分析结果和sessionId
   * */
  async analyzeResume(userId: string, position: string, resumeContent: string, jobDescription: string) {
    try {
      // 1. 创建新建会话
      const systemMessage = RESUME_ANALYSIS_SYSTEM_MESSAGE(position);
      const sessionId = await this.sessionManager.createSession(userId, position,systemMessage);
      this.logger.log(`创建会话：${sessionId}`)

      // 2. 调用简历分析服务
      const result = await this.resumeAnalysisService.analyze(resumeContent, jobDescription);
      
      // 3. 保存用户输入到会话历史
      this.sessionManager.addMessage(
        sessionId,
        'user',
        `简历内容： ${resumeContent}`
      )

      // 4. 保存AI的回答到会话历史
      this.sessionManager.addMessage(
        sessionId,
        'assistant',
        JSON.stringify(result)
      )
      this.logger.log(`简历分析完成, sessionId: ${sessionId}`)
      return {
        sessionId,
        analysis: result
      }
    } catch (err) {
      this.logger.error(`分析简历失败：${err}`);
      throw err;
    }
  }

  /**
   * 继续对话
   * 
   * @param sessionId - 会话ID
   * @param userQuestion - 用户输入
   * @returns - AI的回答
   * */
  async continueConversation(sessionId: string, userQuestion: string):Promise<string>{
    try {
      // 1. 添加用户问题到会话历史
      this.sessionManager.addMessage(sessionId,'user',userQuestion)
      // 2. 获取对话历史
      const history = this.sessionManager.getRecentMessages(sessionId, 10)
      this.logger.log(
        `继续对话，sessionId: ${sessionId}, 历史消息数： ${history.length}`
      )

      // 3. 调用专门的对话继续服务
      const aiResponse = await this.conversationContinuationService.continue(history)

      // 4. 保存AI的回答到会话历史
      this.sessionManager.addMessage(sessionId, 'assistant', aiResponse)
      
      this.logger.log(`继续对话完成, sessionId: ${sessionId}`)
      return aiResponse
 
    } catch (err) {
      this.logger.error(`继续对话失败：${err}`);
      throw err;
    }
  }
}

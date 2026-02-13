import { Injectable, Logger } from "@nestjs/common";
import { PromptTemplate } from "@langchain/core/prompts";
import { AIModelFactory } from "src/ai/services/ai-model.factory";
import { Message } from '../../ai/interfaces/message.interface'
import { CONVERSATION_CONTINUATION_PROMPT } from "../prompts/resume-analysis.prompts";

/**
 * 对话继续服务
 *
 * 这个服务负责在已有的对话历史基础上，继续对话的 AI Chain。
 */
@Injectable()
export class ConversationContinuationService {
  private readonly logger = new Logger(ConversationContinuationService.name);

  constructor(private readonly aiModelFactory: AIModelFactory) { }
  /**
   * 基于对话历史继续对话
   * 
   * @param history 对话历史(Message数组)
   * @returns AI生成的对话内容
  */
  async continue(history: Message[]): Promise<string> { 
    // 1. 创建prompt模板
    const prompt = PromptTemplate.fromTemplate(CONVERSATION_CONTINUATION_PROMPT);
    // 2. 获取模型
    const model = this.aiModelFactory.createDefaultModel()
    // 3. 组建链
    const chain = prompt.pipe(model)
    
    try {
      this.logger.log(`继续对话，历史消息数：${history.length}}`)
      // 4. 调用链
      const response = await chain.invoke({
        history: history.map((message) =>`${message.role}: ${message.content}`).join('\n\n')
      })

      // 5. 获取回答内容
      const aiResponse = response.content as string
      this.logger.log('对话继续完成')
      return aiResponse
    } catch (err) {
      this.logger.error(`继续对话失败，错误信息：${err.message}`)
      throw err
    }
  }
}
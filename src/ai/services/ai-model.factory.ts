import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatDeepSeek } from "@langchain/deepseek"

/**
 * AI 模型工厂服务
 *
 * 这个服务负责初始化和管理 AI 模型。
 * 所有的模型初始化逻辑都集中在这里。
 *
 * 好处：
 * - 集中管理：所有模型配置都在一个地方
 * - 易于切换：以后要换模型（比如从 DeepSeek 换成 OpenAI），只需要改这个文件
 * - 易于复用：任何服务都可以使用这个工厂来获取模型
 * - 易于测试：可以单独测试模型初始化逻辑
 *
 * 如何在其他服务中使用？
 *
 * @Injectable()
 * export class QuizService {
 *   constructor(
 *     private aiModelFactory: AIModelFactory
 *   ) {}
 *
 *   async generateQuiz() {
 *     const model = this.aiModelFactory.createDefaultModel();
 *     // 使用 model
 *   }
 * }
 */

@Injectable()
export class AIModelFactory {
  private readonly logger = new Logger(AIModelFactory.name)

  constructor(private readonly configService: ConfigService) { }

    /**
   * 创建默认的 AI 模型
   *
   * 这是最常用的模型初始化方法。
   * 返回一个配置好的 ChatDeepSeek 实例。
   *
   * 参数都来自环境变量，这样可以根据部署环境灵活配置：
   * - DEEPSEEK_API_KEY：API 密钥
   * - DEEPSEEK_MODEL：模型名称（deepseek-chat 或 deepseek-reasoner）
   * - DEEPSEEK_TEMPERATURE：温度参数（控制随机性）
   * - DEEPSEEK_MAX_TOKENS：最大 Token 数
   */
  createDefaultModel() {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY')
    if(!apiKey) {
      throw new Error('DEEPSEEK_API_KEY 不存在')
    }

    // deepseek-reasoner是深度搜索
    // deepseek-chat是快速聊天
    return new ChatDeepSeek({
      apiKey: apiKey || '',
      model: this.configService.get<string>('DEEPSEEK_MODEL') || 'deepseek-chat',
      temperature: Number(this.configService.get<string>('DEEPSEEK_TEMPERATURE')) || 0.7,
      maxTokens:Number(this.configService.get<string>('DEEPSEEK_MAX_TOKENS')) || 4000
    })
  }

  // 创建用于稳定输出的环境（评估场景）

  createStableModel(): ChatDeepSeek {
    const baseModel = this.createDefaultModel()
    return new ChatDeepSeek({
      apiKey: this.configService.get<string>('DEEPSEEK_API_KEY') || '',
      model: baseModel.model,
      temperature: 0.3,
      maxTokens: 4000
    })
  }

  /**
   * 创建用于创意输出的模型（生成场景）
   *
   * 有些场景需要 AI 的输出更多样化、更有创意（比如生成题目、生成文案）。
   * 这个方法创建一个 temperature 较高的模型。
   */
  createCreativeModel(): ChatDeepSeek {
    const baseModel = this.createDefaultModel()
    return new ChatDeepSeek({
      apiKey: this.configService.get<string>('DEEPSEEK_API_KEY') || '',
      model: baseModel.model,
      temperature: 0.9,
      maxTokens: 4000
    })
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { AIModelFactory } from 'src/ai/services/ai-model.factory';
import {PromptTemplate} from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { ConfigService } from '@nestjs/config';
import { RESUME_QUIZ_PROMPT } from '../prompts/resume-quiz.prompts';


@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  constructor(
    private configService: ConfigService,
    private aiModelFactory: AIModelFactory,
  ) { }
  /**
   * 分析简历并生成报告
   * 
   * @param resumeContent - 简历的文本内容
   * @param jobDescription - 岗位要求
   * @return - 分析报告
   * */
  async analyzeResume(resumeContent: string, jobDescription: string) {
    // 创建Prompt模板
    const prompt = PromptTemplate.fromTemplate(RESUME_QUIZ_PROMPT)
    
    // 通过工厂获取模型（而不是自己初始化
    const model = this.aiModelFactory.createDefaultModel()

    // 创建输出解析器
    const parser = new JsonOutputParser()

    // 创建链：Prompt -> Model -> OutputParser
    const chain = prompt.pipe(model).pipe(parser)
    
    // 调用链
    try {
      this.logger.log(`开始分析简历...`)
      const result = await chain.invoke({
        resume_content: resumeContent,
        job_description: jobDescription
      })

      this.logger.log(`简历分析完成`)
      return result
    } catch (error) {
      this.logger.error(`简历分析失败: ${error}`)
      throw error
    }
  }
}

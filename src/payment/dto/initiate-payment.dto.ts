import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Min,
  IsNumber,
} from 'class-validator';
import { PaymentChannel } from '../payment.types';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '订单ID（可选），如果不提供系统会自动生成',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false
  })
  orderId?: string;

  // 支持小数，最小值为0.01
  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '订单金额（单位：元），最小值为0.01。custom套餐支持1-10000元，其他套餐有固定金额：single=18.8, pro=28.8, max=68.8, ultra=128.8',
    example: 28.8,
    minimum: 0.01,
    required: true
  })
  amount: number;

  @IsIn(['custom', 'single', 'pro', 'max', 'ultra'])
  @ApiProperty({
    description: '套餐ID，可选值：custom(自定义充值), single(单次面试), pro(专业版), max(旗舰版), ultra(至尊版)',
    example: 'pro',
    enum: ['custom', 'single', 'pro', 'max', 'ultra'],
    required: true
  })
  planId: string;

  @IsString()
  @ApiProperty({
    description: '套餐名称，用于显示在订单详情中',
    example: '专业版套餐',
    required: true
  })
  planName: string;

  // 来源，web, h5
  @IsIn(['web', 'h5'])
  @ApiProperty({
    description: '订单来源，标识用户从哪个端发起支付。web=网页端, h5=移动端',
    example: 'web',
    enum: ['web', 'h5'],
    required: true
  })
  source: string;

  @IsString()
  @ApiProperty({
    description: '订单描述，用于说明本次购买的内容',
    example: '购买专业版套餐-包含简历分析+专项面试+行为面试',
    required: true
  })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '订单货币类型，默认为CNY（人民币）',
    example: 'CNY',
    default: 'CNY',
    required: false
  })
  currency?: string;

  @IsEnum(PaymentChannel)
  @ApiProperty({
    description: '支付渠道，目前支持：ALIPAY(支付宝), WECHAT(微信支付), VIRTUAL(虚拟支付-测试用)',
    example: 'ALIPAY',
    enum: PaymentChannel,
    required: true
  })
  channel: PaymentChannel;

  @IsOptional()
  @ApiProperty({
    description: '订单元数据，可以存储额外的业务信息（JSON对象）',
    example: { userId: '123', campaignId: 'spring2026' },
    required: false
  })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '支付成功后的回调通知URL，如果不提供则使用系统默认配置',
    example: 'https://api.example.com/payment/callback',
    required: false
  })
  notifyUrl?: string;
}

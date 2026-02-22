import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPaymentStatusDto {
  @ApiProperty({
    description: '订单ID，创建支付订单时返回的唯一标识',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: true
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: '支付渠道，必须与创建订单时使用的渠道一致。alipay=支付宝, wechat=微信支付',
    example: 'alipay',
    enum: ['alipay', 'wechat'],
    required: true
  })
  @IsIn(['alipay', 'wechat'])
  channel: string;
}

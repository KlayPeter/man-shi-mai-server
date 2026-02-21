import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { QueryPaymentStatusDto } from './dto/query-payment-status.dto';
import { PaymentChannel } from './payment.types';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * 一个简单的小"保障"。比之前的版本（@Request() req: any,）更严格一些。相当于在 Request 上做了一个扩展（表示可能存在 user 字段）
 */
type AuthenticatedRequest = Request & { user?: { userId?: string } };

@ApiTags('支付管理')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建支付订单
   * @param dto 支付订单信息
   * @returns 支付订单结果
   */
  @Post('order')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建支付订单' })
  initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.initiatePayment(dto, req.user);
  }

  /**
   * 主动查询支付结果
   * 3 ～ 5 秒轮询调用，根据订单号查看支付宝支付结果
   */
  @Post('order/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '查询支付状态' })
  queryAlipayPaymentStatus(
    @Body() dto: QueryPaymentStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // 支付宝的支付查询
    if (dto.channel === PaymentChannel.ALIPAY) {
      return this.paymentService.queryAlipayPaymentStatus(
        dto.orderId,
        req.user as { userId: string },
      );
    }
    // // 微信的支付查询
    // else if (dto.channel === PaymentChannel.WECHAT) {
    //   return this.paymentService.queryWechatPaymentStatus(
    //     dto.orderId,
    //     req.user as { userId: string },
    //   );
    // }
  }

  @Post('mock-success')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '模拟支付成功' })
  mockPaymentSuccess(
    @Body() body: { orderId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.mockPaymentSuccess(
      body.orderId,
      req.user as { userId: string },
    );
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PaymentOrderPayload, PaymentChannel } from '../payment.types';

/**
 * 虚拟支付服务
 * 模拟支付宝支付流程，用于测试
 */
@Injectable()
export class VirtualPaymentService {
  private readonly logger = new Logger(VirtualPaymentService.name);
  
  // 存储订单金额的内存映射（生产环境应该用数据库）
  private orderAmountMap: Map<string, number> = new Map();

  /**
   * 发起虚拟支付
   * @param payload 支付订单信息
   * @returns 虚拟支付结果（包含二维码URL）
   */
  async initiatePayment(payload: PaymentOrderPayload) {
    this.logger.log(
      `创建虚拟支付订单: orderId=${payload.orderId}, amount=${payload.amount}`,
    );

    // 存储订单金额
    this.orderAmountMap.set(payload.orderId, payload.amount);

    // 返回虚拟支付结果
    return {
      channel: PaymentChannel.ALIPAY,
      orderId: payload.orderId,
      // 虚拟二维码URL（可以是一个测试页面）
      codeUrl: `http://localhost:3000/payment/virtual-qrcode?orderId=${payload.orderId}&amount=${payload.amount}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 查询虚拟支付结果
   * @param orderId 订单ID
   * @returns 虚拟支付查询结果（始终返回成功）
   */
  async queryTrade(orderId: string) {
    this.logger.log(`查询虚拟支付订单: orderId=${orderId}`);

    // 获取订单金额
    const amount = this.orderAmountMap.get(orderId) || 0.01;
    const amountStr = amount.toString();

    // 模拟支付宝返回的数据结构
    return {
      tradeStatus: 'TRADE_SUCCESS',
      tradeNo: `VIRTUAL_${orderId}`,
      outTradeNo: orderId,
      buyerLogonId: '虚拟用户',
      totalAmount: amountStr,
      receiptAmount: amountStr,
      buyerPayAmount: amountStr,
      pointAmount: '0.00',
      invoiceAmount: amountStr,
      sendPayDate: new Date().toISOString(),
    };
  }
}

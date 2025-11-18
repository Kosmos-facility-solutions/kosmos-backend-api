import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { Injectable } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentProvider, PaymentStatus } from './entities/payment.entity';

export interface PaymentGatewaySessionInput {
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentGatewaySession {
  providerPaymentId: string;
  status: PaymentStatus;
  paymentUrl: string;
  expiresAt?: Date;
  rawResponse?: Record<string, unknown>;
}

export interface PaymentGatewayWebhookEvent {
  providerPaymentId: string;
  status: PaymentStatus;
  receiptUrl?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  amount?: number;
  currency?: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  getDefaultProvider(): PaymentProvider | string {
    return config.paymentGateway?.provider || PaymentProvider.Stripe;
  }

  getDefaultCurrency(): string {
    return config.paymentGateway?.currency || 'USD';
  }

  async createCheckoutSession(
    input: PaymentGatewaySessionInput,
  ): Promise<PaymentGatewaySession> {
    const providerPaymentId = `pay_${randomUUID()}`;
    const paymentUrl =
      input.successUrl ||
      config.paymentGateway?.checkoutUrl ||
      `${config.urls.baseFrontEndURL}/payments/checkout?payment=${providerPaymentId}`;

    this.logger.log(
      `Created payment session ${providerPaymentId} for ${input.amount} ${input.currency}`,
    );

    return {
      providerPaymentId,
      status: PaymentStatus.Pending,
      paymentUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      rawResponse: {
        provider: this.getDefaultProvider(),
        ...input,
      },
    };
  }

  async verifyWebhookSignature(
    rawBody: string,
    signature?: string,
  ): Promise<boolean> {
    const secret = config.paymentGateway?.webhookSecret;
    if (!secret || !signature) {
      return true;
    }

    const digest = createHmac('sha256', secret)
      .update(rawBody || '')
      .digest('hex');

    return digest === signature;
  }

  normalizeStatus(status?: string): PaymentStatus {
    if (!status) {
      return PaymentStatus.Pending;
    }
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return PaymentStatus.Succeeded;
      case 'processing':
      case 'in_progress':
        return PaymentStatus.Processing;
      case 'requires_action':
      case 'requires_payment_method':
        return PaymentStatus.RequiresAction;
      case 'failed':
      case 'declined':
        return PaymentStatus.Failed;
      case 'canceled':
      case 'cancelled':
        return PaymentStatus.Canceled;
      case 'refunded':
        return PaymentStatus.Refunded;
      default:
        return PaymentStatus.Pending;
    }
  }

  parseWebhookEvent(dto: PaymentWebhookDto): PaymentGatewayWebhookEvent {
    const status =
      dto.status ||
      this.normalizeStatus(dto.eventType || (dto.data?.status as string));

    return {
      providerPaymentId: dto.providerPaymentId,
      status,
      receiptUrl:
        dto.receiptUrl || (dto.data?.receipt_url as string) || undefined,
      failureReason:
        dto.failureReason || (dto.data?.failure_reason as string) || undefined,
      metadata: dto.metadata || dto.data,
      amount: dto.amount || Number(dto.data?.amount ?? 0) || undefined,
      currency: dto.currency || (dto.data?.currency as string) || undefined,
    };
  }
}

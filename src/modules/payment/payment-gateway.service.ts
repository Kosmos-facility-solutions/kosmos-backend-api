import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
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
  providerCustomerId?: string;
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
  providerCustomerId?: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private stripeClient: Stripe;

  getDefaultProvider(): PaymentProvider | string {
    return config.paymentGateway?.provider || PaymentProvider.Stripe;
  }

  getDefaultCurrency(): string {
    return config.paymentGateway?.currency || 'USD';
  }

  private getStripeClient(): Stripe {
    if (this.stripeClient) {
      return this.stripeClient;
    }

    const secretKey = config.paymentGateway?.secretKey;

    if (!secretKey) {
      throw new Error(
        'Stripe secret key is not configured. Set PAYMENT_GATEWAY_SECRET_KEY or STRIPE_SECRET_KEY.',
      );
    }

    this.stripeClient = new Stripe(secretKey);

    return this.stripeClient;
  }

  private formatMetadata(
    metadata?: Record<string, unknown>,
  ): Record<string, string> | undefined {
    if (!metadata) {
      return undefined;
    }

    return Object.entries(metadata).reduce(
      (acc, [key, value]) => {
        if (value === undefined || value === null) {
          return acc;
        }
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  async createCheckoutSession(
    input: PaymentGatewaySessionInput,
  ): Promise<PaymentGatewaySession> {
    const stripe = this.getStripeClient();

    const successUrl = input.successUrl || config.paymentGateway?.successUrl;
    const cancelUrl = input.cancelUrl || config.paymentGateway?.cancelUrl;

    if (!successUrl || !cancelUrl) {
      throw new Error(
        'Payment success or cancel URL is not configured. Set PAYMENT_GATEWAY_SUCCESS_URL and PAYMENT_GATEWAY_CANCEL_URL.',
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: input.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency,
            unit_amount: Math.round(input.amount * 100),
            product_data: {
              name: input.description || 'Kosmos Service Payment',
            },
          },
        },
      ],
      metadata: this.formatMetadata(input.metadata),
    });

    this.logger.log(
      `Stripe checkout session ${session.id} created for ${input.amount} ${input.currency}`,
    );

    return {
      providerPaymentId: session.id,
      status: PaymentStatus.Pending,
      paymentUrl: session.url,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
      providerCustomerId:
        typeof session.customer === 'string' ? session.customer : undefined,
      rawResponse: session as unknown as Record<string, unknown>,
    };
  }

  constructEventFromWebhook(
    rawBody: Buffer | string,
    signature: string,
  ): Stripe.Event {
    const secret = config.paymentGateway?.webhookSecret;
    if (!secret) {
      throw new Error(
        'Stripe webhook secret is not configured. Set PAYMENT_GATEWAY_WEBHOOK_SECRET.',
      );
    }

    if (!signature) {
      throw new Error('Stripe webhook signature header is missing.');
    }

    const stripe = this.getStripeClient();

    return stripe.webhooks.constructEvent(rawBody, signature, secret);
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
      case 'open':
      case 'unpaid':
        return PaymentStatus.Pending;
      default:
        return PaymentStatus.Pending;
    }
  }

  parseWebhookEvent(event: Stripe.Event): PaymentGatewayWebhookEvent | null {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      let failureReason: string = null;
      if (event.type === 'checkout.session.async_payment_failed') {
        failureReason = 'Stripe reported async payment failure.';
      } else if (session.payment_status === 'unpaid') {
        failureReason = 'Payment was not completed.';
      }

      return {
        providerPaymentId: session.id,
        status: this.normalizeStatus(session.payment_status),
        receiptUrl: undefined,
        failureReason,
        metadata: session.metadata ? { ...session.metadata } : undefined,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
        currency: session.currency?.toUpperCase(),
        providerCustomerId:
          typeof session.customer === 'string' ? session.customer : undefined,
      };
    }

    this.logger.debug(
      `Received unsupported Stripe event type ${event.type}, ignoring.`,
    );
    return null;
  }
}

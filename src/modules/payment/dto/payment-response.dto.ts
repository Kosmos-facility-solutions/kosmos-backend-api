import { Payment, PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
  id: number;
  userId: number;
  serviceRequestId?: number;
  contractId?: number;
  status: PaymentStatus;
  provider: string;
  channel?: string;
  amount: number;
  currency: string;
  description?: string;
  reference: string;
  paymentUrl?: string;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  providerPaymentId?: string;
  providerCustomerId?: string;
  failureReason?: string;
  paidAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  static fromPayment(payment: Payment): PaymentResponseDto;
  static fromPayment(payment: Payment[]): PaymentResponseDto[];
  static fromPayment(
    payment: Payment | Payment[],
  ): PaymentResponseDto | PaymentResponseDto[] {
    if (Array.isArray(payment)) {
      return payment.map((item) => this.mapPayment(item));
    }
    return this.mapPayment(payment);
  }

  private static mapPayment(payment: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = payment.id;
    dto.userId = payment.userId;
    dto.serviceRequestId = payment.serviceRequestId;
    dto.contractId = payment.contractId;
    dto.status = payment.status;
    dto.provider = payment.provider;
    dto.channel = payment.channel;
    dto.amount = Number(payment.amount);
    dto.currency = payment.currency;
    dto.description = payment.description;
    dto.reference = payment.reference;
    dto.paymentUrl = payment.paymentUrl;
    dto.receiptUrl = payment.receiptUrl;
    dto.metadata = payment.metadata;
    dto.providerPaymentId = payment.providerPaymentId;
    dto.providerCustomerId = payment.providerCustomerId;
    dto.failureReason = payment.failureReason;
    dto.paidAt = payment.paidAt;
    dto.expiresAt = payment.expiresAt;
    dto.createdAt = payment.createdAt;
    dto.updatedAt = payment.updatedAt;
    return dto;
  }
}

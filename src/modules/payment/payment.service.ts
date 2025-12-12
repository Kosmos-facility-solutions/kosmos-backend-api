import { PaginatedDto } from '@common/dto/paginated.dto';
import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IJwtPayload } from '@modules/auth/auth.service';
import { ContractRepository } from '@modules/contract/contract.repository';
import {
  Contract,
  PaymentFrequency,
} from '@modules/contract/entities/contract.entity';
import { MailingService } from '@modules/email/email.service';
import { ROLES } from '@modules/role/enums/roles.enum';
import { ServiceRequestRepository } from '@modules/serviceRequest/serviceRequest.repository';
import { UserRepository } from '@modules/user/user.repository';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import {
  Payment,
  PaymentProvider,
  PaymentStatus,
} from './entities/payment.entity';
import {
  PaymentGatewayService,
  PaymentGatewayWebhookEvent,
} from './payment-gateway.service';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly serviceRequestRepository: ServiceRequestRepository,
    private readonly contractRepository: ContractRepository,
    private readonly userRepository: UserRepository,
    private readonly mailingService: MailingService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    currentUser: IJwtPayload,
  ): Promise<PaymentResponseDto> {
    const { serviceRequest, contract, user, description, defaultAmount } =
      await this.resolvePaymentContext(createPaymentDto);

    if (!serviceRequest && !contract && !user) {
      throw new BadRequestException(
        'A serviceRequestId, contractId or userId must be provided',
      );
    }

    if (!user) {
      throw new BadRequestException(
        'Unable to determine the customer that will pay this invoice',
      );
    }

    if (
      currentUser &&
      !this.isAdmin(currentUser) &&
      currentUser.id !== user.id
    ) {
      throw new ForbiddenException(
        'You are not allowed to create payments for other users',
      );
    }

    const resolvedAmount =
      Number(createPaymentDto.amount ?? defaultAmount ?? 0) || 0;
    const numericAmount = Number(resolvedAmount.toFixed(2));

    if (!numericAmount || numericAmount <= 0) {
      throw new BadRequestException('A positive amount is required');
    }

    const currency =
      createPaymentDto.currency ||
      this.paymentGatewayService.getDefaultCurrency();

    const provider =
      createPaymentDto.provider ||
      (this.paymentGatewayService.getDefaultProvider() as PaymentProvider);

    if (contract?.id) {
      const hasActivePayment =
        await this.paymentRepository.hasActivePaymentForContract(
          contract.id,
        );

      if (hasActivePayment) {
        throw new BadRequestException(
          'An active payment already exists for this contract',
        );
      }
    }

    const session = await this.paymentGatewayService.createCheckoutSession({
      amount: numericAmount,
      currency,
      description,
      customerEmail: user.email,
      metadata: {
        serviceRequestId: serviceRequest?.id,
        contractId: contract?.id,
        ...(createPaymentDto.metadata || {}),
      },
      successUrl:
        createPaymentDto.successUrl || config.paymentGateway?.successUrl,
      cancelUrl: createPaymentDto.cancelUrl || config.paymentGateway?.cancelUrl,
    });

    const payment = await this.paymentRepository.create({
      userId: user.id,
      serviceRequestId: serviceRequest?.id,
      contractId: contract?.id,
      amount: numericAmount,
      currency,
      status: session.status,
      provider,
      channel: createPaymentDto.channel,
      description,
      reference: this.generateReference(),
      metadata: {
        serviceRequestId: serviceRequest?.id,
        contractId: contract?.id,
        ...(createPaymentDto.metadata || {}),
        gatewayResponse: session.rawResponse,
      },
      paymentUrl: session.paymentUrl,
      providerPaymentId: session.providerPaymentId,
      providerCustomerId: session.providerCustomerId || null,
      expiresAt: session.expiresAt,
    });

    this.logger.log(
      `Payment ${payment.reference} created for user #${user.id} (${numericAmount} ${currency})`,
    );

    const detailedPayment = await this.paymentRepository.findDetailedById(
      payment.id,
    );

    if (createPaymentDto.sendEmail !== false) {
      await this.safeSendPaymentLink(detailedPayment);
    }

    return PaymentResponseDto.fromPayment(payment) as PaymentResponseDto;
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<Payment>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<PaymentResponseDto>> {
    const paginatedPayments =
      await this.paymentRepository.findAndCountAll(options);
    return {
      ...paginatedPayments,
      data: PaymentResponseDto.fromPayment(
        paginatedPayments.data,
      ) as PaymentResponseDto[],
    };
  }

  async findForUser(userId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return PaymentResponseDto.fromPayment(payments) as PaymentResponseDto[];
  }

  async findOne(
    id: number,
    currentUser: IJwtPayload,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findDetailedById(id);

    if (
      currentUser &&
      !this.isAdmin(currentUser) &&
      payment.userId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You do not have access to this payment record',
      );
    }

    return PaymentResponseDto.fromPayment(payment) as PaymentResponseDto;
  }

  async handleWebhook(rawBody: Buffer | string, signature: string) {
    let event: PaymentGatewayWebhookEvent;
    let stripeEventType: string = null;
    try {
      const stripeEvent = this.paymentGatewayService.constructEventFromWebhook(
        rawBody,
        signature,
      );
      stripeEventType = stripeEvent.type;
      const parsedEvent =
        this.paymentGatewayService.parseWebhookEvent(stripeEvent);

      if (!parsedEvent) {
        this.logger.debug(
          `No payment mapping for Stripe event ${stripeEvent.type}.`,
        );
        return { ignored: true };
      }

      event = parsedEvent;
    } catch (error) {
      this.logger.error(`Failed to parse Stripe webhook event: ${error}`);
      throw new UnauthorizedException('Invalid webhook payload');
    }

    let payment: Payment;
    try {
      payment = await this.paymentRepository.findByProviderPaymentId(
        event.providerPaymentId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `Payment not found for providerPaymentId ${event.providerPaymentId} (event: ${stripeEventType})`,
        );
        return { ignored: true };
      }
      throw error;
    }

    const updatePayload: Partial<Payment> = {
      status: event.status,
      receiptUrl: event.receiptUrl || payment.receiptUrl,
      failureReason: event.failureReason,
      metadata: {
        ...(payment.metadata || {}),
        lastWebhook: event.metadata,
      },
    };

    if (
      event.status === PaymentStatus.Succeeded ||
      event.status === PaymentStatus.Refunded
    ) {
      updatePayload.paidAt = new Date();
      updatePayload.failureReason = null;
    }

    if (
      event.status !== PaymentStatus.Failed &&
      event.status !== PaymentStatus.Canceled
    ) {
      updatePayload.failureReason = null;
    }

    if (event.amount) {
      updatePayload.amount = event.amount;
    }

    if (event.currency) {
      updatePayload.currency = event.currency;
    }

    if (event.providerCustomerId) {
      updatePayload.providerCustomerId = event.providerCustomerId;
    }

    const updatedPayment = await this.paymentRepository.update(
      payment.id,
      updatePayload,
    );

    const detailedPayment = await this.paymentRepository.findDetailedById(
      updatedPayment.id,
    );

    await this.dispatchPaymentNotifications(detailedPayment, event);

    return { received: true };
  }

  private async resolvePaymentContext(dto: CreatePaymentDto) {
    let serviceRequest = null;
    let contract: Contract = null;
    let user = null;
    let description = dto.description;
    let defaultAmount = dto.amount;

    if (dto.serviceRequestId) {
      serviceRequest = await this.serviceRequestRepository.findOneById(
        dto.serviceRequestId,
        [
          { association: 'user' },
          { association: 'service' },
          { association: 'property' },
        ],
      );
      user = serviceRequest.user;
      defaultAmount = defaultAmount ?? Number(serviceRequest.estimatedPrice);

      if (!description) {
        description = `Service Request #${serviceRequest.id} payment`;
      }
    }

    if (dto.contractId) {
      contract = await this.contractRepository.findOneById(dto.contractId, [
        { association: 'client' },
        { association: 'property' },
        { association: 'serviceRequest' },
      ]);
      user = user ?? contract.client;
      defaultAmount = defaultAmount ?? Number(contract.paymentAmount);

      if (!description) {
        description = `Contract ${contract.contractNumber} payment`;
      }
    }

    if (!user && dto.userId) {
      user = await this.userRepository.findOneById(dto.userId);
    }

    if (!user && dto.customerEmail) {
      try {
        user = await this.userRepository.findOne({
          where: { email: dto.customerEmail },
        });
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    return {
      serviceRequest,
      contract,
      user,
      description:
        description || `Payment ${new Date().toISOString().split('T')[0]}`,
      defaultAmount,
    };
  }

  private async dispatchPaymentNotifications(
    payment: Payment,
    event: PaymentGatewayWebhookEvent,
  ) {
    if (event.status === PaymentStatus.Succeeded) {
      await this.safeTouchContract(payment);
      await this.mailingService.sendPaymentReceiptEmail(payment);
    } else if (
      event.status === PaymentStatus.Failed ||
      event.status === PaymentStatus.Canceled
    ) {
      await this.mailingService.sendPaymentFailedEmail(
        payment,
        event.failureReason,
      );
    }
  }

  private async safeTouchContract(payment: Payment) {
    if (!payment.contractId) {
      return;
    }

    const contract = await this.contractRepository.findOneById(
      payment.contractId,
    );

    const nextPaymentDue = this.calculateNextPaymentDue(contract);

    await this.contractRepository.update(contract.id, {
      lastPaymentDate: new Date(),
      nextPaymentDue,
    });
  }

  private calculateNextPaymentDue(contract: Contract): Date | null {
    if (!contract?.nextPaymentDue) {
      if (contract.paymentFrequency === PaymentFrequency.OneTime) {
        return null;
      }
      return new Date();
    }

    const baseDate = new Date(contract.nextPaymentDue);
    switch (contract.paymentFrequency) {
      case PaymentFrequency.Weekly:
        baseDate.setDate(baseDate.getDate() + 7);
        break;
      case PaymentFrequency.BiWeekly:
        baseDate.setDate(baseDate.getDate() + 14);
        break;
      case PaymentFrequency.Monthly:
        baseDate.setMonth(baseDate.getMonth() + 1);
        break;
      case PaymentFrequency.Quarterly:
        baseDate.setMonth(baseDate.getMonth() + 3);
        break;
      default:
        return null;
    }
    return baseDate;
  }

  private generateReference(): string {
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `PAY-${Date.now()}-${random}`;
  }

  private async safeSendPaymentLink(payment: Payment) {
    try {
      await this.mailingService.sendPaymentLinkEmail(payment);
    } catch (error) {
      this.logger.error(
        `Failed to send payment link email for payment #${payment.id}: ${error}`,
      );
    }
  }

  private isAdmin(user: IJwtPayload): boolean {
    return user?.roles?.some((role) => role.name === ROLES.ADMIN) || false;
  }
}

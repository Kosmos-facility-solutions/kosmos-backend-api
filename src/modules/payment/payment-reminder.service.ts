import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { ContractRepository } from '@modules/contract/contract.repository';
import { Contract } from '@modules/contract/entities/contract.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format } from 'date-fns';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';

const REMINDER_CRON = CronExpression.EVERY_10_MINUTES;

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);
  private readonly leadDays: number;

  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
  ) {
    this.leadDays = Number(config.paymentGateway?.reminderDays ?? 7);
  }

  @Cron(REMINDER_CRON)
  async handlePaymentReminders() {
    await this.handleUpcomingContracts();
    await this.handleOverdueContracts();
  }

  private async handleUpcomingContracts() {
    if (this.leadDays <= 0) {
      return;
    }

    const contracts =
      await this.contractRepository.findContractsWithUpcomingPayments(
        this.leadDays,
      );

    await this.createPendingPaymentsForContracts(contracts, 'upcoming');
  }

  private async handleOverdueContracts() {
    const contracts =
      await this.contractRepository.findContractsWithOverduePayments();

    await this.createPendingPaymentsForContracts(contracts, 'overdue');
  }

  private async createPendingPaymentsForContracts(
    contracts: Contract[],
    reminderType: 'upcoming' | 'overdue',
  ) {
    for (const contract of contracts) {
      if (!contract.nextPaymentDue) {
        continue;
      }

      try {
        const hasActivePayment =
          await this.paymentRepository.hasActivePaymentForContract(contract.id);

        if (hasActivePayment) {
          continue;
        }

        await this.paymentService.create(
          {
            contractId: contract.id,
            sendEmail: true,
            metadata: {
              reminderType,
              dueDate: format(new Date(contract.nextPaymentDue), 'yyyy-MM-dd'),
            },
          },
          null,
        );

        this.logger.log(
          `Payment reminder created for contract #${contract.id} (${reminderType}).`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create reminder for contract #${contract.id}: ${error}`,
        );
      }
    }
  }
}

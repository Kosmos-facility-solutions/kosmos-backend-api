import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import {
  DEFAULT_PAYMENT_REMINDER_LEAD_DAYS,
  PAYMENT_REMINDER_LEAD_DAYS,
} from '@modules/contract/constants/payment-reminder';
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
  private readonly defaultLeadDays: number;
  private readonly maxLeadDays: number;

  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
  ) {
    this.defaultLeadDays = Number(
      config.paymentGateway?.reminderDays ?? DEFAULT_PAYMENT_REMINDER_LEAD_DAYS,
    );
    this.maxLeadDays = Math.max(
      this.defaultLeadDays,
      ...PAYMENT_REMINDER_LEAD_DAYS,
    );
  }

  @Cron(REMINDER_CRON)
  async handlePaymentReminders() {
    await this.handleUpcomingContracts();
    await this.handleOverdueContracts();
  }

  private async handleUpcomingContracts() {
    if (this.maxLeadDays <= 0) {
      return;
    }

    const contracts =
      await this.contractRepository.findContractsWithUpcomingPayments(
        this.maxLeadDays,
      );

    const eligibleContracts = contracts.filter((contract) =>
      this.isWithinLeadWindow(contract),
    );

    await this.createPendingPaymentsForContracts(eligibleContracts, 'upcoming');
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

  private isWithinLeadWindow(contract: Contract): boolean {
    if (!contract.nextPaymentDue) {
      return false;
    }

    const leadDays = this.getLeadDaysForContract(contract);
    if (!leadDays || leadDays <= 0) {
      return false;
    }

    const today = new Date();
    const dueDate = new Date(contract.nextPaymentDue);
    const latestDate = new Date(today);
    latestDate.setDate(latestDate.getDate() + leadDays);

    return dueDate >= today && dueDate <= latestDate;
  }

  private getLeadDaysForContract(contract: Contract): number {
    return contract.paymentReminderLeadDays || this.defaultLeadDays;
  }
}

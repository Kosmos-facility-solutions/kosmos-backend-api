import { Logger } from '@core/logger/Logger';
import { ContractRepository } from '@modules/contract/contract.repository';
import { Contract } from '@modules/contract/entities/contract.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format } from 'date-fns';
import { PaymentRepository } from './payment.repository';

const REMINDER_CRON = CronExpression.EVERY_10_MINUTES;
const REMINDER_DAYS = [10, 7, 3];
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  @Cron(REMINDER_CRON)
  async handlePaymentReminders() {
    await this.handleUpcomingContracts();
    await this.handleOverdueContracts();
  }

  private async handleUpcomingContracts() {
    const today = this.startOfDay(new Date());

    for (const leadDays of REMINDER_DAYS) {
      const contracts =
        await this.contractRepository.findContractsWithUpcomingPayments(
          leadDays,
        );
      await this.notifyContracts(contracts, 'upcoming', today, leadDays);
    }
  }

  private async handleOverdueContracts() {
    const contracts =
      await this.contractRepository.findContractsWithOverduePayments();

    await this.notifyContracts(contracts, 'overdue');
  }

  private async notifyContracts(
    contracts: Contract[],
    reminderType: 'upcoming' | 'overdue',
    today: Date = this.startOfDay(new Date()),
    leadDays?: number,
  ) {
    for (const contract of contracts) {
      if (!contract.nextPaymentDue) {
        continue;
      }

      if (leadDays !== undefined) {
        const due = this.startOfDay(new Date(contract.nextPaymentDue));
        const diffDays = Math.round(
          (due.getTime() - today.getTime()) / DAY_MS,
        );
        if (diffDays !== leadDays) {
          continue;
        }
      }

      try {
        const hasActivePayment =
          await this.paymentRepository.hasActivePaymentForContract(contract.id);

        if (hasActivePayment) {
          continue;
        }

        this.logger.log(
          `Reminder (${reminderType}${leadDays ? ` ${leadDays}d` : ''}): contract #${contract.id} is due on ${format(
            new Date(contract.nextPaymentDue),
            'yyyy-MM-dd',
          )}. Admin must create the payment manually.`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process reminder for contract #${contract.id}: ${error}`,
        );
      }
    }
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
}

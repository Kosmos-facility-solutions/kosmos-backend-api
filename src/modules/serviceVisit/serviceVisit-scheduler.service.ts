import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { ContractRepository } from '@modules/contract/contract.repository';
import {
  Contract,
  ContractStatus,
} from '@modules/contract/entities/contract.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addDays, isAfter } from 'date-fns';
import { ServiceVisitService } from './serviceVisit.service';

@Injectable()
export class ServiceVisitSchedulerService {
  private readonly logger = new Logger(ServiceVisitSchedulerService.name);
  private readonly horizonDays: number;

  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly serviceVisitService: ServiceVisitService,
  ) {
    this.horizonDays =
      Number(process.env.SERVICE_VISIT_HORIZON_DAYS) ||
      config.serviceSchedule?.horizonDays ||
      30;
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async generateUpcomingVisits() {
    const contracts = await this.contractRepository.findAll({
      where: { status: ContractStatus.Active, isActive: true },
    });

    const today = new Date();
    const horizon = addDays(today, this.horizonDays);

    for (const contract of contracts) {
      try {
        await this.ensureVisitsForContract(contract, today, horizon);
      } catch (error) {
        this.logger.error(
          `Failed to schedule visits for contract #${contract.id}: ${error}`,
        );
      }
    }
  }

  private async ensureVisitsForContract(
    contract: Contract,
    startDate: Date,
    horizonDate: Date,
  ) {
    const lastVisit = await this.serviceVisitService.getLastVisit(contract.id);
    let referenceDate = lastVisit
      ? new Date(lastVisit.scheduledDate)
      : new Date(contract.startDate ?? startDate);

    if (isAfter(startDate, referenceDate)) {
      referenceDate = startDate;
    }

    while (referenceDate <= horizonDate) {
      const exists = await this.serviceVisitService.existsOnDate(
        contract.id,
        referenceDate,
      );
      if (!exists) {
        await this.serviceVisitService.createVisit({
          contractId: contract.id,
          serviceRequestId: contract.serviceRequestId,
          scheduledDate: new Date(referenceDate),
          scheduledTime: contract.workStartTime,
        });
        this.logger.log(
          `Created service visit for contract #${contract.id} on ${referenceDate.toISOString().split('T')[0]}`,
        );
      }

      referenceDate = this.serviceVisitService.computeNextServiceDate(
        referenceDate,
        contract,
      );
    }
  }
}

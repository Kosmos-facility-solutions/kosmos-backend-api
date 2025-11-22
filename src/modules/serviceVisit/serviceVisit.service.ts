import { Contract } from '@modules/contract/entities/contract.entity';
import { RecurrenceFrequency } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { Injectable } from '@nestjs/common';
import {
  ServiceVisit,
  ServiceVisitStatus,
} from './entities/serviceVisit.entity';
import { ServiceVisitRepository } from './serviceVisit.repository';

@Injectable()
export class ServiceVisitService {
  constructor(
    private readonly serviceVisitRepository: ServiceVisitRepository,
  ) {}

  async createVisit(input: {
    contractId: number;
    serviceRequestId?: number;
    scheduledDate: Date;
    scheduledTime?: string;
    notes?: string;
  }): Promise<ServiceVisit> {
    return await this.serviceVisitRepository.create({
      contractId: input.contractId,
      serviceRequestId: input.serviceRequestId,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      status: ServiceVisitStatus.Pending,
      notes: input.notes,
    });
  }

  async getLastVisit(contractId: number) {
    return await this.serviceVisitRepository.findLatestForContract(contractId);
  }

  async existsOnDate(contractId: number, date: Date) {
    return await this.serviceVisitRepository.existsForContractOnDate(
      contractId,
      date,
    );
  }

  getIntervalDays(frequency: RecurrenceFrequency): number {
    switch (frequency) {
      case RecurrenceFrequency.Daily:
        return 1;
      case RecurrenceFrequency.Weekly:
        return 7;
      case RecurrenceFrequency.BiWeekly:
        return 14;
      case RecurrenceFrequency.Monthly:
        return 30;
      case RecurrenceFrequency.Quarterly:
        return 90;
      case RecurrenceFrequency.OneTime:
        return 365;
      default:
        return 7;
    }
  }

  computeNextServiceDate(referenceDate: Date, contract: Contract): Date {
    const nextDate = new Date(referenceDate);
    const interval = this.getIntervalDays(contract.serviceFrequency);
    nextDate.setDate(nextDate.getDate() + interval);

    if (contract.workDays?.length) {
      const workDaysLower = contract.workDays.map((day) => day.toLowerCase());
      let attempts = 0;
      while (
        !workDaysLower.includes(
          nextDate
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase(),
        ) &&
        attempts < 7
      ) {
        nextDate.setDate(nextDate.getDate() + 1);
        attempts++;
      }
    }
    return nextDate;
  }
}

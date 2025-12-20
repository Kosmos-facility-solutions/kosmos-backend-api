import { ApiProperty } from '@nestjs/swagger';
import { Contract } from '../entities/contract.entity';

export class ContractResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  serviceRequestId: number;

  @ApiProperty()
  propertyId: number;

  @ApiProperty()
  contractNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  paymentAmount: number;

  @ApiProperty()
  paymentFrequency: string;

  @ApiProperty()
  nextPaymentDue: Date;

  @ApiProperty()
  lastPaymentDate: Date;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty({ required: false })
  paymentReminderLeadDays: number;

  @ApiProperty()
  workDays: string[];

  @ApiProperty()
  workStartTime: string;

  @ApiProperty()
  workEndTime: string;

  @ApiProperty()
  serviceFrequency: string;

  @ApiProperty()
  terms: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  scope: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  totalContractValue: number;

  @ApiProperty()
  estimatedDurationMinutes: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  client?: any;

  @ApiProperty({ required: false })
  property?: any;

  @ApiProperty({ required: false })
  serviceRequest?: any;

  static fromContract(contract: Contract): ContractResponseDto;
  static fromContract(contracts: Contract[]): ContractResponseDto[];
  static fromContract(
    contractOrContracts: Contract | Contract[],
  ): ContractResponseDto | ContractResponseDto[] {
    if (Array.isArray(contractOrContracts)) {
      return contractOrContracts.map((c) => this.fromContract(c));
    }

    const contract = contractOrContracts;
    const dto = new ContractResponseDto();
    dto.id = contract.id;
    dto.clientId = contract.clientId;
    dto.serviceRequestId = contract.serviceRequestId;
    dto.propertyId = contract.propertyId;
    dto.contractNumber = contract.contractNumber;
    dto.status = contract.status;
    dto.startDate = contract.startDate;
    dto.endDate = contract.endDate;
    dto.paymentAmount = contract.paymentAmount;
    dto.paymentFrequency = contract.paymentFrequency;
    dto.nextPaymentDue = contract.nextPaymentDue;
    dto.lastPaymentDate = contract.lastPaymentDate;
    dto.paymentMethod = contract.paymentMethod;
    dto.paymentReminderLeadDays = contract.paymentReminderLeadDays;
    dto.workDays = contract.workDays;
    dto.workStartTime = contract.workStartTime;
    dto.workEndTime = contract.workEndTime;
    dto.serviceFrequency = contract.serviceFrequency;
    dto.terms = contract.terms;
    dto.notes = contract.notes;
    dto.scope = contract.scope;
    dto.isActive = contract.isActive;
    dto.totalContractValue = contract.totalContractValue;
    dto.estimatedDurationMinutes = contract.estimatedDurationMinutes;
    dto.createdAt = contract.createdAt;
    dto.updatedAt = contract.updatedAt;

    // Include relations if they exist
    if (contract['client']) {
      dto.client = contract['client'];
    }
    if (contract['property']) {
      dto.property = contract['property'];
    }
    if (contract['serviceRequest']) {
      dto.serviceRequest = contract['serviceRequest'];
    }

    return dto;
  }
}

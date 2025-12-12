import { PaginatedDto } from '@common/dto/paginated.dto';
import { Logger } from '@core/logger/Logger';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { MailingService } from '@modules/email/email.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { format } from 'date-fns';
import { IncludeOptions, OrderItem } from 'sequelize';
import { ContractDocService } from './contract-doc.service';
import { ContractPdfService } from './contract-pdf.service';
import { ContractRepository } from './contract.repository';
import { ContractResponseDto } from './dto/contract-response.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract, ContractStatus } from './entities/contract.entity';

@Injectable()
export class ContractService {
  private logger: Logger = new Logger(ContractService.name);

  constructor(
    private contractRepository: ContractRepository,
    private contractPdfService: ContractPdfService,
    private contractDocService: ContractDocService,
    private mailingService: MailingService,
  ) {}

  async create(
    createContractDto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    try {
      // Generate unique contract number
      const contractNumber =
        await this.contractRepository.generateContractNumber();

      const contractData = {
        ...createContractDto,
        contractNumber,
        startDate: new Date(createContractDto.startDate),
        endDate: createContractDto.endDate
          ? new Date(createContractDto.endDate)
          : null,
        nextPaymentDue: createContractDto.nextPaymentDue
          ? new Date(createContractDto.nextPaymentDue)
          : null,
      };

      const contract = await this.contractRepository.create(contractData);

      this.logger.log(`Contract created: ${contract.contractNumber}`);

      // Fetch complete contract with relations
      const fullContract = await this.contractRepository.findOneById(
        contract.id,
        [
          { association: 'client' },
          { association: 'property' },
          { association: 'serviceRequest' },
        ],
      );

      return ContractResponseDto.fromContract(fullContract);
    } catch (error) {
      this.logger.error('Error creating contract:', error);
      throw error;
    }
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<Contract>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }) {
    const paginatedContracts =
      await this.contractRepository.findAndCountAll(options);

    const contracts = ContractResponseDto.fromContract(paginatedContracts.data);
    const paginatedContractResponses = {
      ...paginatedContracts,
      data: contracts,
    };
    return paginatedContractResponses as PaginatedDto<ContractResponseDto>;
  }

  async findOne(
    id: number,
    include?: IncludeOptions[],
    attributes?: string[],
  ): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(
      id,
      include,
      attributes,
    );

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return ContractResponseDto.fromContract(contract);
  }

  async findByContractNumber(
    contractNumber: string,
  ): Promise<ContractResponseDto> {
    const contract =
      await this.contractRepository.findByContractNumber(contractNumber);

    if (!contract) {
      throw new NotFoundException(
        `Contract with number ${contractNumber} not found`,
      );
    }

    return ContractResponseDto.fromContract(contract);
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    const updateData: any = { ...updateContractDto };

    // Convert date strings to Date objects if provided
    if (updateContractDto.startDate) {
      updateData.startDate = new Date(updateContractDto.startDate);
    }
    if (updateContractDto.endDate) {
      updateData.endDate = new Date(updateContractDto.endDate);
    }
    if (updateContractDto.nextPaymentDue) {
      updateData.nextPaymentDue = new Date(updateContractDto.nextPaymentDue);
    }

    const updatedContract = await this.contractRepository.update(
      id,
      updateData,
    );

    this.logger.log(`Contract updated: ${contract.contractNumber}`);

    return ContractResponseDto.fromContract(updatedContract);
  }

  async remove(id: number) {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.contractRepository.delete(id);

    this.logger.log(`Contract deleted: ${contract.contractNumber}`);

    return { message: 'Contract deleted successfully' };
  }

  // ==================== MÉTODOS ESPECÍFICOS ====================

  /**
   * Activate a contract
   */
  async activate(id: number): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (contract.status === ContractStatus.Active) {
      throw new BadRequestException('Contract is already active');
    }

    const updatedContract = await this.contractRepository.update(id, {
      status: ContractStatus.Active,
      isActive: true,
    });

    this.logger.log(`Contract activated: ${contract.contractNumber}`);

    return ContractResponseDto.fromContract(updatedContract);
  }

  /**
   * Pause a contract
   */
  async pause(id: number): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (contract.status === ContractStatus.Paused) {
      throw new BadRequestException('Contract is already paused');
    }

    const updatedContract = await this.contractRepository.update(id, {
      status: ContractStatus.Paused,
    });

    this.logger.log(`Contract paused: ${contract.contractNumber}`);

    return ContractResponseDto.fromContract(updatedContract);
  }

  /**
   * Cancel a contract
   */
  async cancel(id: number, reason?: string): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (contract.status === ContractStatus.Cancelled) {
      throw new BadRequestException('Contract is already cancelled');
    }

    const updateData: any = {
      status: ContractStatus.Cancelled,
      isActive: false,
    };

    if (reason) {
      updateData.notes = contract.notes
        ? `${contract.notes}\n\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }

    const updatedContract = await this.contractRepository.update(
      id,
      updateData,
    );

    this.logger.log(`Contract cancelled: ${contract.contractNumber}`);

    return ContractResponseDto.fromContract(updatedContract);
  }

  /**
   * Complete a contract
   */
  async complete(id: number): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOneById(id);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (contract.status === ContractStatus.Completed) {
      throw new BadRequestException('Contract is already completed');
    }

    const updatedContract = await this.contractRepository.update(id, {
      status: ContractStatus.Completed,
      isActive: false,
    });

    this.logger.log(`Contract completed: ${contract.contractNumber}`);

    return ContractResponseDto.fromContract(updatedContract);
  }

  /**
   * Get contracts by client
   */
  async findByClient(clientId: number): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findByClientId(clientId);
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Get contracts by property
   */
  async findByProperty(propertyId: number): Promise<ContractResponseDto[]> {
    const contracts =
      await this.contractRepository.findByPropertyId(propertyId);
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Get active contracts
   */
  async findActiveContracts(): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findActiveContracts();
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Get contracts with upcoming payments
   */
  async findContractsWithUpcomingPayments(
    daysAhead: number = 7,
  ): Promise<ContractResponseDto[]> {
    const contracts =
      await this.contractRepository.findContractsWithUpcomingPayments(
        daysAhead,
      );
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Get contracts with overdue payments
   */
  async findContractsWithOverduePayments(): Promise<ContractResponseDto[]> {
    const contracts =
      await this.contractRepository.findContractsWithOverduePayments();
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Get expiring contracts
   */
  async findExpiringContracts(
    daysAhead: number = 30,
  ): Promise<ContractResponseDto[]> {
    const contracts =
      await this.contractRepository.findExpiringContracts(daysAhead);
    return ContractResponseDto.fromContract(contracts);
  }

  /**
   * Envía el contrato por correo mostrando la ficha técnica (sin adjuntos)
   */
  async sendContractEmailWithPdf(contractId: number): Promise<void> {
    const contract = await this.contractRepository.findOneById(contractId, [
      { association: 'client' },
      { association: 'property' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }],
      },
    ]);

    if (!contract) {
      throw new Error('Contract not found');
    }

    const emailData = {
      clientName:
        contract.client?.firstName + ' ' + contract.client.lastName || 'Client',
      contractNumber: contract.contractNumber,
      serviceName: contract.serviceRequest?.service?.name || 'Service',
      startDate: format(new Date(contract.startDate), 'MMMM dd, yyyy'),
      endDate: contract.endDate
        ? format(new Date(contract.endDate), 'MMMM dd, yyyy')
        : null,
      paymentAmount: String(contract.paymentAmount),
      paymentFrequency: this.formatPaymentFrequency(contract.paymentFrequency),
      nextPaymentDue: contract.nextPaymentDue
        ? format(new Date(contract.nextPaymentDue), 'MMMM dd, yyyy')
        : null,
      propertyName: contract.property?.name || 'Property',
      propertyAddress: contract.property?.address || '',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/contracts/${contract.id}`,
    };

    await this.mailingService.sendContractApprovedEmail(
      contract.client?.email || '',
      emailData,
    );
  }

  async sendContractEmailWithDoc(contractId: number): Promise<void> {
    const contract = await this.contractRepository.findOneById(contractId, [
      { association: 'client' },
      { association: 'property' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }],
      },
    ]);

    if (!contract) {
      throw new Error('Contract not found');
    }

    const emailData = {
      clientName:
        contract.client?.firstName + ' ' + contract.client.lastName || 'Client',
      contractNumber: contract.contractNumber,
      serviceName: contract.serviceRequest?.service?.name || 'Service',
      startDate: format(new Date(contract.startDate), 'MMMM dd, yyyy'),
      endDate: contract.endDate
        ? format(new Date(contract.endDate), 'MMMM dd, yyyy')
        : null,
      paymentAmount: String(contract.paymentAmount),
      paymentFrequency: this.formatPaymentFrequency(contract.paymentFrequency),
      nextPaymentDue: contract.nextPaymentDue
        ? format(new Date(contract.nextPaymentDue), 'MMMM dd, yyyy')
        : null,
      propertyName: contract.property?.name || 'Property',
      propertyAddress: contract.property?.address || '',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/contracts/${contract.id}`,
    };

    await this.mailingService.sendContractApprovedEmail(
      contract.client?.email || '',
      emailData,
    );
  }

  /**
   * Genera el PDF del contrato por ID
   */
  async generateContractPdfById(contractId: number): Promise<Buffer> {
    const contract = await this.contractRepository.findOneById(contractId, [
      { association: 'client' },
      { association: 'property' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }],
      },
    ]);

    if (!contract) {
      throw new Error('Contract not found');
    }

    return await this.contractPdfService.generateContractPdf(contract);
  }

  async generateContractDocById(contractId: number): Promise<Buffer> {
    const contract = await this.contractRepository.findOneById(contractId, [
      { association: 'client' },
      { association: 'property' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }],
      },
    ]);

    if (!contract) {
      throw new Error('Contract not found');
    }

    return await this.contractDocService.generateEditableContract(contract);
  }

  /**
   * Formatea la frecuencia de pago
   */
  private formatPaymentFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      one_time: 'One-Time Payment',
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return frequencyMap[frequency] || frequency;
  }
}

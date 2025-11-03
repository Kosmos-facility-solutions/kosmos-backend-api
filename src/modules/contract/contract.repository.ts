import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Property } from '@modules/property/entities/property.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { User } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Contract, ContractStatus } from './entities/contract.entity';

@Injectable()
export class ContractRepository extends SequelizeCrudRepository<Contract> {
  constructor(
    @InjectModel(Contract)
    protected model: typeof Contract,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  /**
   * Generate a unique contract number
   */
  async generateContractNumber(transaction?: Transaction): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.model.count({
      where: {
        contractNumber: {
          [Op.like]: `CONT-${year}-%`,
        },
      },
      transaction,
    });

    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `CONT-${year}-${nextNumber}`;
  }

  /**
   * Find contracts by client ID
   */
  async findByClientId(
    clientId: number,
    transaction?: Transaction,
  ): Promise<Contract[]> {
    return await this.findAll(
      {
        where: { clientId },
        include: [
          { model: Property },
          { model: ServiceRequest },
          { model: User, as: 'client' },
        ],
        order: [['createdAt', 'DESC']],
      },
      transaction,
    );
  }

  /**
   * Find contracts by property ID
   */
  async findByPropertyId(
    propertyId: number,
    transaction?: Transaction,
  ): Promise<Contract[]> {
    return await this.findAll(
      {
        where: { propertyId },
        include: [
          { model: User, as: 'client' },
          { model: Property },
          { model: ServiceRequest },
        ],
        order: [['createdAt', 'DESC']],
      },
      transaction,
    );
  }

  /**
   * Find contracts by status
   */
  async findByStatus(
    status: ContractStatus,
    transaction?: Transaction,
  ): Promise<Contract[]> {
    return await this.findAll(
      {
        where: { status },
        include: [{ model: User, as: 'client' }, { model: Property }],
        order: [['startDate', 'ASC']],
      },
      transaction,
    );
  }

  /**
   * Find active contracts
   */
  async findActiveContracts(transaction?: Transaction): Promise<Contract[]> {
    return await this.findAll(
      {
        where: {
          status: ContractStatus.Active,
          isActive: true,
        },
        include: [{ model: User, as: 'client' }, { model: Property }],
        order: [['startDate', 'ASC']],
      },
      transaction,
    );
  }

  /**
   * Find contracts with upcoming payments
   */
  async findContractsWithUpcomingPayments(
    daysAhead: number = 7,
    transaction?: Transaction,
  ): Promise<Contract[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return await this.findAll(
      {
        where: {
          status: ContractStatus.Active,
          nextPaymentDue: {
            [Op.between]: [today, futureDate],
          },
        },
        include: [{ model: User, as: 'client' }, { model: Property }],
        order: [['nextPaymentDue', 'ASC']],
      },
      transaction,
    );
  }

  /**
   * Find contracts with overdue payments
   */
  async findContractsWithOverduePayments(
    transaction?: Transaction,
  ): Promise<Contract[]> {
    const today = new Date();

    return await this.findAll(
      {
        where: {
          status: ContractStatus.Active,
          nextPaymentDue: {
            [Op.lt]: today,
          },
        },
        include: [{ model: User, as: 'client' }, { model: Property }],
        order: [['nextPaymentDue', 'ASC']],
      },
      transaction,
    );
  }

  /**
   * Find contract by contract number
   */
  async findByContractNumber(
    contractNumber: string,
    transaction?: Transaction,
  ): Promise<Contract> {
    return await this.findOne(
      {
        where: { contractNumber },
        include: [
          { model: User, as: 'client' },
          { model: Property },
          { model: ServiceRequest },
        ],
      },
      transaction,
    );
  }

  /**
   * Count contracts by status
   */
  async countByStatus(
    status: ContractStatus,
    transaction?: Transaction,
  ): Promise<number> {
    return await this.model.count({
      where: { status },
      transaction,
    });
  }

  /**
   * Find expiring contracts (ending within specified days)
   */
  async findExpiringContracts(
    daysAhead: number = 30,
    transaction?: Transaction,
  ): Promise<Contract[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return await this.findAll(
      {
        where: {
          status: ContractStatus.Active,
          endDate: {
            [Op.between]: [today, futureDate],
          },
        },
        include: [{ model: User, as: 'client' }, { model: Property }],
        order: [['endDate', 'ASC']],
      },
      transaction,
    );
  }
}

import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Property } from '@modules/property/entities/property.entity';
import { Service } from '@modules/service/entities/service.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { User } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  ServiceReport,
  ServiceReportStatus,
} from './entities/serviceReport.entity';

@Injectable()
export class ServiceReportRepository extends SequelizeCrudRepository<ServiceReport> {
  constructor(
    @InjectModel(ServiceReport)
    protected model: typeof ServiceReport,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findByServiceRequestId(
    serviceRequestId: number,
    transaction?: Transaction,
  ): Promise<ServiceReport> {
    return await this.findOne(
      {
        where: { serviceRequestId },
        include: [
          {
            model: ServiceRequest,
            include: [Property, Service],
          },
          { model: User, as: 'staff' },
        ],
      },
      transaction,
    );
  }

  async findByStaffId(
    staffId: number,
    transaction?: Transaction,
  ): Promise<ServiceReport[]> {
    return await this.findAll(
      {
        where: { staffId },
        include: [
          {
            model: ServiceRequest,
            include: [Property, Service],
          },
        ],
        order: [['createdAt', 'DESC']],
      },
      transaction,
    );
  }

  async findByStatus(
    status: ServiceReportStatus,
    transaction?: Transaction,
  ): Promise<ServiceReport[]> {
    return await this.findAll(
      {
        where: { status },
        include: [
          {
            model: ServiceRequest,
            include: [Property, Service],
          },
          { model: User, as: 'staff' },
        ],
        order: [['submittedAt', 'DESC']],
      },
      transaction,
    );
  }

  async findPendingReview(transaction?: Transaction): Promise<ServiceReport[]> {
    return await this.findAll(
      {
        where: { status: ServiceReportStatus.Submitted },
        include: [
          {
            model: ServiceRequest,
            include: [Property, Service],
          },
          { model: User, as: 'staff' },
        ],
        order: [['submittedAt', 'ASC']],
      },
      transaction,
    );
  }

  async findRequiringFollowUp(
    transaction?: Transaction,
  ): Promise<ServiceReport[]> {
    return await this.findAll(
      {
        where: { requiresFollowUp: true },
        include: [
          {
            model: ServiceRequest,
            include: [Property, Service],
          },
          { model: User, as: 'staff' },
        ],
        order: [['createdAt', 'DESC']],
      },
      transaction,
    );
  }

  async getAverageRatingByStaff(
    staffId: number,
    transaction?: Transaction,
  ): Promise<number> {
    const result = await this.model.findOne({
      where: { staffId },
      attributes: [
        [this.sequelize.fn('AVG', this.sequelize.col('rating')), 'avgRating'],
      ],
      transaction,
    });

    return result ? parseFloat(result.get('avgRating') as string) : 0;
  }

  async getCustomerAverageRatingByStaff(
    staffId: number,
    transaction?: Transaction,
  ): Promise<number> {
    const result = await this.model.findOne({
      where: { staffId },
      attributes: [
        [
          this.sequelize.fn('AVG', this.sequelize.col('customerRating')),
          'avgCustomerRating',
        ],
      ],
      transaction,
    });

    return result ? parseFloat(result.get('avgCustomerRating') as string) : 0;
  }
}

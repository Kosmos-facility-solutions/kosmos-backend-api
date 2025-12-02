import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Property } from '@modules/property/entities/property.entity';
import { Service } from '@modules/service/entities/service.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from './entities/serviceRequest.entity';

@Injectable()
export class ServiceRequestRepository extends SequelizeCrudRepository<ServiceRequest> {
  constructor(
    @InjectModel(ServiceRequest)
    protected model: typeof ServiceRequest,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<ServiceRequest[]> {
    return await this.findAll(
      {
        where: { userId },
        include: [Property, Service],
        order: [['scheduledDate', 'DESC']],
      },
      transaction,
    );
  }

  async findByPropertyId(
    propertyId: number,
    transaction?: Transaction,
  ): Promise<ServiceRequest[]> {
    return await this.findAll(
      {
        where: { propertyId },
        include: [Service, { association: 'user' }],
        order: [['scheduledDate', 'DESC']],
      },
      transaction,
    );
  }

  async findByStatus(
    status: ServiceRequestStatus,
    transaction?: Transaction,
  ): Promise<ServiceRequest[]> {
    return await this.findAll(
      {
        where: { status },
        include: [Property, Service, { association: 'user' }],
        order: [['scheduledDate', 'ASC']],
      },
      transaction,
    );
  }

  async findUpcoming(
    userId: number,
    transaction?: Transaction,
  ): Promise<ServiceRequest[]> {
    const today = new Date().toISOString().split('T')[0];
    return await this.findAll(
      {
        where: {
          userId,
          status: ServiceRequestStatus.Scheduled,
          scheduledDate: { $gte: today },
        },
        include: [Property, Service],
        order: [['scheduledDate', 'ASC']],
      },
      transaction,
    );
  }

  async findPending(transaction?: Transaction): Promise<ServiceRequest[]> {
    return await this.findAll(
      {
        where: { status: ServiceRequestStatus.Pending },
        include: [Property, Service, { association: 'user' }],
        order: [['createdAt', 'ASC']],
      },
      transaction,
    );
  }

  async countByStatus(
    status: ServiceRequestStatus,
    transaction?: Transaction,
  ): Promise<number> {
    return await this.model.count({
      where: { status },
      transaction,
    });
  }
}

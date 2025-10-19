import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Service, ServiceCategory } from './entities/service.entity';

@Injectable()
export class ServiceRepository extends SequelizeCrudRepository<Service> {
  constructor(
    @InjectModel(Service)
    protected model: typeof Service,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findActiveServices(transaction?: Transaction): Promise<Service[]> {
    return await this.findAll(
      {
        where: { isActive: true },
        order: [
          ['displayOrder', 'ASC'],
          ['name', 'ASC'],
        ],
      },
      transaction,
    );
  }

  async findByCategory(
    category: ServiceCategory,
    transaction?: Transaction,
  ): Promise<Service[]> {
    return await this.findAll(
      {
        where: { category, isActive: true },
        order: [['displayOrder', 'ASC']],
      },
      transaction,
    );
  }

  async findPopularServices(
    limit: number = 6,
    transaction?: Transaction,
  ): Promise<Service[]> {
    return await this.findAll(
      {
        where: { isActive: true },
        order: [['displayOrder', 'ASC']],
        limit,
      },
      transaction,
    );
  }
}

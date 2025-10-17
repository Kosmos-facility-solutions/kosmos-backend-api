import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertyRepository extends SequelizeCrudRepository<Property> {
  constructor(
    @InjectModel(Property)
    protected model: typeof Property,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<Property[]> {
    return await this.findAll(
      {
        where: { userId, isActive: true },
      },
      transaction,
    );
  }

  async findActiveProperties(transaction?: Transaction): Promise<Property[]> {
    return await this.findAll(
      {
        where: { isActive: true },
      },
      transaction,
    );
  }
}

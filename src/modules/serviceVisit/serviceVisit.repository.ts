import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ServiceVisit } from './entities/serviceVisit.entity';

@Injectable()
export class ServiceVisitRepository extends SequelizeCrudRepository<ServiceVisit> {
  constructor(
    @InjectModel(ServiceVisit)
    protected model: typeof ServiceVisit,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findLatestForContract(
    contractId: number,
    transaction?: Transaction,
  ): Promise<ServiceVisit | null> {
    const visits = await this.findAll(
      {
        where: { contractId },
        order: [['scheduledDate', 'DESC']],
        limit: 1,
      },
      transaction,
    );
    return visits.length ? visits[0] : null;
  }

  async existsForContractOnDate(
    contractId: number,
    targetDate: Date,
    transaction?: Transaction,
  ): Promise<boolean> {
    const dayString = targetDate.toISOString().split('T')[0];
    const visits = await this.findAll(
      {
        where: {
          contractId,
          scheduledDate: {
            [Op.eq]: dayString,
          },
        },
        limit: 1,
      },
      transaction,
    );
    return visits.length > 0;
  }
}

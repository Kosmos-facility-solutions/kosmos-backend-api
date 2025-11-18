import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Includeable, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentRepository extends SequelizeCrudRepository<Payment> {
  constructor(
    @InjectModel(Payment)
    protected model: typeof Payment,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }

  async findByProviderPaymentId(
    providerPaymentId: string,
    transaction?: Transaction,
  ): Promise<Payment> {
    return await this.findOne(
      {
        where: { providerPaymentId },
      },
      transaction,
    );
  }

  async findDetailedById(
    id: number,
    transaction?: Transaction,
  ): Promise<Payment> {
    const include: Includeable[] = [
      { association: 'user' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }, { association: 'property' }],
      },
      {
        association: 'contract',
        include: [
          { association: 'property' },
          {
            association: 'serviceRequest',
            include: [{ association: 'service' }],
          },
        ],
      },
    ];
    return await this.findOneById(id, include, null, transaction);
  }
}

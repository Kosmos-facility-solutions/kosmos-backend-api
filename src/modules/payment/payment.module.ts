import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractModule } from '@modules/contract/contract.module';
import { ServiceRequestModule } from '@modules/serviceRequest/serviceRequest.module';
import { UserModule } from '@modules/user/user.module';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment]),
    ServiceRequestModule,
    ContractModule,
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PaymentGatewayService],
  exports: [SequelizeModule, PaymentService, PaymentRepository],
})
export class PaymentModule {}

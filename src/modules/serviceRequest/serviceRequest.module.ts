import { IsOwnerGuard } from '@modules/auth/guards/isOwner.guard';
import { IsOwnerOrIsRoleGuard } from '@modules/auth/guards/isOwnerOrIsRole.guard';
import { IsRoleGuard } from '@modules/auth/guards/isRole.guard';
import { ContractModule } from '@modules/contract/contract.module';
import { ProductModule } from '@modules/product/product.module';
import { PropertyModule } from '@modules/property/property.module';
import { ServiceModule } from '@modules/service/service.module';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentModule } from '@modules/payment/payment.module';
import { ServiceRequest } from './entities/serviceRequest.entity';
import { ServiceRequestProduct } from './entities/serviceRequestProduct.entity';
import { ServiceRequestStaff } from './entities/serviceRequestStaff.entity';
import { ServiceRequestController } from './serviceRequest.controller';
import { ServiceRequestRepository } from './serviceRequest.repository';
import { ServiceRequestService } from './serviceRequest.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ServiceRequest,
      ServiceRequestProduct,
      ServiceRequestStaff,
    ]),
    UserModule,
    PropertyModule,
    ContractModule,
    ServiceModule,
    ProductModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [ServiceRequestController],
  providers: [
    ServiceRequestService,
    ServiceRequestRepository,
    IsRoleGuard,
    IsOwnerGuard,
    IsOwnerOrIsRoleGuard,
  ],
  exports: [SequelizeModule, ServiceRequestService, ServiceRequestRepository],
})
export class ServiceRequestModule {}

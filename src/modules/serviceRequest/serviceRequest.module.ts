import { IsOwnerGuard } from '@modules/auth/guards/isOwner.guard';
import { IsOwnerOrIsRoleGuard } from '@modules/auth/guards/isOwnerOrIsRole.guard';
import { IsRoleGuard } from '@modules/auth/guards/isRole.guard';
import { ContractModule } from '@modules/contract/contract.module';
import { PropertyModule } from '@modules/property/property.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceRequest } from './entities/serviceRequest.entity';
import { ServiceRequestController } from './serviceRequest.controller';
import { ServiceRequestRepository } from './serviceRequest.repository';
import { ServiceRequestService } from './serviceRequest.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ServiceRequest]),
    UserModule,
    PropertyModule,
    ContractModule,
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

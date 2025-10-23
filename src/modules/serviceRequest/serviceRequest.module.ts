import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceRequest } from './entities/serviceRequest.entity';
import { ServiceRequestController } from './serviceRequest.controller';
import { ServiceRequestRepository } from './serviceRequest.repository';
import { ServiceRequestService } from './serviceRequest.service';

@Module({
  imports: [SequelizeModule.forFeature([ServiceRequest])],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService, ServiceRequestRepository],
  exports: [SequelizeModule, ServiceRequestService, ServiceRequestRepository],
})
export class ServiceRequestModule {}
//correct version

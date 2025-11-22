import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractModule } from '@modules/contract/contract.module';
import { ServiceVisit } from './entities/serviceVisit.entity';
import { ServiceVisitRepository } from './serviceVisit.repository';
import { ServiceVisitService } from './serviceVisit.service';
import { ServiceVisitSchedulerService } from './serviceVisit-scheduler.service';

@Module({
  imports: [SequelizeModule.forFeature([ServiceVisit]), ContractModule],
  providers: [
    ServiceVisitRepository,
    ServiceVisitService,
    ServiceVisitSchedulerService,
  ],
  exports: [SequelizeModule, ServiceVisitService, ServiceVisitRepository],
})
export class ServiceVisitModule {}

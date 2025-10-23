import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceReport } from './entities/serviceReport.entity';
import { ServiceReportController } from './serviceReport.controller';
import { ServiceReportRepository } from './serviceReport.repository';
import { ServiceReportService } from './serviceReport.service';

@Module({
  imports: [SequelizeModule.forFeature([ServiceReport])],
  controllers: [ServiceReportController],
  providers: [ServiceReportService, ServiceReportRepository],
  exports: [SequelizeModule, ServiceReportService, ServiceReportRepository],
})
export class ServiceReportModule {}

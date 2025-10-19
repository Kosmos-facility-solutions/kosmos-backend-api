import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service } from './entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { ServiceService } from './service.service';

@Module({
  imports: [SequelizeModule.forFeature([Service])],
  controllers: [ServiceController],
  providers: [ServiceService, ServiceRepository],
  exports: [SequelizeModule, ServiceService, ServiceRepository],
})
export class ServiceModule {}

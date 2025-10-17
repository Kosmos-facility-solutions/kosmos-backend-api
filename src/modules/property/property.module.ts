import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from './entities/property.entity';
import { PropertyController } from './property.controller';
import { PropertyRepository } from './property.repository';
import { PropertyService } from './property.service';

@Module({
  imports: [SequelizeModule.forFeature([Property])],
  controllers: [PropertyController],
  providers: [PropertyService, PropertyRepository],
  exports: [SequelizeModule, PropertyService, PropertyRepository],
})
export class PropertyModule {}

import { PaginatedDto } from '@common/dto/paginated.dto';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { Injectable } from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { PropertyRepository } from './property.repository';

@Injectable()
export class PropertyService {
  constructor(private propertyRepository: PropertyRepository) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return await this.propertyRepository.create(createPropertyDto);
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<Property>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<Property>> {
    return await this.propertyRepository.findAndCountAll(options);
  }

  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    return await this.propertyRepository.findOneById(id, include, attributes);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return await this.propertyRepository.update(id, updatePropertyDto);
  }

  async remove(id: number) {
    return await this.propertyRepository.delete(id);
  }

  async findByUserId(userId: number) {
    return await this.propertyRepository.findByUserId(userId);
  }
}

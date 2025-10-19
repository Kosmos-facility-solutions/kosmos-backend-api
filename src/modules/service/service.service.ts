import { PaginatedDto } from '@common/dto/paginated.dto';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { Injectable } from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceCategory } from './entities/service.entity';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServiceService {
  constructor(private serviceRepository: ServiceRepository) {}

  async create(createServiceDto: CreateServiceDto) {
    return await this.serviceRepository.create(createServiceDto);
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<Service>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<Service>> {
    return await this.serviceRepository.findAndCountAll(options);
  }

  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    return await this.serviceRepository.findOneById(id, include, attributes);
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    return await this.serviceRepository.update(id, updateServiceDto);
  }

  async remove(id: number) {
    return await this.serviceRepository.delete(id);
  }

  async findActiveServices() {
    return await this.serviceRepository.findActiveServices();
  }

  async findByCategory(category: ServiceCategory) {
    return await this.serviceRepository.findByCategory(category);
  }

  async findPopularServices(limit?: number) {
    return await this.serviceRepository.findPopularServices(limit);
  }
}

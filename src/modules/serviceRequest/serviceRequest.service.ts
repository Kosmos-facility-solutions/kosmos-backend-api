import { PaginatedDto } from '@common/dto/paginated.dto';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from './entities/serviceRequest.entity';
import { ServiceRequestRepository } from './serviceRequest.repository';

@Injectable()
export class ServiceRequestService {
  constructor(private serviceRequestRepository: ServiceRequestRepository) {}

  async create(createServiceRequestDto: CreateServiceRequestDto) {
    return await this.serviceRequestRepository.create(createServiceRequestDto);
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<ServiceRequest>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<ServiceRequest>> {
    return await this.serviceRequestRepository.findAndCountAll(options);
  }

  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    return await this.serviceRequestRepository.findOneById(
      id,
      include,
      attributes,
    );
  }

  async update(id: number, updateServiceRequestDto: UpdateServiceRequestDto) {
    return await this.serviceRequestRepository.update(
      id,
      updateServiceRequestDto,
    );
  }

  async remove(id: number) {
    return await this.serviceRequestRepository.delete(id);
  }

  async findByUserId(userId: number) {
    return await this.serviceRequestRepository.findByUserId(userId);
  }

  async findByPropertyId(propertyId: number) {
    return await this.serviceRequestRepository.findByPropertyId(propertyId);
  }

  async findByStatus(status: ServiceRequestStatus) {
    return await this.serviceRequestRepository.findByStatus(status);
  }

  async findUpcoming(userId: number) {
    return await this.serviceRequestRepository.findUpcoming(userId);
  }

  async findPending() {
    return await this.serviceRequestRepository.findPending();
  }

  async cancel(id: number, cancelDto: CancelServiceRequestDto) {
    const serviceRequest = await this.serviceRequestRepository.findOneById(id);

    if (!serviceRequest) {
      throw new NotFoundException(`ServiceRequest with id ${id} not found`);
    }

    return await this.serviceRequestRepository.update(id, {
      status: ServiceRequestStatus.Cancelled,
      cancellationReason: cancelDto.cancellationReason,
    });
  }

  async complete(id: number, actualPrice?: number, actualDuration?: number) {
    return await this.serviceRequestRepository.update(id, {
      status: ServiceRequestStatus.Completed,
      completedDate: new Date(),
      ...(actualPrice && { actualPrice }),
      ...(actualDuration && { actualDurationMinutes: actualDuration }),
    });
  }

  async countByStatus(status: ServiceRequestStatus) {
    return await this.serviceRequestRepository.countByStatus(status);
  }
}

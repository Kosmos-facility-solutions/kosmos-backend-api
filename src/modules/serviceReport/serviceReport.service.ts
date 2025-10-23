import { PaginatedDto } from '@common/dto/paginated.dto';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { CreateServiceReportDto } from './dto/create-service-report.dto';
import { CustomerFeedbackDto } from './dto/customer-feedback.dto';
import { UpdateServiceReportDto } from './dto/update-service-report.dto';
import {
  ServiceReport,
  ServiceReportStatus,
} from './entities/serviceReport.entity';
import { ServiceReportRepository } from './serviceReport.repository';

@Injectable()
export class ServiceReportService {
  constructor(private serviceReportRepository: ServiceReportRepository) {}

  async create(createServiceReportDto: CreateServiceReportDto) {
    return await this.serviceReportRepository.create(createServiceReportDto);
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<ServiceReport>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<ServiceReport>> {
    return await this.serviceReportRepository.findAndCountAll(options);
  }

  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    return await this.serviceReportRepository.findOneById(
      id,
      include,
      attributes,
    );
  }

  async update(id: number, updateServiceReportDto: UpdateServiceReportDto) {
    return await this.serviceReportRepository.update(
      id,
      updateServiceReportDto,
    );
  }

  async remove(id: number) {
    return await this.serviceReportRepository.delete(id);
  }

  async findByServiceRequestId(serviceRequestId: number) {
    return await this.serviceReportRepository.findByServiceRequestId(
      serviceRequestId,
    );
  }

  async findByStaffId(staffId: number) {
    return await this.serviceReportRepository.findByStaffId(staffId);
  }

  async findByStatus(status: ServiceReportStatus) {
    return await this.serviceReportRepository.findByStatus(status);
  }

  async findPendingReview() {
    return await this.serviceReportRepository.findPendingReview();
  }

  async findRequiringFollowUp() {
    return await this.serviceReportRepository.findRequiringFollowUp();
  }

  async submitReport(id: number) {
    const report = await this.serviceReportRepository.findOneById(id);

    if (!report) {
      throw new NotFoundException(`ServiceReport with id ${id} not found`);
    }

    return await this.serviceReportRepository.update(id, {
      status: ServiceReportStatus.Submitted,
      submittedAt: new Date(),
    });
  }

  async reviewReport(id: number, reviewerId: number, approved: boolean) {
    const report = await this.serviceReportRepository.findOneById(id);

    if (!report) {
      throw new NotFoundException(`ServiceReport with id ${id} not found`);
    }

    const status = approved
      ? ServiceReportStatus.Approved
      : ServiceReportStatus.Reviewed;

    return await this.serviceReportRepository.update(id, {
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    });
  }

  async addCustomerFeedback(id: number, feedbackDto: CustomerFeedbackDto) {
    const report = await this.serviceReportRepository.findOneById(id);

    if (!report) {
      throw new NotFoundException(`ServiceReport with id ${id} not found`);
    }

    return await this.serviceReportRepository.update(id, {
      customerRating: feedbackDto.customerRating,
      customerFeedback: feedbackDto.customerFeedback,
      customerWouldRecommend: feedbackDto.customerWouldRecommend,
    });
  }

  async getStaffStats(staffId: number) {
    const [averageRating, customerAverageRating, reports] = await Promise.all([
      this.serviceReportRepository.getAverageRatingByStaff(staffId),
      this.serviceReportRepository.getCustomerAverageRatingByStaff(staffId),
      this.serviceReportRepository.findByStaffId(staffId),
    ]);

    return {
      staffId,
      totalReports: reports.length,
      averageRating: averageRating || 0,
      customerAverageRating: customerAverageRating || 0,
      completedReports: reports.filter(
        (r) => r.status === ServiceReportStatus.Approved,
      ).length,
    };
  }
}

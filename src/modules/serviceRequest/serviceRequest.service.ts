import { PaginatedDto } from '@common/dto/paginated.dto';
import { Logger } from '@core/logger/Logger';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IncludeOptions, OrderItem } from 'sequelize';
import { MailingService } from '../email/email.service';
import { ApproveServiceRequestDto } from './dto/approved-service-request.dto';
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
  private logger: Logger = new Logger(ServiceRequestService.name);
  constructor(
    private serviceRequestRepository: ServiceRequestRepository,
    private mailingService: MailingService,
    private userRepository: UserRepository,
    private userService: UserService,
  ) {}

  async create(createServiceRequestDto: CreateServiceRequestDto) {
    const data = {
      ...createServiceRequestDto,
      scheduledDate: new Date(createServiceRequestDto.scheduledDate),
      recurrenceEndDate: createServiceRequestDto.recurrenceEndDate
        ? new Date(createServiceRequestDto.recurrenceEndDate)
        : null,
    };

    const serviceRequest = await this.serviceRequestRepository.create(data);
    const fullServiceRequest = await this.serviceRequestRepository.findOneById(
      serviceRequest.id,
      [
        { association: 'user' },
        { association: 'service' },
        { association: 'property' },
      ],
    );

    await this.mailingService.sendServiceRequestAdminEmail(fullServiceRequest);
    await this.mailingService.sendServiceRequestCustomerEmail(
      fullServiceRequest,
    );
    return serviceRequest;
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

  /**
   * Approve a service request and send appropriate emails
   */
  async approve(
    id: number,
    approveDto: ApproveServiceRequestDto,
    approvedBy: number,
  ) {
    // 1. Find the service request
    const serviceRequest = await this.serviceRequestRepository.findOneById(id);

    if (!serviceRequest) {
      throw new NotFoundException(`ServiceRequest with id ${id} not found`);
    }

    // Check if already approved
    if (serviceRequest.status === ServiceRequestStatus.Scheduled) {
      throw new BadRequestException('Service request is already approved');
    }

    // 2. Update service request to 'scheduled' status
    const updateData: any = {
      status: ServiceRequestStatus.Scheduled,
      // Update price if provided
      estimatedPrice:
        approveDto.confirmedPrice || serviceRequest.estimatedPrice,
      approvedBy,
    };

    // Add assigned staff if provided
    if (approveDto.assignedStaffId) {
      updateData.assignedStaffId = approveDto.assignedStaffId;
    }

    // Add admin notes if provided
    if (approveDto.adminNotes) {
      updateData.notes = approveDto.adminNotes;
    }

    await this.serviceRequestRepository.update(id, updateData);

    // 3. Fetch complete service request with relations
    const fullServiceRequest = await this.serviceRequestRepository.findOneById(
      id,
      [
        { association: 'user' },
        { association: 'service' },
        { association: 'property' },
      ],
    );

    // 4. Determine if this is a new customer
    const isNewCustomer = !fullServiceRequest.user.isEmailConfirmed;

    try {
      if (isNewCustomer) {
        const temporaryPassword = this.generateTemporaryPassword();

        // Check if user already exists
        const user = await this.userRepository.findOneByEmail(
          fullServiceRequest.user?.email,
        );

        await user.update({
          password: temporaryPassword,
          isActive: true,
          isEmailConfirmed: true,
        });

        this.logger.log(`New customer account confirmed: ${user.email}`);

        // Send welcome email with credentials
        await this.mailingService.sendServiceApprovedNewCustomerEmail(
          fullServiceRequest,
          temporaryPassword,
        );

        this.logger.log(`Welcome email sent to new customer: ${user.email}`);
      } else {
        let assignedStaffName = null;

        // Get assigned staff name if provided
        if (approveDto.assignedStaffId) {
          // Fetch staff details - adjust this based on your Staff model
          // const staff = await this.staffService.findOne(approveDto.assignedStaffId);
          // assignedStaffName = `${staff.firstName} ${staff.lastName}`;

          // For now, you can pass a placeholder or fetch it
          assignedStaffName = 'Service Team'; // Replace with actual staff lookup
        }

        // Send approval email to existing customer
        await this.mailingService.sendServiceApprovedExistingCustomerEmail(
          fullServiceRequest,
          assignedStaffName,
        );

        this.logger.log(
          `Approval email sent to existing customer: ${fullServiceRequest.user?.email}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to send approval email:', error);
      throw error;
    }

    return fullServiceRequest;
  }

  /**
   * Generate a secure temporary password
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

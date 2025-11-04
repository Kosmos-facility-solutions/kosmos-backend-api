import { PaginatedDto } from '@common/dto/paginated.dto';
import { Logger } from '@core/logger/Logger';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { ContractService } from '@modules/contract/contract.service';
import { ContractResponseDto } from '@modules/contract/dto/contract-response.dto';
import {
  ContractStatus,
  PaymentFrequency,
} from '@modules/contract/entities/contract.entity';
import { PropertyRepository } from '@modules/property/property.repository';
import { PropertyService } from '@modules/property/property.service';
import { Role } from '@modules/role/entities/role.entity';
import { ROLES } from '@modules/role/enums/roles.enum';
import { User } from '@modules/user/entities/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';
import { UserRole } from '@modules/userrole/entities/userrole.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IncludeOptions, OrderItem, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MailingService } from '../email/email.service';
import { ApproveServiceRequestDto } from './dto/approved-service-request.dto';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateServiceRequestDemoQuoteDto } from './dto/demo-quote-dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import {
  RecurrenceFrequency,
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
    private propertyService: PropertyService,
    private propertyRepository: PropertyRepository,
    private sequelize: Sequelize, // For transactions,
    private contractService: ContractService,
  ) {}

  async create(createServiceRequestDto: CreateServiceRequestDto) {
    const data = {
      ...createServiceRequestDto,
      scheduledDate: new Date(createServiceRequestDto.scheduledDate),
      walkthroughDate: new Date(createServiceRequestDto.walkthroughDate),
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

  /**
   * Create a demo quote request (public endpoint - no authentication required)
   * This creates: User -> Property -> Service Request
   * And sends emails to both customer and admin
   */
  async createDemoQuote(
    createServiceRequestDto: CreateServiceRequestDemoQuoteDto,
  ) {
    let transaction: Transaction;

    try {
      // Start transaction
      transaction = await this.sequelize.transaction();

      // 1. Check if user already exists
      let user = await User.findOne({
        where: {
          email: createServiceRequestDto.user.email,
        },
      });

      if (!user) {
        // Create new user with a temporary password
        const temporaryPassword = this.generateTemporaryPassword();

        user = await this.userRepository.create(
          {
            ...createServiceRequestDto.user,
            password: temporaryPassword,
            isActive: true,
            isEmailConfirmed: true,
          },
          transaction,
        );
        this.logger.log(`New user created: ${user.email}`);
      } else {
        this.logger.log(`Existing user found: ${user.email}`);
      }

      // 2. Create property linked to the user
      createServiceRequestDto.property.userId = user.id;

      const property = await this.propertyRepository.create(
        createServiceRequestDto.property,
        transaction,
      );

      this.logger.log(`Property created: ${property.name}`);

      const serviceRequestData: any = {
        userId: user.id,
        propertyId: property.id,
        serviceId: createServiceRequestDto.serviceRequest.serviceId,
        scheduledDate: new Date(
          createServiceRequestDto.serviceRequest.scheduledDate,
        ),
        scheduledTime: createServiceRequestDto.serviceRequest.scheduledTime,
        estimatedPrice: createServiceRequestDto.serviceRequest.estimatedPrice,
        status: ServiceRequestStatus.Pending, // Always start as pending for quotes
        priority: createServiceRequestDto.serviceRequest.priority,
        notes: createServiceRequestDto.serviceRequest.notes,
        specialInstructions:
          createServiceRequestDto.serviceRequest.specialInstructions,
        isRecurring:
          createServiceRequestDto.serviceRequest.isRecurring || false,
        recurrenceFrequency:
          createServiceRequestDto.serviceRequest.recurrenceFrequency,
        recurrenceEndDate: createServiceRequestDto.serviceRequest
          .recurrenceEndDate
          ? new Date(createServiceRequestDto.serviceRequest.recurrenceEndDate)
          : null,
        estimatedDurationMinutes:
          createServiceRequestDto.serviceRequest.estimatedDurationMinutes,
        additionalServices:
          createServiceRequestDto.serviceRequest.additionalServices,
      };

      // 4. Create service request
      const serviceRequest = await this.serviceRequestRepository.create(
        serviceRequestData,
        transaction,
      );

      this.logger.log(`Service request created: #${serviceRequest.id}`);

      // Commit transaction
      await transaction.commit();

      const role = await Role.findOne({ where: { name: ROLES.USER } });
      await UserRole.create({ userId: user.id, roleId: role.id });

      // 5. Fetch complete service request with relations
      const fullServiceRequest =
        await this.serviceRequestRepository.findOneById(serviceRequest.id, [
          { association: 'user' },
          { association: 'service' },
          { association: 'property' },
        ]);
      await this.mailingService.sendServiceRequestAdminEmail(
        fullServiceRequest,
      );
      await this.mailingService.sendServiceRequestCustomerEmail(
        fullServiceRequest,
      );

      return serviceRequest;
    } catch (error) {
      // Rollback transaction if it exists
      if (transaction) {
        await transaction.rollback();
      }
      this.logger.error('Error creating demo quote:', error);
      throw error;
    }
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

        // 4. CREATE CONTRACT AUTOMATICALLY 🎯
        try {
          // Determine payment frequency based on service frequency
          let paymentFrequency: PaymentFrequency;
          switch (fullServiceRequest.recurrenceFrequency) {
            case RecurrenceFrequency.Weekly:
              paymentFrequency = PaymentFrequency.Weekly;
              break;
            case RecurrenceFrequency.BiWeekly:
              paymentFrequency = PaymentFrequency.BiWeekly;
              break;
            case RecurrenceFrequency.Monthly:
              paymentFrequency = PaymentFrequency.Monthly;
              break;
            case RecurrenceFrequency.Quarterly:
              paymentFrequency = PaymentFrequency.Quarterly;
              break;
            default:
              paymentFrequency = PaymentFrequency.OneTime;
          }

          // Calculate contract dates
          const startDate = new Date(fullServiceRequest.scheduledDate);
          let endDate = null;

          if (fullServiceRequest.recurrenceEndDate) {
            endDate = new Date(fullServiceRequest.recurrenceEndDate);
          } else if (fullServiceRequest.isRecurring) {
            // Default: 1 year contract for recurring services
            endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          // Calculate next payment due date (7 days from start for first payment)
          const nextPaymentDue = new Date(startDate);
          nextPaymentDue.setDate(nextPaymentDue.getDate() + 7);

          // Create contract
          const contractData = {
            clientId: fullServiceRequest.userId,
            serviceRequestId: fullServiceRequest.id,
            propertyId: fullServiceRequest.propertyId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            paymentAmount: Number(fullServiceRequest.estimatedPrice),
            paymentFrequency,
            nextPaymentDue: nextPaymentDue.toISOString().split('T')[0],
            serviceFrequency: fullServiceRequest.recurrenceFrequency,
            workStartTime: fullServiceRequest.scheduledTime,
            status: ContractStatus.Active,
            scope:
              fullServiceRequest.specialInstructions ||
              `${fullServiceRequest.service?.name} service`,
            notes:
              approveDto.adminNotes ||
              'Contract created from approved service request',
            estimatedDurationMinutes:
              fullServiceRequest.estimatedDurationMinutes,
            isActive: true,
          };

          const contract: ContractResponseDto =
            await this.contractService.create(contractData);

          this.logger.log(
            `Contract ${contract.contractNumber} created for ServiceRequest #${id}`,
          );
        } catch (error) {
          this.logger.error('Error creating contract:', error);
        }

        // 5. Send approval email to existing customer
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

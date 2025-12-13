import { PaginatedDto } from '@common/dto/paginated.dto';
import { Logger } from '@core/logger/Logger';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { generateTemporaryPassword } from '@libraries/util';
import { ContractService } from '@modules/contract/contract.service';
import { ContractResponseDto } from '@modules/contract/dto/contract-response.dto';
import {
  Contract,
  ContractStatus,
  PaymentFrequency,
} from '@modules/contract/entities/contract.entity';
import { Product } from '@modules/product/entities/product.entity';
import { ProductRepository } from '@modules/product/product.repository';
import { PropertyRepository } from '@modules/property/property.repository';
import { PropertyService } from '@modules/property/property.service';
import { Role } from '@modules/role/entities/role.entity';
import { ROLES } from '@modules/role/enums/roles.enum';
import { Service } from '@modules/service/entities/service.entity';
import { ServiceRepository } from '@modules/service/service.repository';
import { User } from '@modules/user/entities/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';
import { UserRole } from '@modules/userrole/entities/userrole.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IncludeOptions, Op, OrderItem, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ContractDocService } from '@modules/contract/contract-doc.service';
import { MailingService } from '../email/email.service';
import { PaymentService } from '../payment/payment.service';
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
import { ServiceRequestProduct } from './entities/serviceRequestProduct.entity';
import { ServiceRequestStaff } from './entities/serviceRequestStaff.entity';
import { ServiceRequestRepository } from './serviceRequest.repository';

type ServiceRequestProductSelection = {
  productId: number;
  quantity: number;
};

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
    private serviceRepository: ServiceRepository,
    private productRepository: ProductRepository,
    private sequelize: Sequelize, // For transactions,
    private contractService: ContractService,
    private paymentService: PaymentService,
    private contractDocService: ContractDocService,
  ) {}

  async create(createServiceRequestDto: CreateServiceRequestDto) {
    let transaction: Transaction;
    const { products, ...serviceRequestPayload } = createServiceRequestDto;

    try {
      transaction = await this.sequelize.transaction();

      const normalizedProducts = this.normalizeProductSelections(products);
      const estimatedPrice = await this.calculatePriceFromSelections(
        serviceRequestPayload.serviceId,
        serviceRequestPayload.estimatedDurationMinutes,
        normalizedProducts,
      );

      const data = {
        ...serviceRequestPayload,
        scheduledDate: new Date(serviceRequestPayload.scheduledDate),
        walkthroughDate: new Date(serviceRequestPayload.walkthroughDate),
        recurrenceEndDate: serviceRequestPayload.recurrenceEndDate
          ? new Date(serviceRequestPayload.recurrenceEndDate)
          : null,
        estimatedPrice,
      };

      const serviceRequest = await this.serviceRequestRepository.create(
        data,
        transaction,
      );

      await this.replaceServiceRequestProducts(
        serviceRequest.id,
        normalizedProducts,
        transaction,
      );

      await transaction.commit();
      transaction = null;

      const fullServiceRequest =
        await this.serviceRequestRepository.findOneById(serviceRequest.id, [
          { association: 'user' },
          { association: 'service' },
          { association: 'property' },
          { association: 'serviceRequestProducts' },
          { association: 'products' },
        ]);

      await this.mailingService.sendServiceRequestAdminEmail(
        fullServiceRequest,
      );
      await this.mailingService.sendServiceRequestCustomerEmail(
        fullServiceRequest,
      );
      return serviceRequest;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
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
        const temporaryPassword = generateTemporaryPassword();

        user = await this.userRepository.create(
          {
            ...createServiceRequestDto.user,
            password: temporaryPassword,
            isActive: true,
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

      const { products, ...serviceRequestInput } =
        createServiceRequestDto.serviceRequest;

      const normalizedProducts = this.normalizeProductSelections(products);
      const computedEstimatedPrice = await this.calculatePriceFromSelections(
        serviceRequestInput.serviceId,
        serviceRequestInput.estimatedDurationMinutes,
        normalizedProducts,
      );

      const serviceRequestData: any = {
        userId: user.id,
        propertyId: property.id,
        serviceId: serviceRequestInput.serviceId,
        scheduledDate: new Date(serviceRequestInput.scheduledDate),
        scheduledTime: serviceRequestInput.scheduledTime,
        preferredWalkthroughContactTime:
          serviceRequestInput.preferredWalkthroughContactTime,
        estimatedPrice: computedEstimatedPrice,
        status: ServiceRequestStatus.Pending, // Always start as pending for quotes
        priority: serviceRequestInput.priority,
        notes: serviceRequestInput.notes,
        specialInstructions: serviceRequestInput.specialInstructions,
        isRecurring: serviceRequestInput.isRecurring || false,
        recurrenceFrequency: serviceRequestInput.recurrenceFrequency,
        recurrenceEndDate: serviceRequestInput.recurrenceEndDate
          ? new Date(serviceRequestInput.recurrenceEndDate)
          : null,
        estimatedDurationMinutes: serviceRequestInput.estimatedDurationMinutes,
        additionalServices: serviceRequestInput.additionalServices,
      };

      // 4. Create service request
      const serviceRequest = await this.serviceRequestRepository.create(
        serviceRequestData,
        transaction,
      );

      await this.replaceServiceRequestProducts(
        serviceRequest.id,
        normalizedProducts,
        transaction,
      );

      this.logger.log(`Service request created: #${serviceRequest.id}`);

      // Commit transaction
      await transaction.commit();
      transaction = null;

      const role = await Role.findOne({ where: { name: ROLES.USER } });
      await UserRole.create({ userId: user.id, roleId: role.id });

      // 5. Fetch complete service request with relations
      const fullServiceRequest =
        await this.serviceRequestRepository.findOneById(serviceRequest.id, [
          { association: 'user' },
          { association: 'service' },
          { association: 'property' },
          { association: 'serviceRequestProducts' },
          { association: 'products' },
        ]);
      try {
        await this.mailingService.sendServiceRequestAdminEmail(
          fullServiceRequest,
        );
        await this.mailingService.sendServiceRequestCustomerEmail(
          fullServiceRequest,
        );
      } catch (emailError) {
        this.logger.error('Error sending demo quote emails', emailError);
      }

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
    let transaction: Transaction;
    const {
      products,
      estimatedPrice: _ignoredEstimatedPrice,
      ...payload
    } = updateServiceRequestDto;
    void _ignoredEstimatedPrice;

    try {
      transaction = await this.sequelize.transaction();

      const serviceRequest = await this.serviceRequestRepository.findOneById(
        id,
        [{ association: 'serviceRequestProducts' }],
      );

      const shouldRecalculate =
        payload.serviceId !== undefined ||
        payload.estimatedDurationMinutes !== undefined ||
        products !== undefined;

      let normalizedProducts: ServiceRequestProductSelection[] | undefined =
        undefined;

      if (products !== undefined) {
        normalizedProducts = this.normalizeProductSelections(products);
      } else if (shouldRecalculate) {
        normalizedProducts =
          serviceRequest.serviceRequestProducts?.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })) ?? [];
      }

      const {
        scheduledDate: scheduledDateInput,
        walkthroughDate: walkthroughDateInput,
        recurrenceEndDate: recurrenceEndDateInput,
        ...restPayload
      } = payload;
      const updatePayload: Partial<ServiceRequest> = { ...restPayload };

      if (scheduledDateInput) {
        updatePayload.scheduledDate = new Date(scheduledDateInput);
      }

      if (walkthroughDateInput) {
        updatePayload.walkthroughDate = new Date(walkthroughDateInput);
      }

      if (recurrenceEndDateInput) {
        updatePayload.recurrenceEndDate = new Date(recurrenceEndDateInput);
      }

      if (payload.recurrenceEndDate) {
        updatePayload.recurrenceEndDate = new Date(payload.recurrenceEndDate);
      }

      if (shouldRecalculate) {
        const serviceId = updatePayload.serviceId ?? serviceRequest.serviceId;
        const estimatedDurationMinutes =
          updatePayload.estimatedDurationMinutes ??
          serviceRequest.estimatedDurationMinutes;

        const newEstimatedPrice = await this.calculatePriceFromSelections(
          serviceId,
          estimatedDurationMinutes,
          normalizedProducts ?? [],
        );
        updatePayload.estimatedPrice = newEstimatedPrice;
      }

      const updatedServiceRequest = await this.serviceRequestRepository.update(
        id,
        updatePayload,
        transaction,
      );

      if (products !== undefined) {
        await this.replaceServiceRequestProducts(
          id,
          normalizedProducts ?? [],
          transaction,
        );
      }

      await transaction.commit();
      return updatedServiceRequest;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
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

  async assignStaff(serviceRequestId: number, staffIds: number[]) {
    await this.serviceRequestRepository.findOneById(serviceRequestId);

    const uniqueStaffIds = Array.from(new Set(staffIds));

    if (!uniqueStaffIds.length) {
      throw new BadRequestException(
        'At least one staff member must be provided',
      );
    }

    const employees = await this.userRepository.findAll({
      where: {
        id: {
          [Op.in]: uniqueStaffIds,
        },
      },
      include: [
        {
          association: 'roles',
          where: {
            name: ROLES.EMPLOYEE,
          },
          required: true,
        },
      ],
    });

    const validStaffIds = new Set(employees.map((employee) => employee.id));
    const invalidStaffIds = uniqueStaffIds.filter(
      (staffId) => !validStaffIds.has(staffId),
    );

    if (invalidStaffIds.length) {
      throw new BadRequestException(
        `Users must exist and have employee role: ${invalidStaffIds.join(', ')}`,
      );
    }

    await this.replaceServiceRequestStaff(serviceRequestId, uniqueStaffIds);

    const fullServiceRequest = await this.serviceRequestRepository.findOneById(
      serviceRequestId,
      [
        { association: 'user' },
        { association: 'service' },
        { association: 'property' },
        { association: 'assignedStaff' },
      ],
    );

    await Promise.all(
      employees.map((employee) =>
        this.mailingService.sendServiceRequestStaffAssignmentEmail(
          employee,
          fullServiceRequest,
        ),
      ),
    );

    return fullServiceRequest;
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
        {
          association: 'serviceRequestProducts',
          include: [{ association: 'product' }],
        },
        { association: 'products' },
      ],
    );

    // 4. Determine if this is a new customer
    const isNewCustomer = !fullServiceRequest.user.isEmailConfirmed;

    let assignedStaffName: string = null;
    if (approveDto.assignedStaffId) {
      assignedStaffName = 'Service Team';
    }

    try {
      if (isNewCustomer) {
        const temporaryPassword = generateTemporaryPassword();

        const user = await this.userRepository.findOneByEmail(
          fullServiceRequest.user?.email,
        );

        await user.update({
          password: temporaryPassword,
          isActive: true,
          isEmailConfirmed: true,
        });

        this.logger.log(`New customer account confirmed: ${user.email}`);

        await this.mailingService.sendServiceApprovedNewCustomerEmail(
          fullServiceRequest,
          temporaryPassword,
        );

        this.logger.log(`Welcome email sent to new customer: ${user.email}`);
      }
    } catch (error) {
      this.logger.error('Failed to send approval email:', error);
      throw error;
    }

    await this.createContractFromServiceRequest(
      fullServiceRequest,
      approveDto,
      id,
    );

    if (!isNewCustomer) {
      await this.mailingService.sendServiceApprovedExistingCustomerEmail(
        fullServiceRequest,
        assignedStaffName,
      );

      this.logger.log(
        `Approval email sent to existing customer: ${fullServiceRequest.user?.email}`,
      );
    }

    return fullServiceRequest;
  }

  private async createContractFromServiceRequest(
    fullServiceRequest: ServiceRequest,
    approveDto: ApproveServiceRequestDto,
    serviceRequestId: number,
  ): Promise<ContractResponseDto> {
    try {
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

      const startDate = new Date(fullServiceRequest.scheduledDate);
      let endDate = null;

      if (fullServiceRequest.recurrenceEndDate) {
        endDate = new Date(fullServiceRequest.recurrenceEndDate);
      } else if (fullServiceRequest.isRecurring) {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const nextPaymentDue = this.calculateInitialNextPaymentDue(
        startDate,
        paymentFrequency,
      );

      const contractData = {
        clientId: fullServiceRequest.userId,
        serviceRequestId: fullServiceRequest.id,
        propertyId: fullServiceRequest.propertyId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        paymentAmount: this.resolvePaymentAmount(fullServiceRequest),
        paymentFrequency,
        nextPaymentDue: nextPaymentDue
          ? nextPaymentDue.toISOString().split('T')[0]
          : null,
        serviceFrequency: fullServiceRequest.recurrenceFrequency,
        workStartTime: this.normalizeTime(fullServiceRequest.scheduledTime),
        workEndTime: this.normalizeTime(fullServiceRequest.scheduledTime, 8),
        status: ContractStatus.Active,
        scope:
          fullServiceRequest.specialInstructions ||
          `${fullServiceRequest.service?.name} service`,
        notes:
          approveDto.adminNotes ||
          'Contract created from approved service request',
        estimatedDurationMinutes: fullServiceRequest.estimatedDurationMinutes,
        isActive: true,
      };

      const contract = await this.contractService.create(contractData);

      if (paymentFrequency === PaymentFrequency.OneTime) {
        await this.createImmediateContractPayment(contract.id);
      }

      this.logger.log(
        `Contract ${contract.contractNumber} created for ServiceRequest #${serviceRequestId}`,
      );

      try {
        await this.contractService.sendContractEmailWithPdf(contract.id);
        this.logger.log(
          `Contract PDF email sent for Contract #${contract.contractNumber}`,
        );
      } catch (pdfError) {
        this.logger.error('Error sending contract PDF email: ', pdfError);
      }

      return contract;
    } catch (error) {
      this.logger.error('Error creating contract:', error);
      throw error;
    }
  }

  private resolvePaymentAmount(serviceRequest: ServiceRequest): number {
    const recalculatedPrice = serviceRequest.service
      ? this.calculateEstimatedPriceValue(
          serviceRequest.service,
          serviceRequest.estimatedDurationMinutes,
          serviceRequest.serviceRequestProducts?.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })) ?? [],
        )
      : null;

    const priceSource =
      serviceRequest.actualPrice ??
      recalculatedPrice ??
      serviceRequest.estimatedPrice ??
      0;

    return Number(priceSource);
  }

  private calculateInitialNextPaymentDue(
    startDate: Date,
    paymentFrequency: PaymentFrequency,
  ): Date | null {
    const nextDate = new Date(startDate);

    switch (paymentFrequency) {
      case PaymentFrequency.Weekly:
        nextDate.setDate(nextDate.getDate() + 7);
        return nextDate;
      case PaymentFrequency.BiWeekly:
        nextDate.setDate(nextDate.getDate() + 14);
        return nextDate;
      case PaymentFrequency.Monthly:
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate;
      case PaymentFrequency.Quarterly:
        nextDate.setMonth(nextDate.getMonth() + 3);
        return nextDate;
      default:
        return null;
    }
  }

  private async createImmediateContractPayment(contractId: number) {
    try {
      await this.paymentService.create(
        {
          contractId,
          sendEmail: true,
        },
        null,
      );
      this.logger.log(
        `Immediate payment session created for one-time contract #${contractId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create immediate payment for contract #${contractId}: ${error}`,
      );
    }
  }

  async generateContractPreview(serviceRequestId: number): Promise<Buffer> {
    const serviceRequest = await this.serviceRequestRepository.findOneById(
      serviceRequestId,
      [
        { association: 'user' },
        { association: 'property' },
        { association: 'service' },
        {
          association: 'serviceRequestProducts',
          include: [{ association: 'product' }],
        },
      ],
    );

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    const paymentFrequency =
      this.getPaymentFrequencyForServiceRequest(serviceRequest);

    const startDate = serviceRequest.scheduledDate
      ? new Date(serviceRequest.scheduledDate)
      : serviceRequest.walkthroughDate
        ? new Date(serviceRequest.walkthroughDate)
        : new Date();

    let endDate: Date = null;
    if (serviceRequest.recurrenceEndDate) {
      endDate = new Date(serviceRequest.recurrenceEndDate);
    } else if (serviceRequest.isRecurring) {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const nextPaymentDue = this.calculateInitialNextPaymentDue(
      new Date(startDate),
      paymentFrequency,
    );

    const contractLike = {
      id: null,
      contractNumber: `SR-${serviceRequest.id}-PREVIEW`,
      clientId: serviceRequest.userId,
      client: serviceRequest.user,
      propertyId: serviceRequest.propertyId,
      property: serviceRequest.property,
      serviceRequestId: serviceRequest.id,
      serviceRequest,
      startDate,
      endDate,
      paymentAmount: this.resolvePaymentAmount(serviceRequest),
      paymentFrequency,
      nextPaymentDue,
      serviceFrequency: serviceRequest.recurrenceFrequency,
      workStartTime: this.normalizeTime(serviceRequest.scheduledTime),
      workEndTime: this.normalizeTime(serviceRequest.scheduledTime, 8),
      status: ContractStatus.Draft,
      scope:
        serviceRequest.specialInstructions ||
        `${serviceRequest.service?.name || 'Service'} service`,
      notes: serviceRequest.notes,
      estimatedDurationMinutes: serviceRequest.estimatedDurationMinutes,
      isActive: false,
      createdAt: serviceRequest.createdAt || new Date(),
      updatedAt: new Date(),
    } as Contract;

    return await this.contractDocService.generateEditableContract(contractLike);
  }

  private getPaymentFrequencyForServiceRequest(
    fullServiceRequest: ServiceRequest,
  ): PaymentFrequency {
    switch (fullServiceRequest.recurrenceFrequency) {
      case RecurrenceFrequency.Weekly:
        return PaymentFrequency.Weekly;
      case RecurrenceFrequency.BiWeekly:
        return PaymentFrequency.BiWeekly;
      case RecurrenceFrequency.Monthly:
        return PaymentFrequency.Monthly;
      case RecurrenceFrequency.Quarterly:
        return PaymentFrequency.Quarterly;
      default:
        return PaymentFrequency.OneTime;
    }
  }

  private normalizeProductSelections(
    products?: Array<{ productId: number; quantity?: number }>,
  ): ServiceRequestProductSelection[] {
    if (!products?.length) {
      return [];
    }

    const normalized = new Map<number, number>();

    for (const product of products) {
      if (!product || typeof product.productId !== 'number') {
        continue;
      }

      const quantityInput =
        typeof product.quantity === 'number' &&
        Number.isFinite(product.quantity)
          ? product.quantity
          : 1;
      const cleanedQuantity = Math.max(1, Math.floor(quantityInput));
      const current = normalized.get(product.productId) ?? 0;
      normalized.set(product.productId, current + cleanedQuantity);
    }

    return Array.from(normalized.entries()).map(
      ([productId, quantity]): ServiceRequestProductSelection => ({
        productId,
        quantity,
      }),
    );
  }

  private async calculatePriceFromSelections(
    serviceId: number,
    estimatedDurationMinutes?: number,
    products: ServiceRequestProductSelection[] = [],
  ): Promise<number> {
    const service = await this.serviceRepository.findOneById(serviceId);

    let productEntities: Product[] = [];
    const productIds = Array.from(
      new Set(products.map((product) => product.productId)),
    );

    if (productIds.length) {
      productEntities = await this.productRepository.findAll({
        where: {
          id: {
            [Op.in]: productIds,
          },
        },
      });

      const foundIds = new Set(productEntities.map((product) => product.id));
      const missing = productIds.filter((id) => !foundIds.has(id));

      if (missing.length) {
        throw new NotFoundException(
          `Products not found: ${missing.join(', ')}`,
        );
      }
    }

    const productsMap = new Map(productEntities.map((p) => [p.id, p]));

    return this.calculateEstimatedPriceValue(
      service,
      estimatedDurationMinutes,
      products.map((selection) => ({
        product: productsMap.get(selection.productId),
        quantity: selection.quantity,
      })),
    );
  }

  private calculateEstimatedPriceValue(
    service: Service,
    estimatedDurationMinutes?: number,
    products: Array<{ product?: Product; quantity: number }> = [],
  ): number {
    const durationMinutes =
      estimatedDurationMinutes ?? service.estimatedDurationMinutes ?? 0;
    const durationHours = durationMinutes / 60;
    const serviceRate = Number(service.basePrice || 0);
    const serviceTotal = durationHours > 0 ? serviceRate * durationHours : 0;

    const productsTotal = products.reduce((sum, item) => {
      if (!item.product) {
        return sum;
      }
      return sum + Number(item.product.price || 0) * item.quantity;
    }, 0);

    return Number((serviceTotal + productsTotal).toFixed(2));
  }

  private async replaceServiceRequestProducts(
    serviceRequestId: number,
    products: ServiceRequestProductSelection[],
    transaction?: Transaction,
  ) {
    await ServiceRequestProduct.destroy({
      where: { serviceRequestId },
      transaction,
    });

    if (!products.length) {
      return;
    }

    await ServiceRequestProduct.bulkCreate(
      products.map((product) => ({
        serviceRequestId,
        productId: product.productId,
        quantity: product.quantity,
      })),
      { transaction },
    );
  }

  private async replaceServiceRequestStaff(
    serviceRequestId: number,
    staffIds: number[],
    transaction?: Transaction,
  ) {
    await ServiceRequestStaff.destroy({
      where: { serviceRequestId },
      transaction,
    });

    if (!staffIds.length) {
      return;
    }

    await ServiceRequestStaff.bulkCreate(
      staffIds.map((staffId) => ({
        serviceRequestId,
        staffId,
      })),
      { transaction },
    );
  }

  private normalizeTime(time?: string, hoursToAdd = 0): string {
    if (!time) {
      return null;
    }
    try {
      const [hoursPart = '0', minutesPart = '0'] = time.split(':');
      let hours = parseInt(hoursPart, 10);
      const minutes = parseInt(minutesPart, 10);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
      }
      if (hoursToAdd) {
        hours = (hours + hoursToAdd) % 24;
        if (hours < 0) hours += 24;
      }
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0',
      )}`;
    } catch (error) {
      this.logger.warn(`Invalid time received (${time}), skipping conversion`);
      return null;
    }
  }
}

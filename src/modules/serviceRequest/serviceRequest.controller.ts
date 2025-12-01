import { AppendUser } from '@decorators/appendUser.decorator';
import { FilterOwner } from '@decorators/filterOwner.decorator';
import { User } from '@decorators/user.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IJwtPayload } from '@modules/auth/auth.service';
import { IsOwner } from '@modules/auth/decorators/isOwner.decorator';
import { IsOwnerOrIsRole } from '@modules/auth/decorators/isOwnerOrIsRole.decorator';
import { IsRole } from '@modules/auth/decorators/isRole.decorator';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { CreatePropertyDto } from '@modules/property/dto/create-property.dto';
import { ROLES } from '@modules/role/enums/roles.enum';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseAttributesPipe } from '@pipes/parseAttributes.pipe';
import { ParseIncludePipe } from '@pipes/parseInclude.pipe';
import { ParseLimitPipe } from '@pipes/parseLimit.pipe';
import { ParseOffsetPipe } from '@pipes/parseOffset.pipe';
import { ParseOrderPipe } from '@pipes/parseOrder.pipe';
import { ParseWherePipe } from '@pipes/parseWhere.pipe';
import { ApiCreatedResponseData } from '@swagger/httpResponses/Created.decorator';
import { ApiOkResponseData } from '@swagger/httpResponses/Ok.decorator';
import { ApiOkResponsePaginatedData } from '@swagger/httpResponses/OkPaginatedData.decorator';
import { ApiQueryAttributes } from '@swagger/parameters/attributes.decorator';
import { ApiQueryInclude } from '@swagger/parameters/include.decorator';
import { ApiQueryWhere } from '@swagger/parameters/where.decorator';
import { ApiCommonResponses } from '@swagger/utils/commonResponses.decorator';
import { ApiQueryPagination } from '@swagger/utils/pagination.decorator';
import { IncludeOptions, OrderItem } from 'sequelize';
import { ApproveServiceRequestDto } from './dto/approved-service-request.dto';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { AssignServiceRequestStaffDto } from './dto/assign-service-request-staff.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateServiceRequestDemoQuoteDto } from './dto/demo-quote-dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from './entities/serviceRequest.entity';
import { ServiceRequestService } from './serviceRequest.service';

@ApiExtraModels(
  ServiceRequest,
  CreateServiceRequestDto,
  CreateServiceRequestDemoQuoteDto,
  CreateUserDto,
  CreatePropertyDto,
)
@ApiTags('service-requests')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(private serviceRequestService: ServiceRequestService) {}

  @ApiOperation({ summary: 'Create a Service Request' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(ServiceRequest)
  @AppendUser()
  @ValidateJWT()
  @Post()
  async create(@Body() createServiceRequestDto: CreateServiceRequestDto) {
    return await this.serviceRequestService.create(createServiceRequestDto);
  }

  @ApiOperation({ summary: 'Create a Service  for demo quotes without auth' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(ServiceRequest)
  @Post('/demo-quote')
  async createDemoQuote(
    @Body() createServiceRequestDemoQuoteDto: CreateServiceRequestDemoQuoteDto,
  ) {
    return await this.serviceRequestService.createDemoQuote(
      createServiceRequestDemoQuoteDto,
    );
  }

  @ApiOperation({ summary: 'Approve Service Request (Admin only)' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveServiceRequestDto,
    @Req() req: Request & { user?: any },
  ) {
    const currentUserId = req.user.id;
    return await this.serviceRequestService.approve(
      +id,
      approveDto,
      currentUserId,
    );
  }

  @ApiOperation({ summary: 'Get all Service Request entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(ServiceRequest)
  @ApiCommonResponses()
  @FilterOwner()
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<ServiceRequest>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(ServiceRequest))
    include?: IncludeOptions[],
  ) {
    return await this.serviceRequestService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get upcoming service requests for current user' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('upcoming')
  async findUpcoming(@User() user: IJwtPayload) {
    return await this.serviceRequestService.findUpcoming(user.id);
  }

  @ApiOperation({ summary: 'Get pending service requests (Admin only)' })
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('pending')
  async findPending() {
    return await this.serviceRequestService.findPending();
  }

  @ApiOperation({ summary: 'Get service requests by status' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('status/:status')
  async findByStatus(@Param('status') status: ServiceRequestStatus) {
    return await this.serviceRequestService.findByStatus(status);
  }

  @ApiOperation({ summary: 'Get service requests by property' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('property/:propertyId')
  async findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return await this.serviceRequestService.findByPropertyId(propertyId);
  }

  @ApiOperation({ summary: 'Get Service Request entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @IsOwnerOrIsRole(ServiceRequestService, [ROLES.ADMIN])
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(ServiceRequest))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.serviceRequestService.findOne(+id, include, attributes);
  }

  @ApiOperation({ summary: 'Update Service Request entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @IsOwnerOrIsRole(ServiceRequestService, [ROLES.ADMIN])
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceRequestDto: UpdateServiceRequestDto,
  ) {
    return await this.serviceRequestService.update(
      +id,
      updateServiceRequestDto,
    );
  }

  @ApiOperation({ summary: 'Cancel Service Request' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @IsOwner(ServiceRequestService)
  @ValidateJWT()
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelDto: CancelServiceRequestDto,
  ) {
    return await this.serviceRequestService.cancel(+id, cancelDto);
  }

  @ApiOperation({ summary: 'Mark Service Request as completed (Admin only)' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { actualPrice?: number; actualDurationMinutes?: number },
  ) {
    return await this.serviceRequestService.complete(
      +id,
      body.actualPrice,
      body.actualDurationMinutes,
    );
  }

  @ApiOperation({ summary: 'Assign staff to a Service Request (Admin only)' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceRequest)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/staff')
  async assignStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignStaffDto: AssignServiceRequestStaffDto,
  ) {
    return await this.serviceRequestService.assignStaff(
      +id,
      assignStaffDto.staffIds,
    );
  }

  @ApiOperation({ summary: 'Delete Service Request entry by id' })
  @ApiCommonResponses()
  @HttpCode(204)
  @IsOwner(ServiceRequestService)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceRequestService.remove(+id);
  }
}

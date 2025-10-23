import { AppendUser } from '@decorators/appendUser.decorator';
import { User } from '@decorators/user.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IJwtPayload } from '@modules/auth/auth.service';
import { IsRole } from '@modules/auth/decorators/isRole.decorator';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { ROLES } from '@modules/role/enums/roles.enum';
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
import { CreateServiceReportDto } from './dto/create-service-report.dto';
import { CustomerFeedbackDto } from './dto/customer-feedback.dto';
import { UpdateServiceReportDto } from './dto/update-service-report.dto';
import {
  ServiceReport,
  ServiceReportStatus,
} from './entities/serviceReport.entity';
import { ServiceReportService } from './serviceReport.service';

@ApiExtraModels(ServiceReport)
@ApiTags('service-reports')
@Controller('service-reports')
export class ServiceReportController {
  constructor(private serviceReportService: ServiceReportService) {}

  @ApiOperation({ summary: 'Create a Service Report (Staff only)' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(ServiceReport)
  @AppendUser<CreateServiceReportDto>('staffId')
  @ValidateJWT()
  @Post()
  async create(@Body() createServiceReportDto: CreateServiceReportDto) {
    return await this.serviceReportService.create(createServiceReportDto);
  }

  @ApiOperation({ summary: 'Get all Service Report entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(ServiceReport)
  @ApiCommonResponses()
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<ServiceReport>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(ServiceReport))
    include?: IncludeOptions[],
  ) {
    return await this.serviceReportService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get reports pending review (Admin only)' })
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('pending-review')
  async findPendingReview() {
    return await this.serviceReportService.findPendingReview();
  }

  @ApiOperation({ summary: 'Get reports requiring follow-up (Admin only)' })
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('follow-up')
  async findRequiringFollowUp() {
    return await this.serviceReportService.findRequiringFollowUp();
  }

  @ApiOperation({ summary: 'Get reports by status' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('status/:status')
  async findByStatus(@Param('status') status: ServiceReportStatus) {
    return await this.serviceReportService.findByStatus(status);
  }

  @ApiOperation({ summary: 'Get reports by staff member' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('staff/:staffId')
  async findByStaff(@Param('staffId', ParseIntPipe) staffId: number) {
    return await this.serviceReportService.findByStaffId(staffId);
  }

  @ApiOperation({ summary: 'Get staff statistics' })
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('staff/:staffId/stats')
  async getStaffStats(@Param('staffId', ParseIntPipe) staffId: number) {
    return await this.serviceReportService.getStaffStats(staffId);
  }

  @ApiOperation({ summary: 'Get report by service request' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @ValidateJWT()
  @Get('service-request/:serviceRequestId')
  async findByServiceRequest(
    @Param('serviceRequestId', ParseIntPipe) serviceRequestId: number,
  ) {
    return await this.serviceReportService.findByServiceRequestId(
      serviceRequestId,
    );
  }

  @ApiOperation({ summary: 'Get Service Report entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(ServiceReport))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.serviceReportService.findOne(+id, include, attributes);
  }

  @ApiOperation({ summary: 'Update Service Report entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceReportDto: UpdateServiceReportDto,
  ) {
    return await this.serviceReportService.update(+id, updateServiceReportDto);
  }

  @ApiOperation({ summary: 'Submit report for review' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @ValidateJWT()
  @Patch(':id/submit')
  async submitReport(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceReportService.submitReport(+id);
  }

  @ApiOperation({ summary: 'Review and approve/reject report (Admin only)' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/review')
  async reviewReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approved: boolean },
    @User() user: IJwtPayload,
  ) {
    return await this.serviceReportService.reviewReport(
      +id,
      user.id,
      body.approved,
    );
  }

  @ApiOperation({ summary: 'Add customer feedback to report' })
  @ApiCommonResponses()
  @ApiOkResponseData(ServiceReport)
  @ValidateJWT()
  @Patch(':id/feedback')
  async addCustomerFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() feedbackDto: CustomerFeedbackDto,
  ) {
    return await this.serviceReportService.addCustomerFeedback(
      +id,
      feedbackDto,
    );
  }

  @ApiOperation({ summary: 'Delete Service Report entry by id (Admin only)' })
  @ApiCommonResponses()
  @HttpCode(204)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceReportService.remove(+id);
  }
}

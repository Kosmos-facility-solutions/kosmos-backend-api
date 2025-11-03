import { AppendUser } from '@decorators/appendUser.decorator';
import { FilterOwner } from '@decorators/filterOwner.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
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
import { ContractService } from './contract.service';
import { ContractResponseDto } from './dto/contract-response.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';

@ApiExtraModels(Contract, CreateContractDto, ContractResponseDto)
@ApiTags('contracts')
@Controller('contracts')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @ApiOperation({ summary: 'Create a new contract' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(ContractResponseDto)
  @AppendUser()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Post()
  async create(@Body() createContractDto: CreateContractDto) {
    return await this.contractService.create(createContractDto);
  }

  @ApiOperation({ summary: 'Get all contracts' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(ContractResponseDto)
  @ApiCommonResponses()
  @FilterOwner('clientId')
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Contract>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Contract))
    include?: IncludeOptions[],
  ) {
    return await this.contractService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get active contracts only' })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('active')
  async findActiveContracts() {
    return await this.contractService.findActiveContracts();
  }

  @ApiOperation({
    summary: 'Get contracts with upcoming payments (within 7 days)',
  })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('upcoming-payments')
  async findContractsWithUpcomingPayments(
    @Query('daysAhead', ParseIntPipe) days?: number,
  ) {
    return await this.contractService.findContractsWithUpcomingPayments(
      days || 7,
    );
  }

  @ApiOperation({ summary: 'Get contracts with overdue payments' })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('overdue-payments')
  async findContractsWithOverduePayments() {
    return await this.contractService.findContractsWithOverduePayments();
  }

  @ApiOperation({ summary: 'Get expiring contracts (within 30 days)' })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('expiring')
  async findExpiringContracts(@Query('days', ParseIntPipe) days?: number) {
    return await this.contractService.findExpiringContracts(days || 30);
  }

  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(Contract))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.contractService.findOne(id, include, attributes);
  }

  @ApiOperation({ summary: 'Get contract by contract number' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @ValidateJWT()
  @Get('number/:contractNumber')
  async findByContractNumber(@Param('contractNumber') contractNumber: string) {
    return await this.contractService.findByContractNumber(contractNumber);
  }

  @ApiOperation({ summary: 'Update a contract' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return await this.contractService.update(id, updateContractDto);
  }

  @ApiOperation({ summary: 'Activate a contract' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.activate(id);
  }

  @ApiOperation({ summary: 'Pause a contract' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/pause')
  async pause(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.pause(id);
  }

  @ApiOperation({ summary: 'Cancel a contract' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return await this.contractService.cancel(id, reason);
  }

  @ApiOperation({ summary: 'Complete a contract' })
  @ApiCommonResponses()
  @ApiOkResponseData(ContractResponseDto)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.complete(id);
  }

  @ApiOperation({ summary: 'Get contracts by client ID' })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get('client/:clientId')
  async findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return await this.contractService.findByClient(clientId);
  }

  @ApiOperation({ summary: 'Get contracts by property ID' })
  @ApiOkResponseData(ContractResponseDto)
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('property/:propertyId')
  async findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return await this.contractService.findByProperty(propertyId);
  }

  @ApiOperation({ summary: 'Delete a contract (Admin only)' })
  @ApiCommonResponses()
  @HttpCode(204)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.remove(id);
  }
}

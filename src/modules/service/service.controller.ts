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
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceCategory } from './entities/service.entity';
import { ServiceService } from './service.service';

@ApiExtraModels(Service)
@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @ApiOperation({ summary: 'Create a Service (Admin only)' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(Service)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return await this.serviceService.create(createServiceDto);
  }

  @ApiOperation({ summary: 'Get all Service entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Service)
  @ApiCommonResponses()
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Service>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Service))
    include?: IncludeOptions[],
  ) {
    return await this.serviceService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get all active services' })
  @ApiCommonResponses()
  @Get('active')
  async findActiveServices() {
    return await this.serviceService.findActiveServices();
  }

  @ApiOperation({ summary: 'Get popular services' })
  @ApiCommonResponses()
  @Get('popular')
  async findPopularServices(@Query('limit', ParseIntPipe) limit?: number) {
    return await this.serviceService.findPopularServices(limit);
  }

  @ApiOperation({ summary: 'Get services by category' })
  @ApiCommonResponses()
  @Get('category/:category')
  async findByCategory(@Param('category') category: ServiceCategory) {
    return await this.serviceService.findByCategory(category);
  }

  @ApiOperation({ summary: 'Get Service entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Service)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(Service))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.serviceService.findOne(+id, include, attributes);
  }

  @ApiOperation({ summary: 'Update Service entry by id (Admin only)' })
  @ApiCommonResponses()
  @ApiOkResponseData(Service)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.serviceService.update(+id, updateServiceDto);
  }

  @ApiOperation({ summary: 'Delete Service entry by id (Admin only)' })
  @ApiCommonResponses()
  @HttpCode(204)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceService.remove(+id);
  }
}

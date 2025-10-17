import { AppendUser } from '@decorators/appendUser.decorator';
import { FilterOwner } from '@decorators/filterOwner.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IsOwner } from '@modules/auth/decorators/isOwner.decorator';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
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
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { PropertyService } from './property.service';

@ApiExtraModels(Property)
@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @ApiOperation({ summary: 'Create a Property' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(Property)
  @AppendUser()
  @ValidateJWT()
  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return await this.propertyService.create(createPropertyDto);
  }

  @ApiOperation({ summary: 'Get all Property entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Property)
  @ApiCommonResponses()
  @FilterOwner()
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Property>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Property))
    include?: IncludeOptions[],
  ) {
    return await this.propertyService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get Property entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Property)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @IsOwner(PropertyService)
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(Property))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.propertyService.findOne(+id, include, attributes);
  }

  @ApiOperation({ summary: 'Update Property entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Property)
  @IsOwner(PropertyService)
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return await this.propertyService.update(+id, updatePropertyDto);
  }

  @ApiOperation({ summary: 'Delete Property entry by id' })
  @ApiCommonResponses()
  @HttpCode(204)
  @IsOwner(PropertyService)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.propertyService.remove(+id);
  }
}

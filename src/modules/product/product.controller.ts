import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IsRole } from '@modules/auth/decorators/isRole.decorator';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { ROLES } from '@modules/role/enums/roles.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@ApiExtraModels(Product)
@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponseData(Product)
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'List products' })
  @ApiCommonResponses()
  @ApiOkResponsePaginatedData(Product)
  @ApiQueryWhere()
  @ApiQueryPagination()
  @ApiQueryInclude()
  @ApiQueryAttributes()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Product>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('include', new ParseIncludePipe(Product))
    include?: IncludeOptions[],
  ) {
    return await this.productService.findAll({
      where,
      offset,
      limit,
      order,
      attributes,
      include,
    });
  }

  @ApiOperation({ summary: 'Get product by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Product)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOne(id);
  }

  @ApiOperation({ summary: 'Update product' })
  @ApiCommonResponses()
  @ApiOkResponseData(Product)
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiCommonResponses()
  @IsRole(ROLES.ADMIN)
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.remove(id);
  }
}

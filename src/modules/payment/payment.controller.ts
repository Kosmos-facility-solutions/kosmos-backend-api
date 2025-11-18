import { User as UserDecorator } from '@decorators/user.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';
import { IJwtPayload } from '@modules/auth/auth.service';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { IsRole } from '@modules/auth/decorators/isRole.decorator';
import { ROLES } from '@modules/role/enums/roles.enum';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@ApiExtraModels(Payment, PaymentResponseDto)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create a payment session for a user' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(PaymentResponseDto)
  @ValidateJWT()
  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @UserDecorator() user: IJwtPayload,
  ) {
    return await this.paymentService.create(createPaymentDto, user);
  }

  @ApiOperation({ summary: 'List all payments (admin only)' })
  @ApiCommonResponses()
  @ApiOkResponsePaginatedData(PaymentResponseDto)
  @ApiQueryWhere()
  @ApiQueryPagination()
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @ValidateJWT()
  @IsRole(ROLES.ADMIN)
  @Get()
  async findAll(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Payment>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe) attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Payment))
    include?: IncludeOptions[],
  ) {
    return await this.paymentService.findAll({
      where,
      offset,
      limit,
      order,
      include,
      attributes,
    });
  }

  @ApiOperation({ summary: 'List payments for current user' })
  @ApiCommonResponses()
  @ApiOkResponseData(PaymentResponseDto)
  @ValidateJWT()
  @Get('me')
  async findMine(@UserDecorator() user: IJwtPayload) {
    return await this.paymentService.findForUser(user.id);
  }

  @ApiOperation({ summary: 'Get payment by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(PaymentResponseDto)
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: IJwtPayload,
  ) {
    return await this.paymentService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Receive payment webhook events' })
  @HttpCode(200)
  @Post('webhook')
  async handleWebhook(@Body() webhookDto: PaymentWebhookDto) {
    return await this.paymentService.handleWebhook(webhookDto);
  }
}

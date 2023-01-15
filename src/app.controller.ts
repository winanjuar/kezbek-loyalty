import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { EPatternMessage } from './core/pattern-message.enum';
import { IRequestCalculateLoyalty } from './core/request-calculate-loyalty.interface';
import { IResponseCalculateLoyalty } from './core/response-calculate-loyalty.interface';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { CreateLoyaltyCustomerResponseDto } from './dto/response/create-loyalty-customer.response.dto';
import { BaseLoyaltyCustomerActualResponseDto } from './dto/response/base-loyalty-customer-actual.response.dto';
import { BaseLoyaltyCustomerActualDto } from './dto/base-loyalty-customer-actual.dto';
import { ETierName } from './core/tier-name.enum';
import { TierMasterPointResponseDto } from './dto/response/tier-master-point.response.dto';
import { ResultLoyaltyCustomerResponseDto } from './dto/response/result-loyalty-customer.response.dto';
import { IRequestIdCustomer } from './core/request-id-customer.interface';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';

@ApiTags('Loyalty')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ type: TierMasterPointResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Get('try-tier-master-point')
  async getTierMaster() {
    const logIdentifier = 'GET try-tier-master';
    try {
      const tierMasterPoints = await this.appService.getTierMaster();

      this.logger.log(`[${logIdentifier}] Get tier master successfully`);
      return new TierMasterPointResponseDto(
        HttpStatus.OK,
        'Get tier master successfully',
        tierMasterPoints,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: BaseLoyaltyCustomerActualResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiParam({ name: 'customer_id', type: 'string' })
  @Get('try-loyalty-actual/:customer_id')
  async getLoyaltyActual(@Param('customer_id') customer_id: string) {
    const logIdentifier = 'GET try-loyalty-actual';
    try {
      const loyaltyActual = await this.appService.getCurrentLoyalty(
        customer_id,
      );

      const result: BaseLoyaltyCustomerActualDto = {
        customer_id: customer_id,
        total_trx: loyaltyActual?.total_trx ? loyaltyActual.total_trx : 0,
        tier: loyaltyActual?.tier?.name
          ? loyaltyActual.tier.name
          : ETierName.BRONZE,
        max_trx: loyaltyActual?.tier?.max_trx ? loyaltyActual.tier.max_trx : 7,
      };

      this.logger.log(
        `[${logIdentifier}] [${customer_id}] Get loyalty actual successfully`,
      );
      return new BaseLoyaltyCustomerActualResponseDto(
        HttpStatus.OK,
        'Get loyalty actual successfully',
        result,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: ResultLoyaltyCustomerResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiParam({ name: 'customer_id', type: 'string' })
  @Get('try-loyalty-history/:customer_id')
  async getLoyaltyHistory(@Param('customer_id') customer_id: string) {
    const logIdentifier = 'GET try-loyalty-history';
    try {
      const loyaltyHistory = await this.appService.getLoyaltyHistory(
        customer_id,
      );

      this.logger.log(
        `[${logIdentifier}] [${customer_id}] Get loyalty history successfully`,
      );
      return new ResultLoyaltyCustomerResponseDto(
        HttpStatus.OK,
        'Get loyalty history successfully',
        loyaltyHistory,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiBody({ type: LoyaltyTransactionRequestDto })
  @ApiCreatedResponse({ type: CreateLoyaltyCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('try-new-transaction')
  async createNewTransaction(@Body() loyaltyDto: LoyaltyTransactionRequestDto) {
    const logIdentifier = 'POST try-new-transaction';
    try {
      const loyaltyCustomer = await this.appService.createNewTransaction(
        loyaltyDto,
      );
      this.logger.log(
        `[${logIdentifier}] [${loyaltyDto.transaction_id}] Write loyalty custumer successfully`,
      );
      return new CreateLoyaltyCustomerResponseDto(
        HttpStatus.OK,
        'Write loyalty custumer successfully',
        loyaltyCustomer,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern(EPatternMessage.INFO_LOYALTY)
  async handleInfoLoyalty(@Payload() data: IRequestIdCustomer) {
    try {
      const customer_id = data.customer_id;
      const loyaltyActual = await this.appService.getCurrentLoyalty(
        customer_id,
      );
      this.logger.log(
        `[${EPatternMessage.INFO_LOYALTY}] [${customer_id}] Get info loyalty successfully`,
      );

      return {
        customer_id: customer_id,
        total_trx: loyaltyActual?.total_trx ? loyaltyActual.total_trx : 0,
        tier: loyaltyActual?.tier?.name
          ? loyaltyActual.tier.name
          : ETierName.BRONZE,
        max_trx: loyaltyActual?.tier?.max_trx ? loyaltyActual.tier.max_trx : 7,
      } as IResponseInfoLoyalty;
    } catch (error) {
      this.logger.log(`[${EPatternMessage.INFO_LOYALTY}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern(EPatternMessage.CALCULATE_LOYALTY_POINT)
  async handleCalculateLoyaltyPoint(
    @Payload() data: IRequestCalculateLoyalty,
  ): Promise<IResponseCalculateLoyalty> {
    try {
      const loyaltyDto: LoyaltyTransactionRequestDto = {
        transaction_id: data.transaction_id,
        customer_id: data.customer_id,
        transaction_time: data.transaction_time,
      };

      const loyaltyCustomer = await this.appService.createNewTransaction(
        loyaltyDto,
      );

      this.logger.log(
        `[${EPatternMessage.CALCULATE_LOYALTY_POINT}] [${loyaltyDto.transaction_id}] Write loyalty point successfully`,
      );

      return {
        transaction_id: data.transaction_id,
        point: loyaltyCustomer.point,
        total_trx: loyaltyCustomer.total_trx,
        remark: loyaltyCustomer.remark,
        tier: loyaltyCustomer.tier.name,
      } as IResponseCalculateLoyalty;
    } catch (error) {
      this.logger.log(`[${EPatternMessage.CALCULATE_LOYALTY_POINT}] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}

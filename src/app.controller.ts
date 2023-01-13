import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { IRequestInfoLoyalty } from './core/request-info-loyalty.interface';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { LoyaltyCustomerActualResponseDto } from './dto/response/loyalty-customer-actual.response.dto';

@ApiTags('Loyalty')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: LoyaltyTransactionRequestDto })
  @ApiOkResponse({ type: LoyaltyCustomerActualResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @HttpCode(200)
  @Post()
  async createNewTransaction(@Body() loyaltyDto: LoyaltyTransactionRequestDto) {
    try {
      const loyalctyCustomerActual = await this.appService.createNewTransaction(
        loyaltyDto,
      );
      this.logger.log(
        `[POST, /] [${loyaltyDto.transaction_id}] Set loyalty custumer actual successfully`,
      );
      return new LoyaltyCustomerActualResponseDto(
        HttpStatus.OK,
        'Set loyalty custumer actual successfully',
        loyalctyCustomerActual,
      );
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern('mp_loyalty_point')
  async handleGetLoyaltyPoint(
    @Payload() data: IRequestInfoLoyalty,
  ): Promise<IResponseInfoLoyalty> {
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
        `[MessagePattern mp_loyalty_point] [${loyaltyDto.transaction_id}] Calculate loyalty point successfully`,
      );

      return {
        transaction_id: data.transaction_id,
        point: loyaltyCustomer.point,
        total_trx: loyaltyCustomer.total_trx,
        remark: loyaltyCustomer.remark,
        tier: loyaltyCustomer.tier.name,
      } as IResponseInfoLoyalty;
    } catch (error) {
      this.logger.log(`[MessagePattern mp_loyalty_point] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}

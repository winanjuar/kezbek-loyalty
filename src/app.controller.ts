import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { IRequestInfoLoyalty } from './core/request-info-loyalty.interface';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Post()
  async createNewTransaction(@Body() loyaltyDto: LoyaltyTransactionRequestDto) {
    return this.appService.createNewTransaction(loyaltyDto);
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
        point: loyaltyCustomer.poin,
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

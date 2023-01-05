import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async createNewTransaction(@Body() loyaltyDto: LoyaltyTransactionRequestDto) {
    return this.appService.createNewTransaction(loyaltyDto);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';
import { LoyaltyPointConfig } from './entity/loyalty-point-config.entity';
import { LoyaltyTierJourney } from './entity/loyalty-tier-journey.entity';
import { LoyaltyTierMaster } from './entity/loyalty-tier-master.entity';
import { LoyaltyCustomerActualRepository } from './repository/loyalty-customer-actual.repository';
import { LoyaltyCustomerHistoryRepository } from './repository/loyalty-customer-history.repository';
import { LoyaltyPointConfigRepository } from './repository/loyalty-point-catalog.repository';
import { LoyaltyTierJourneyRepository } from './repository/loyalty-tier-journey.repository';
import { LoyaltyTierMasterRepository } from './repository/loyalty-tier-master.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRESQL_HOST'),
        port: configService.get<number>('POSTGRESQL_PORT'),
        username: configService.get<string>('POSTGRESQL_USERNAME'),
        password: configService.get<string>('POSTGRESQL_PASSWORD'),
        database: configService.get<string>('POSTGRESQL_DATABASE'),
        entities: [
          LoyaltyTierMaster,
          LoyaltyTierJourney,
          LoyaltyPointConfig,
          LoyaltyCustomerActual,
          LoyaltyCustomerHistory,
        ],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoyaltyTierMasterRepository,
    LoyaltyTierJourneyRepository,
    LoyaltyPointConfigRepository,
    LoyaltyCustomerActualRepository,
    LoyaltyCustomerHistoryRepository,
  ],
})
export class AppModule {}

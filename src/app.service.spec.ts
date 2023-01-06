import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { omit, pick } from 'lodash';

import { AppService } from './app.service';
import { ETierName } from './core/tier-name.enum';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';
import { LoyaltyPointConfig } from './entity/loyalty-point-config.entity';
import { LoyaltyTierMaster } from './entity/loyalty-tier-master.entity';
import { LoyaltyCustomerActualRepository } from './repository/loyalty-customer-actual.repository';
import { LoyaltyCustomerHistoryRepository } from './repository/loyalty-customer-history.repository';
import { LoyaltyPointConfigRepository } from './repository/loyalty-point-catalog.repository';
import { LoyaltyTierJourneyRepository } from './repository/loyalty-tier-journey.repository';
import { LoyaltyTierMasterRepository } from './repository/loyalty-tier-master.repository';

describe('AppService', () => {
  let appService: AppService;

  let mockLoyaltyCustomerActual: LoyaltyCustomerActual;
  let mockLoyaltyCustomerHistory: LoyaltyCustomerHistory;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;

  const loyaltyTierMasterRepository = {
    getTierMasterById: jest.fn(),
    getTierMaster: jest.fn(),
  };

  const loyaltyTierJourneyRepository = {
    getTierJourneyById: jest.fn(),
  };

  const loyaltyPointConfigRepository = {
    getLoyaltyPoint: jest.fn(),
  };

  const loyaltyCustomerActualRepository = {
    getCurrentLoyalty: jest.fn(),
    saveCurrentLoyalty: jest.fn(),
  };
  const loyaltyCustomerHistoryRepository = {
    getLoyaltyHistory: jest.fn(),
    saveCurrentLoyalty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: LoyaltyTierMasterRepository,
          useValue: loyaltyTierMasterRepository,
        },
        {
          provide: LoyaltyTierJourneyRepository,
          useValue: loyaltyTierJourneyRepository,
        },
        {
          provide: LoyaltyPointConfigRepository,
          useValue: loyaltyPointConfigRepository,
        },
        {
          provide: LoyaltyCustomerActualRepository,
          useValue: loyaltyCustomerActualRepository,
        },

        {
          provide: LoyaltyCustomerHistoryRepository,
          useValue: loyaltyCustomerHistoryRepository,
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);

    mockLoyaltyPointConfig = {
      id: faker.datatype.uuid(),
      at_trx: faker.datatype.number(),
      point: faker.datatype.number(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      tier: mockLoyaltyTierMaster,
    };

    mockLoyaltyTierMaster = {
      id: faker.datatype.uuid(),
      name: faker.helpers.arrayElement(Object.values(ETierName)),
      level: faker.helpers.arrayElement([1, 2, 3]),
      max_trx: faker.datatype.number(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      points: [mockLoyaltyPointConfig],
    };

    mockLoyaltyCustomerActual = {
      customer_id: faker.datatype.uuid(),
      transaction_id: faker.datatype.uuid(),
      transaction_time: new Date(),
      point: faker.datatype.number(),
      total_trx: faker.datatype.number(),
      remark: faker.datatype.string(),
      tier: mockLoyaltyTierMaster,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockLoyaltyCustomerHistory = {
      ...omit(mockLoyaltyCustomerActual, ['tier']),
      tier_id: mockLoyaltyCustomerActual.tier.id,
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('createNewCustomer', () => {
    const requestDto: LoyaltyTransactionRequestDto = pick(
      mockLoyaltyCustomerActual,
      ['customer_id', 'transaction_id', 'transaction_time'],
    );

    it('should setup loyalty for first time transaction', async () => {
      // arrange
      delete mockLoyaltyTierMaster.points;

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(null);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMaster')
        .mockResolvedValue(mockLoyaltyTierMaster);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerHistory);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });

    it('should keep current tier based on current transaction due not reach max level', async () => {
      // arrange
      delete mockLoyaltyTierMaster.points;

      const newLoyalty = mockLoyaltyCustomerActual;
      newLoyalty.total_trx += 1;

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValue(mockLoyaltyTierMaster);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerHistory);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });

    it('should reset tier based on current transaction due not reach max level', async () => {
      // arrange
      delete mockLoyaltyTierMaster.points;
      mockLoyaltyCustomerActual.transaction_time = new Date();
      requestDto.transaction_time = new Date(
        mockLoyaltyCustomerActual.transaction_time.getTime() +
          75 * 24 * 60 * 60 * 1000,
      );

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValue(mockLoyaltyTierMaster);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerHistory);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });
  });
});

import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { pick } from 'lodash';

import { AppService } from './app.service';
import { ETierLevel } from './core/tier-level.enum';
import { ETierName } from './core/tier-name.enum';
import { ETierRemark } from './core/tier-remark.enum';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';
import { LoyaltyPointConfig } from './entity/loyalty-point-config.entity';
import { LoyaltyTierJourney } from './entity/loyalty-tier-journey.entity';
import { LoyaltyTierMaster } from './entity/loyalty-tier-master.entity';
import { LoyaltyCustomerActualRepository } from './repository/loyalty-customer-actual.repository';
import { LoyaltyCustomerHistoryRepository } from './repository/loyalty-customer-history.repository';
import { LoyaltyPointConfigRepository } from './repository/loyalty-point-config.repository';
import { LoyaltyTierJourneyRepository } from './repository/loyalty-tier-journey.repository';
import { LoyaltyTierMasterRepository } from './repository/loyalty-tier-master.repository';

describe('AppService', () => {
  let appService: AppService;

  let mockLoyaltyCustomerActual: LoyaltyCustomerActual;
  let mockLoyaltyCustomerHistory: LoyaltyCustomerHistory;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;
  let mockTierJourney: LoyaltyTierJourney;

  const loyaltyTierMasterRepository = {
    getTierMasterById: jest.fn(),
    getTierMaster: jest.fn(),
    getAllTier: jest.fn(),
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

    mockLoyaltyCustomerHistory = mockLoyaltyCustomerActual;
  });

  afterEach(() => jest.clearAllMocks());

  describe('getTierMaster', () => {
    it('should return all tier master', async () => {
      // arrange
      const spyGetAllTier = jest
        .spyOn(loyaltyTierMasterRepository, 'getAllTier')
        .mockResolvedValue([mockLoyaltyTierMaster]);

      // act
      const tierMasters = await appService.getTierMaster();

      // assert
      expect(tierMasters).toEqual([mockLoyaltyTierMaster]);
      expect(spyGetAllTier).toHaveBeenCalledTimes(1);
      expect(spyGetAllTier).toHaveBeenCalledWith();
    });

    it('should return empty array when data still empty', async () => {
      // arrange
      const spyGetAllTier = jest
        .spyOn(loyaltyTierMasterRepository, 'getAllTier')
        .mockResolvedValue([]);

      // act
      const tierMasters = await appService.getTierMaster();

      // assert
      expect(tierMasters).toEqual([]);
      expect(spyGetAllTier).toHaveBeenCalledTimes(1);
      expect(spyGetAllTier).toHaveBeenCalledWith();
    });
  });

  describe('getCurrentLoyalty', () => {
    it('should return current loyalty customer', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;
      const spyGetCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      // act
      const currentLoyalty = await appService.getCurrentLoyalty(customer_id);

      // assert
      expect(currentLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(customer_id);
    });

    it('should return null instead of not found', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;
      const spyGetCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(null);

      // act
      const currentLoyalty = await appService.getCurrentLoyalty(customer_id);

      // assert
      expect(currentLoyalty).toEqual(null);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(customer_id);
    });
  });

  describe('getLoyaltyHistory', () => {
    it('should return loyalty history customer', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerHistory.customer_id;
      const spyGetLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'getLoyaltyHistory')
        .mockResolvedValue(mockLoyaltyCustomerHistory);

      // act
      const loyaltyHistory = await appService.getLoyaltyHistory(customer_id);

      // assert
      expect(loyaltyHistory).toEqual(mockLoyaltyCustomerHistory);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledWith(customer_id);
    });

    it('should return empty array instead of not found', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerHistory.customer_id;
      const spyGetLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'getLoyaltyHistory')
        .mockResolvedValue([]);

      // act
      const loyaltyHistory = await appService.getLoyaltyHistory(customer_id);

      // assert
      expect(loyaltyHistory).toEqual([]);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledWith(customer_id);
    });
  });

  describe('createNewTransaction', () => {
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

    it('should keep current tier based on current transaction because still not reach max level', async () => {
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

    it('should keep tier on max level due to currently loyalty is GOLD and and have gotten bonus point', async () => {
      // arrange

      const mockLoyaltyTierMasterGold: LoyaltyTierMaster = {
        id: faker.datatype.uuid(),
        name: ETierName.GOLD,
        level: ETierLevel.GOLD,
        max_trx: 7,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        points: [mockLoyaltyPointConfig],
      };

      mockTierJourney = {
        current_tier: mockLoyaltyTierMasterGold.id,
        next_1: mockLoyaltyTierMasterGold.id,
        prev_1: faker.datatype.uuid(),
        prev_2: faker.datatype.uuid(),
      };

      delete mockLoyaltyTierMasterGold.points;

      mockLoyaltyCustomerActual.total_trx = 7;
      mockLoyaltyCustomerActual.tier = mockLoyaltyTierMasterGold;
      mockLoyaltyCustomerActual.transaction_time = new Date(
        '2023-01-04T16:57:11.704Z',
      );

      requestDto.customer_id = mockLoyaltyCustomerActual.customer_id;
      requestDto.transaction_id = faker.datatype.uuid();
      requestDto.transaction_time = new Date('2023-01-05T16:57:11.704Z');

      const newCustomerLoyalty = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: requestDto.transaction_id,
        transaction_time: requestDto.transaction_time,
        point: 0,
        total_trx: mockLoyaltyCustomerActual.total_trx + 1,
        remark: ETierRemark.MAXIMUM,
        tier: mockLoyaltyTierMasterGold,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValueOnce(mockLoyaltyTierMasterGold);

      jest
        .spyOn(loyaltyTierJourneyRepository, 'getTierJourneyById')
        .mockResolvedValue(mockTierJourney);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(newCustomerLoyalty);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });

    it('should upgrade tier based on current transaction reach max trx config', async () => {
      // arrange

      const mockLoyaltyTierMasterSilver: LoyaltyTierMaster = {
        id: faker.datatype.uuid(),
        name: ETierName.SILVER,
        level: ETierLevel.SILVER,
        max_trx: 7,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        points: [mockLoyaltyPointConfig],
      };

      const mockLoyaltyTierMasterBronze: LoyaltyTierMaster = {
        id: faker.datatype.uuid(),
        name: ETierName.BRONZE,
        level: ETierLevel.BRONZE,
        max_trx: 7,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        points: [mockLoyaltyPointConfig],
      };

      mockTierJourney = {
        current_tier: mockLoyaltyTierMasterBronze.id,
        next_1: mockLoyaltyTierMasterSilver.id,
        prev_1: mockLoyaltyTierMasterBronze.id,
        prev_2: mockLoyaltyTierMasterBronze.id,
      };

      delete mockLoyaltyTierMasterSilver.points;
      delete mockLoyaltyTierMasterBronze.points;

      mockLoyaltyCustomerActual.total_trx = 7;
      mockLoyaltyCustomerActual.tier = mockLoyaltyTierMasterBronze;
      mockLoyaltyCustomerActual.transaction_time = new Date(
        '2023-01-04T16:57:11.704Z',
      );

      requestDto.customer_id = mockLoyaltyCustomerActual.customer_id;
      requestDto.transaction_id = faker.datatype.uuid();
      requestDto.transaction_time = new Date('2023-01-05T16:57:11.704Z');

      const newCustomerLoyalty = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: requestDto.transaction_id,
        transaction_time: requestDto.transaction_time,
        point: 0,
        total_trx: 1,
        remark: ETierRemark.UPGRADE,
        tier: mockLoyaltyTierMasterSilver,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValueOnce(mockLoyaltyTierMasterBronze);

      jest
        .spyOn(loyaltyTierJourneyRepository, 'getTierJourneyById')
        .mockResolvedValue(mockTierJourney);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValueOnce(mockLoyaltyTierMasterBronze);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(newCustomerLoyalty);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });

    it('should downgrade tier based on current transaction without transaction over 30 days', async () => {
      // arrange

      const mockLoyaltyTierMasterSilver: LoyaltyTierMaster = {
        id: faker.datatype.uuid(),
        name: ETierName.SILVER,
        level: ETierLevel.SILVER,
        max_trx: 7,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        points: [mockLoyaltyPointConfig],
      };

      const mockLoyaltyTierMasterBronze: LoyaltyTierMaster = {
        id: faker.datatype.uuid(),
        name: ETierName.BRONZE,
        level: ETierLevel.BRONZE,
        max_trx: 7,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        points: [mockLoyaltyPointConfig],
      };

      mockTierJourney = {
        current_tier: mockLoyaltyTierMasterSilver.id,
        next_1: faker.datatype.uuid(),
        prev_1: mockLoyaltyTierMasterBronze.id,
        prev_2: faker.datatype.uuid(),
      };

      delete mockLoyaltyTierMasterSilver.points;
      delete mockLoyaltyTierMasterBronze.points;

      mockLoyaltyCustomerActual.tier = mockLoyaltyTierMasterSilver;
      mockLoyaltyCustomerActual.transaction_time = new Date(
        '2022-12-01T16:57:11.704Z',
      );

      requestDto.customer_id = mockLoyaltyCustomerActual.customer_id;
      requestDto.transaction_id = faker.datatype.uuid();
      requestDto.transaction_time = new Date('2023-01-05T16:57:11.704Z');

      const newCustomerLoyalty = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: requestDto.transaction_id,
        transaction_time: requestDto.transaction_time,
        point: 0,
        total_trx: 1,
        remark: ETierRemark.DOWNGRADE,
        tier: mockLoyaltyTierMasterBronze,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(loyaltyCustomerActualRepository, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValueOnce(mockLoyaltyTierMasterSilver);

      jest
        .spyOn(loyaltyTierJourneyRepository, 'getTierJourneyById')
        .mockResolvedValue(mockTierJourney);

      jest
        .spyOn(loyaltyTierMasterRepository, 'getTierMasterById')
        .mockResolvedValueOnce(mockLoyaltyTierMasterBronze);

      const spySaveCurrentLoyalty = jest
        .spyOn(loyaltyCustomerActualRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      const spySaveLoyaltyHistory = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'saveCurrentLoyalty')
        .mockResolvedValue(newCustomerLoyalty);

      // act
      const actualLoyalty = await appService.createNewTransaction(requestDto);

      // assert
      expect(actualLoyalty).toEqual(newCustomerLoyalty);
      expect(spySaveCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spySaveLoyaltyHistory).toHaveBeenCalledTimes(1);
    });

    it('should reset tier based on current transaction without transaction over 60 days', async () => {
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

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { LoyaltyCustomerHistoryRepository } from './loyalty-customer-history.repository';
import { LoyaltyCustomerHistory } from 'src/entity/loyalty-customer-history.entity';
import { ETierName } from 'src/core/tier-name.enum';
import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { LoyaltyPointConfig } from 'src/entity/loyalty-point-config.entity';

describe('LoyaltyCustomerHistoryRepository', () => {
  let loyaltyCustomerHistoryRepository: LoyaltyCustomerHistoryRepository;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;
  let mockLoyaltyCustomerHistory: LoyaltyCustomerHistory[];
  let customer_id: string;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyCustomerHistoryRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    loyaltyCustomerHistoryRepository =
      module.get<LoyaltyCustomerHistoryRepository>(
        LoyaltyCustomerHistoryRepository,
      );

    customer_id = faker.datatype.uuid();

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

    mockLoyaltyCustomerHistory = [
      {
        transaction_id: faker.datatype.uuid(),
        customer_id,
        transaction_time: new Date(),
        point: faker.datatype.number(),
        total_trx: faker.datatype.number(),
        remark: faker.datatype.string(),
        tier: mockLoyaltyTierMaster,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
  });

  afterEach(() => jest.clearAllMocks());

  describe('getLoyaltyHistory', () => {
    it('should return history loyalty customer', async () => {
      // arrange
      const spyFind = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'find')
        .mockResolvedValue(mockLoyaltyCustomerHistory);

      // act
      const historyLoyalty =
        await loyaltyCustomerHistoryRepository.getLoyaltyHistory(customer_id);

      // assert
      expect(historyLoyalty).toEqual(mockLoyaltyCustomerHistory);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        relations: ['tier'],
        where: { customer_id },
        order: { transaction_time: 'DESC' },
      });
    });

    it('should return empty array when not data exist', async () => {
      // arrange
      const spyFind = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'find')
        .mockResolvedValue([]);

      // act
      const historyLoyalty =
        await loyaltyCustomerHistoryRepository.getLoyaltyHistory(customer_id);

      // assert
      expect(historyLoyalty).toEqual([]);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        relations: ['tier'],
        where: { customer_id },
        order: { transaction_time: 'DESC' },
      });
    });
  });

  describe('saveCurrentLoyalty', () => {
    it('should return current loyalty customer', async () => {
      // arrange
      const data: Partial<LoyaltyCustomerHistory> =
        mockLoyaltyCustomerHistory[0];

      const spySave = jest
        .spyOn(loyaltyCustomerHistoryRepository, 'save')
        .mockResolvedValue(mockLoyaltyCustomerHistory[0]);

      // act
      const currentLoyalty =
        await loyaltyCustomerHistoryRepository.saveCurrentLoyalty(data);

      // assert
      expect(currentLoyalty).toEqual(mockLoyaltyCustomerHistory[0]);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(data);
    });
  });
});

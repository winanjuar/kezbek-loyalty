import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { LoyaltyCustomerActualRepository } from './loyalty-customer-actual.repository';
import { LoyaltyCustomerActual } from 'src/entity/loyalty-customer-actual.entity';
import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { ETierName } from 'src/core/tier-name.enum';
import { LoyaltyPointConfig } from 'src/entity/loyalty-point-config.entity';

describe('LoyaltyCustomerActualRepository', () => {
  let loyaltyCustomerActualRepository: LoyaltyCustomerActualRepository;
  let mockLoyaltyCustomerActual: LoyaltyCustomerActual;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyCustomerActualRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    loyaltyCustomerActualRepository =
      module.get<LoyaltyCustomerActualRepository>(
        LoyaltyCustomerActualRepository,
      );

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
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCurrentLoyalty', () => {
    it('should return current loyalty customer', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyFindOne = jest
        .spyOn(loyaltyCustomerActualRepository, 'findOne')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      // act
      const currentLoyalty =
        await loyaltyCustomerActualRepository.getCurrentLoyalty(customer_id);

      // assert
      expect(currentLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { customer_id },
        relations: ['tier'],
      });
    });

    it('should return null when data does not exist', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyFindOne = jest
        .spyOn(loyaltyCustomerActualRepository, 'findOne')
        .mockResolvedValue(null);

      // act
      const currentLoyalty =
        await loyaltyCustomerActualRepository.getCurrentLoyalty(customer_id);

      // assert
      expect(currentLoyalty).toEqual(null);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { customer_id },
        relations: ['tier'],
      });
    });
  });

  describe('saveCurrentLoyalty', () => {
    it('should return current loyalty customer', async () => {
      // arrange
      const data: Partial<LoyaltyCustomerActual> = mockLoyaltyCustomerActual;

      const spySave = jest
        .spyOn(loyaltyCustomerActualRepository, 'save')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      // act
      const currentLoyalty =
        await loyaltyCustomerActualRepository.saveCurrentLoyalty(data);

      // assert
      expect(currentLoyalty).toEqual(mockLoyaltyCustomerActual);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(data);
    });
  });
});

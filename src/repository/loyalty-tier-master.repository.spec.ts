import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { LoyaltyTierMasterRepository } from './loyalty-tier-master.repository';
import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { LoyaltyPointConfig } from 'src/entity/loyalty-point-config.entity';
import { ETierName } from 'src/core/tier-name.enum';

describe('LoyaltyTierMasterRepository', () => {
  let loyaltyTierMasterRepository: LoyaltyTierMasterRepository;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyTierMasterRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    loyaltyTierMasterRepository = module.get<LoyaltyTierMasterRepository>(
      LoyaltyTierMasterRepository,
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
  });

  afterEach(() => jest.clearAllMocks());

  describe('getTierMasterById', () => {
    it('should return loyalty point config', async () => {
      // arrange
      const tier_id = mockLoyaltyTierMaster.id;
      delete mockLoyaltyTierMaster.points;

      const findOneBy = jest
        .spyOn(loyaltyTierMasterRepository, 'findOneBy')
        .mockResolvedValue(mockLoyaltyTierMaster);

      // act
      const tierMaster = await loyaltyTierMasterRepository.getTierMasterById(
        tier_id,
      );

      // assert
      expect(tierMaster).toEqual(mockLoyaltyTierMaster);
      expect(findOneBy).toHaveBeenCalledTimes(1);
      expect(findOneBy).toHaveBeenCalledWith({ id: tier_id });
    });
  });

  describe('getTierMaster', () => {
    it('should return loyalty point config', async () => {
      // arrange
      const level = mockLoyaltyTierMaster.level;
      delete mockLoyaltyTierMaster.points;

      const findOne = jest
        .spyOn(loyaltyTierMasterRepository, 'findOne')
        .mockResolvedValue(mockLoyaltyTierMaster);

      // act
      const tierMaster = await loyaltyTierMasterRepository.getTierMaster(level);

      // assert
      expect(tierMaster).toEqual(mockLoyaltyTierMaster);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith({ where: { level } });
    });
  });
});

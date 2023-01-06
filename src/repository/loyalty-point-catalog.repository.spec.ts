import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { ETierName } from 'src/core/tier-name.enum';
import { LoyaltyPointConfig } from 'src/entity/loyalty-point-config.entity';
import { LoyaltyPointConfigRepository } from './loyalty-point-catalog.repository';

describe('LoyaltyPointConfigRepository', () => {
  let loyaltyPointConfigRepository: LoyaltyPointConfigRepository;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyPointConfigRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    loyaltyPointConfigRepository = module.get<LoyaltyPointConfigRepository>(
      LoyaltyPointConfigRepository,
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

  describe('getLoyaltyPoint', () => {
    it('should return loyalty point config', async () => {
      // arrange
      const tier_id = mockLoyaltyTierMaster.id;
      const expected = mockLoyaltyPointConfig.at_trx;

      const spyFindOne = jest
        .spyOn(loyaltyPointConfigRepository, 'findOne')
        .mockResolvedValue(mockLoyaltyPointConfig);

      // act
      const currentLoyalty = await loyaltyPointConfigRepository.getLoyaltyPoint(
        tier_id,
        expected,
      );

      // assert
      expect(currentLoyalty).toEqual(mockLoyaltyPointConfig.point);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { tier: { id: tier_id }, at_trx: expected },
        relations: ['tier'],
      });
    });

    it('should return 0 when loyal config not found', async () => {
      // arrange
      const tier_id = mockLoyaltyTierMaster.id;
      const expected = mockLoyaltyPointConfig.at_trx;

      const spyFindOne = jest
        .spyOn(loyaltyPointConfigRepository, 'findOne')
        .mockResolvedValue(null);

      // act
      const currentLoyalty = await loyaltyPointConfigRepository.getLoyaltyPoint(
        tier_id,
        expected,
      );

      // assert
      expect(currentLoyalty).toEqual(0);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { tier: { id: tier_id }, at_trx: expected },
        relations: ['tier'],
      });
    });
  });
});

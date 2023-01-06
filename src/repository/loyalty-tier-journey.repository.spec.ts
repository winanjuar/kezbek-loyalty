import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { LoyaltyTierJourneyRepository } from './loyalty-tier-journey.repository';
import { LoyaltyTierJourney } from 'src/entity/loyalty-tier-journey.entity';

describe('LoyaltyTierJourneyRepository', () => {
  let loyaltyTierJourneyRepository: LoyaltyTierJourneyRepository;
  let mockLoyaltyTierJourney: LoyaltyTierJourney;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyTierJourneyRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    loyaltyTierJourneyRepository = module.get<LoyaltyTierJourneyRepository>(
      LoyaltyTierJourneyRepository,
    );

    mockLoyaltyTierJourney = {
      current_tier: faker.datatype.uuid(),
      next_1: faker.datatype.uuid(),
      prev_1: faker.datatype.uuid(),
      prev_2: faker.datatype.uuid(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('getLoyaltyPoint', () => {
    it('should return loyalty point config', async () => {
      // arrange
      const tier_id = mockLoyaltyTierJourney.current_tier;

      const findOneBy = jest
        .spyOn(loyaltyTierJourneyRepository, 'findOneBy')
        .mockResolvedValue(mockLoyaltyTierJourney);

      // act
      const tierJourney = await loyaltyTierJourneyRepository.getTierJourneyById(
        tier_id,
      );

      // assert
      expect(tierJourney).toEqual(mockLoyaltyTierJourney);
      expect(findOneBy).toHaveBeenCalledTimes(1);
      expect(findOneBy).toHaveBeenCalledWith({ current_tier: tier_id });
    });
  });
});

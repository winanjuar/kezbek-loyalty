import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerActualResponseDto } from './dto/response/loyalty-customer-actual.response.dto';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { LoyaltyTierMaster } from './entity/loyalty-tier-master.entity';
import { LoyaltyPointConfig } from './entity/loyalty-point-config.entity';
import { ETierName } from './core/tier-name.enum';

describe('AppController', () => {
  let controller: AppController;
  let mockLoyaltyCustomerActual: LoyaltyCustomerActual;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;

  let mockLoyaltyCustomerActualResponse: LoyaltyCustomerActualResponseDto;
  let mockLoyaltyDto: LoyaltyTransactionRequestDto;

  const mockAppService = {
    createNewTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);

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

  describe('createCustomer', () => {
    it('should response single response customer', async () => {
      // arrange
      mockLoyaltyCustomerActual.transaction_time = new Date(
        '2023-01-05T05:47:34.509Z',
      );

      mockLoyaltyDto = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date('2023-01-06T05:47:34.509Z'),
      };

      const spyCreateNewTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      mockLoyaltyCustomerActualResponse = new LoyaltyCustomerActualResponseDto(
        HttpStatus.OK,
        `Set loyalty custumer actual successfully`,
        mockLoyaltyCustomerActual,
      );

      // act
      const response = await controller.createNewTransaction(mockLoyaltyDto);

      // assert
      expect(response).toEqual(mockLoyaltyCustomerActualResponse);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(mockLoyaltyDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      mockLoyaltyDto = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date('2023-01-06T05:47:34.509Z'),
      };

      const spyCreateNewTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funCreateNewTransaction =
        controller.createNewTransaction(mockLoyaltyDto);

      // assert
      await expect(funCreateNewTransaction).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(mockLoyaltyDto);
    });
  });
});

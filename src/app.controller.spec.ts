import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { LoyaltyTierMaster } from './entity/loyalty-tier-master.entity';
import { LoyaltyPointConfig } from './entity/loyalty-point-config.entity';
import { ETierName } from './core/tier-name.enum';
import { IResponseCalculateLoyalty } from './core/response-calculate-loyalty.interface';
import { ETierRemark } from './core/tier-remark.enum';
import { TierMasterPointResponseDto } from './dto/response/tier-master-point.response.dto';
import { CreateLoyaltyCustomerResponseDto } from './dto/response/create-loyalty-customer.response.dto';
import { BaseLoyaltyCustomerActualResponseDto } from './dto/response/base-loyalty-customer-actual.response.dto';
import { ResultLoyaltyCustomerResponseDto } from './dto/response/result-loyalty-customer.response.dto';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { IRequestCalculateLoyalty } from './core/request-calculate-loyalty.interface';
import { IRequestIdCustomer } from './core/request-id-customer.interface';

describe('AppController', () => {
  let controller: AppController;
  let mockLoyaltyTierMaster: LoyaltyTierMaster;
  let mockLoyaltyPointConfig: LoyaltyPointConfig;
  let mockLoyaltyCustomerActual: LoyaltyCustomerActual;
  let mockLoyaltyCustomerHistory: LoyaltyCustomerHistory;

  let mockLoyaltyDto: LoyaltyTransactionRequestDto;
  let mockLoyaltyData: IRequestCalculateLoyalty;
  let mockCustomerID: IRequestIdCustomer;

  let mockTierMasterPointResponse: TierMasterPointResponseDto;
  let mockBaseLoyaltyCustomerActualResponse: BaseLoyaltyCustomerActualResponseDto;
  let mockResultLoyaltyCustomerResponse: ResultLoyaltyCustomerResponseDto;
  let mockCreateLoyaltyCustomerResponse: CreateLoyaltyCustomerResponseDto;
  let mockResponseCalculateLoyalty: IResponseCalculateLoyalty;
  let mockResponseInfoLoyalty: IResponseInfoLoyalty;

  const mockAppService = {
    getTierMaster: jest.fn(),
    getCurrentLoyalty: jest.fn(),
    getLoyaltyHistory: jest.fn(),
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

    mockLoyaltyCustomerHistory = mockLoyaltyCustomerActual;
  });

  afterEach(() => jest.clearAllMocks());

  describe('getTierMasterPoint', () => {
    it('should response tier master', async () => {
      // arrange
      const spyGetTierMaster = jest
        .spyOn(mockAppService, 'getTierMaster')
        .mockResolvedValue([mockLoyaltyTierMaster]);

      mockTierMasterPointResponse = new TierMasterPointResponseDto(
        HttpStatus.OK,
        `Get tier master successfully`,
        [mockLoyaltyTierMaster],
      );

      // act
      const response = await controller.getTierMaster();

      // assert
      expect(response).toEqual(mockTierMasterPointResponse);
      expect(spyGetTierMaster).toHaveBeenCalledTimes(1);
      expect(spyGetTierMaster).toHaveBeenCalledWith();
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const spyGetTierMaster = jest
        .spyOn(mockAppService, 'getTierMaster')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetTierMaster = controller.getTierMaster();

      // assert
      await expect(funGetTierMaster).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetTierMaster).toHaveBeenCalledTimes(1);
      expect(spyGetTierMaster).toHaveBeenCalledWith();
    });
  });

  describe('getLoyaltyActual', () => {
    it('should response loyalty customer actual', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      const mockResult = {
        customer_id,
        total_trx: mockLoyaltyCustomerActual.total_trx,
        tier: mockLoyaltyCustomerActual.tier.name,
        max_trx: mockLoyaltyCustomerActual.tier.max_trx,
      };

      mockBaseLoyaltyCustomerActualResponse =
        new BaseLoyaltyCustomerActualResponseDto(
          HttpStatus.OK,
          `Get loyalty actual successfully`,
          mockResult,
        );

      // act
      const response = await controller.getLoyaltyActual(customer_id);

      // assert
      expect(response).toEqual(mockBaseLoyaltyCustomerActualResponse);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(customer_id);
    });

    it('should response loyalty customer actual even not data exist', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockResolvedValue(null);

      const mockResult = {
        customer_id,
        total_trx: 0,
        tier: ETierName.BRONZE,
        max_trx: 7,
      };

      mockBaseLoyaltyCustomerActualResponse =
        new BaseLoyaltyCustomerActualResponseDto(
          HttpStatus.OK,
          `Get loyalty actual successfully`,
          mockResult,
        );

      // act
      const response = await controller.getLoyaltyActual(customer_id);

      // assert
      expect(response).toEqual(mockBaseLoyaltyCustomerActualResponse);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(customer_id);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetLoyaltyActual = controller.getLoyaltyActual(customer_id);

      // assert
      await expect(funGetLoyaltyActual).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(customer_id);
    });
  });

  describe('getLoyaltyHistory', () => {
    it('should response loyalty customer history', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerHistory.customer_id;

      const spyGetLoyaltyHistory = jest
        .spyOn(mockAppService, 'getLoyaltyHistory')
        .mockResolvedValue([mockLoyaltyCustomerHistory]);

      mockResultLoyaltyCustomerResponse = new ResultLoyaltyCustomerResponseDto(
        HttpStatus.OK,
        `Get loyalty history successfully`,
        [mockLoyaltyCustomerHistory],
      );

      // act
      const response = await controller.getLoyaltyHistory(customer_id);

      // assert
      expect(response).toEqual(mockResultLoyaltyCustomerResponse);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledWith(customer_id);
    });

    it('should response empty array when data still empty', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerHistory.customer_id;

      const spyGetLoyaltyHistory = jest
        .spyOn(mockAppService, 'getLoyaltyHistory')
        .mockResolvedValue([]);

      mockResultLoyaltyCustomerResponse = new ResultLoyaltyCustomerResponseDto(
        HttpStatus.OK,
        `Get loyalty history successfully`,
        [],
      );

      // act
      const response = await controller.getLoyaltyHistory(customer_id);

      // assert
      expect(response).toEqual(mockResultLoyaltyCustomerResponse);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledWith(customer_id);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const customer_id = mockLoyaltyCustomerActual.customer_id;

      const spyGetLoyaltyHistory = jest
        .spyOn(mockAppService, 'getLoyaltyHistory')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetLoyaltyHistory = controller.getLoyaltyHistory(customer_id);

      // assert
      await expect(funGetLoyaltyHistory).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetLoyaltyHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLoyaltyHistory).toHaveBeenCalledWith(customer_id);
    });
  });

  describe('createNewTransaction', () => {
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

      mockCreateLoyaltyCustomerResponse = new CreateLoyaltyCustomerResponseDto(
        HttpStatus.OK,
        `Write loyalty custumer successfully`,
        mockLoyaltyCustomerActual,
      );

      // act
      const response = await controller.createNewTransaction(mockLoyaltyDto);

      // assert
      expect(response).toEqual(mockCreateLoyaltyCustomerResponse);
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

  describe('handleInfoLoyalty', () => {
    it('should return customer loyalty actual', async () => {
      // arrange
      mockCustomerID = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
      };

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      mockResponseInfoLoyalty = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        total_trx: mockLoyaltyCustomerActual.total_trx,
        tier: mockLoyaltyCustomerActual.tier.name,
        max_trx: mockLoyaltyCustomerActual.tier.max_trx,
      };

      // act
      const response = await controller.handleInfoLoyalty(mockCustomerID);

      // assert
      expect(response).toEqual(mockResponseInfoLoyalty);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(
        mockCustomerID.customer_id,
      );
    });

    it('should return customer loyalty actual even data does not exist', async () => {
      // arrange
      mockCustomerID = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockResolvedValue(null);

      mockResponseInfoLoyalty = {
        customer_id: mockCustomerID.customer_id,
        total_trx: 0,
        tier: ETierName.BRONZE,
        max_trx: 7,
      };

      // act
      const response = await controller.handleInfoLoyalty(mockCustomerID);

      // assert
      expect(response).toEqual(mockResponseInfoLoyalty);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(
        mockCustomerID.customer_id,
      );
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      mockCustomerID = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
      };

      const spyGetCurrentLoyalty = jest
        .spyOn(mockAppService, 'getCurrentLoyalty')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funHandleInfoLoyalty = controller.handleInfoLoyalty(mockCustomerID);

      // assert
      await expect(funHandleInfoLoyalty).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetCurrentLoyalty).toHaveBeenCalledTimes(1);
      expect(spyGetCurrentLoyalty).toHaveBeenCalledWith(
        mockCustomerID.customer_id,
      );
    });
  });

  describe('handleCalculateLoyaltyPoint', () => {
    it('should response single response info customer loyalty', async () => {
      // arrange
      mockLoyaltyCustomerActual.remark = ETierRemark.NONE;

      mockLoyaltyData = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date('2023-01-06T05:47:34.509Z'),
      };

      const spyCreateNewTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockResolvedValue(mockLoyaltyCustomerActual);

      mockResponseCalculateLoyalty = {
        transaction_id: mockLoyaltyData.transaction_id,
        point: mockLoyaltyCustomerActual.point,
        total_trx: mockLoyaltyCustomerActual.total_trx,
        remark: mockLoyaltyCustomerActual.remark,
        tier: mockLoyaltyCustomerActual.tier.name,
      };

      // act
      const response = await controller.handleCalculateLoyaltyPoint(
        mockLoyaltyData,
      );

      // assert
      expect(response).toEqual(mockResponseCalculateLoyalty);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(mockLoyaltyData);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      mockLoyaltyData = {
        customer_id: mockLoyaltyCustomerActual.customer_id,
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date('2023-01-06T05:47:34.509Z'),
      };

      const spyCreateNewTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funHandleCalculateLoyaltyPoint =
        controller.handleCalculateLoyaltyPoint(mockLoyaltyData);

      // assert
      await expect(funHandleCalculateLoyaltyPoint).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(mockLoyaltyData);
    });
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { ETierStatus } from './core/tier-status.enum';
import { ITierResponse } from './core/tier-response.interface';
import { ETierLevel } from './core/tier-level.enum';
import { ETierName } from './core/tier-name.enum';
import { ETierRemark } from './core/tier-remark.enum';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerActualRepository } from './repository/loyalty-customer-actual.repository';
import { LoyaltyPointConfigRepository } from './repository/loyalty-point-config.repository';
import { LoyaltyTierJourneyRepository } from './repository/loyalty-tier-journey.repository';
import { LoyaltyTierMasterRepository } from './repository/loyalty-tier-master.repository';
import { LoyaltyCustomerHistoryRepository } from './repository/loyalty-customer-history.repository';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';
import { IUpdateTier } from './core/update-tier.interface';
import { DateHelper } from './helpers/date.helper';
import { IRequestCalculateLoyalty } from './core/request-calculate-loyalty.interface';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private loyaltyTierMasterRepository: LoyaltyTierMasterRepository,
    private loyaltyTierJourneyRepository: LoyaltyTierJourneyRepository,
    private loyaltyPointConfigRepository: LoyaltyPointConfigRepository,
    private loyaltyCustomerActualRepository: LoyaltyCustomerActualRepository,
    private loyaltyCustomerHistoryRepository: LoyaltyCustomerHistoryRepository,
  ) {}

  async getTierMaster() {
    return await this.loyaltyTierMasterRepository.getAllTier();
  }

  async getCurrentLoyalty(customer_id: string) {
    return await this.loyaltyCustomerActualRepository.getCurrentLoyalty(
      customer_id,
    );
  }

  async getLoyaltyHistory(customer_id: string) {
    return await this.loyaltyCustomerHistoryRepository.getLoyaltyHistory(
      customer_id,
    );
  }

  private async __getTierMaster(level: number) {
    return await this.loyaltyTierMasterRepository.getTierMaster(level);
  }

  private async __getTierMasterById(id: string) {
    return await this.loyaltyTierMasterRepository.getTierMasterById(id);
  }

  private async __getPointConfig(tier_id: string, at_trx: number) {
    return await this.loyaltyPointConfigRepository.getLoyaltyPoint(
      tier_id,
      at_trx,
    );
  }

  private async __saveCurrentLoyalty(data: Partial<LoyaltyCustomerActual>) {
    return await this.loyaltyCustomerActualRepository.saveCurrentLoyalty(data);
  }

  private async __checkPossibilityUpdateTier(
    updateTier: IUpdateTier,
  ): Promise<ITierResponse> {
    const lastTier = await this.__getTierMasterById(updateTier.tier_id);
    const tierJourney =
      await this.loyaltyTierJourneyRepository.getTierJourneyById(
        updateTier.tier_id,
      );
    if (updateTier.days_without_trx <= 30) {
      if (
        lastTier.name === ETierName.GOLD &&
        updateTier.total_trx >= lastTier.max_trx
      ) {
        this.logger.log(
          `[${updateTier.customer_id}] Keep loyalty customer on maximum level`,
        );
        return {
          status: ETierStatus.KEEP,
          current_tier: lastTier,
          total_trx: updateTier.total_trx + 1,
          remark: ETierRemark.MAXIMUM,
        } as ITierResponse;
      }

      if (updateTier.total_trx === lastTier.max_trx) {
        this.logger.log(
          `[${updateTier.customer_id}] Upgrade loyalty customer to next level`,
        );
        return {
          status: ETierStatus.UPGRADE,
          current_tier: await this.__getTierMasterById(tierJourney.next_1),
          total_trx: 1,
          remark: ETierRemark.UPGRADE,
        } as ITierResponse;
      }

      this.logger.log(
        `[${updateTier.customer_id}] Keep loyalty customer at same level`,
      );
      return {
        status: ETierStatus.KEEP,
        current_tier: await this.__getTierMasterById(updateTier.tier_id),
        total_trx: updateTier.total_trx + 1,
        remark: ETierRemark.NONE,
      } as ITierResponse;
    } else if (updateTier.days_without_trx <= 60) {
      this.logger.log(
        `[${updateTier.customer_id}] Downgrade loyalty customer to lower level`,
      );
      return {
        status: ETierStatus.DOWNGRADE,
        current_tier: await this.__getTierMasterById(tierJourney.prev_1),
        total_trx: 1,
        remark: ETierRemark.DOWNGRADE,
      } as ITierResponse;
    } else {
      this.logger.log(
        `[${updateTier.customer_id}] Reset loyalty customer to the lowest level`,
      );
      return {
        status: ETierStatus.RESET,
        current_tier: await this.__getTierMaster(ETierLevel.BRONZE),
        total_trx: 1,
        remark: ETierRemark.RESET,
      } as ITierResponse;
    }
  }

  async createNewTransaction(
    loyaltyData: LoyaltyTransactionRequestDto | IRequestCalculateLoyalty,
  ) {
    const currentLoyalty = await this.getCurrentLoyalty(
      loyaltyData.customer_id,
    );

    let loyaltyCustomer: LoyaltyCustomerActual;
    if (!currentLoyalty) {
      this.logger.log(
        `[${loyaltyData.customer_id}] Setting up customer loyalty for first time transaction`,
      );
      const tier = await this.__getTierMaster(ETierLevel.BRONZE);
      const initialLoyalty: Partial<LoyaltyCustomerActual> = {
        customer_id: loyaltyData.customer_id,
        transaction_id: loyaltyData.transaction_id,
        transaction_time: loyaltyData.transaction_time,
        point: 0,
        total_trx: 1,
        tier,
        remark: ETierRemark.FIRST_TRANSACTION,
      };

      const initialHistory: Partial<LoyaltyCustomerHistory> = {
        customer_id: loyaltyData.customer_id,
        transaction_id: loyaltyData.transaction_id,
        transaction_time: loyaltyData.transaction_time,
        point: 0,
        total_trx: 1,
        tier,
        remark: ETierRemark.FIRST_TRANSACTION,
      };

      loyaltyCustomer = await this.__saveCurrentLoyalty(initialLoyalty);
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        initialHistory,
      );
    } else {
      const dateDiff = DateHelper.getDateDiff(
        loyaltyData.transaction_time,
        currentLoyalty.transaction_time,
      );

      const updateTier: IUpdateTier = {
        customer_id: loyaltyData.customer_id,
        tier_id: currentLoyalty.tier.id,
        total_trx: currentLoyalty.total_trx,
        days_without_trx: dateDiff,
      };

      const checkResult = await this.__checkPossibilityUpdateTier(updateTier);

      const loyaltyPoint = await this.__getPointConfig(
        checkResult.current_tier.id,
        checkResult.total_trx,
      );
      currentLoyalty.transaction_time = loyaltyData.transaction_time;
      currentLoyalty.transaction_id = loyaltyData.transaction_id;
      currentLoyalty.point = loyaltyPoint;
      currentLoyalty.total_trx = checkResult.total_trx;
      currentLoyalty.tier = checkResult.current_tier;
      currentLoyalty.remark = checkResult.remark;
      loyaltyCustomer = await this.__saveCurrentLoyalty(currentLoyalty);

      const loyaltyHistory: Partial<LoyaltyCustomerHistory> = {
        customer_id: loyaltyData.customer_id,
        transaction_time: loyaltyData.transaction_time,
        transaction_id: loyaltyData.transaction_id,
        point: loyaltyPoint,
        total_trx: checkResult.total_trx,
        remark: checkResult.remark,
        tier: checkResult.current_tier,
      };
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        loyaltyHistory,
      );
    }
    return loyaltyCustomer;
  }
}

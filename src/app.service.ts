import { Injectable } from '@nestjs/common';
import { ETierStatus } from './core/tier-status.enum';
import { ITierResponse } from './core/tier-response.interface';
import { ETierLevel } from './core/tier-level.enum';
import { ETierName } from './core/tier-name.enum';
import { ETierRemark } from './core/tier-remark.enum';
import { LoyaltyTransactionRequestDto } from './dto/request/loyalty-transaction.request.dto';
import { UpdateTierDto } from './dto/request/update-tier.dto';
import { LoyaltyCustomerActual } from './entity/loyalty-customer-actual.entity';
import { LoyaltyCustomerActualRepository } from './repository/loyalty-customer-actual.repository';
import { LoyaltyPointConfigRepository } from './repository/loyalty-point-catalog.repository';
import { LoyaltyTierJourneyRepository } from './repository/loyalty-tier-journey.repository';
import { LoyaltyTierMasterRepository } from './repository/loyalty-tier-master.repository';
import { LoyaltyCustomerHistoryRepository } from './repository/loyalty-customer-history.repository';
import { LoyaltyCustomerHistory } from './entity/loyalty-customer-history.entity';

@Injectable()
export class AppService {
  constructor(
    private loyaltyTierMasterRepository: LoyaltyTierMasterRepository,
    private loyaltyTierJourneyRepository: LoyaltyTierJourneyRepository,
    private loyaltyPointConfigRepository: LoyaltyPointConfigRepository,
    private loyaltyCustomerActualRepository: LoyaltyCustomerActualRepository,
    private loyaltyCustomerHistoryRepository: LoyaltyCustomerHistoryRepository,
  ) {}

  private __getDateDiff(end: Date, start: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
    const endDate = new Date(end);
    const daysDiff =
      Math.floor((Number(endDate) - Number(start)) / msInDay) || 0;
    return daysDiff;
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

  private async __getCurrentLoyalty(customer_id: string) {
    return await this.loyaltyCustomerActualRepository.getCurrentLoyalty(
      customer_id,
    );
  }

  private async __saveCurrentLoyalty(data: Partial<LoyaltyCustomerActual>) {
    return await this.loyaltyCustomerActualRepository.saveCurrentLoyalty(data);
  }

  private async __checkPossibilityUpdateTier(
    updateTierDto: UpdateTierDto,
  ): Promise<ITierResponse> {
    const lastTier = await this.__getTierMasterById(updateTierDto.tier_id);
    const tierJourney =
      await this.loyaltyTierJourneyRepository.getTierJourneyById(
        updateTierDto.tier_id,
      );
    if (updateTierDto.days_without_trx <= 30) {
      if (
        lastTier.name === ETierName.GOLD &&
        updateTierDto.total_trx >= lastTier.max_trx
      ) {
        console.log('Keep on maximum level');
        return {
          status: ETierStatus.KEEP,
          current_tier: lastTier,
          total_trx: updateTierDto.total_trx + 1,
          remark: ETierRemark.MAXIMUM,
        } as ITierResponse;
      }

      if (updateTierDto.total_trx === lastTier.max_trx) {
        console.log('Upgrade to next level');
        return {
          status: ETierStatus.UPGRADE,
          current_tier: await this.__getTierMasterById(tierJourney.next_1),
          total_trx: 1,
          remark: ETierRemark.UPGRADE,
        } as ITierResponse;
      }

      console.log('Keep on this level');
      return {
        status: ETierStatus.KEEP,
        current_tier: await this.__getTierMasterById(updateTierDto.tier_id),
        total_trx: updateTierDto.total_trx + 1,
        remark: ETierRemark.NONE,
      } as ITierResponse;
    } else if (updateTierDto.days_without_trx <= 60) {
      console.log('Downgrade to lower level');
      return {
        status: ETierStatus.DOWNGRADE,
        current_tier: await this.__getTierMasterById(tierJourney.prev_1),
        total_trx: 1,
        remark: ETierRemark.DOWNGRADE,
      } as ITierResponse;
    } else {
      console.log('Reset to the lowest level');
      return {
        status: ETierStatus.RESET,
        current_tier: await this.__getTierMaster(ETierLevel.BRONZE),
        total_trx: 1,
        remark: ETierRemark.RESET,
      } as ITierResponse;
    }
  }

  async createNewTransaction(loyaltyDto: LoyaltyTransactionRequestDto) {
    const currentLoyalty = await this.__getCurrentLoyalty(
      loyaltyDto.customer_id,
    );

    let loyaltyCustomer: LoyaltyCustomerActual;
    if (!currentLoyalty) {
      console.log('Setting up first transaction');
      const tier = await this.__getTierMaster(ETierLevel.BRONZE);
      const initialLoyalty: Partial<LoyaltyCustomerActual> = {
        customer_id: loyaltyDto.customer_id,
        transaction_id: loyaltyDto.transaction_id,
        transaction_time: loyaltyDto.transaction_time,
        point: 0,
        total_trx: 1,
        tier,
        remark: ETierRemark.FIRST_TRANSACTION,
      };

      const initialHistory: Partial<LoyaltyCustomerHistory> = {
        customer_id: loyaltyDto.customer_id,
        transaction_id: loyaltyDto.transaction_id,
        transaction_time: loyaltyDto.transaction_time,
        point: 0,
        total_trx: 1,
        tier_id: tier.id,
        remark: ETierRemark.FIRST_TRANSACTION,
      };

      loyaltyCustomer = await this.__saveCurrentLoyalty(initialLoyalty);
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        initialHistory,
      );
    } else {
      const dateDiff = this.__getDateDiff(
        loyaltyDto.transaction_time,
        currentLoyalty.transaction_time,
      );

      const updateTierDto: UpdateTierDto = {
        tier_id: currentLoyalty.tier.id,
        total_trx: currentLoyalty.total_trx,
        days_without_trx: dateDiff,
      };

      const checkResult = await this.__checkPossibilityUpdateTier(
        updateTierDto,
      );

      const loyaltyPoint = await this.__getPointConfig(
        checkResult.current_tier.id,
        checkResult.total_trx,
      );
      currentLoyalty.transaction_time = loyaltyDto.transaction_time;
      currentLoyalty.transaction_id = loyaltyDto.transaction_id;
      currentLoyalty.point = loyaltyPoint;
      currentLoyalty.total_trx = checkResult.total_trx;
      currentLoyalty.tier = checkResult.current_tier;
      currentLoyalty.remark = checkResult.remark;
      loyaltyCustomer = await this.__saveCurrentLoyalty(currentLoyalty);

      const loyaltyHistory: Partial<LoyaltyCustomerHistory> = {
        customer_id: loyaltyDto.customer_id,
        transaction_time: loyaltyDto.transaction_time,
        transaction_id: loyaltyDto.transaction_id,
        point: loyaltyPoint,
        total_trx: checkResult.total_trx,
        remark: checkResult.remark,
        tier_id: checkResult.current_tier.id,
      };
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        loyaltyHistory,
      );
    }
    return loyaltyCustomer;
  }
}

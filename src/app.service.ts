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

  getHello(): string {
    return 'Hello World!';
  }

  private async __getTierMaster(level: number) {
    return await this.loyaltyTierMasterRepository.getTierMaster(level);
  }

  private async __getTierMasterById(id: string) {
    return await this.loyaltyTierMasterRepository.getTierMasterById(id);
  }

  async __getPointConfig(tier_id: string, at_trx: number) {
    return await this.loyaltyPointConfigRepository.getLoyaltyPoint(
      tier_id,
      at_trx,
    );
  }

  async __getCurrentLoyalty(customer_id: string) {
    return await this.loyaltyCustomerActualRepository.getCurrentLoyalty(
      customer_id,
    );
  }

  async __saveCurrentLoyalty(data: Partial<LoyaltyCustomerActual>) {
    return await this.loyaltyCustomerActualRepository.saveCurrentLoyalty(data);
  }

  async __checkPossibilityUpdateTier(
    updateTierDto: UpdateTierDto,
  ): Promise<ITierResponse> {
    const lastTier = await this.__getTierMasterById(updateTierDto.tier_id);

    // maximum level
    if (
      lastTier.name === ETierName.GOLD &&
      updateTierDto.total_trx > lastTier.max_trx
    ) {
      return {
        status: ETierStatus.KEEP,
        current_tier: lastTier,
        total_trx: updateTierDto.total_trx + 1,
        remark: ETierRemark.MAXIMUM,
      } as ITierResponse;
    }

    if (updateTierDto.total_trx === lastTier.max_trx) {
      const tierJourney =
        await this.loyaltyTierJourneyRepository.getTierJourneyById(
          updateTierDto.tier_id,
        );
      return {
        status: ETierStatus.UPGRADE,
        current_tier: await this.__getTierMasterById(tierJourney.next_1),
        total_trx: 1,
        remark: ETierRemark.UPGRADE,
      } as ITierResponse;
    }

    return {
      status: ETierStatus.KEEP,
      current_tier: await this.__getTierMasterById(updateTierDto.tier_id),
      total_trx: updateTierDto.total_trx + 1,
      remark: ETierRemark.NONE,
    } as ITierResponse;
  }

  async createNewTransaction(loyaltyDto: LoyaltyTransactionRequestDto) {
    const currentLoyalty = await this.__getCurrentLoyalty(
      loyaltyDto.customer_id,
    );

    let loyaltyCustomer: LoyaltyCustomerActual;
    if (!currentLoyalty) {
      const tier = await this.__getTierMaster(ETierLevel.BRONZE);
      const initialLoyalty: Partial<LoyaltyCustomerActual> = {
        customer_id: loyaltyDto.customer_id,
        transaction_id: loyaltyDto.transaction_id,
        transaction_time: loyaltyDto.transaction_time,
        poin: 0,
        total_trx: 1,
        tier,
        remark: ETierRemark.FIRST_TRANSACTION,
      };
      loyaltyCustomer = await this.__saveCurrentLoyalty(initialLoyalty);
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        initialLoyalty,
      );
    } else {
      const updateTierDto: UpdateTierDto = {
        tier_id: currentLoyalty.tier.id,
        total_trx: currentLoyalty.total_trx,
        transaction_time: currentLoyalty.transaction_time,
      };

      const checkResult = await this.__checkPossibilityUpdateTier(
        updateTierDto,
      );
      if (checkResult.status === ETierStatus.UPGRADE) {
        currentLoyalty.tier = checkResult.current_tier;
      }

      const loyaltyPoint = await this.__getPointConfig(
        checkResult.current_tier.id,
        checkResult.total_trx,
      );
      currentLoyalty.poin = loyaltyPoint;
      currentLoyalty.remark = checkResult.remark;
      currentLoyalty.total_trx = checkResult.total_trx;
      loyaltyCustomer = await this.__saveCurrentLoyalty(currentLoyalty);
      const loyaltyHistory: Partial<LoyaltyCustomerHistory> = {
        ...currentLoyalty,
        ...loyaltyDto,
      };
      await this.loyaltyCustomerHistoryRepository.saveCurrentLoyalty(
        loyaltyHistory,
      );
    }
    return { loyaltyCustomer };
  }
}

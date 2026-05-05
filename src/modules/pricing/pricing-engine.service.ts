import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingRule } from './pricing-rule.entity';

export interface PriceBreakdownItem {
  ruleName: string;
  conditionType: string;
  thresholdValue: number;
  percentageIncrease: number;
  amountAdded: number;
}

export interface PriceCalculationResult {
  basePrice: number;
  finalPrice: number;
  breakdown: PriceBreakdownItem[];
}

@Injectable()
export class PricingEngineService {
  constructor(
    @InjectRepository(PricingRule)
    private pricingRuleRepo: Repository<PricingRule>,
  ) {}

  async calculateFinalPrice(
    event: { price: number; capacity: number; bookedTickets: number; fromTime: Date; createdAt: Date },
    currentTime: Date = new Date(),
  ): Promise<PriceCalculationResult> {
    const basePrice = Number(event.price);
    let finalPrice = basePrice;
    const breakdown: PriceBreakdownItem[] = [];
    const activeRules = await this.pricingRuleRepo.find({ where: { isActive: true } });

    for (const rule of activeRules) {
      const isApplied = await this.evaluateRule(rule, event, currentTime);
      if (isApplied) {
        const amountAdded = (basePrice * Number(rule.percentageIncrease)) / 100;
        finalPrice += amountAdded;
        breakdown.push({
          ruleName: rule.ruleName,
          conditionType: rule.conditionType,
          thresholdValue: Number(rule.thresholdValue),
          percentageIncrease: Number(rule.percentageIncrease),
          amountAdded,
        });
      }
    }

    return {
      basePrice,
      finalPrice,
      breakdown,
    };
  }

  private async evaluateRule(
    rule: PricingRule,
    event: { price: number; capacity: number; bookedTickets: number; fromTime: Date; createdAt: Date },
    currentTime: Date,
  ): Promise<boolean> {
    const { conditionType, thresholdValue, ruleName } = rule;
    const fromTime = new Date(event.fromTime);
    const createdAt = new Date(event.createdAt);
    const timeUntilEvent = fromTime.getTime() - currentTime.getTime();
    const timeSinceCreation = currentTime.getTime() - createdAt.getTime();

    switch (conditionType) {
      case 'time_based': {
        const daysUntilEvent = timeUntilEvent / (1000 * 60 * 60 * 24);
        const thresholdDays = Number(thresholdValue);
        
        if (ruleName === 'less_than_1_week') {
          return daysUntilEvent < 7 && daysUntilEvent >= 0;
        }
        if (ruleName === 'less_than_or_equal_1_day') {
          return daysUntilEvent <= 1 && daysUntilEvent >= 0;
        }
        return daysUntilEvent <= thresholdDays;
      }
      case 'demand_based': {
        const capacity = Number(event.capacity);
        if (capacity === 0) return false;
        const bookedPercentage = (Number(event.bookedTickets) / capacity) * 100;
        const thresholdPercentage = Number(thresholdValue);
        
        if (ruleName === 'early_demand_spike') {
          const hoursSinceCreation = timeSinceCreation / (1000 * 60 * 60);
          return hoursSinceCreation <= 1 && bookedPercentage >= thresholdPercentage;
        }
        if (ruleName === 'high_demand') {
          return bookedPercentage >= thresholdPercentage;
        }
        return bookedPercentage >= thresholdPercentage;
      }
      default:
        return false;
    }
  }
}

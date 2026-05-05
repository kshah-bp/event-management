import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { PricingRule } from './pricing-rule.entity';
import { EventRegistration } from '../registration/event-registration.entity';

export interface PriceBreakdownItem {
  ruleName: string;
  ruleType: 'time_based' | 'demand_based' | 'inventory_based';
  weight: number;
  adjustment: number;
  applied: boolean;
}

export interface PriceCalculationResult {
  basePrice: number;
  finalPrice: number;
  breakdown: PriceBreakdownItem[];
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class PricingEngineService {
  constructor(
    @InjectRepository(PricingRule)
    private pricingRuleRepo: Repository<PricingRule>,
    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,
  ) {}

  async calculateFinalPrice(
    event: {
      id: number;
      price: number;
      capacity: number;
      bookedTickets: number;
      fromTime: Date;
      createdAt: Date;
    },
    currentTime: Date = new Date(),
  ): Promise<PriceCalculationResult> {
    const basePrice = Number(event.price);
    const minPrice = Number(process.env.PRICE_FLOOR || 0);
    const maxPrice = Number(process.env.PRICE_CEILING || Infinity);
    const breakdown: PriceBreakdownItem[] = [];

    const activeRules = await this.pricingRuleRepo.find({
      where: { isActive: true },
      order: { ruleName: 'ASC' },
    });

    let totalWeightedAdjustment = 0;

    for (const rule of activeRules) {
      const weight = Number(rule.percentageIncrease) / 100;
      const isApplied = await this.evaluateRule(rule, event, currentTime);

      if (isApplied) {
        totalWeightedAdjustment += weight;
        breakdown.push({
          ruleName: rule.ruleName,
          ruleType: rule.conditionType as any,
          weight,
          adjustment: weight,
          applied: true,
        });
      } else {
        breakdown.push({
          ruleName: rule.ruleName,
          ruleType: rule.conditionType as any,
          weight,
          adjustment: 0,
          applied: false,
        });
      }
    }

    let finalPrice = basePrice * (1 + totalWeightedAdjustment);
    finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));

    return {
      basePrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      breakdown,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice !== Infinity ? maxPrice : undefined,
    };
  }

  private async evaluateRule(
    rule: PricingRule,
    event: {
      id: number;
      price: number;
      capacity: number;
      bookedTickets: number;
      fromTime: Date;
      createdAt: Date;
    },
    currentTime: Date,
  ): Promise<boolean> {
    const { conditionType, thresholdValue, ruleName } = rule;
    const fromTime = new Date(event.fromTime);
    const createdAt = new Date(event.createdAt);
    const timeUntilEvent = fromTime.getTime() - currentTime.getTime();
    const timeSinceCreation = currentTime.getTime() - createdAt.getTime();
    const daysUntilEvent = timeUntilEvent / (1000 * 60 * 60 * 24);
    const hoursSinceCreation = timeSinceCreation / (1000 * 60 * 60);

    switch (ruleName) {
      case 'time_based_7_days':
        return daysUntilEvent < 7 && daysUntilEvent >= 0;

      case 'time_based_1_day':
        return daysUntilEvent <= 1 && daysUntilEvent >= 0;

      case 'demand_based_velocity': {
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
        const recentBookings = await this.registrationRepo.count({
          where: {
            event: { id: event.id },
            status: 'CONFIRMED',
            createdAt: MoreThan(oneHourAgo),
          },
        });
        return recentBookings >= Number(thresholdValue);
      }

      case 'inventory_based_low_tickets': {
        const capacity = Number(event.capacity);
        if (capacity === 0) return false;
        const remainingPercentage = ((capacity - event.bookedTickets) / capacity) * 100;
        return remainingPercentage < Number(thresholdValue);
      }

      case 'early_demand_spike':
        return hoursSinceCreation <= 1 && (event.bookedTickets / event.capacity) * 100 >= thresholdValue;

      case 'high_demand':
        return event.capacity > 0 && (event.bookedTickets / event.capacity) * 100 >= thresholdValue;

      default:
        return false;
    }
  }
}

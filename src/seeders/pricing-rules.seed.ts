import { PricingRule } from '../modules/pricing/pricing-rule.entity';

export async function seedPricingRules(repo: any) {
  const defaultRules = [
    {
      ruleName: 'time_based_7_days',
      conditionType: 'time_based',
      thresholdValue: 7,
      percentageIncrease: 20,
      isActive: true,
      metadata: { description: 'If event is less than 7 days away, +20% weight (PRICE_TIME_WEIGHT)' },
    },
    {
      ruleName: 'time_based_1_day',
      conditionType: 'time_based',
      thresholdValue: 1,
      percentageIncrease: 50,
      isActive: true,
      metadata: { description: 'If event is less than or equal to 1 day away, +50% weight' },
    },
    {
      ruleName: 'demand_based_velocity',
      conditionType: 'demand_based',
      thresholdValue: 10,
      percentageIncrease: 15,
      isActive: true,
      metadata: { description: 'If 10+ bookings in last hour, +15% weight (PRICE_DEMAND_WEIGHT)' },
    },
    {
      ruleName: 'inventory_based_low_tickets',
      conditionType: 'inventory_based',
      thresholdValue: 20,
      percentageIncrease: 25,
      isActive: true,
      metadata: { description: 'If less than 20% tickets remain, +25% weight (PRICE_INVENTORY_WEIGHT)' },
    },
    {
      ruleName: 'early_demand_spike',
      conditionType: 'demand_based',
      thresholdValue: 20,
      percentageIncrease: 10,
      isActive: false,
      metadata: { description: 'Legacy rule - disabled (replaced by demand_based_velocity)' },
    },
    {
      ruleName: 'high_demand',
      conditionType: 'demand_based',
      thresholdValue: 75,
      percentageIncrease: 30,
      isActive: false,
      metadata: { description: 'Legacy rule - disabled (replaced by inventory_based_low_tickets)' },
    },
  ];

  for (const ruleData of defaultRules) {
    const existing = await repo.findOne({
      where: { ruleName: ruleData.ruleName },
    });

    if (!existing) {
      const rule = repo.create(ruleData);
      await repo.save(rule);
      console.log(`Created pricing rule: ${ruleData.ruleName}`);
    } else {
      console.log(`Pricing rule already exists: ${ruleData.ruleName}`);
    }
  }
}

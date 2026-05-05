import { PricingRule } from '../modules/pricing/pricing-rule.entity';

export async function seedPricingRules(repo: any) {
  const defaultRules = [
    {
      ruleName: 'less_than_1_week',
      conditionType: 'time_based',
      thresholdValue: 7,
      percentageIncrease: 25,
      isActive: true,
      metadata: { description: 'If event is less than 1 week away, +25% of base price' },
    },
    {
      ruleName: 'less_than_or_equal_1_day',
      conditionType: 'time_based',
      thresholdValue: 1,
      percentageIncrease: 20,
      isActive: true,
      metadata: { description: 'If event is less than or equal to 1 day away, +20% of base price' },
    },
    {
      ruleName: 'early_demand_spike',
      conditionType: 'demand_based',
      thresholdValue: 20,
      percentageIncrease: 10,
      isActive: true,
      metadata: { description: 'Within 1 hour of creation AND >= 20% capacity booked, +10% of base price' },
    },
    {
      ruleName: 'high_demand',
      conditionType: 'demand_based',
      thresholdValue: 75,
      percentageIncrease: 30,
      isActive: true,
      metadata: { description: 'If >= 75% tickets booked, +30% of base price' },
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

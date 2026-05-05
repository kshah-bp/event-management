import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../database/typeorm.config';
import { User } from '../modules/users/user.entity';
import { PricingRule } from '../modules/pricing/pricing-rule.entity';
import { seedAdmin } from './admin.seed';
import { seedPricingRules } from './pricing-rules.seed';

async function main() {
  const config = typeOrmConfig() as any;
  const dataSource = new DataSource({
    ...config,
    entities: [User, PricingRule],
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const userRepo = dataSource.getRepository(User);
  await seedAdmin(userRepo);

  const pricingRuleRepo = dataSource.getRepository(PricingRule);
  await seedPricingRules(pricingRuleRepo);
  
  console.log('All seeds completed');
  await dataSource.destroy();
}

main().catch(console.error);
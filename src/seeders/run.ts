import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../database/typeorm.config';
import { User } from '../modules/users/user.entity';
import { PricingRule } from '../modules/pricing/pricing-rule.entity';
import { GlobalSetting } from '../modules/config/global-setting.entity';
import { seedAdmin } from './admin.seed';
import { seedPricingRules } from './pricing-rules.seed';
import { seedGlobalSettings } from './global-settings.seed';

async function main() {
  const config = typeOrmConfig() as any;
  const dataSource = new DataSource({
    ...config,
    entities: [User, PricingRule, GlobalSetting],
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const userRepo = dataSource.getRepository(User);
  await seedAdmin(userRepo);

  const pricingRuleRepo = dataSource.getRepository(PricingRule);
  await seedPricingRules(pricingRuleRepo);

  const globalSettingRepo = dataSource.getRepository(GlobalSetting);
  await seedGlobalSettings(globalSettingRepo);
  
  console.log('All seeds completed');
  await dataSource.destroy();
}

main().catch(console.error);
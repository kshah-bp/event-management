import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingRule } from './pricing-rule.entity';
import { Event } from '../event/event.entity';
import { EventRegistration } from '../registration/event-registration.entity';
import { PricingRuleService } from './pricing-rule.service';
import { PricingEngineService } from './pricing-engine.service';
import { PricingRuleController } from './pricing-rule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PricingRule, Event, EventRegistration])],
  controllers: [PricingRuleController],
  providers: [PricingRuleService, PricingEngineService],
  exports: [PricingEngineService, PricingRuleService],
})
export class PricingModule {}

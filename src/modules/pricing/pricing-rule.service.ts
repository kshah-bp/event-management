import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingRule } from './pricing-rule.entity';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

@Injectable()
export class PricingRuleService {
  constructor(
    @InjectRepository(PricingRule)
    private pricingRuleRepo: Repository<PricingRule>,
  ) {}

  async create(dto: CreatePricingRuleDto): Promise<PricingRule> {
    const rule = this.pricingRuleRepo.create(dto);
    return this.pricingRuleRepo.save(rule);
  }

  async findAll(): Promise<PricingRule[]> {
    return this.pricingRuleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<PricingRule> {
    const rule = await this.pricingRuleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Pricing rule with id ${id} not found`);
    return rule;
  }

  async update(id: number, dto: UpdatePricingRuleDto): Promise<PricingRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, dto);
    return this.pricingRuleRepo.save(rule);
  }

  async remove(id: number): Promise<void> {
    const rule = await this.findOne(id);
    await this.pricingRuleRepo.remove(rule);
  }

  async setActive(id: number, isActive: boolean): Promise<PricingRule> {
    const rule = await this.findOne(id);
    rule.isActive = isActive;
    return this.pricingRuleRepo.save(rule);
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('pricing_rules')
export class PricingRule {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Rule name (e.g., last_week_increase)' })
  @Column({ name: 'rule_name', unique: true })
  ruleName: string;

  @ApiProperty({ description: 'Condition type: time_based or demand_based' })
  @Column({ name: 'condition_type' })
  conditionType: 'time_based' | 'demand_based';

  @ApiProperty({ description: 'Threshold value (days, hours, or percentage)' })
  @Column({ name: 'threshold_value', type: 'decimal', precision: 10, scale: 2 })
  thresholdValue: number;

  @ApiProperty({ description: 'Percentage increase to apply' })
  @Column({ name: 'percentage_increase', type: 'decimal', precision: 5, scale: 2 })
  percentageIncrease: number;

  @ApiProperty({ description: 'Whether the rule is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Additional rule metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

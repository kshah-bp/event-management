import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class UpdatePricingRuleDto {
  @ApiPropertyOptional({ description: 'Rule name (e.g., last_week_increase)' })
  @IsOptional()
  @IsString()
  ruleName?: string;

  @ApiPropertyOptional({ description: 'Condition type', enum: ['time_based', 'demand_based'] })
  @IsOptional()
  @IsIn(['time_based', 'demand_based'])
  conditionType?: 'time_based' | 'demand_based';

  @ApiPropertyOptional({ description: 'Threshold value (days, hours, or percentage)' })
  @IsOptional()
  @IsNumber()
  thresholdValue?: number;

  @ApiPropertyOptional({ description: 'Percentage increase to apply' })
  @IsOptional()
  @IsNumber()
  percentageIncrease?: number;

  @ApiPropertyOptional({ description: 'Whether the rule is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional rule metadata' })
  @IsOptional()
  metadata?: any;
}

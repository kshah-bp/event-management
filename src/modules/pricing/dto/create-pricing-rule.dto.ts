import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreatePricingRuleDto {
  @ApiProperty({ description: 'Rule name (e.g., last_week_increase)' })
  @IsString()
  ruleName: string;

  @ApiProperty({ description: 'Condition type', enum: ['time_based', 'demand_based'] })
  @IsIn(['time_based', 'demand_based'])
  conditionType: 'time_based' | 'demand_based';

  @ApiProperty({ description: 'Threshold value (days, hours, or percentage)' })
  @IsNumber()
  thresholdValue: number;

  @ApiProperty({ description: 'Percentage increase to apply' })
  @IsNumber()
  percentageIncrease: number;

  @ApiPropertyOptional({ description: 'Whether the rule is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional rule metadata' })
  @IsOptional()
  metadata?: any;
}

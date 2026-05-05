import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class ListRegistrationsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by event ID', type: Number })
  @IsOptional()
  eventId?: number;

  @ApiPropertyOptional({ description: 'Filter by user name', type: String })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({ description: 'Filter by registrations from this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by registrations until this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', type: Number, example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', type: Number, example: 10 })
  @IsOptional()
  limit?: number;
}

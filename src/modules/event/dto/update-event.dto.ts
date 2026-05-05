import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ description: 'Title of the event' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the event' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Location/venue of the event' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Date and time of the event (ISO 8601 format)', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiPropertyOptional({ description: 'Event start time (ISO 8601 format)', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  fromTime?: Date;

  @ApiPropertyOptional({ description: 'Event end time (ISO 8601 format)', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  toTime?: Date;

  @ApiPropertyOptional({ description: 'Base price of the event' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Maximum number of attendees', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;
}
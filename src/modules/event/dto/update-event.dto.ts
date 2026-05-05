import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Maximum number of attendees', default: 0 })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}
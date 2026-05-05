import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Title of the event' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Location/venue of the event' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Date and time of the event (ISO 8601 format)', format: 'date-time' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Event start time (ISO 8601 format)', format: 'date-time' })
  @IsDateString()
  fromTime: Date;

  @ApiProperty({ description: 'Event end time (ISO 8601 format)', format: 'date-time' })
  @IsDateString()
  toTime: Date;

  @ApiPropertyOptional({ description: 'Base price of the event', default: 0 })
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
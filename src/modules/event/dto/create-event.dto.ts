import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Event {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Event title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Event description' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Event location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Event date (ISO 8601)', format: 'date-time' })
  @Column()
  date: Date;

  @ApiProperty({ description: 'Maximum capacity', default: 0 })
  @Column({ default: 0 })
  capacity: number;
}
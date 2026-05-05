import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.entity';

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

  @ApiProperty({ description: 'Event start time', format: 'date-time' })
  @Column({ name: 'from_time', nullable: true })
  fromTime: Date;

  @ApiProperty({ description: 'Event end time', format: 'date-time' })
  @Column({ name: 'to_time', nullable: true })
  toTime: Date;

  @ApiProperty({ description: 'Base price of the event', default: 0 })
  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Maximum capacity', default: 0 })
  @Column({ default: 0 })
  capacity: number;

  @ApiProperty({ description: 'Number of booked tickets', default: 0 })
  @Column({ name: 'booked_tickets', default: 0 })
  bookedTickets: number;

  @ApiPropertyOptional({ description: 'User who created the event' })
  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ApiProperty({ description: 'Event creation timestamp', format: 'date-time' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Event } from '../event/event.entity';

@Entity('event_registrations')
export class EventRegistration {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Registered user' })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Registered event' })
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ApiProperty({ description: 'Final ticket price at time of registration', type: 'number', format: 'decimal' })
  @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice: number;

  @ApiPropertyOptional({ description: 'Breakdown of applied pricing rules', required: false })
  @Column({ name: 'price_breakdown', type: 'json', nullable: true })
  priceBreakdown?: any;

  @ApiProperty({ description: 'Registration status', enum: ['PENDING', 'CONFIRMED', 'EXPIRED'], default: 'CONFIRMED' })
  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'EXPIRED'],
    default: 'CONFIRMED',
  })
  status: string;

  @ApiPropertyOptional({ description: 'Expiration time for pending registration' })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'Registration timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

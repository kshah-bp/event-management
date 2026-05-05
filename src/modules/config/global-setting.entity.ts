import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('global_settings')
export class GlobalSetting {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Setting key (unique)' })
  @Column({ unique: true })
  key: string;

  @ApiProperty({ description: 'Setting value' })
  @Column()
  value: string;

  @ApiPropertyOptional({ description: 'Setting description' })
  @Column({ nullable: true })
  description?: string;
}

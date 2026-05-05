import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Full name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Email address', format: 'email' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
}
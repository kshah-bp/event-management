import { ApiPropertyOptions } from '@nestjs/swagger';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const RoleApiProperty: ApiPropertyOptions = {
  enum: Role,
  description: 'User role in the system',
};
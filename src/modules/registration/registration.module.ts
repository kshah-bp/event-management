import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../event/event.entity';
import { User } from '../users/user.entity';
import { RegistrationService } from './registration.service';
import { RegistrationAdminController } from './registration-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventRegistration, Event, User])],
  controllers: [RegistrationAdminController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}

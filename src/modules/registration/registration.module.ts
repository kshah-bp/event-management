import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../event/event.entity';
import { User } from '../users/user.entity';
import { RegistrationService } from './registration.service';
import { RegistrationAdminController } from './registration-admin.controller';
import { RegistrationController } from './registration.controller';
import { RegistrationCronService } from './registration-cron.service';
import { PricingModule } from '../pricing/pricing.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventRegistration, Event, User]), PricingModule, ConfigModule, ScheduleModule.forRoot()],
  controllers: [RegistrationAdminController, RegistrationController],
  providers: [RegistrationService, RegistrationCronService],
  exports: [RegistrationService],
})
export class RegistrationModule {}

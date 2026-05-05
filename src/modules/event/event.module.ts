import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { EventsService } from './event.service';
import { EventsController } from './event.controller';
import { RegistrationModule } from '../registration/registration.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User]), RegistrationModule, PricingModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

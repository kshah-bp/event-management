import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventsService } from './event.service';
import { EventsController } from './event.controller';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), RegistrationModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

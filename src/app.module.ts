import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/event/event.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { ConfigModule as GlobalConfigModule } from './modules/config/config.module';

import { typeOrmConfig } from './database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    EventsModule,
    RegistrationModule,
    PricingModule,
    GlobalConfigModule,
  ],
})
export class AppModule {}

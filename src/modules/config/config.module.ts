import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalSetting } from './global-setting.entity';
import { GlobalSettingService } from './global-setting.service';
import { GlobalSettingController } from './global-setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalSetting])],
  controllers: [GlobalSettingController],
  providers: [GlobalSettingService],
  exports: [GlobalSettingService],
})
export class ConfigModule {}

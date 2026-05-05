import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSetting } from './global-setting.entity';

@Injectable()
export class GlobalSettingService {
  constructor(
    @InjectRepository(GlobalSetting)
    private repo: Repository<GlobalSetting>,
  ) {}

  async get(key: string): Promise<GlobalSetting> {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting ${key} not found`);
    return setting;
  }

  async set(key: string, value: string, description?: string): Promise<GlobalSetting> {
    let setting = await this.repo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
    } else {
      setting = this.repo.create({ key, value, description });
    }
    return this.repo.save(setting);
  }

  async getAll(): Promise<GlobalSetting[]> {
    return this.repo.find();
  }
}

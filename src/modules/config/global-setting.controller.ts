import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GlobalSettingService } from './global-setting.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Global Settings')
@ApiBearerAuth('BearerAuth')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin/settings')
export class GlobalSettingController {
  constructor(private readonly settingService: GlobalSettingService) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all settings (Admin only)' })
  @Get()
  getAll() {
    return this.settingService.getAll();
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get setting by key (Admin only)' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingService.get(key);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Set setting value (Admin only)' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @Post(':key')
  set(@Param('key') key: string, @Body() body: { value: string; description?: string }) {
    return this.settingService.set(key, body.value, body.description);
  }
}

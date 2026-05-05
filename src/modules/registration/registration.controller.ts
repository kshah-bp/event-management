import { Controller, Post, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RegistrationService } from './registration.service';

@ApiTags('Registrations')
@ApiBearerAuth('BearerAuth')
@UseGuards(JwtGuard)
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @ApiOperation({ summary: 'Confirm a pending registration' })
  @ApiParam({ name: 'id', type: Number, description: 'Registration ID' })
  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.id;
    return this.registrationService.confirmRegistration(id, userId);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RegistrationService } from './registration.service';

@Injectable()
export class RegistrationCronService {
  private readonly logger = new Logger(RegistrationCronService.name);

  constructor(private readonly registrationService: RegistrationService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredRegistrations() {
    const count = await this.registrationService.expirePendingRegistrations();
    if (count > 0) this.logger.log(`Expired ${count} pending registrations`);
  }
}

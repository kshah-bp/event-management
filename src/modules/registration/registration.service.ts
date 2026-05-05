import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThan, MoreThan } from 'typeorm';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../event/event.entity';
import { User } from '../users/user.entity';
import { ListRegistrationsQueryDto } from './dto/list-registrations-query.dto';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import { GlobalSettingService } from '../config/global-setting.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private pricingEngine: PricingEngineService,
    private globalSettingService: GlobalSettingService,
  ) {}

  async registerForEvent(userId: number, eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingRegs = await this.registrationRepo.find({
      where: { user: { id: userId }, event: { id: eventId } },
    });

    const now = new Date();
    const hasActive = existingRegs.some(reg => {
      if (reg.status === 'CONFIRMED') return true;
      if (reg.status === 'PENDING' && reg.expiresAt && reg.expiresAt > now) return true;
      return false;
    });

    if (hasActive) throw new ConflictException('Already registered for this event');

    return await this.eventRepo.manager.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const regRepo = manager.getRepository(EventRegistration);

      const lockedEvent = await eventRepo.findOne({
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedEvent) throw new NotFoundException('Event not found');

      const activePendingCount = await regRepo.count({
        where: { event: { id: eventId }, status: 'PENDING', expiresAt: MoreThan(now) },
      });
      const confirmedCount = await regRepo.count({
        where: { event: { id: eventId }, status: 'CONFIRMED' },
      });

      if (confirmedCount + activePendingCount >= lockedEvent.capacity) {
        throw new BadRequestException('Event is fully booked');
      }

      const priceResult = await this.pricingEngine.calculateFinalPrice(lockedEvent);

      let expiresAt: Date | undefined;
      try {
        const setting = await this.globalSettingService.get('registration_lock_duration');
        const durationInMinutes = parseInt(setting.value, 10);
        expiresAt = new Date(Date.now() + durationInMinutes * 60 * 1000);
      } catch {
        expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      }

      lockedEvent.bookedTickets += 1;
      await eventRepo.save(lockedEvent);

      const registration = regRepo.create({
        user,
        event: lockedEvent,
        finalPrice: priceResult.finalPrice,
        priceBreakdown: priceResult.breakdown,
        status: 'PENDING',
        expiresAt,
      });

      return regRepo.save(registration);
    });
  }

  async confirmRegistration(registrationId: number, userId: number) {
    return this.registrationRepo.manager.transaction(async (manager) => {
      const regRepo = manager.getRepository(EventRegistration);
      const eventRepo = manager.getRepository(Event);

      const registration = await regRepo.findOne({
        where: { id: registrationId },
        lock: { mode: 'pessimistic_write' },
        relations: ['user', 'event'],
      });

      if (!registration) throw new NotFoundException('Registration not found');
      if (registration.user.id !== userId) throw new ForbiddenException('Not your registration');
      if (registration.status !== 'PENDING') {
        throw new BadRequestException(`Registration status is ${registration.status}, cannot confirm`);
      }

      const now = new Date();
      if (registration.expiresAt && registration.expiresAt < now) {
        registration.status = 'EXPIRED';
        registration.expiresAt = undefined;
        await regRepo.save(registration);

        const event = await eventRepo.findOne({ where: { id: registration.event.id } });
        if (event) {
          event.bookedTickets = Math.max(0, event.bookedTickets - 1);
          await eventRepo.save(event);
        }
        throw new BadRequestException('Reservation expired');
      }

      registration.status = 'CONFIRMED';
      registration.expiresAt = undefined;
      return regRepo.save(registration);
    });
  }

  async expirePendingRegistrations() {
    const now = new Date();
    const pendingRegs = await this.registrationRepo.find({
      where: { status: 'PENDING', expiresAt: LessThan(now) },
      relations: ['event'],
    });

    let expiredCount = 0;
    for (const reg of pendingRegs) {
      await this.registrationRepo.manager.transaction(async (manager) => {
        const regRepo = manager.getRepository(EventRegistration);
        const eventRepo = manager.getRepository(Event);

        const lockedReg = await regRepo.findOne({
          where: { id: reg.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!lockedReg || lockedReg.status !== 'PENDING') return;

        lockedReg.status = 'EXPIRED';
        lockedReg.expiresAt = undefined;
        await regRepo.save(lockedReg);

        const event = await eventRepo.findOne({ where: { id: reg.event.id } });
        if (event) {
          event.bookedTickets = Math.max(0, event.bookedTickets - 1);
          await eventRepo.save(event);
        }
        expiredCount++;
      });
    }
    return expiredCount;
  }

  async getRegistrationsByEvent(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    return this.registrationRepo.find({
      where: { event: { id: eventId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllRegistrations(query: ListRegistrationsQueryDto) {
    const { eventId, userName, dateFrom, dateTo, page, limit } = query;
    const qb = this.registrationRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .leftJoinAndSelect('r.event', 'e')
      .orderBy('r.createdAt', 'DESC');

    if (eventId) {
      qb.andWhere('e.id = :eventId', { eventId });
    }

    if (userName) {
      qb.andWhere('u.name ILIKE :name', { name: `%${userName}%` });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('r.createdAt BETWEEN :from AND :to', {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      });
    } else if (dateFrom) {
      qb.andWhere('r.createdAt >= :from', { from: new Date(dateFrom) });
    } else if (dateTo) {
      qb.andWhere('r.createdAt <= :to', { to: new Date(dateTo) });
    }

    const total = await qb.getCount();

    if (page && limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      total: count,
      page: page || 1,
      limit: limit || count,
      totalPages: limit ? Math.ceil(count / limit) : 1,
    };
  }
}

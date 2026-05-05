import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../event/event.entity';
import { User } from '../users/user.entity';
import { ListRegistrationsQueryDto } from './dto/list-registrations-query.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(EventRegistration)
    private registrationRepo: Repository<EventRegistration>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async registerForEvent(userId: number, eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.registrationRepo.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });
    if (existing) throw new ConflictException('Already registered for this event');

    const registration = this.registrationRepo.create({ user, event });
    return this.registrationRepo.save(registration);
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

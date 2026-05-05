import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

export interface FindEventsOptions {
  search?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateEventDto, userId: number) {
    const createdBy = await this.userRepo.findOne({ where: { id: userId } });
    const event = this.repo.create({ ...dto, createdBy: createdBy || undefined });
    return this.repo.save(event);
  }

  async findAll(options: FindEventsOptions = {}) {
    const { search, location, dateFrom, dateTo, page, limit } = options;
    const where: any = {};

    if (search) {
      where.title = Like(`%${search}%`);
    }

    if (location) {
      where.location = Like(`%${location}%`);
    }

    if (dateFrom && dateTo) {
      where.date = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.date = Between(new Date(dateFrom), new Date('9999-12-31'));
    } else if (dateTo) {
      where.date = Between(new Date('1970-01-01'), new Date(dateTo));
    }

    let query = this.repo.find({ where });

    if (page && limit) {
      query = this.repo.find({
        where,
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    return query;
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return this.repo.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    return this.repo.remove(event);
  }
}

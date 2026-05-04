import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
  ) {}

  create(dto: CreateEventDto) {
    return this.repo.save(dto);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    return this.repo.save({ ...event, ...dto });
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    return this.repo.remove(event);
  }
}
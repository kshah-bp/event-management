import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { EventsService } from './event.service';
import { RegistrationService } from '../registration/registration.service';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly registrationService: RegistrationService,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter events from this date (ISO 8601)', format: 'date-time' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter events until this date (ISO 8601)', format: 'date-time' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of events' })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.eventsService.findAll({ search, location, dateFrom, dateTo, page, limit });
  }

  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'Get current ticket price for an event (base + dynamic pricing)' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Price calculation with breakdown' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get(':id/price')
  async getPrice(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.findOne(id);
    return this.pricingEngine.calculateFinalPrice(event);
  }

  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Register for an event' })
  @ApiParam({ name: 'eventId', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Already registered for this event' })
  @UseGuards(JwtGuard)
  @Post(':eventId/register')
  registerForEvent(@Param('eventId', ParseIntPipe) eventId: number, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.registrationService.registerForEvent(userId, eventId);
  }

  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.eventsService.create(dto, userId);
  }

  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}

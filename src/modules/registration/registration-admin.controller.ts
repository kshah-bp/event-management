import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
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
import { RegistrationService } from './registration.service';
import { ListRegistrationsQueryDto } from './dto/list-registrations-query.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Registrations')
@ApiBearerAuth('BearerAuth')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin')
export class RegistrationAdminController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all registrations for a specific event (Admin only)' })
  @ApiParam({ name: 'eventId', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'List of registrations for the event' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get('events/:eventId/registrations')
  getEventRegistrations(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.registrationService.getRegistrationsByEvent(eventId);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all registrations with pagination and filtering (Admin only)' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filter by event ID', type: Number })
  @ApiQuery({ name: 'userName', required: false, description: 'Filter by user name' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO 8601)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of registrations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('registrations')
  getAllRegistrations(@Query() query: ListRegistrationsQueryDto) {
    return this.registrationService.getAllRegistrations(query);
  }
}

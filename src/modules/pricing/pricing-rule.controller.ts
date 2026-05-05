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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PricingRuleService } from './pricing-rule.service';
import { PricingEngineService } from './pricing-engine.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { PricingRule } from './pricing-rule.entity';
import { Event } from '../event/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Pricing Rules')
@ApiBearerAuth('BearerAuth')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin/pricing-rules')
export class PricingRuleController {
  constructor(
    private readonly pricingRuleService: PricingRuleService,
    private readonly pricingEngine: PricingEngineService,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new pricing rule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Pricing rule created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Post()
  create(@Body() dto: CreatePricingRuleDto): Promise<PricingRule> {
    return this.pricingRuleService.create(dto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all pricing rules (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of pricing rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get()
  findAll(): Promise<PricingRule[]> {
    return this.pricingRuleService.findAll();
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a pricing rule by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PricingRule> {
    return this.pricingRuleService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a pricing rule (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePricingRuleDto,
  ): Promise<PricingRule> {
    return this.pricingRuleService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a pricing rule (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pricingRuleService.remove(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Enable or disable a pricing rule (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  @Patch(':id/:active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Param('active') active: string,
  ): Promise<PricingRule> {
    return this.pricingRuleService.setActive(id, active === 'true');
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Preview price for an event (Admin only)' })
  @ApiParam({ name: 'eventId', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Price preview with breakdown' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get('preview/:eventId')
  async previewPrice(@Param('eventId', ParseIntPipe) eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const result = await this.pricingEngine.calculateFinalPrice(event);
    return {
      eventId: event.id,
      eventTitle: event.title,
      basePrice: result.basePrice,
      finalPrice: result.finalPrice,
      appliedRules: result.breakdown,
    };
  }
}

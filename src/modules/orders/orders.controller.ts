import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  QueryOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  UpdateTrackingDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.ordersService.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Patch(':id/tracking')
  updateTracking(@Param('id') id: string, @Body() dto: UpdateTrackingDto) {
    return this.ordersService.updateTracking(id, dto.trackingNumber);
  }
}

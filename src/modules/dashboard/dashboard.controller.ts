import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() { return this.dashboardService.getStats(); }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit?: string) { return this.dashboardService.getRecentOrders(limit ? parseInt(limit, 10) : 10); }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) { return this.dashboardService.getTopProducts(limit ? parseInt(limit, 10) : 10); }
}

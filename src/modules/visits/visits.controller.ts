import { Controller, Get, UseGuards } from '@nestjs/common';
import { VisitsService } from './visits.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('admin/visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get('stats')
  async getStats() {
    const [total, last30Days] = await Promise.all([
      this.visitsService.getTotalVisits(),
      this.visitsService.getLast30Days(),
    ]);
    return { total, last30Days };
  }
}

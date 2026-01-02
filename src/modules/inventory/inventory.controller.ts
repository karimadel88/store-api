import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockAdjustmentDto, QueryStockHistoryDto, BatchStockUpdateDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products/:id/stock-adjustment')
  createStockAdjustment(
    @Param('id') productId: string,
    @Body() createDto: CreateStockAdjustmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.inventoryService.createStockAdjustment(productId, createDto, req.user.userId);
  }

  @Get('products/:id/stock-history')
  getStockHistory(@Param('id') productId: string, @Query() query: QueryStockHistoryDto) {
    return this.inventoryService.getStockHistory(productId, query);
  }

  @Get('alerts')
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Post('batch-update')
  batchUpdateStock(@Body() updates: BatchStockUpdateDto[], @Request() req: AuthenticatedRequest) {
    return this.inventoryService.batchUpdateStock(updates, req.user.userId);
  }
}

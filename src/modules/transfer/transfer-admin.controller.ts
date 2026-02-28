import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { FeeRulesService } from './fee-rules.service.js';
import { TransferOrdersService } from './transfer-orders.service.js';
import { WhatsappMessageService } from './whatsapp-message.service.js';
import { TransferCustomerAuthService } from './transfer-customer-auth.service.js';
import { CreateTransferMethodDto, UpdateTransferMethodDto } from './dto/transfer-method.dto.js';
import { CreateFeeRuleDto, UpdateFeeRuleDto } from './dto/fee-rule.dto.js';
import {
  QueryTransferOrderDto,
  UpdateTransferOrderStatusDto,
  UpdateTransferOrderNotesDto,
} from './dto/transfer-order.dto.js';

@Controller('admin/transfer')
@UseGuards(JwtAuthGuard)
export class TransferAdminController {
  constructor(
    private readonly transferMethodsService: TransferMethodsService,
    private readonly feeRulesService: FeeRulesService,
    private readonly transferOrdersService: TransferOrdersService,
    private readonly whatsappMessageService: WhatsappMessageService,
    private readonly transferCustomerAuthService: TransferCustomerAuthService,
  ) {}

  // ─── Transfer Methods ──────────────────────────────────

  @Post('methods')
  createMethod(@Body() dto: CreateTransferMethodDto) {
    return this.transferMethodsService.create(dto);
  }

  @Get('methods')
  findAllMethods() {
    return this.transferMethodsService.findAll();
  }

  @Get('methods/:id')
  findOneMethod(@Param('id') id: string) {
    return this.transferMethodsService.findOne(id);
  }

  @Patch('methods/:id')
  updateMethod(@Param('id') id: string, @Body() dto: UpdateTransferMethodDto) {
    return this.transferMethodsService.update(id, dto);
  }

  @Delete('methods/:id')
  removeMethod(@Param('id') id: string) {
    return this.transferMethodsService.remove(id);
  }

  // ─── Fee Rules ─────────────────────────────────────────

  @Post('fee-rules')
  createFeeRule(@Body() dto: CreateFeeRuleDto) {
    return this.feeRulesService.create(dto);
  }

  @Get('fee-rules')
  findAllFeeRules() {
    return this.feeRulesService.findAll();
  }

  @Get('fee-rules/:id')
  findOneFeeRule(@Param('id') id: string) {
    return this.feeRulesService.findOne(id);
  }

  @Patch('fee-rules/:id')
  updateFeeRule(@Param('id') id: string, @Body() dto: UpdateFeeRuleDto) {
    return this.feeRulesService.update(id, dto);
  }

  @Delete('fee-rules/:id')
  removeFeeRule(@Param('id') id: string) {
    return this.feeRulesService.remove(id);
  }

  // ─── Transfer Orders ──────────────────────────────────

  @Get('orders')
  findAllOrders(@Query() query: QueryTransferOrderDto) {
    return this.transferOrdersService.findAll(query);
  }

  @Get('orders/:id')
  async findOneOrder(@Param('id') id: string) {
    const order = await this.transferOrdersService.findOne(id);
    const whatsapp = this.whatsappMessageService.buildMessage(order);
    return { ...order, whatsapp };
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransferOrderStatusDto,
  ) {
    return this.transferOrdersService.updateStatus(id, dto.status);
  }

  @Patch('orders/:id/notes')
  updateOrderNotes(
    @Param('id') id: string,
    @Body() dto: UpdateTransferOrderNotesDto,
  ) {
    return this.transferOrdersService.updateNotes(id, dto.adminNotes);
  }

  // ─── Transfer Customers ───────────────────────────────

  @Get('customers')
  findAllCustomers() {
    return this.transferCustomerAuthService.findAll();
  }

  @Get('customers/:id')
  findOneCustomer(@Param('id') id: string) {
    return this.transferCustomerAuthService.findById(id);
  }

  @Patch('customers/:id/toggle-active')
  toggleCustomerActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.transferCustomerAuthService.toggleActive(id, isActive);
  }
}


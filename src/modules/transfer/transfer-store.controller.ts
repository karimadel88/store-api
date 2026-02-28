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
import { TransferAuthGuard } from './guards/transfer-auth.guard.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { TransferOrdersService } from './transfer-orders.service.js';
import { WhatsappMessageService } from './whatsapp-message.service.js';
import { TransferCustomerAuthService } from './transfer-customer-auth.service.js';
import { QuoteDto, ConfirmTransferDto, QueryTransferOrderDto } from './dto/transfer-order.dto.js';
import {
  RegisterTransferCustomerDto,
  LoginTransferCustomerDto,
} from './dto/transfer-customer.dto.js';

@Controller('transfer')
export class TransferStoreController {
  constructor(
    private readonly transferMethodsService: TransferMethodsService,
    private readonly transferOrdersService: TransferOrdersService,
    private readonly whatsappMessageService: WhatsappMessageService,
    private readonly transferCustomerAuthService: TransferCustomerAuthService,
  ) {}

  // ─── Auth (Public) ─────────────────────────────────────

  @Post('auth/register')
  register(@Body() dto: RegisterTransferCustomerDto) {
    return this.transferCustomerAuthService.register(dto);
  }

  @Post('auth/login')
  login(@Body() dto: LoginTransferCustomerDto) {
    return this.transferCustomerAuthService.login(dto);
  }

  @Get('auth/profile')
  @UseGuards(TransferAuthGuard)
  getProfile(@Request() req: any) {
    return this.transferCustomerAuthService.findById(req.user.customerId);
  }

  // ─── Transfer Methods (Public) ─────────────────────────

  @Get('methods')
  findAllEnabledMethods() {
    return this.transferMethodsService.findAllEnabled();
  }

  // ─── Quote & Confirm (Authenticated) ──────────────────

  @Post('quote')
  @UseGuards(TransferAuthGuard)
  getQuote(@Body() dto: QuoteDto) {
    return this.transferOrdersService.quote(dto);
  }

  @Post('confirm')
  @UseGuards(TransferAuthGuard)
  async confirmTransfer(@Body() dto: ConfirmTransferDto, @Request() req: any) {
    const order = await this.transferOrdersService.confirm(dto, req.user.customerId);
    const whatsapp = this.whatsappMessageService.buildMessage(order);
    return { order, whatsapp };
  }

  // ─── My Orders (Authenticated) ────────────────────────

  @Get('orders')
  @UseGuards(TransferAuthGuard)
  findMyOrders(@Query() query: QueryTransferOrderDto, @Request() req: any) {
    return this.transferOrdersService.findByCustomerId(req.user.customerId, query);
  }

  @Get('orders/:id')
  @UseGuards(TransferAuthGuard)
  async findOneOrder(@Param('id') id: string, @Request() req: any) {
    return this.transferOrdersService.findOneByCustomer(id, req.user.customerId);
  }
}

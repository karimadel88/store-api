import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TransferMethod, TransferMethodSchema } from './schemas/transfer-method.schema.js';
import { FeeRule, FeeRuleSchema } from './schemas/fee-rule.schema.js';
import { TransferOrder, TransferOrderSchema } from './schemas/transfer-order.schema.js';
import { TransferCustomer, TransferCustomerSchema } from './schemas/transfer-customer.schema.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { FeeRulesService } from './fee-rules.service.js';
import { TransferOrdersService } from './transfer-orders.service.js';
import { WhatsappMessageService } from './whatsapp-message.service.js';
import { TransferCustomerAuthService } from './transfer-customer-auth.service.js';
import { JwtTransferStrategy } from './strategies/jwt-transfer.strategy.js';
import { TransferAdminController } from './transfer-admin.controller.js';
import { TransferStoreController } from './transfer-store.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransferMethod.name, schema: TransferMethodSchema },
      { name: FeeRule.name, schema: FeeRuleSchema },
      { name: TransferOrder.name, schema: TransferOrderSchema },
      { name: TransferCustomer.name, schema: TransferCustomerSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [TransferAdminController, TransferStoreController],
  providers: [
    TransferMethodsService,
    FeeRulesService,
    TransferOrdersService,
    WhatsappMessageService,
    TransferCustomerAuthService,
    JwtTransferStrategy,
  ],
  exports: [TransferMethodsService, FeeRulesService, TransferOrdersService],
})
export class TransferModule {}

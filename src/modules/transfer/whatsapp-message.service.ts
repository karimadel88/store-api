import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransferOrder } from './schemas/transfer-order.schema.js';

export interface WhatsAppMessage {
  messageText: string;
  encodedMessage: string;
  whatsappUrl: string;
  brokerPhone: string;
}

@Injectable()
export class WhatsappMessageService {
  constructor(private readonly configService: ConfigService) {}

  buildMessage(order: TransferOrder): WhatsAppMessage {
    const brokerPhone = this.configService.get<string>('BROKER_WHATSAPP_PHONE', '');

    // Extract method names from populated data
    const fromMethodName = (order.fromMethodId as any)?.name || 'N/A';
    const toMethodName = (order.toMethodId as any)?.name || 'N/A';

    const messageText = [
      `📋 Order #${order.orderNumber}`,
      `💰 Amount: ${order.amount}`,
      `💸 Fee: ${order.fee}`,
      `💵 Total: ${order.total}`,
      `📤 From: ${fromMethodName}`,
      `📥 To: ${toMethodName}`,
      `👤 Customer: ${order.customerName || 'N/A'}`,
      `📞 Phone: ${order.customerPhone || 'N/A'}`,
      `📱 WhatsApp: ${order.customerWhatsapp || 'N/A'}`,
    ].join('\n');

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = brokerPhone
      ? `https://wa.me/${brokerPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    return {
      messageText,
      encodedMessage,
      whatsappUrl,
      brokerPhone,
    };
  }
}

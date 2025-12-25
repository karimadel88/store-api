import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { StoreCreateOrderDto } from './dto/store-order.dto';
import { ProductsService } from '../products/products.service';
import { ShippingService } from '../shipping/shipping.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrdersStoreController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly shippingService: ShippingService,
  ) {}

  @Post()
  async create(@Body() storeDto: StoreCreateOrderDto) {
    // 1. Calculate Shipping Cost provided cityId
    const shippingOptions = await this.shippingService.calculateShipping(storeDto.shippingAddress.cityId);
    if (!shippingOptions || shippingOptions.length === 0) {
       throw new BadRequestException('No shipping methods available for this location');
    }
    // Default to the first option (usually standard)
    const selectedShipping = shippingOptions[0];

    // 2. Hydrate Items (Get Name, SKU, Image)
    const items = await Promise.all(
      storeDto.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);
        return {
          productId: item.productId,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          price: item.price, // Trusting frontend price for now, or use product.price
          total: item.price * item.quantity,
          image: product.imageIds && product.imageIds.length > 0 ? product.imageIds[0].toString() : undefined,
        };
      }),
    );

    // 3. Construct Internal CreateOrderDto
    const internalDto: CreateOrderDto = {
      customerDetails: {
        firstName: storeDto.customer.firstName,
        lastName: storeDto.customer.lastName,
        email: storeDto.customer.email,
        phone: storeDto.customer.phone,
      },
      shippingAddress: {
        street: storeDto.shippingAddress.street,
        cityId: storeDto.shippingAddress.cityId,
        cityName: storeDto.shippingAddress.city,
        country: storeDto.shippingAddress.country,
      },
      items: items,
      shippingCost: selectedShipping.price,
      shippingMethodId: selectedShipping.shippingMethodId,
      shippingMethodName: selectedShipping.name,
      paymentMethod: storeDto.paymentMethod || 'cod',
      notes: storeDto.notes,
    };

    return this.ordersService.create(internalDto);
  }
}

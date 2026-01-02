import { Injectable } from '@nestjs/common';
import { BannersService } from '../banners/banners.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly bannersService: BannersService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly settingsService: SettingsService,
  ) {}

  async getHomeData() {
    const [banners, categories, featuredProducts, newArrivals, onSaleProducts, settings] = await Promise.all([
      this.bannersService.findAll(false),
      this.categoriesService.findAllWithStats(),
      this.productsService.findAll({ isFeatured: true, isActive: true, limit: 8 }),
      this.productsService.findAll({ isActive: true, limit: 8, page: 1 }), // New Arrivals (default sort)
      this.productsService.findAll({ isActive: true, isOnSale: true, limit: 8 }), // On Sale
      this.settingsService.get(),
    ]);

    return {
      banners,
      categories,
      featuredProducts: featuredProducts.data,
      newArrivals: newArrivals.data,
      onSaleProducts: onSaleProducts.data,
      settings,
    };
  }
}

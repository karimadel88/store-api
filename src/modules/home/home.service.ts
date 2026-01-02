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
    // Fetch all data in parallel for better performance
    const [banners, categories, featuredProducts, newArrivals, settings] = await Promise.all([
      this.bannersService.findAll(false),
      this.categoriesService.findAllWithStats(),
      this.productsService.findAll({ isActive: true, isFeatured: true, limit: 12 }),
      this.productsService.findAll({ isActive: true, limit: 8 }),
      this.settingsService.get(),
    ]);

    return {
      banners,
      categories,
      featuredProducts: featuredProducts.data,
      newArrivals: newArrivals.data,
      settings: {
        storeName: settings.storeName,
        logo: settings.logo,
        currency: settings.currency,
        contactInfo: settings.contactInfo,
      },
    };
  }
}

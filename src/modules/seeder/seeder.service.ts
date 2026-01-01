import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../categories/schemas/category.schema';
import { Banner } from '../banners/schemas/banner.schema';
import { Product } from '../products/schemas/product.schema';
import { Media } from '../media/schemas/media.schema';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Banner.name) private bannerModel: Model<Banner>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Media.name) private mediaModel: Model<Media>,
  ) {}

  async seedData(): Promise<{
    message: string;
    created: {
      categories: number;
      banners: number;
      products: number;
      media: number;
    };
  }> {
    const results = {
      categories: 0,
      banners: 0,
      products: 0,
      media: 0,
    };

    // Check if data already exists
    const existingCategories = await this.categoryModel.countDocuments();
    if (existingCategories > 0) {
      return {
        message: 'Data already exists. Skipping seed.',
        created: results,
      };
    }

    // Create placeholder media for images
    const categoryImages = await this.createPlaceholderMedia('category', 4);
    const bannerImages = await this.createPlaceholderMedia('banner', 3);
    const productImages = await this.createPlaceholderMedia('product', 8);
    results.media = categoryImages.length + bannerImages.length + productImages.length;

    // Seed Categories
    const categoriesData = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronic devices and gadgets',
        imageId: categoryImages[0]?._id,
        isActive: true,
        sortOrder: 0,
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel for all ages',
        imageId: categoryImages[1]?._id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home and garden',
        imageId: categoryImages[2]?._id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories',
        imageId: categoryImages[3]?._id,
        isActive: true,
        sortOrder: 3,
      },
    ];

    const categories = await this.categoryModel.insertMany(categoriesData);
    results.categories = categories.length;

    // Seed Banners
    const bannersData = [
      {
        title: 'Summer Sale',
        subtitle: 'Up to 50% off on selected items',
        imageId: bannerImages[0]?._id,
        link: '/products?sale=true',
        buttonText: 'Shop Now',
        isActive: true,
        sortOrder: 0,
      },
      {
        title: 'New Arrivals',
        subtitle: 'Check out our latest collection',
        imageId: bannerImages[1]?._id,
        link: '/products?new=true',
        buttonText: 'Explore',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Free Shipping',
        subtitle: 'On orders over 500 EGP',
        imageId: bannerImages[2]?._id,
        link: '/shipping',
        buttonText: 'Learn More',
        isActive: true,
        sortOrder: 2,
      },
    ];

    const banners = await this.bannerModel.insertMany(bannersData);
    results.banners = banners.length;

    // Seed Products
    const productsData = [
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        brand: 'TechSound',
        sku: 'WH-001',
        price: 1500,
        compareAtPrice: 2000,
        quantity: 50,
        categoryId: categories[0]._id,
        imageIds: [productImages[0]?._id].filter(Boolean),
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Feature-packed smartwatch with health monitoring',
        brand: 'TechWear',
        sku: 'SW-001',
        price: 2500,
        compareAtPrice: 3000,
        quantity: 30,
        categoryId: categories[0]._id,
        imageIds: [productImages[1]?._id].filter(Boolean),
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Cotton T-Shirt',
        slug: 'cotton-tshirt',
        description: 'Comfortable 100% cotton t-shirt',
        brand: 'FashionPlus',
        sku: 'TS-001',
        price: 299,
        compareAtPrice: 399,
        quantity: 100,
        categoryId: categories[1]._id,
        imageIds: [productImages[2]?._id].filter(Boolean),
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Denim Jeans',
        slug: 'denim-jeans',
        description: 'Classic denim jeans with modern fit',
        brand: 'FashionPlus',
        sku: 'DJ-001',
        price: 799,
        compareAtPrice: 999,
        quantity: 75,
        categoryId: categories[1]._id,
        imageIds: [productImages[3]?._id].filter(Boolean),
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'LED Desk Lamp',
        slug: 'led-desk-lamp',
        description: 'Adjustable LED desk lamp with multiple brightness levels',
        brand: 'HomeBright',
        sku: 'LD-001',
        price: 450,
        compareAtPrice: 550,
        quantity: 40,
        categoryId: categories[2]._id,
        imageIds: [productImages[4]?._id].filter(Boolean),
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Garden Tool Set',
        slug: 'garden-tool-set',
        description: 'Complete garden tool set with 5 essential tools',
        brand: 'GreenGarden',
        sku: 'GT-001',
        price: 650,
        compareAtPrice: 800,
        quantity: 25,
        categoryId: categories[2]._id,
        imageIds: [productImages[5]?._id].filter(Boolean),
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Yoga Mat',
        slug: 'yoga-mat',
        description: 'Non-slip yoga mat with carrying strap',
        brand: 'FitLife',
        sku: 'YM-001',
        price: 350,
        compareAtPrice: 450,
        quantity: 60,
        categoryId: categories[3]._id,
        imageIds: [productImages[6]?._id].filter(Boolean),
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Dumbbell Set',
        slug: 'dumbbell-set',
        description: 'Adjustable dumbbell set from 5kg to 25kg',
        brand: 'FitLife',
        sku: 'DS-001',
        price: 1200,
        compareAtPrice: 1500,
        quantity: 20,
        categoryId: categories[3]._id,
        imageIds: [productImages[7]?._id].filter(Boolean),
        isActive: true,
        isFeatured: false,
      },
    ];

    const products = await this.productModel.insertMany(productsData);
    results.products = products.length;

    return {
      message: 'Sample data seeded successfully',
      created: results,
    };
  }

  private async createPlaceholderMedia(type: string, count: number): Promise<any[]> {
    const media: any[] = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    for (let i = 0; i < count; i++) {
      const filename = `placeholder-${type}-${i + 1}.jpg`;
      media.push({
        filename,
        originalName: `${type}-image-${i + 1}.jpg`,
        path: `uploads/${filename}`,
        url: `${baseUrl}/uploads/${filename}`,
        mimeType: 'image/jpeg',
        size: 1024,
        sortOrder: i,
      });
    }

    return this.mediaModel.insertMany(media);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/schemas/user.schema';
import { CategoriesService } from './modules/categories/categories.service';
import { ProductsService } from './modules/products/products.service';
import { MediaService } from './modules/media/media.service';
import { EntityType } from './modules/media/schemas/media.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Types } from 'mongoose';

async function downloadImage(url: string, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.join(uploadsDir, filename);
  const file = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); 
      reject(err);
    });
  });
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    const categoriesService = app.get(CategoriesService);
    const productsService = app.get(ProductsService);
    const mediaService = app.get(MediaService);

    console.log('🌱 Starting seed...');

    // 1. Admin User
    const adminEmail = 'admin@store.com';
    const existingAdmin = await usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      await usersService.create({
        email: adminEmail,
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });
      console.log('✅ Admin user created: admin@store.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // 2. Categories & Products
    // Check specific categories by name to avoid duplicates
    const allCategories = await categoriesService.findAll(true);
    // Check for Home category as indicator of full seed
    const existingHome = allCategories.find(c => c.name === 'المنزل والمطبخ');
    
    if (existingHome) {
      console.log('ℹ️  Full Arabic content seems to exist, skipping.');
    } else {
      console.log('📦 Seeding Extended Arabic content...');

      const getOrCreateCategory = async (name: string, description: string, imageId: string) => {
        const found = allCategories.find(c => c.name === name);
        if (found) return found;
        return categoriesService.create({ name, description, imageId, isActive: true });
      };

      // ==========================================
      // 1. Electronics (إلكترونيات)
      // ==========================================
      let catElec: any;
      {
        const existing = allCategories.find(c => c.name === 'إلكترونيات');
        if (existing) {
             catElec = existing;
        } else {
             const elecImg = await downloadImage('https://images.unsplash.com/photo-1498049381575-7f14b562a0cd?w=600', 'electronics.jpg');
             const elecMedia = await mediaService.create({ filename: 'electronics.jpg', originalname: 'electronics.jpg', path: 'uploads/electronics.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.CATEGORY });
             catElec = await categoriesService.create({ name: 'إلكترونيات', description: 'أحدث الأجهزة والإلكترونيات', imageId: elecMedia._id.toString(), isActive: true });
        }
      }

      // Products (try/catch for duplicates)
      const safeCreateProduct = async (dto: any) => {
        try {
          await productsService.create(dto);
        } catch (e) {
             // Ignore duplicate sku/slug
             console.log(`Skipping existing product: ${dto.name}`);
        }
      };

      const p1Img = await downloadImage('https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600', 'iphone.jpg');
      const p1Media = await mediaService.create({ filename: 'iphone.jpg', originalname: 'iphone.jpg', path: 'uploads/iphone.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'آيفون 15 برو', sku: 'IPHONE-15', price: 45000, quantity: 50, description: 'أحدث هاتف من آبل.', categoryId: catElec._id.toString(), imageIds: [p1Media._id.toString()], isActive: true, attributes: { 'اللون': 'تيتانيوم' }, brand: 'Apple' });

      const p2Img = await downloadImage('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 'macbook.jpg');
      const p2Media = await mediaService.create({ filename: 'macbook.jpg', originalname: 'macbook.jpg', path: 'uploads/macbook.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'ماك بوك برو M3', sku: 'MACBOOK-M3', price: 95000, quantity: 20, description: 'أداء خارق للمحترفين.', categoryId: catElec._id.toString(), imageIds: [p2Media._id.toString()], isActive: true, attributes: { 'المعالج': 'M3 Pro' }, brand: 'Apple' });

      const p3Img = await downloadImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'headphones.jpg');
      const p3Media = await mediaService.create({ filename: 'headphones.jpg', originalname: 'headphones.jpg', path: 'uploads/headphones.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'سماعات سوني هيدفون', sku: 'SONY-WH1000', price: 12000, quantity: 30, description: 'عازل للضوضاء.', categoryId: catElec._id.toString(), imageIds: [p3Media._id.toString()], isActive: true, attributes: { 'النوع': 'لاسلكي' }, brand: 'Sony' });

      const p4Img = await downloadImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', 'smartwatch.jpg');
      const p4Media = await mediaService.create({ filename: 'smartwatch.jpg', originalname: 'smartwatch.jpg', path: 'uploads/smartwatch.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'ساعة آبل الذكية', sku: 'APPLE-WATCH', price: 18000, quantity: 40, description: 'تتبع نشاطك الرياضي.', categoryId: catElec._id.toString(), imageIds: [p4Media._id.toString()], isActive: true, attributes: { 'الجيل': 'التاسع' }, brand: 'Apple' });


      // ==========================================
      // 2. Fashion (أزياء وموضة)
      // ==========================================
      let catFash: any;
      {
           const existing = allCategories.find(c => c.name === 'أزياء وموضة');
           if (existing) {
               catFash = existing;
           } else {
               const fashImg = await downloadImage('https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', 'fashion.jpg');
               const fashMedia = await mediaService.create({ filename: 'fashion.jpg', originalname: 'fashion.jpg', path: 'uploads/fashion.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.CATEGORY });
               catFash = await categoriesService.create({ name: 'أزياء وموضة', description: 'أحدث صيحات الموضة', imageId: fashMedia._id.toString(), isActive: true });
           }
      }

      const p5Img = await downloadImage('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'tshirt.jpg');
      const p5Media = await mediaService.create({ filename: 'tshirt.jpg', originalname: 'tshirt.jpg', path: 'uploads/tshirt.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'تيشيرت أبيض', sku: 'TSHIRT-W', price: 450, quantity: 100, description: 'قطن 100%.', categoryId: catFash._id.toString(), imageIds: [p5Media._id.toString()], isActive: true, attributes: { 'المقاس': 'L' }, brand: 'Zara' });

      const p6Img = await downloadImage('https://images.unsplash.com/photo-1542272617-08f08375810c?w=600', 'jeans.jpg');
      const p6Media = await mediaService.create({ filename: 'jeans.jpg', originalname: 'jeans.jpg', path: 'uploads/jeans.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'بنطلون جينز أزرق', sku: 'JEANS-BLUE', price: 850, quantity: 60, description: 'قصة مريحة.', categoryId: catFash._id.toString(), imageIds: [p6Media._id.toString()], isActive: true, attributes: { 'المقاس': '32' }, brand: 'Levis' });

      const p7Img = await downloadImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'sneakers.jpg');
      const p7Media = await mediaService.create({ filename: 'sneakers.jpg', originalname: 'sneakers.jpg', path: 'uploads/sneakers.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'حذاء رياضي أحمر', sku: 'NIKE-RED', price: 3500, quantity: 25, description: 'للجري والتمارين.', categoryId: catFash._id.toString(), imageIds: [p7Media._id.toString()], isActive: true, attributes: { 'المقاس': '42' }, brand: 'Nike' });

      const p8Img = await downloadImage('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600', 'jacket.jpg');
      const p8Media = await mediaService.create({ filename: 'jacket.jpg', originalname: 'jacket.jpg', path: 'uploads/jacket.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'جاكيت جلد', sku: 'JACKET-L', price: 2200, quantity: 15, description: 'جلد طبيعي.', categoryId: catFash._id.toString(), imageIds: [p8Media._id.toString()], isActive: true, attributes: { 'اللون': 'أسود' }, brand: 'Generic' });


      // ==========================================
      // 3. Home & Kitchen (المنزل والمطبخ)
      // ==========================================
      let catHome: any;
      {
           const existing = allCategories.find(c => c.name === 'المنزل والمطبخ');
           if (existing) {
               catHome = existing;
           } else {
               const homeImg = await downloadImage('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', 'kitchen.jpg');
               const homeMedia = await mediaService.create({ filename: 'kitchen.jpg', originalname: 'kitchen.jpg', path: 'uploads/kitchen.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.CATEGORY });
               catHome = await categoriesService.create({ name: 'المنزل والمطبخ', description: 'كل ما يحتاجه منزلك', imageId: homeMedia._id.toString(), isActive: true });
           }
      }

      const p9Img = await downloadImage('https://images.unsplash.com/photo-1517088455889-bfa750e4505b?w=600', 'coffee.jpg');
      const p9Media = await mediaService.create({ filename: 'coffee.jpg', originalname: 'coffee.jpg', path: 'uploads/coffee.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'ماكينة قهوة', sku: 'COFFEE-MKR', price: 6500, quantity: 20, description: 'تحضير اسبريسو.', categoryId: catHome._id.toString(), imageIds: [p9Media._id.toString()], isActive: true, attributes: { 'النوع': 'أتوماتيك' }, brand: 'DeLonghi' });

      const p10Img = await downloadImage('https://images.unsplash.com/photo-1570222094114-28a9d8896aca?w=600', 'blender.jpg');
      const p10Media = await mediaService.create({ filename: 'blender.jpg', originalname: 'blender.jpg', path: 'uploads/blender.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'خلاط كهربائي', sku: 'BLENDER-1', price: 1200, quantity: 40, description: 'عالي السرعة.', categoryId: catHome._id.toString(), imageIds: [p10Media._id.toString()], isActive: true, attributes: { 'القوة': '1000 وات' }, brand: 'Moulinex' });

      const p11Img = await downloadImage('https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=600', 'towels.jpg');
      const p11Media = await mediaService.create({ filename: 'towels.jpg', originalname: 'towels.jpg', path: 'uploads/towels.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'طقم مناشف', sku: 'TOWEL-SET', price: 550, quantity: 100, description: 'نعومة فائقة.', categoryId: catHome._id.toString(), imageIds: [p11Media._id.toString()], isActive: true, attributes: { 'العدد': '3 قطع' }, brand: 'Cotton' });

      const p12Img = await downloadImage('https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600', 'vase.jpg');
      const p12Media = await mediaService.create({ filename: 'vase.jpg', originalname: 'vase.jpg', path: 'uploads/vase.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'فازة سيراميك', sku: 'VASE-001', price: 300, quantity: 50, description: 'شكل عصري.', categoryId: catHome._id.toString(), imageIds: [p12Media._id.toString()], isActive: true, attributes: { 'اللون': 'بيج' }, brand: 'Deco' });


      // ==========================================
      // 4. Beauty (الجمال والعناية)
      // ==========================================
      const beautyImg = await downloadImage('https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600', 'beauty.jpg');
      const beautyMedia = await mediaService.create({ filename: 'beauty.jpg', originalname: 'beauty.jpg', path: 'uploads/beauty.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.CATEGORY });
      const catBeauty = await getOrCreateCategory('الجمال والعناية', 'منتجات التجميل والعطور', beautyMedia._id.toString());

      const p13Img = await downloadImage('https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600', 'perfume.jpg');
      const p13Media = await mediaService.create({ filename: 'perfume.jpg', originalname: 'perfume.jpg', path: 'uploads/perfume.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'عطر فرنسي', sku: 'PERF-001', price: 3200, quantity: 30, description: 'رائحة تدوم طويلاً.', categoryId: catBeauty._id.toString(), imageIds: [p13Media._id.toString()], isActive: true, attributes: { 'الحجم': '100 مل' }, brand: 'Chanel' });

      const p14Img = await downloadImage('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600', 'cream.jpg');
      const p14Media = await mediaService.create({ filename: 'cream.jpg', originalname: 'cream.jpg', path: 'uploads/cream.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'كريم مرطب', sku: 'CREAM-FACE', price: 450, quantity: 80, description: 'لجميع أنواع البشرة.', categoryId: catBeauty._id.toString(), imageIds: [p14Media._id.toString()], isActive: true, attributes: { 'النوع': 'نهاري' }, brand: 'Nivea' });

      const p15Img = await downloadImage('https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600', 'hairdryer.jpg');
      const p15Media = await mediaService.create({ filename: 'hairdryer.jpg', originalname: 'hairdryer.jpg', path: 'uploads/hairdryer.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'مجفف شعر', sku: 'HAIR-DRYER', price: 1800, quantity: 40, description: 'حرارة قابلة للتعديل.', categoryId: catBeauty._id.toString(), imageIds: [p15Media._id.toString()], isActive: true, attributes: { 'اللون': 'وردي' }, brand: 'Philips' });

      const p16Img = await downloadImage('https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600', 'lipstick.jpg');
        // Reusing beauty image for simplicity logic-wise or downloading specific, downloading again for file
      const p16Media = await mediaService.create({ filename: 'lipstick.jpg', originalname: 'lipstick.jpg', path: 'uploads/beauty.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'أحمر شفاه', sku: 'LIPSTICK-RED', price: 350, quantity: 100, description: 'لون ثابت.', categoryId: catBeauty._id.toString(), imageIds: [p16Media._id.toString()], isActive: true, attributes: { 'اللون': 'أحمر' }, brand: 'MAC' });


      // ==========================================
      // 5. Sports (الرياضة)
      // ==========================================
      const sportImg = await downloadImage('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', 'sports.jpg');
      const sportMedia = await mediaService.create({ filename: 'sports.jpg', originalname: 'sports.jpg', path: 'uploads/sports.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.CATEGORY });
      const catSport = await getOrCreateCategory('الرياضة', 'معدات وملابس رياضية', sportMedia._id.toString());

      const p17Img = await downloadImage('https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 'yogamat.jpg');
      const p17Media = await mediaService.create({ filename: 'yogamat.jpg', originalname: 'yogamat.jpg', path: 'uploads/yogamat.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'سجادة يوجا', sku: 'YOGA-MAT', price: 350, quantity: 50, description: 'مانعة للانزلاق.', categoryId: catSport._id.toString(), imageIds: [p17Media._id.toString()], isActive: true, attributes: { 'اللون': 'بينك' }, brand: 'Generic' });

      const p18Img = await downloadImage('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600', 'dumbbells.jpg');
      const p18Media = await mediaService.create({ filename: 'dumbbells.jpg', originalname: 'dumbbells.jpg', path: 'uploads/dumbbells.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
        await safeCreateProduct({ name: 'أوزان دامبلز', sku: 'DUMB-5KG', price: 900, quantity: 20, description: '5 كيلو.', categoryId: catSport._id.toString(), imageIds: [p18Media._id.toString()], isActive: true, attributes: { 'الوزن': '5kg' }, brand: 'ProFit' });

      const p19Img = await downloadImage('https://images.unsplash.com/photo-1602143407151-11115cd4e69b?w=600', 'waterbottle.jpg');
      const p19Media = await mediaService.create({ filename: 'waterbottle.jpg', originalname: 'waterbottle.jpg', path: 'uploads/waterbottle.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'زجاجة مياه ذكية', sku: 'WATER-BTL', price: 500, quantity: 60, description: 'تحفظ الحرارة.', categoryId: catSport._id.toString(), imageIds: [p19Media._id.toString()], isActive: true, attributes: { 'السعة': '500ml' }, brand: 'Generic' });

      const p20Img = await downloadImage('https://images.unsplash.com/photo-1627931868350-25662a8c54c3?w=600', 'racket.jpg');
      const p20Media = await mediaService.create({ filename: 'racket.jpg', originalname: 'racket.jpg', path: 'uploads/racket.jpg', mimetype: 'image/jpeg', size: 1024, buffer: Buffer.from([]), stream: null as any, destination: '', fieldname: 'file', encoding: '7bit' }, { entityType: EntityType.PRODUCT });
      await safeCreateProduct({ name: 'مضرب تنس', sku: 'RACKET-PRO', price: 2500, quantity: 15, description: 'خفيف الوزن.', categoryId: catSport._id.toString(), imageIds: [p20Media._id.toString()], isActive: true, attributes: { 'الماركة': 'Wilson' }, brand: 'Wilson' });

      console.log('✅ Arabic Content seeded successfully (5 Categories, 20 Products)');
    }

    // ==========================================
    // Transfer Methods & Fee Rules
    // ==========================================
    const { seedTransferData } = await import('./modules/transfer/transfer-seed.js');
    await seedTransferData(app);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }

  await app.close();
  console.log('🏁 Seed process finished');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

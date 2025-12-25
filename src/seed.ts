import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

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
    console.log('✅ Admin user created:');
    console.log('   Email: admin@store.com');
    console.log('   Password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  await app.close();
  console.log('🌱 Seed completed');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

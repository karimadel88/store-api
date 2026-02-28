import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { FeeRulesService } from './fee-rules.service.js';

export async function seedTransferData(app?: any): Promise<void> {
  let localApp = app;
  let shouldClose = false;

  if (!localApp) {
    localApp = await NestFactory.createApplicationContext(AppModule);
    shouldClose = true;
  }

  try {
    const methodsService = localApp.get(TransferMethodsService);
    const feeRulesService = localApp.get(FeeRulesService);

    console.log('💱 Seeding Transfer Methods and Fee Rules...');

    // ─── Transfer Methods ─────────────────────────────────

    const methods = [
      { name: 'Vodafone Cash', code: 'VODAFONE_CASH', category: 'wallet', sortOrder: 1 },
      { name: 'InstaPay', code: 'INSTAPAY', category: 'bank', sortOrder: 2 },
      { name: 'Bank Transfer', code: 'BANK_TRANSFER', category: 'bank', sortOrder: 3 },
      { name: 'Fawry', code: 'FAWRY', category: 'wallet', sortOrder: 4 },
      { name: 'Orange Cash', code: 'ORANGE_CASH', category: 'wallet', sortOrder: 5 },
      { name: 'Etisalat Cash', code: 'ETISALAT_CASH', category: 'wallet', sortOrder: 6 },
    ];

    const createdMethods: Record<string, any> = {};

    for (const method of methods) {
      const existing = await methodsService.findByCode(method.code);
      if (existing) {
        createdMethods[method.code] = existing;
        console.log(`  ℹ️  Transfer method "${method.name}" already exists`);
      } else {
        const created = await methodsService.create(method);
        createdMethods[method.code] = created;
        console.log(`  ✅ Created transfer method: ${method.name} (${method.code})`);
      }
    }

    // ─── Fee Rules ────────────────────────────────────────

    const feeRules = [
      {
        from: 'VODAFONE_CASH',
        to: 'INSTAPAY',
        feeType: 'PERCENT' as const,
        feeValue: 1.5,
        minFee: 5,
        maxFee: 100,
        priority: 10,
      },
      {
        from: 'VODAFONE_CASH',
        to: 'BANK_TRANSFER',
        feeType: 'FIXED' as const,
        feeValue: 25,
        priority: 10,
      },
      {
        from: 'INSTAPAY',
        to: 'VODAFONE_CASH',
        feeType: 'PERCENT' as const,
        feeValue: 2.0,
        minFee: 10,
        maxFee: 150,
        priority: 10,
      },
      {
        from: 'FAWRY',
        to: 'INSTAPAY',
        feeType: 'PERCENT' as const,
        feeValue: 2.5,
        minFee: 10,
        maxFee: 200,
        priority: 10,
      },
      {
        from: 'VODAFONE_CASH',
        to: 'ORANGE_CASH',
        feeType: 'FIXED' as const,
        feeValue: 10,
        priority: 5,
      },
      {
        from: 'ORANGE_CASH',
        to: 'VODAFONE_CASH',
        feeType: 'FIXED' as const,
        feeValue: 10,
        priority: 5,
      },
      {
        from: 'INSTAPAY',
        to: 'BANK_TRANSFER',
        feeType: 'PERCENT' as const,
        feeValue: 1.0,
        minFee: 5,
        maxFee: 50,
        priority: 10,
      },
      {
        from: 'ETISALAT_CASH',
        to: 'VODAFONE_CASH',
        feeType: 'FIXED' as const,
        feeValue: 15,
        priority: 5,
      },
    ];

    // Check if any fee rules exist (simple check)
    const existingRules = await feeRulesService.findAll();
    if (existingRules.length > 0) {
      console.log(`  ℹ️  Fee rules already exist (${existingRules.length} rules), skipping`);
    } else {
      for (const rule of feeRules) {
        const fromMethod = createdMethods[rule.from];
        const toMethod = createdMethods[rule.to];

        if (fromMethod && toMethod) {
          await feeRulesService.create({
            fromMethodId: fromMethod._id.toString(),
            toMethodId: toMethod._id.toString(),
            feeType: rule.feeType,
            feeValue: rule.feeValue,
            minFee: rule.minFee,
            maxFee: rule.maxFee,
            priority: rule.priority,
          });
          console.log(`  ✅ Created fee rule: ${rule.from} → ${rule.to} (${rule.feeType} ${rule.feeValue})`);
        }
      }
    }

    console.log('✅ Transfer data seeded successfully');
  } catch (error) {
    console.error('❌ Transfer seed failed:', error);
    throw error;
  }

  if (shouldClose) {
    await localApp.close();
  }
}

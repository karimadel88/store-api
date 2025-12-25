import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactStoreController } from './contact-store.controller';
import { Contact, ContactSchema } from './schemas/contact.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }])],
  controllers: [ContactController, ContactStoreController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}

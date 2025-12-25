import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactStoreController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createDto: CreateContactDto) {
    return this.contactService.create(createDto);
  }
}

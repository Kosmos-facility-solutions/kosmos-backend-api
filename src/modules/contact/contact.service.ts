import { Logger } from '@core/logger/Logger';
import { Injectable } from '@nestjs/common';
import { MailingService } from '@modules/email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly mailingService: MailingService) {}

  async submitContactMessage(dto: CreateContactMessageDto) {
    await this.mailingService.sendContactFormMessage(dto);
    this.logger.log(`Contact form submitted by ${dto.email}`);
    return {
      message: 'Your inquiry has been received. We will get back to you soon.',
    };
  }
}

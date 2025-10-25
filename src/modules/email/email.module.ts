import { RoleModule } from '@modules/role/role.module';
import { Global, Module } from '@nestjs/common';
import { EmailHttpService } from './email-http.service';
import { MailingService } from './email.service';

@Global()
@Module({
  imports: [RoleModule],
  providers: [MailingService, EmailHttpService],
  exports: [MailingService],
})
export class EmailModule {}

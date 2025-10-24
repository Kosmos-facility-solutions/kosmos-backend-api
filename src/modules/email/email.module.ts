import { RoleModule } from '@modules/role/role.module';
import { Global, Module } from '@nestjs/common';
import { MailingService } from './email.service';

@Global()
@Module({
  imports: [RoleModule],
  providers: [MailingService],
  exports: [MailingService],
})
export class EmailModule {}

import { ContractModule } from '@modules/contract/contract.module';
import { ContactModule } from '@modules/contact/contact.module';
import { EmailModule } from '@modules/email/email.module';
import { PropertyModule } from '@modules/property/property.module';
import { ServiceModule } from '@modules/service/service.module';
import { ServiceReportModule } from '@modules/serviceReport/serviceReport.module';
import { ServiceRequestModule } from '@modules/serviceRequest/serviceRequest.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { ServiceVisitModule } from '@modules/serviceVisit/serviceVisit.module';
import { ProductModule } from '@modules/product/product.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    EmailModule,
    UserModule,
    AuthModule,
    PropertyModule,
    ServiceModule,
    ServiceRequestModule,
    ServiceReportModule,
    ContractModule,
    PaymentModule,
    ServiceVisitModule,
    ProductModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

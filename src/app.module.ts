import { EmailModule } from '@modules/email/email.module';
import { PropertyModule } from '@modules/property/property.module';
import { ServiceModule } from '@modules/service/service.module';
import { ServiceReportModule } from '@modules/serviceReport/serviceReport.module';
import { ServiceRequestModule } from '@modules/serviceRequest/servicerequest.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    UserModule,
    AuthModule,
    PropertyModule,
    ServiceModule,
    ServiceRequestModule,
    ServiceReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

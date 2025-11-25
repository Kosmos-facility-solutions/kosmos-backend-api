import { IsRoleGuard } from '@modules/auth/guards/isRole.guard';
import { IsSelfUserGuard } from '@modules/auth/guards/isSelfUser.guard';
import { EmailModule } from '@modules/email/email.module'; // ← AGREGAR
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractPdfController } from './contract-pdf.controller'; // ← AGREGAR
import { ContractDocService } from './contract-doc.service';
import { ContractPdfService } from './contract-pdf.service'; // ← AGREGAR
import { ContractController } from './contract.controller';
import { ContractRepository } from './contract.repository';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [SequelizeModule.forFeature([Contract]), EmailModule],
  controllers: [ContractController, ContractPdfController],
  providers: [
    ContractService,
    ContractPdfService,
    ContractDocService,
    ContractRepository,
    IsRoleGuard,
    IsSelfUserGuard,
  ],
  exports: [ContractService, ContractRepository],
})
export class ContractModule {}

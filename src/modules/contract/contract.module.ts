import { IsRoleGuard } from '@modules/auth/guards/isRole.guard';
import { IsSelfUserGuard } from '@modules/auth/guards/isSelfUser.guard';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractController } from './contract.controller';
import { ContractRepository } from './contract.repository';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [SequelizeModule.forFeature([Contract])],
  controllers: [ContractController],
  providers: [
    ContractService,
    ContractRepository,
    IsRoleGuard,
    IsSelfUserGuard,
  ],
  exports: [ContractService, ContractRepository],
})
export class ContractModule {}

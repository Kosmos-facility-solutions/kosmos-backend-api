import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ContractDocService } from './contract-doc.service';
import { ContractPdfService } from './contract-pdf.service';
import { ContractService } from './contract.service';

@ApiTags('contract-pdf')
@Controller('contracts')
export class ContractPdfController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractPdfService: ContractPdfService,
    private readonly contractDocService: ContractDocService,
  ) {}

  @Get(':id/pdf/download')
  @ValidateJWT()
  //@IsOwnerOrIsRole([ROLES.ADMIN, ROLES.SUPERADMIN], 'clientId')
  @ApiOperation({
    summary: 'Download contract PDF',
    description: 'Generates and downloads the contract as a PDF file',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async downloadContractPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const contract = await this.findContractWithRelations(id);

      if (!contract) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Contract not found',
        });
        return;
      }

      const pdfBuffer =
        await this.contractPdfService.generateContractPdf(contract);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Contract_${contract.contractNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating PDF',
        error: error,
      });
    }
  }

  @Get(':id/pdf/view')
  @ValidateJWT()
  //@IsOwnerOrIsRole([ROLES.ADMIN, ROLES.SUPERADMIN], 'clientId')
  @ApiOperation({
    summary: 'View contract PDF',
    description: 'Generates and displays the contract PDF in browser',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async viewContractPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const contract = await this.findContractWithRelations(id);

      if (!contract) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Contract not found',
        });
        return;
      }

      const pdfBuffer =
        await this.contractPdfService.generateContractPdf(contract);

      console.log(pdfBuffer);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Contract_${contract.contractNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating PDF',
        error: error,
      });
    }
  }

  @Post(':id/pdf/email')
  @ValidateJWT()
  //@IsRole([ROLES.ADMIN, ROLES.SUPERADMIN])
  @ApiOperation({
    summary: 'Email contract PDF',
    description: 'Generates contract PDF and sends it to the client via email',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async emailContractPdf(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; success: boolean }> {
    try {
      await this.contractService.sendContractEmailWithPdf(id);

      return {
        message: 'Contract PDF sent successfully',
        success: true,
      };
    } catch (error) {
      console.error('Error sending contract PDF:', error);
      throw error;
    }
  }

  @Get(':id/doc/download')
  @ValidateJWT()
  @ApiOperation({
    summary: 'Download editable contract document',
    description: 'Generates an editable DOCX document for the contract',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async downloadContractDoc(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const contract = await this.findContractWithRelations(id);

      if (!contract) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Contract not found',
        });
        return;
      }

      const docBuffer =
        await this.contractDocService.generateEditableContract(contract);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Contract_${contract.contractNumber}.docx"`,
        'Content-Length': docBuffer.length,
      });

      res.send(docBuffer);
    } catch (error) {
      console.error('Error generating contract DOC:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating document',
        error: error,
      });
    }
  }

  @Get(':id/doc/view')
  @ValidateJWT()
  @ApiOperation({
    summary: 'View editable contract document',
    description: 'Streams the editable DOCX document for in-browser download',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async viewContractDoc(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const contract = await this.findContractWithRelations(id);

      if (!contract) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Contract not found',
        });
        return;
      }

      const docBuffer =
        await this.contractDocService.generateEditableContract(contract);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename="Contract_${contract.contractNumber}.docx"`,
        'Content-Length': docBuffer.length,
      });

      res.send(docBuffer);
    } catch (error) {
      console.error('Error streaming contract DOC:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating document',
        error: error,
      });
    }
  }

  @Post(':id/doc/email')
  @ValidateJWT()
  @ApiOperation({
    summary: 'Email editable contract document',
    description:
      'Generates the editable DOCX document and emails it to the client',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  async emailContractDoc(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; success: boolean }> {
    try {
      await this.contractService.sendContractEmailWithDoc(id);

      return {
        message: 'Contract document sent successfully',
        success: true,
      };
    } catch (error) {
      console.error('Error sending contract DOC:', error);
      throw error;
    }
  }

  private async findContractWithRelations(id: number) {
    return this.contractService['contractRepository'].findOneById(id, [
      { association: 'client' },
      { association: 'property' },
      {
        association: 'serviceRequest',
        include: [{ association: 'service' }],
      },
    ]);
  }
}

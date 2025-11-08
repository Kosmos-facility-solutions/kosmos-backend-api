import { Property } from '@modules/property/entities/property.entity';
import { User } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import { Contract } from './entities/contract.entity';

@Injectable()
export class ContractPdfService {
  async generateContractPdf(contract: Contract): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc);

        // Contract Title
        this.addContractTitle(doc, contract);

        // Parties Section
        this.addPartiesSection(doc, contract);

        // Recitals (WHEREAS clauses)
        this.addRecitals(doc, contract);

        // Agreement Section
        this.addAgreementSection(doc);

        // Article 1: Services
        this.addServicesArticle(doc, contract);

        // Article 2: Term
        this.addTermArticle(doc, contract);

        // Article 3: Compensation
        this.addCompensationArticle(doc, contract);

        // Article 4: Schedule
        this.addScheduleArticle(doc, contract);

        // Article 5: Terms and Conditions
        this.addTermsArticle(doc, contract);

        // Signature Section
        this.addSignatureSection(doc, contract);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument) {
    const primaryColor = '#1a56db';

    // Company letterhead
    doc
      .fontSize(20)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('KOSMOS FACILITY SOLUTIONS', 72, 50, { align: 'center' });

    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .font('Helvetica')
      .text('123 Main Street, Providence, RI 02903', 72, 75, {
        align: 'center',
      })
      .text(
        'Phone: (401) 555-0100 | Email: contracts@kosmosfacility.com',
        72,
        88,
        { align: 'center' },
      )
      .text('License: RI-CLS-12345 | Insurance: INS-789456', 72, 101, {
        align: 'center',
      });

    // Horizontal line
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(72, 120)
      .lineTo(doc.page.width - 72, 120)
      .stroke();

    doc.moveDown(3);
  }

  private addContractTitle(doc: PDFKit.PDFDocument, contract: Contract) {
    const startY = 140;

    doc
      .fontSize(16)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('SERVICE AGREEMENT', 72, startY, { align: 'left' });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(`Contract No. ${contract.contractNumber}`, 72, doc.y, {
        align: 'left',
      })
      .text(
        `Contract creation Date: ${format(contract.createdAt, 'MMMM dd, yyyy')}`,
        72,
        doc.y + 6,
        {
          align: 'left',
        },
      );

    doc.moveDown(2);
  }

  private addPartiesSection(doc: PDFKit.PDFDocument, contract: Contract) {
    const client = contract.client as User;
    const property = contract.property as Property;

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('PARTIES TO THIS AGREEMENT', 72, doc.y);

    doc.moveDown(1);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        'This Service Agreement (the "Agreement") is entered into as of ',
        72,
        doc.y,
        { continued: true },
      )
      .font('Helvetica-Bold')
      .text(format(new Date(contract.startDate), 'MMMM dd, yyyy'), {
        continued: true,
      })
      .font('Helvetica')
      .text(' by and between:');

    doc.moveDown(1);

    // Provider
    doc.font('Helvetica-Bold').text('SERVICE PROVIDER:', 72, doc.y);

    doc.moveDown(0.3);

    doc
      .font('Helvetica')
      .text(
        'Kosmos Facility Solutions, a facility management company organized under the laws of Rhode Island, with its principal place of business at 123 Main Street, Providence, RI 02903 (hereinafter referred to as "Provider" or "Company").',
        72,
        doc.y,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1);

    // Client
    doc.font('Helvetica-Bold').text('CLIENT:', 72, doc.y);

    doc.moveDown(0.3);

    const clientName =
      `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client';
    const clientEmail = client?.email || 'N/A';
    const clientPhone = client?.phone || 'N/A';
    const propertyAddress = property?.address || 'N/A';

    doc
      .font('Helvetica')
      .text(
        `${clientName}, located at ${propertyAddress} (hereinafter referred to as "Client"). Contact information: Email: ${clientEmail}, Phone: ${clientPhone}.`,
        72,
        doc.y,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1);

    doc
      .font('Helvetica')
      .text(
        'Provider and Client are collectively referred to as the "Parties" and individually as a "Party."',
        72,
        doc.y,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1.5);
  }

  private addRecitals(doc: PDFKit.PDFDocument, contract: Contract) {
    const service = contract.serviceRequest?.service;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('RECITALS', 72, doc.y);

    doc.moveDown(1);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('WHEREAS, ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Provider is engaged in the business of providing professional facility management and cleaning services;',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    doc
      .font('Helvetica-Bold')
      .text('WHEREAS, ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        `Client desires to engage Provider to perform ${service?.name || 'facility services'} at the premises located at ${contract.property?.address || 'the specified location'};`,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    doc
      .font('Helvetica-Bold')
      .text('WHEREAS, ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Provider has the necessary expertise, equipment, and personnel to provide such services in a professional and timely manner;',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    doc
      .font('Helvetica-Bold')
      .text('NOW, THEREFORE, ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1.5);
  }

  private addAgreementSection(doc: PDFKit.PDFDocument) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('AGREEMENT', 72, doc.y, { align: 'center' });

    doc.moveDown(1.5);
  }

  private addServicesArticle(doc: PDFKit.PDFDocument, contract: Contract) {
    const service = contract.serviceRequest?.service;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('ARTICLE 1: SCOPE OF SERVICES', 72, doc.y);

    doc.moveDown(0.8);

    // Section 1.1
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('1.1 Services to be Provided. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        `Provider agrees to provide Client with ${service?.name || 'facility services'} (the "Services") at the premises described herein. `,
        {
          width: doc.page.width - 144,
          align: 'justify',
          continued: true,
        },
      );

    if (service?.description) {
      doc.text(`The Services shall include: ${service.description}`, {
        width: doc.page.width - 144,
        align: 'justify',
      });
    }

    doc.moveDown(0.8);

    // Section 1.2 - Features
    if (service?.features && service.features.length > 0) {
      doc
        .font('Helvetica-Bold')
        .text('1.2 Service Features. ', 72, doc.y, { continued: true })
        .font('Helvetica')
        .text('The Services shall include the following features:', {
          width: doc.page.width - 144,
          align: 'justify',
        });

      doc.moveDown(0.5);

      service.features.forEach((feature: string, index: number) => {
        doc
          .font('Helvetica')
          .text(`(${String.fromCharCode(97 + index)}) ${feature}`, 90, doc.y, {
            width: doc.page.width - 162,
            align: 'justify',
          });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.5);
    }

    // Section 1.3 - Requirements
    if (service?.requirements && service.requirements.length > 0) {
      if (doc.y > 650) {
        doc.addPage();
      }

      doc
        .font('Helvetica-Bold')
        .text('1.3 Client Obligations. ', 72, doc.y, { continued: true })
        .font('Helvetica')
        .text('Client shall provide and ensure:', {
          width: doc.page.width - 144,
          align: 'justify',
        });

      doc.moveDown(0.5);

      service.requirements.forEach((req: string, index: number) => {
        doc
          .font('Helvetica')
          .text(`(${String.fromCharCode(97 + index)}) ${req}`, 90, doc.y, {
            width: doc.page.width - 162,
            align: 'justify',
          });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.5);
    }

    // Section 1.4 - Scope
    if (
      contract.scope &&
      contract.scope.trim() !== '' &&
      contract.scope !== 'string'
    ) {
      if (doc.y > 650) {
        doc.addPage();
      }

      doc
        .font('Helvetica-Bold')
        .text('1.4 Specific Scope. ', 72, doc.y, { continued: true })
        .font('Helvetica')
        .text(
          `For this particular engagement, the scope of work shall specifically include: ${contract.scope}`,
          {
            width: doc.page.width - 144,
            align: 'justify',
          },
        );

      doc.moveDown(0.8);
    }

    doc.moveDown(1);
  }

  private addTermArticle(doc: PDFKit.PDFDocument, contract: Contract) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('ARTICLE 2: TERM AND TERMINATION', 72, doc.y);

    doc.moveDown(0.8);

    // Section 2.1
    const startDate = format(new Date(contract.startDate), 'MMMM dd, yyyy');
    const endDate = contract.endDate
      ? format(new Date(contract.endDate), 'MMMM dd, yyyy')
      : 'ongoing until terminated';

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('2.1 Term. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        `This Agreement shall commence on ${startDate} and shall continue until ${endDate}, unless earlier terminated in accordance with the provisions herein (the "Term").`,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // Section 2.2
    doc
      .font('Helvetica-Bold')
      .text('2.2 Termination. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Either Party may terminate this Agreement upon thirty (30) days written notice to the other Party. Client shall remain liable for payment of all Services rendered through the effective date of termination.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1);
  }

  private addCompensationArticle(doc: PDFKit.PDFDocument, contract: Contract) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('ARTICLE 3: COMPENSATION AND PAYMENT', 72, doc.y);

    doc.moveDown(0.8);

    // Section 3.1
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('3.1 Service Fee. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        `Client agrees to pay Provider the sum of $${contract.paymentAmount} (${this.numberToWords(contract.paymentAmount)} dollars) ${this.formatPaymentFrequency(contract.paymentFrequency).toLowerCase()} for the Services rendered under this Agreement.`,
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // Section 3.2
    const paymentDue = contract.nextPaymentDue
      ? format(new Date(contract.nextPaymentDue), 'MMMM dd, yyyy')
      : 'within thirty (30) days of invoice date';

    doc
      .font('Helvetica-Bold')
      .text('3.2 Payment Terms. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(`Payment shall be due ${paymentDue}. All payments shall be made `, {
        width: doc.page.width - 144,
        align: 'justify',
        continued: true,
      });

    if (contract.paymentMethod) {
      doc.text(`via ${contract.paymentMethod}. `, { continued: true });
    }

    doc.text(
      'Invoices not paid within thirty (30) days of the due date shall accrue interest at the rate of one and one-half percent (1.5%) per month.',
      {
        width: doc.page.width - 144,
        align: 'justify',
      },
    );

    doc.moveDown(0.8);

    // Section 3.3
    doc
      .font('Helvetica-Bold')
      .text('3.3 Late Payment. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Provider reserves the right to suspend Services if payment becomes more than fifteen (15) days overdue, without prejudice to any other remedies available at law or equity.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(1);
  }

  private addScheduleArticle(doc: PDFKit.PDFDocument, contract: Contract) {
    if (
      !contract.serviceFrequency &&
      !contract.workDays &&
      !contract.workStartTime
    ) {
      return;
    }

    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('ARTICLE 4: SERVICE SCHEDULE', 72, doc.y);

    doc.moveDown(0.8);

    let scheduleText = '4.1 Schedule. Provider shall perform the Services ';

    if (contract.serviceFrequency) {
      scheduleText += `on a ${this.formatServiceFrequency(contract.serviceFrequency).toLowerCase()} basis`;
    }

    if (contract.workDays && contract.workDays.length > 0) {
      const formattedDays = contract.workDays
        .map((day) => this.capitalizeFirst(day))
        .join(', ');
      scheduleText += `, specifically on ${formattedDays}`;
    }

    if (contract.workStartTime && contract.workEndTime) {
      scheduleText += `, between the hours of ${this.formatTime(contract.workStartTime)} and ${this.formatTime(contract.workEndTime)}`;
    } else if (contract.workStartTime) {
      scheduleText += `, commencing at ${this.formatTime(contract.workStartTime)}`;
    }

    scheduleText += '. ';

    if (contract.estimatedDurationMinutes) {
      const hours = Math.floor(contract.estimatedDurationMinutes / 60);
      const minutes = contract.estimatedDurationMinutes % 60;

      if (hours > 0 && minutes > 0) {
        scheduleText += `Each service visit shall take approximately ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minutes. `;
      } else if (hours > 0) {
        scheduleText += `Each service visit shall take approximately ${hours} hour${hours > 1 ? 's' : ''}. `;
      } else {
        scheduleText += `Each service visit shall take approximately ${minutes} minutes. `;
      }
    }

    scheduleText +=
      'The Parties may mutually agree to modify this schedule with reasonable advance notice.';

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(scheduleText, {
        width: doc.page.width - 144,
        align: 'justify',
      });

    doc.moveDown(1);
  }

  private addTermsArticle(doc: PDFKit.PDFDocument, contract: Contract) {
    if (doc.y > 600) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('ARTICLE 5: GENERAL PROVISIONS', 72, doc.y);

    doc.moveDown(0.8);

    // 5.1 Insurance
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('5.1 Insurance. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        "Provider maintains comprehensive general liability insurance and workers' compensation insurance as required by law. Provider shall be responsible for any damages caused by its employees or agents during the performance of Services.",
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.2 Quality Standards
    doc
      .font('Helvetica-Bold')
      .text('5.2 Quality Standards. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Provider guarantees that all Services will be performed in accordance with industry standards and applicable regulations. Client must report any concerns regarding service quality within twenty-four (24) hours of service completion.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.3 Cancellation
    doc
      .font('Helvetica-Bold')
      .text('5.3 Cancellation Policy. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Client may cancel scheduled service with at least twenty-four (24) hours advance notice without penalty. Cancellations made with less than twenty-four (24) hours notice may be subject to a cancellation fee equal to fifty percent (50%) of the scheduled service fee.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.4 Confidentiality
    doc
      .font('Helvetica-Bold')
      .text('5.4 Confidentiality. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        "Provider acknowledges that it may have access to Client's confidential information and agrees to maintain the confidentiality of such information both during and after the Term of this Agreement.",
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.5 Independent Contractor
    doc
      .font('Helvetica-Bold')
      .text('5.5 Independent Contractor. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'Provider is an independent contractor and not an employee of Client. Nothing in this Agreement shall be construed to create a partnership, joint venture, or agency relationship between the Parties.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.6 Governing Law
    doc
      .font('Helvetica-Bold')
      .text('5.6 Governing Law. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'This Agreement shall be governed by and construed in accordance with the laws of the State of Rhode Island, without regard to its conflict of laws principles.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // 5.7 Entire Agreement
    doc
      .font('Helvetica-Bold')
      .text('5.7 Entire Agreement. ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, or agreements, whether written or oral. This Agreement may only be amended by a written instrument signed by both Parties.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(0.8);

    // Additional Notes
    if (contract.notes) {
      if (doc.y > 650) {
        doc.addPage();
      }

      doc
        .font('Helvetica-Bold')
        .text('5.8 Additional Terms. ', 72, doc.y, { continued: true })
        .font('Helvetica')
        .text(contract.notes, {
          width: doc.page.width - 144,
          align: 'justify',
        });

      doc.moveDown(0.8);
    }

    doc.moveDown(1);
  }

  private addSignatureSection(doc: PDFKit.PDFDocument, contract: Contract) {
    if (doc.y > 600) {
      doc.addPage();
    }

    doc.moveDown(2);

    doc
      .fontSize(10)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('IN WITNESS WHEREOF, ', 72, doc.y, { continued: true })
      .font('Helvetica')
      .text(
        'the Parties have executed this Agreement as of the date first written above.',
        {
          width: doc.page.width - 144,
          align: 'justify',
        },
      );

    doc.moveDown(2);

    const signatureY = doc.y;
    const client = contract.client as User;
    const clientName =
      `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client';

    // Provider Signature Block
    doc.font('Helvetica-Bold').text('PROVIDER:', 72, signatureY);

    doc
      .font('Helvetica')
      .text('Kosmos Facility Solutions', 72, signatureY + 15);

    doc.moveDown(2);
    const providerLineY = doc.y;
    doc.moveTo(72, providerLineY).lineTo(272, providerLineY).stroke();

    doc.fontSize(9).text('Authorized Signature', 72, providerLineY + 5);

    doc.text(
      `Date: ${format(new Date(), 'MM/dd/yyyy')}`,
      72,
      providerLineY + 20,
    );

    // Client Signature Block
    doc.fontSize(10).font('Helvetica-Bold').text('CLIENT:', 320, signatureY);

    doc.font('Helvetica').text(clientName, 320, signatureY + 15);

    doc.moveTo(320, providerLineY).lineTo(520, providerLineY).stroke();

    doc.fontSize(9).text('Signature', 320, providerLineY + 5);

    doc.text('Date: _____________________', 320, providerLineY + 20);

    doc.moveDown(3);
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const bottomMargin = 50;

    doc
      .fontSize(7)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(
        `Contract ${format(new Date(), 'MM/dd/yyyy HH:mm:ss')} | © ${new Date().getFullYear()} Kosmos Facility Solutions | Page 1 of 1`,
        72,
        doc.page.height - bottomMargin,
        {
          align: 'center',
          width: doc.page.width - 144,
        },
      );
  }

  // Helper Methods
  private formatPaymentFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      one_time: 'One-Time Payment',
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return frequencyMap[frequency] || frequency;
  }

  private formatServiceFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      one_time: 'One-Time Service',
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return frequencyMap[frequency] || frequency;
  }

  private formatTime(time: string): string {
    if (!time) return '';

    const parts = time.split(':');
    if (parts.length < 2) return time;

    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes} ${ampm}`;
  }

  private capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      office_cleaning: 'Office Cleaning',
      deep_cleaning: 'Deep Cleaning',
      floor_care: 'Floor Care',
      window_cleaning: 'Window Cleaning',
      carpet_care: 'Carpet Care',
      sanitization: 'Sanitization',
      power_washing: 'Power Washing',
      special_event_prep: 'Special Event Prep',
    };
    return categoryMap[category] || category;
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      draft: 'Draft',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  }

  private numberToWords(num: number): string {
    // Simple implementation for contract amounts
    const ones = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
    ];
    const tens = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];
    const teens = [
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];

    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        ' hundred' +
        (num % 100 ? ' ' + this.numberToWords(num % 100) : '')
      );
    return num.toString();
  }
}

import { Property } from '@modules/property/entities/property.entity';
import { User } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { Contract } from './entities/contract.entity';

const PRIMARY_COLOR = '1a56db';
const TEXT_MUTED = '4b5563';
const TEXT_DARK = '1f2937';

type ParagraphAlignment = (typeof AlignmentType)[keyof typeof AlignmentType];

@Injectable()
export class ContractDocService {
  async generateEditableContract(contract: Contract): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5"
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            ...this.buildHeaderSection(),
            ...this.buildContractTitleSection(contract),
            ...this.buildPartiesSection(contract),
            ...this.buildRecitalsSection(contract),
            this.sectionDivider('AGREEMENT'),
            ...this.buildServicesArticle(contract),
            ...this.buildTermArticle(contract),
            ...this.buildCompensationArticle(contract),
            ...this.buildScheduleArticle(contract),
            ...this.buildTermsArticle(contract),
            ...this.buildSignatureSection(contract),
            this.buildFooter(),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private buildHeaderSection(): Paragraph[] {
    return [
      this.createParagraph('KOSMOS FACILITY SOLUTIONS', {
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 32,
        color: PRIMARY_COLOR,
        spacingBefore: 160,
        spacingAfter: 80,
      }),
      this.createParagraph('123 Main Street, Providence, RI 02903', {
        alignment: AlignmentType.CENTER,
        size: 18,
        color: TEXT_MUTED,
        spacingBefore: 0,
        spacingAfter: 40,
      }),
      this.createParagraph(
        'Phone: (401) 555-0100 | Email: contracts@kosmosfacility.com',
        {
          alignment: AlignmentType.CENTER,
          size: 18,
          color: TEXT_MUTED,
          spacingBefore: 0,
          spacingAfter: 40,
        },
      ),
      this.createParagraph('License: RI-CLS-12345 | Insurance: INS-789456', {
        alignment: AlignmentType.CENTER,
        size: 18,
        color: TEXT_MUTED,
        spacingBefore: 0,
        spacingAfter: 120,
      }),
      this.createRuleParagraph(),
    ];
  }

  private buildContractTitleSection(contract: Contract): Paragraph[] {
    return [
      this.createParagraph('SERVICE AGREEMENT', {
        bold: true,
        size: 28,
        spacingBefore: 200,
        spacingAfter: 80,
      }),
      this.createParagraph(`Contract No. ${contract.contractNumber}`, {
        size: 20,
        color: TEXT_MUTED,
        spacingBefore: 0,
        spacingAfter: 40,
      }),
      this.createParagraph(
        `Contract creation Date: ${this.formatDate(contract.createdAt)}`,
        {
          size: 20,
          color: TEXT_MUTED,
          spacingBefore: 0,
          spacingAfter: 160,
        },
      ),
    ];
  }

  private buildPartiesSection(contract: Contract): Paragraph[] {
    const client = contract.client as User;
    const property = contract.property as Property;
    const clientName =
      `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client';
    const propertyAddress = property?.address || 'N/A';

    return [
      this.sectionHeading('PARTIES TO THIS AGREEMENT'),
      this.createParagraph(
        `This Service Agreement (the "Agreement") is entered into as of ${this.formatDate(
          contract.startDate,
        )} by and between:`,
        { spacingAfter: 160 },
      ),
      this.createLabelParagraph(
        'SERVICE PROVIDER:',
        'Kosmos Facility Solutions, a facility management company organized under the laws of Rhode Island, with its principal place of business at 123 Main Street, Providence, RI 02903 (hereinafter referred to as "Provider" or "Company").',
      ),
      this.createLabelParagraph(
        'CLIENT:',
        `${clientName}, located at ${propertyAddress} (hereinafter referred to as "Client"). Contact information: Email: ${
          client?.email || 'N/A'
        }, Phone: ${client?.phone || 'N/A'}.`,
      ),
      this.createParagraph(
        'Provider and Client are collectively referred to as the "Parties" and individually as a "Party."',
        { spacingAfter: 200 },
      ),
    ];
  }

  private buildRecitalsSection(contract: Contract): Paragraph[] {
    const service = contract.serviceRequest?.service;
    const propertyAddress = (contract.property as Property)?.address || '';

    return [
      this.sectionHeading('RECITALS'),
      this.createRecitalParagraph(
        'WHEREAS,',
        'Provider is engaged in the business of providing professional facility management and cleaning services;',
      ),
      this.createRecitalParagraph(
        'WHEREAS,',
        `Client desires to engage Provider to perform ${
          service?.name || 'facility services'
        } at the premises located at ${propertyAddress || 'the specified location'};`,
      ),
      this.createRecitalParagraph(
        'WHEREAS,',
        'Provider has the necessary expertise, equipment, and personnel to provide such services in a professional and timely manner;',
      ),
      this.createRecitalParagraph(
        'NOW, THEREFORE,',
        'in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:',
      ),
    ];
  }

  private buildServicesArticle(contract: Contract): Paragraph[] {
    const service = contract.serviceRequest?.service;
    const scope =
      contract.scope && contract.scope !== 'string'
        ? contract.scope
        : undefined;

    const paragraphs: Paragraph[] = [
      this.sectionHeading('ARTICLE 1: SCOPE OF SERVICES'),
      this.createArticleParagraph(
        '1.1 Services to be Provided.',
        `Provider agrees to provide Client with ${
          service?.name || 'facility services'
        } (the "Services") at the premises described herein.${
          service?.description
            ? ` The Services shall include: ${service.description}`
            : ''
        }`,
      ),
    ];

    if (service?.features?.length) {
      paragraphs.push(
        this.createArticleParagraph(
          '1.2 Service Features.',
          'The Services shall include the following features:',
        ),
      );
      service.features.forEach((feature, index) => {
        paragraphs.push(
          this.createIndentedParagraph(
            `(${String.fromCharCode(97 + index)}) ${feature}`,
          ),
        );
      });
    }

    if (service?.requirements?.length) {
      paragraphs.push(
        this.createArticleParagraph(
          '1.3 Client Obligations.',
          'Client shall provide and ensure:',
        ),
      );
      service.requirements.forEach((req, index) => {
        paragraphs.push(
          this.createIndentedParagraph(
            `(${String.fromCharCode(97 + index)}) ${req}`,
          ),
        );
      });
    }

    if (scope) {
      paragraphs.push(
        this.createArticleParagraph(
          '1.4 Specific Scope.',
          `For this particular engagement, the scope of work shall specifically include: ${scope}`,
        ),
      );
    }

    return paragraphs;
  }

  private buildTermArticle(contract: Contract): Paragraph[] {
    const startDate = this.formatDate(contract.startDate);
    const endDate = contract.endDate
      ? this.formatDate(contract.endDate)
      : 'ongoing until terminated';

    return [
      this.sectionHeading('ARTICLE 2: TERM AND TERMINATION'),
      this.createArticleParagraph(
        '2.1 Term.',
        `This Agreement shall commence on ${startDate} and shall continue until ${endDate}, unless earlier terminated in accordance with the provisions herein (the "Term").`,
      ),
      this.createArticleParagraph(
        '2.2 Termination.',
        'Either Party may terminate this Agreement upon thirty (30) days written notice to the other Party. Client shall remain liable for payment of all Services rendered through the effective date of termination.',
      ),
    ];
  }

  private buildCompensationArticle(contract: Contract): Paragraph[] {
    const amount = Number(contract.paymentAmount || 0).toFixed(2);
    const amountWords = this.numberToWords(Number(contract.paymentAmount) || 0);
    const paymentDue = contract.nextPaymentDue
      ? this.formatDate(contract.nextPaymentDue)
      : 'within thirty (30) days of invoice date';

    const paragraphs: Paragraph[] = [
      this.sectionHeading('ARTICLE 3: COMPENSATION AND PAYMENT'),
      this.createArticleParagraph(
        '3.1 Service Fee.',
        `Client agrees to pay Provider the sum of $${amount} (${amountWords} dollars) ${this.formatPaymentFrequency(
          contract.paymentFrequency,
        ).toLowerCase()} for the Services rendered under this Agreement.`,
      ),
    ];

    let paymentTerms = `Payment shall be due ${paymentDue}. All payments shall be made `;
    if (contract.paymentMethod) {
      paymentTerms += `via ${contract.paymentMethod}. `;
    }
    paymentTerms +=
      'Invoices not paid within thirty (30) days of the due date shall accrue interest at the rate of one and one-half percent (1.5%) per month.';

    paragraphs.push(
      this.createArticleParagraph('3.2 Payment Terms.', paymentTerms),
    );

    paragraphs.push(
      this.createArticleParagraph(
        '3.3 Late Payment.',
        'Provider reserves the right to suspend Services if payment becomes more than fifteen (15) days overdue, without prejudice to any other remedies available at law or equity.',
      ),
    );

    return paragraphs;
  }

  private buildScheduleArticle(contract: Contract): Paragraph[] {
    if (
      !contract.serviceFrequency &&
      !contract.workDays?.length &&
      !contract.workStartTime
    ) {
      return [];
    }

    const scheduleParts: string[] = [];
    scheduleParts.push('Provider shall perform the Services ');

    if (contract.serviceFrequency) {
      scheduleParts.push(
        `on a ${this.formatServiceFrequency(
          contract.serviceFrequency,
        ).toLowerCase()} basis`,
      );
    }

    if (contract.workDays?.length) {
      const formattedDays = contract.workDays
        .map((day) => this.capitalizeFirst(day))
        .join(', ');
      scheduleParts.push(`, specifically on ${formattedDays}`);
    }

    if (contract.workStartTime && contract.workEndTime) {
      scheduleParts.push(
        `, between the hours of ${this.formatTime(
          contract.workStartTime,
        )} and ${this.formatTime(contract.workEndTime)}`,
      );
    } else if (contract.workStartTime) {
      scheduleParts.push(
        `, commencing at ${this.formatTime(contract.workStartTime)}`,
      );
    }

    scheduleParts.push('. ');

    if (contract.estimatedDurationMinutes) {
      const hours = Math.floor(contract.estimatedDurationMinutes / 60);
      const minutes = contract.estimatedDurationMinutes % 60;
      if (hours && minutes) {
        scheduleParts.push(
          `Each service visit shall take approximately ${hours} hour${
            hours > 1 ? 's' : ''
          } and ${minutes} minutes. `,
        );
      } else if (hours) {
        scheduleParts.push(
          `Each service visit shall take approximately ${hours} hour${
            hours > 1 ? 's' : ''
          }. `,
        );
      } else {
        scheduleParts.push(
          `Each service visit shall take approximately ${minutes} minutes. `,
        );
      }
    }

    scheduleParts.push(
      'The Parties may mutually agree to modify this schedule with reasonable advance notice.',
    );

    return [
      this.sectionHeading('ARTICLE 4: SERVICE SCHEDULE'),
      this.createArticleParagraph('4.1 Schedule.', scheduleParts.join('')),
    ];
  }

  private buildTermsArticle(contract: Contract): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.sectionHeading('ARTICLE 5: GENERAL PROVISIONS'),
      this.createArticleParagraph(
        '5.1 Insurance.',
        "Provider maintains comprehensive general liability insurance and workers' compensation insurance as required by law. Provider shall be responsible for any damages caused by its employees or agents during the performance of Services.",
      ),
      this.createArticleParagraph(
        '5.2 Quality Standards.',
        'Provider guarantees that all Services will be performed in accordance with industry standards and applicable regulations. Client must report any concerns regarding service quality within twenty-four (24) hours of service completion.',
      ),
      this.createArticleParagraph(
        '5.3 Cancellation Policy.',
        'Client may cancel scheduled service with at least twenty-four (24) hours advance notice without penalty. Cancellations made with less than twenty-four (24) hours notice may be subject to a cancellation fee equal to fifty percent (50%) of the scheduled service fee.',
      ),
      this.createArticleParagraph(
        '5.4 Confidentiality.',
        "Provider acknowledges that it may have access to Client's confidential information and agrees to maintain the confidentiality of such information both during and after the Term of this Agreement.",
      ),
      this.createArticleParagraph(
        '5.5 Independent Contractor.',
        'Provider is an independent contractor and not an employee of Client. Nothing in this Agreement shall be construed to create a partnership, joint venture, or agency relationship between the Parties.',
      ),
      this.createArticleParagraph(
        '5.6 Governing Law.',
        'This Agreement shall be governed by and construed in accordance with the laws of the State of Rhode Island, without regard to its conflict of laws principles.',
      ),
      this.createArticleParagraph(
        '5.7 Entire Agreement.',
        'This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, or agreements, whether written or oral. This Agreement may only be amended by a written instrument signed by both Parties.',
      ),
    ];

    if (contract.notes) {
      paragraphs.push(
        this.createArticleParagraph('5.8 Additional Terms.', contract.notes),
      );
    }

    return paragraphs;
  }

  private buildSignatureSection(contract: Contract): (Paragraph | Table)[] {
    const client = contract.client as User;
    const clientName =
      `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client';
    const today = format(new Date(), 'MMMM dd, yyyy');

    return [
      this.createParagraph(
        'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.',
        {
          bold: true,
          spacingBefore: 240,
          spacingAfter: 160,
        },
      ),
      this.buildSignatureTable(clientName, today),
    ];
  }

  private buildFooter(): Paragraph {
    return this.createParagraph(
      `Contract generated ${format(
        new Date(),
        'MM/dd/yyyy HH:mm:ss',
      )} | © ${new Date().getFullYear()} Kosmos Facility Solutions`,
      {
        alignment: AlignmentType.CENTER,
        color: TEXT_MUTED,
        size: 16,
        spacingBefore: 300,
        spacingAfter: 0,
      },
    );
  }

  private buildSignatureTable(clientName: string, today: string): Table {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            this.signatureLabelCell('PROVIDER:', 'Kosmos Facility Solutions'),
            this.signatureLabelCell('CLIENT:', clientName),
          ],
        }),
        new TableRow({
          children: [this.signatureLineCell(), this.signatureLineCell()],
        }),
        new TableRow({
          children: [
            this.signatureMetaCell('Authorized Signature'),
            this.signatureMetaCell('Signature'),
          ],
        }),
        new TableRow({
          children: [
            this.signatureMetaCell(`Date: ${today}`),
            this.signatureMetaCell('Date: _____________________'),
          ],
        }),
      ],
    });
  }

  private signatureLabelCell(label: string, value: string): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: label + ' ',
              bold: true,
              font: 'Helvetica',
              color: TEXT_DARK,
            }),
            new TextRun({
              text: value,
              font: 'Helvetica',
              color: TEXT_DARK,
            }),
          ],
        }),
      ],
    });
  }

  private signatureLineCell(): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          border: {
            bottom: {
              color: TEXT_DARK,
              size: 6,
              space: 2,
              style: BorderStyle.SINGLE,
            },
          },
          spacing: { after: 200 },
        }),
      ],
    });
  }

  private signatureMetaCell(text: string): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Helvetica',
              size: 18,
              color: TEXT_DARK,
            }),
          ],
        }),
      ],
    });
  }

  private createRuleParagraph(): Paragraph {
    return new Paragraph({
      border: {
        bottom: {
          color: PRIMARY_COLOR,
          size: 12,
          space: 2,
          style: BorderStyle.SINGLE,
        },
      },
    });
  }

  private sectionHeading(text: string): Paragraph {
    return this.createParagraph(text, {
      bold: true,
      spacingBefore: 200,
      spacingAfter: 80,
      size: 26,
    });
  }

  private sectionDivider(text: string): Paragraph {
    return this.createParagraph(text, {
      alignment: AlignmentType.CENTER,
      bold: true,
      spacingBefore: 200,
      spacingAfter: 200,
      size: 26,
    });
  }

  private createLabelParagraph(label: string, value: string): Paragraph {
    return new Paragraph({
      spacing: { before: 80, after: 80 },
      children: [
        new TextRun({
          text: `${label} `,
          bold: true,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
        new TextRun({
          text: value,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
      ],
    });
  }

  private createRecitalParagraph(prefix: string, text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 80, after: 80 },
      children: [
        new TextRun({
          text: `${prefix} `,
          bold: true,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
        new TextRun({
          text,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
      ],
    });
  }

  private createArticleParagraph(label: string, text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 80, after: 80 },
      children: [
        new TextRun({
          text: `${label} `,
          bold: true,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
        new TextRun({
          text,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
      ],
    });
  }

  private createIndentedParagraph(text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 720 },
      children: [
        new TextRun({
          text,
          font: 'Helvetica',
          color: TEXT_DARK,
          size: 22,
        }),
      ],
    });
  }

  private createParagraph(
    text: string,
    options?: {
      alignment?: ParagraphAlignment;
      bold?: boolean;
      size?: number;
      color?: string;
      spacingBefore?: number;
      spacingAfter?: number;
    },
  ): Paragraph {
    return new Paragraph({
      alignment: options?.alignment ?? AlignmentType.LEFT,
      spacing: {
        before: options?.spacingBefore ?? 120,
        after: options?.spacingAfter ?? 120,
      },
      children: [
        new TextRun({
          text,
          font: 'Helvetica',
          size: options?.size ?? 22,
          color: options?.color ?? TEXT_DARK,
          bold: options?.bold ?? false,
        }),
      ],
    });
  }

  private formatDate(date?: string | Date | null): string {
    if (!date) {
      return 'N/A';
    }
    return format(new Date(date), 'MMMM dd, yyyy');
  }

  private formatPaymentFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      one_time: 'One-Time Payment',
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return frequencyMap[frequency] || frequency || 'One-Time Payment';
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
    return frequencyMap[frequency] || frequency || 'One-Time Service';
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

  private capitalizeFirst(value?: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  private numberToWords(num: number): string {
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

    if (!num) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
      );
    if (num < 1000) {
      return (
        ones[Math.floor(num / 100)] +
        ' hundred' +
        (num % 100 ? ' ' + this.numberToWords(num % 100) : '')
      );
    }
    return num.toString();
  }
}

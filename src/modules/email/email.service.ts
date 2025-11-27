// src/modules/email/email.service.ts
import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { Plain } from '@libraries/baseModel.entity';
import { Payment } from '@modules/payment/entities/payment.entity';
import { ROLES } from '@modules/role/enums/roles.enum';
import { RoleRepository } from '@modules/role/role.repository';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { User } from '@modules/user/entities/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { UserRole } from '@modules/userrole/entities/userrole.entity';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import ejs from 'ejs';
import path from 'path';
import { EmailHttpService } from './email-http.service';

@Injectable()
export class MailingService {
  private logger: Logger = new Logger(MailingService.name);

  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private emailHttpService: EmailHttpService,
  ) {}

  private async send(
    email: string,
    subject: string,
    html: string,
  ): Promise<any> {
    return await this.emailHttpService.send(email, subject, html);
  }

  private compileTemplate(context: any): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, './templates/template.ejs'),
        context,
        (err, str) => {
          if (err) return reject(err);
          return resolve(str);
        },
      );
    });
  }

  async sendEmail(
    email: string,
    subject: string,
    page: string,
    context?: any,
  ): Promise<any> {
    try {
      if (context == null) context = {};
      context.page = page;
      const html = await this.compileTemplate(context);

      this.logger.info(`Sending ${page} email to: ${email}`);
      await this.send(email, subject, html);
      return;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async sendConfirmationEmail(user: Plain<User>, token: string) {
    await this.sendEmail(
      user.email,
      'Email confirmation',
      'email_confirmation',
      {
        path:
          config.urls.baseFrontEndURL + '/v1/auth/email/confirmation/' + token,
        name: user.firstName,
      },
    );
  }

  async sendResetPasswordTokenEmail(user: Plain<User>, token: string) {
    await this.sendEmail(user.email, 'Password reset', 'email_reset_password', {
      name: user.firstName,
      url: `${config.urls.baseFrontEndURL}/change-password?token=${token}`,
    });
  }

  /**
   * Send service request confirmation email to customer
   */
  async sendServiceRequestCustomerEmail(
    serviceRequest: ServiceRequest & {
      user?: User;
      service?: any;
      property?: any;
    },
  ) {
    const scheduledFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );
    const walkthroughFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      scheduledDate: scheduledFormattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      walkthroughTime: serviceRequest.walkthroughTime,
      walkthroughDate: walkthroughFormattedDate,
      estimatedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      notes: serviceRequest.notes,
    };

    await this.sendEmail(
      serviceRequest.user?.email || '',
      'Service Request Received - Kosmos Facility Solutions',
      'service_request_customer',
      context,
    );
  }

  /**
   * Send service request notification email to admins
   */
  private async getAdminEmails(): Promise<string[]> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: ROLES.ADMIN },
    });

    const admins = await this.userRepository.findAll({
      include: [
        {
          model: UserRole,
          where: { roleId: adminRole.id },
          required: true,
        },
      ],
    });

    return admins.map((user) => user.email);
  }

  async sendServiceRequestAdminEmail(
    serviceRequest: ServiceRequest & {
      user?: User;
      service?: any;
      property?: any;
    },
  ) {
    const scheduledFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );
    const walkthroughFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName:
        `${serviceRequest.user?.firstName || ''} ${serviceRequest.user?.lastName || ''}`.trim(),
      customerEmail: serviceRequest.user?.email || 'N/A',
      customerPhone: serviceRequest.user?.phone || 'N/A',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      propertyAddress: serviceRequest.property?.address || 'N/A',
      scheduledDate: scheduledFormattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      walkthroughDate: walkthroughFormattedDate,
      walkthroughTime: serviceRequest.scheduledTime,
      estimatedDuration: serviceRequest.estimatedDurationMinutes || 60,
      estimatedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      status: serviceRequest.status,
      priority: serviceRequest.priority,
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      notes: serviceRequest.notes,
      specialInstructions: serviceRequest.specialInstructions,
      adminPanelUrl: `${config.urls.baseFrontEndURL}/admin/service-requests/${serviceRequest.id}`,
    };

    const adminEmails = await this.getAdminEmails();

    for (const email of adminEmails) {
      await this.sendEmail(
        email,
        `New Service Request #${serviceRequest.id} - Action Required`,
        'service_request_admin',
        context,
      );
    }
  }

  /**
   * Send service approved email to NEW customer (with account creation)
   */
  async sendServiceApprovedNewCustomerEmail(
    serviceRequest: ServiceRequest & {
      user?: User;
      service?: any;
      property?: any;
    },
    temporaryPassword: string,
  ) {
    const scheduledFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );
    const walkthroughFormattedDate = format(
      new Date(serviceRequest.walkthroughDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      customerEmail: serviceRequest.user?.email || '',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      scheduledDate: scheduledFormattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      walkthroughDate: walkthroughFormattedDate,
      walkthroughTime: serviceRequest.walkthroughTime,
      confirmedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      temporaryPassword: temporaryPassword,
      loginUrl: `${config.urls.baseFrontEndURL}/login`,
    };

    await this.sendEmail(
      serviceRequest.user?.email || '',
      'Service Approved - Welcome to Kosmos!',
      'service_approved_new_customer',
      context,
    );
  }

  /**
   * Send service approved email to EXISTING customer (no account creation)
   */
  async sendServiceApprovedExistingCustomerEmail(
    serviceRequest: ServiceRequest & {
      user?: User;
      service?: any;
      property?: any;
    },
    assignedStaff?: string,
  ) {
    const scheduledFormattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );
    const walkthroughFormattedDate = format(
      new Date(serviceRequest.walkthroughDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      propertyAddress: serviceRequest.property?.address || 'N/A',
      scheduledDate: scheduledFormattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      walkthroughDate: walkthroughFormattedDate,
      walkthroughTime: serviceRequest.walkthroughTime,
      estimatedDuration: serviceRequest.estimatedDurationMinutes || 60,
      confirmedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      specialInstructions: serviceRequest.specialInstructions,
      assignedStaff: assignedStaff || null,
      dashboardUrl: `${config.urls.baseFrontEndURL}/dashboard`,
      calendarUrl: `${config.urls.baseFrontEndURL}/calendar`,
    };

    await this.sendEmail(
      serviceRequest.user?.email || '',
      'Service Request Approved - Confirmed!',
      'service_approved_existing_customer',
      context,
    );
  }

  async sendContactFormMessage(contactMessage: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    const adminEmails = await this.getAdminEmails();
    const context = {
      name: contactMessage.name,
      email: contactMessage.email,
      phone: contactMessage.phone,
      subject: contactMessage.subject,
      message: contactMessage.message,
    };

    for (const email of adminEmails) {
      await this.sendEmail(
        email,
        `New inquiry from ${contactMessage.name}`,
        'contact_form_message',
        context,
      );
    }
  }

  /**
   * Envía email de contrato aprobado con PDF adjunto
   */
  async sendContractApprovedEmail(
    to: string,
    data: {
      clientName: string;
      contractNumber: string;
      serviceName: string;
      startDate: string;
      endDate?: string;
      paymentAmount: string;
      paymentFrequency: string;
      nextPaymentDue?: string;
      propertyName: string;
      propertyAddress: string;
      dashboardUrl: string;
    },
    attachment?: {
      buffer: Buffer;
      filename: string;
      contentType: string;
    },
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        'contract_approved_with_pdf.ejs',
      );

      const html = await ejs.renderFile(templatePath, data);

      if (attachment) {
        await this.emailHttpService.sendWithAttachment(
          to,
          `✅ Your Contract is Ready - ${data.contractNumber}`,
          html,
          [
            {
              filename: attachment.filename,
              content: attachment.buffer,
              contentType: attachment.contentType,
            },
          ],
        );
      } else {
        await this.emailHttpService.send(
          to,
          `✅ Your Contract is Ready - ${data.contractNumber}`,
          html,
        );
      }

      this.logger.info(`Contract email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error('Error sending contract email:', error);
      throw new Error('Failed to send contract email');
    }
  }

  /**
   * Send welcome email to new employee with temporary credentials
   */
  async sendEmployeeWelcomeEmail(
    employee: User,
    temporaryPassword: string,
  ): Promise<void> {
    const context = {
      firstName: employee.firstName || 'Team Member',
      lastName: employee.lastName || '',
      email: employee.email,
      temporaryPassword: temporaryPassword,
      loginUrl: config.urls.baseFrontEndURL || 'https://app.kosmosfs.com',
    };

    await this.sendEmail(
      employee.email,
      'Welcome to Kosmos Facility Solutions - Your Employee Account',
      'employee_welcome',
      context,
    );

    this.logger.info(`Employee welcome email sent to: ${employee.email}`);
  }

  async sendPaymentLinkEmail(payment: Payment) {
    if (!payment?.user?.email) {
      this.logger.warn('Payment link email skipped: missing user email');
      return;
    }

    const context = {
      customerName: payment.user.firstName || 'Customer',
      amount: Number(payment.amount || 0).toFixed(2),
      currency: payment.currency || 'USD',
      description: payment.description || 'Pending service payment with Kosmos',
      paymentUrl:
        payment.paymentUrl || config.paymentGateway?.checkoutUrl || '',
      reference: payment.reference,
      propertyName:
        payment.serviceRequest?.property?.name ||
        payment.contract?.property?.name ||
        'Property',
      serviceName:
        payment.serviceRequest?.service?.name ||
        payment.contract?.serviceRequest?.service?.name ||
        'Service',
      dueDate: payment.contract?.nextPaymentDue
        ? format(new Date(payment.contract.nextPaymentDue), 'MMMM dd, yyyy')
        : null,
      dashboardUrl: `${config.urls.baseFrontEndURL}/dashboard`,
    };

    await this.sendEmail(
      payment.user.email,
      'Complete Your Kosmos Payment',
      'payment_link',
      context,
    );
  }

  async sendPaymentReceiptEmail(payment: Payment) {
    if (!payment?.user?.email) {
      this.logger.warn('Payment receipt email skipped: missing user email');
      return;
    }

    const paidDate = payment.paidAt
      ? format(new Date(payment.paidAt), 'MMMM dd, yyyy')
      : format(new Date(), 'MMMM dd, yyyy');

    const context = {
      customerName: payment.user.firstName || 'Customer',
      amount: Number(payment.amount || 0).toFixed(2),
      currency: payment.currency || 'USD',
      reference: payment.reference,
      receiptUrl: payment.receiptUrl,
      paidAt: paidDate,
      description:
        payment.description ||
        'Payment registered with Kosmos Facility Solutions',
      serviceName:
        payment.serviceRequest?.service?.name ||
        payment.contract?.serviceRequest?.service?.name ||
        'Service',
      propertyName:
        payment.serviceRequest?.property?.name ||
        payment.contract?.property?.name ||
        'Property',
      propertyAddress:
        payment.serviceRequest?.property?.address ||
        payment.contract?.property?.address ||
        'N/A',
      dashboardUrl: `${config.urls.baseFrontEndURL}/dashboard`,
    };

    await this.sendEmail(
      payment.user.email,
      'Payment Received - Kosmos Facility Solutions',
      'payment_receipt',
      context,
    );
  }

  async sendPaymentFailedEmail(payment: Payment, reason?: string) {
    if (!payment?.user?.email) {
      this.logger.warn('Payment failure email skipped: missing user email');
      return;
    }

    const context = {
      customerName: payment.user.firstName || 'Customer',
      amount: Number(payment.amount || 0).toFixed(2),
      currency: payment.currency || 'USD',
      reference: payment.reference,
      description:
        payment.description || 'Payment for upcoming service with Kosmos',
      failureReason:
        reason ||
        payment.failureReason ||
        'The payment was declined by the processor.',
      retryUrl: payment.paymentUrl || config.paymentGateway?.checkoutUrl || '',
      supportEmail: config.adminEmail,
    };

    await this.sendEmail(
      payment.user.email,
      'Payment Could Not Be Processed',
      'payment_failed',
      context,
    );
  }
}

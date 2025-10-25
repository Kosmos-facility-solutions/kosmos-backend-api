// src/modules/email/email.service.ts
import { config } from '@config/index';
import { Logger } from '@core/logger/Logger';
import { Plain } from '@libraries/baseModel.entity';
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
        path: config.urls.base + '/v1/auth/email/confirmation/' + token,
        name: user.firstName,
      },
    );
  }

  async sendResetPasswordTokenEmail(user: Plain<User>, token: string) {
    await this.sendEmail(user.email, 'Password reset', 'email_reset_password', {
      name: user.firstName,
      token: token,
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
    const formattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      scheduledDate: formattedDate,
      scheduledTime: serviceRequest.scheduledTime,
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
    const formattedDate = format(
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
      scheduledDate: formattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      estimatedDuration: serviceRequest.estimatedDurationMinutes || 60,
      estimatedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      status: serviceRequest.status,
      priority: serviceRequest.priority,
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      notes: serviceRequest.notes,
      specialInstructions: serviceRequest.specialInstructions,
      adminPanelUrl: `${config.urls.base}/admin/service-requests/${serviceRequest.id}`,
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
    const formattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      customerEmail: serviceRequest.user?.email || '',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      scheduledDate: formattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      confirmedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      temporaryPassword: temporaryPassword,
      loginUrl: `${config.urls.base}/login`,
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
    const formattedDate = format(
      new Date(serviceRequest.scheduledDate),
      'MMMM dd, yyyy',
    );

    const context = {
      customerName: serviceRequest.user?.firstName || 'Customer',
      requestId: serviceRequest.id,
      serviceName: serviceRequest.service?.name || 'Service',
      propertyName: serviceRequest.property?.name || 'Property',
      propertyAddress: serviceRequest.property?.address || 'N/A',
      scheduledDate: formattedDate,
      scheduledTime: serviceRequest.scheduledTime,
      estimatedDuration: serviceRequest.estimatedDurationMinutes || 60,
      confirmedPrice: Number(serviceRequest.estimatedPrice || 0).toFixed(2),
      isRecurring: serviceRequest.isRecurring,
      recurrenceFrequency: serviceRequest.recurrenceFrequency,
      specialInstructions: serviceRequest.specialInstructions,
      assignedStaff: assignedStaff || null,
      dashboardUrl: `${config.urls.base}/dashboard`,
      calendarUrl: `${config.urls.base}/calendar`,
    };

    await this.sendEmail(
      serviceRequest.user?.email || '',
      'Service Request Approved - Confirmed!',
      'service_approved_existing_customer',
      context,
    );
  }
}

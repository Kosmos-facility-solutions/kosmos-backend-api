// src/modules/email/email-http.service.ts
import { config } from '@config/index';
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailHttpService {
  private readonly logger = new Logger(EmailHttpService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(config.email.auth.pass);
    this.logger.log('✅ Resend HTTP service initialized');
  }

  async send(to: string | string[], subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: config.email.from_address,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(`Resend error: ${JSON.stringify(error)}`);
      }

      this.logger.log(`✅ Email sent: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  async sendBatch(
    emails: Array<{ to: string; subject: string; html: string }>,
  ) {
    try {
      const { data, error } = await this.resend.batch.send(
        emails.map((email) => ({
          from: config.email.from_address,
          to: [email.to],
          subject: email.subject,
          html: email.html,
        })),
      );

      if (error) {
        throw new Error(`Resend batch error: ${JSON.stringify(error)}`);
      }

      this.logger.log(`✅ Batch emails sent: ${data?.length || 0} emails`);
      return data;
    } catch (error) {
      this.logger.error('❌ Failed to send batch emails:', error);
      throw error;
    }
  }
}

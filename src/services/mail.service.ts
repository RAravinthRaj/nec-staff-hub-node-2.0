/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import logger from '../utils/logger';
import { config } from '../config/config';

export interface SendOTPParams {
  email: string;
  userName: string;
  otp: string;
}

export interface IMailService {
  sendOTP(args: SendOTPParams): Promise<any>;
}

export interface SendAttachmentMailParams {
  email: string;
  subject: string;
  html: string;
  attachments: nodemailer.SendMailOptions['attachments'];
}

export class MailService implements IMailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.smtpUserName,
        pass: config.smtpPassword,
      },
    });
  }

  public static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  private compileTemplate(templateName: string, variables: any): string {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(source);
    return compiled(variables);
  }

  public async sendOTP(args: SendOTPParams) {
    const { email, userName, otp } = args;
    logger.info(`OTP Email Sent to ${email} - ${otp}`);

    try {
      const html = this.compileTemplate('otp-template', { userName, OTP: otp });
      const result = await this.transporter.sendMail({
        from: `NEC Staff Hub <${config.smtpUserName}>`,
        to: email,
        subject: 'OTP Verification Code',
        html,
        attachments: [
          {
            filename: 'logo.png',
            path: path.join(__dirname, '..', 'templates', 'assets', 'logo.png'),
            cid: 'logo',
          },
        ],
      });

      logger.info(`OTP Email Sent to ${email} - ${otp}`);
      return result;
    } catch (err) {
      logger.error('Error in sendOTP:', err);
      throw err;
    }
  }

  public async sendAttachmentMail(args: SendAttachmentMailParams) {
    const { email, subject, html, attachments } = args;

    try {
      const result = await this.transporter.sendMail({
        from: `NEC Staff Hub <${config.smtpUserName}>`,
        to: email,
        subject,
        html,
        attachments,
      });

      logger.info(`Attachment email sent to ${email} - ${subject}`);
      return result;
    } catch (err) {
      logger.error('Error in sendAttachmentMail:', err);
      throw err;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private readonly fromEmail = 'no-reply@jekana.com'; // TODO: Config in env for prod

    constructor(private configService: ConfigService) {
        this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    }

    private getTemplate(templateName: string): string {
        const templatePath = path.join(process.cwd(), 'public', 'emails', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf8');
    }

    async sendVerificationEmail(to: string, otp: string): Promise<boolean> {
        try {
            let html = this.getTemplate('otp-verification');
            html = html.replace('{{OTP_CODE}}', otp);

            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: 'Your Shomwe verification code',
                html: html,
            });

            if (error) {
                this.logger.error(`Failed to send email to ${to}: ${error.message}`);
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${to}`, error);
            return false;
        }
    }

    async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
        try {
            let html = this.getTemplate('welcome');
            const ctaLink = `https://shomwe.com/dashboard/agent`; // TODO: Make dynamic or from config

            html = html.replace('{{first_name}}', firstName);
            html = html.replace('{{cta_link}}', ctaLink);

            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: 'Welcome to Showmwe 🎉',
                html: html,
            });

            if (error) {
                this.logger.error(`Failed to send email to ${to}: ${error.message}`);
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${to}`, error);
            return false;
        }
    }
}

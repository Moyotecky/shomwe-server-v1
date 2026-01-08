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
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            this.logger.error('RESEND_API_KEY is not defined in the configuration!');
        } else {
            this.logger.log(`EmailService initialized with API Key: ${apiKey.substring(0, 4)}...`);
        }
        this.resend = new Resend(apiKey);
    }

    private getTemplate(templateName: string): string {
        const templatePath = path.join(process.cwd(), 'public', 'emails', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf8');
    }

    async sendVerificationEmail(to: string, otp: string): Promise<boolean> {
        const html = this.getTemplate('otp-verification').replace('{{OTP_CODE}}', otp);
        return this.sendWithRetry(to, 'Your Shomwe verification code', html);
    }

    async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
        const html = this.getTemplate('welcome')
            .replace('{{first_name}}', firstName)
            .replace('{{cta_link}}', 'https://shomwe.com/dashboard/agent');

        return this.sendWithRetry(to, 'Welcome to Showmwe 🎉', html);
    }

    async sendAgentWelcomeEmail(to: string, firstName: string): Promise<boolean> {
        const html = this.getTemplate('welcome-agent')
            .replace('{{first_name}}', firstName)
            .replace('{{cta_link}}', 'https://shomwe.com/dashboard/agent');

        return this.sendWithRetry(to, 'You are now a Shomwe Agent! 🚀', html);
    }

    private async sendWithRetry(to: string, subject: string, html: string, retries = 3): Promise<boolean> {
        for (let i = 0; i < retries; i++) {
            try {
                const { error } = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: [to],
                    subject,
                    html,
                });

                if (error) {
                    this.logger.warn(`Attempt ${i + 1} failed for ${to}: ${error.message}`);
                    if (i === retries - 1) return false;
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i))); // 1s, 2s, 4s
                    continue;
                }
                return true;
            } catch (err) {
                this.logger.warn(`Attempt ${i + 1} exception for ${to}: ${err.message}`);
                if (i === retries - 1) {
                    this.logger.error(`Final failure sending email to ${to}`, err);
                    return false;
                }
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
            }
        }
        return false;
    }
}

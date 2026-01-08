import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../shared/email/email.service';
import * as crypto from 'crypto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }

    async sendOtp(sendOtpDto: SendOtpDto) {
        const { email, phoneNumber } = sendOtpDto;

        if (!email && !phoneNumber) {
            throw new BadRequestException('Email or Phone Number is required');
        }

        // 1. Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 2. Find or Create User
        // TODO: Handle phone number search in UsersService
        let user;
        if (email) {
            user = await this.usersService.findByEmail(email);
        } else {
            // We need to implement findByPhone in UsersService
            // For now assuming findByEmail works or stubbing it (UserSchema matches sparse unique)
            // We will query directly.
            // Actually, verify what UsersService exposes.
            // Let's assume we update UsersService.
            user = await (this.usersService as any).findByPhone(phoneNumber); // Need to implement
        }

        if (!user) {
            // Create pending user
            try {
                user = await this.usersService.create({ email, phoneNumber } as any);
            } catch (e) {
                // Handle race condition
                if (email) user = await this.usersService.findByEmail(email);
                else user = await (this.usersService as any).findByPhone(phoneNumber);
            }
        }

        // 3. Save OTP to user
        if (user) {
            await this.usersService.updateOtp((user as any)._id, otp, otpExpires);
        }

        // 4. Send Email / SMS
        if (email) {
            await this.emailService.sendVerificationEmail(email, otp);
        } else {
            // TODO: Integrate SMS Service
            console.log(`[SMS MOCK] Sending OTP ${otp} to ${phoneNumber}`);
        }

        return { message: 'OTP sent successfully' };
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email, phoneNumber, otp } = verifyOtpDto;

        let userWithOtp;
        if (email) {
            userWithOtp = await this.usersService.findWithOtp(email); // This searches by email
        } else if (phoneNumber) {
            userWithOtp = await this.usersService.findByPhone(phoneNumber); // searches by phone, includes OTP
        }

        if (!userWithOtp || userWithOtp.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        if (userWithOtp.otpExpires && userWithOtp.otpExpires < new Date()) {
            throw new UnauthorizedException('OTP expired');
        }

        // Clear OTP
        await this.usersService.updateOtp((userWithOtp as any)._id, null, null);

        return this.generateTokens(userWithOtp);
    }

    async completeProfile(userId: string, data: CompleteProfileDto) {
        const user = await this.usersService.updateProfile(userId, {
            ...data,
            dob: new Date(data.dob),
        });

        // Send Welcome Email
        if (user.email && user.firstName) {
            await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        }

        return user;
    }

    private generateTokens(user: any) {
        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isProfileComplete: !!(user.firstName && user.lastName),
            }
        };
    }
}

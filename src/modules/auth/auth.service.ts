import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../shared/email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }

    async sendOtp(email: string) {
        // 1. Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 2. Find or Create User
        let user = await this.usersService.findByEmail(email);
        if (!user) {
            // Create pending user
            try {
                user = await this.usersService.create({ email } as any);
            } catch (e) {
                // Handle race condition
                user = await this.usersService.findByEmail(email);
            }
        }

        // 3. Save OTP to user
        if (user) {
            await this.usersService.updateOtp((user as any)._id, otp, otpExpires);
        }

        // 4. Send Email
        await this.emailService.sendVerificationEmail(email, otp);

        return { message: 'OTP sent successfully' };
    }

    async verifyOtp(email: string, otp: string) {
        const userWithOtp = await this.usersService.findWithOtp(email);

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

    async completeProfile(userId: string, data: { firstName: string; lastName: string; dob: string }) {
        const user = await this.usersService.updateProfile(userId, {
            ...data,
            dob: new Date(data.dob),
        });
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

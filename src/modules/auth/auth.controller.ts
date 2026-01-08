import { Controller, Post, Body, UseGuards, Request, Put, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('send-otp')
    async sendOtp(@Body('email') email: string) {
        return this.authService.sendOtp(email);
    }

    @Post('verify-otp')
    async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
        return this.authService.verifyOtp(email, otp);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async completeProfile(@Request() req, @Body() body: { firstName: string; lastName: string; dob: string }) {
        return this.authService.completeProfile(req.user.userId, body);
    }
}

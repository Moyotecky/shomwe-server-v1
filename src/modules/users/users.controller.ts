import { Controller, Get, Put, Post, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OnboardingStep1Dto } from './dto/onboarding/step1-personal.dto';
import { OnboardingStep2Dto } from './dto/onboarding/step2-type.dto';
import { OnboardingStep3Dto } from './dto/onboarding/step3-location.dto';
import { OnboardingStep4Dto } from './dto/onboarding/step4-payouts.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@CurrentUser() user: any) {
        return this.usersService.findById(user.userId);
    }

    // --- Agent Onboarding Steps ---

    @Put('onboarding/step-1') // Personal Info
    @UseGuards(AuthGuard('jwt'))
    updateStep1(@CurrentUser() user: any, @Body() body: OnboardingStep1Dto) {
        return this.usersService.updateOnboardingStep1(user.userId, body);
    }

    @Put('onboarding/step-2') // Agent Type
    @UseGuards(AuthGuard('jwt'))
    updateStep2(@CurrentUser() user: any, @Body() body: OnboardingStep2Dto) {
        return this.usersService.updateOnboardingStep2(user.userId, body);
    }

    @Put('onboarding/step-3') // Location
    @UseGuards(AuthGuard('jwt'))
    updateStep3(@CurrentUser() user: any, @Body() body: OnboardingStep3Dto) {
        return this.usersService.updateOnboardingStep3(user.userId, body);
    }

    @Put('onboarding/step-4') // Payouts
    @UseGuards(AuthGuard('jwt'))
    updateStep4(@CurrentUser() user: any, @Body() body: OnboardingStep4Dto) {
        return this.usersService.updateOnboardingStep4(user.userId, body);
    }

    @Post('onboarding/step-5') // Identity Document
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file')) // Expects form-data field 'file'
    updateStep5(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('docType') docType: string
    ) {
        if (!docType) throw new BadRequestException('Document type (docType) is required');
        return this.usersService.updateOnboardingStep5(user.userId, file, docType);
    }

    @Post('onboarding/step-6') // Selfie & Finalize
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file')) // Expects form-data field 'file'
    updateStep6(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.usersService.updateOnboardingStep6(user.userId, file);
    }
}

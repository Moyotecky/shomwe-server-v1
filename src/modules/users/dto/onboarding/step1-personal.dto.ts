import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class OnboardingStep1Dto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsPhoneNumber() // Validates phone number format
    phoneNumber?: string;
}

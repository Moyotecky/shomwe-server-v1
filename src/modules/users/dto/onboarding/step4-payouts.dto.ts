import { IsString, IsNotEmpty } from 'class-validator';

export class OnboardingStep4Dto {
    @IsString()
    @IsNotEmpty()
    bankName: string;

    @IsString()
    @IsNotEmpty()
    accountNumber: string;

    @IsString()
    @IsNotEmpty()
    accountName: string;
}

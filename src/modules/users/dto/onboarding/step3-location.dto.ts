import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OnboardingStep3Dto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    neighborhood?: string;
}

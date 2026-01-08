
import { IsEmail, IsOptional, IsString, IsNotEmpty, ValidateIf, Length } from 'class-validator';

export class VerifyOtpDto {
    @ValidateIf((o) => !o.phoneNumber)
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ValidateIf((o) => !o.email)
    @IsString()
    @IsNotEmpty()
    phoneNumber?: string;

    @IsString()
    @Length(6, 6)
    otp: string;
}

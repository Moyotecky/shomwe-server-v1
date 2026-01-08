
import { IsEmail, IsOptional, IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class SendOtpDto {
    @ValidateIf((o) => !o.phoneNumber)
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ValidateIf((o) => !o.email)
    @IsString()
    @IsNotEmpty()
    phoneNumber?: string;
}

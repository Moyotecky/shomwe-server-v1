
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CompleteProfileDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsDateString()
    dob: string;
}

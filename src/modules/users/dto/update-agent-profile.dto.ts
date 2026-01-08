
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AgentType {
    INDIVIDUAL = 'individual',
    AGENT = 'agent',
    COMPANY = 'company',
}

export class AgentOperatingAreaDto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    neighborhood?: string;
}

export class BankDetailsDto {
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

export class UpdateAgentProfileDto {
    @IsEnum(AgentType)
    @IsOptional()
    type?: AgentType;

    @ValidateNested()
    @Type(() => AgentOperatingAreaDto)
    @IsOptional()
    operatingArea?: AgentOperatingAreaDto;

    @ValidateNested()
    @Type(() => BankDetailsDto)
    @IsOptional()
    bankDetails?: BankDetailsDto;
}

import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum AgentType {
    INDIVIDUAL = 'Individual Property Owner',
    AGENT = 'Real Estate Agent',
    COMPANY = 'Property Manager / Company',
}

export class OnboardingStep2Dto {
    @IsEnum(AgentType)
    @IsNotEmpty()
    type: AgentType;
}

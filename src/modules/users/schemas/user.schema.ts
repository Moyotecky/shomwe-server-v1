
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../core/database/base.schema';
import { UserRole } from '../../../shared/enums/user-role.enum';

@Schema({ timestamps: true })
export class User extends BaseSchema {
    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    dob?: Date;

    @Prop({ unique: true })
    email: string;

    @Prop({ select: false })
    otp?: string;

    @Prop({ select: false })
    otpExpires?: Date;

    @Prop({ select: false }) // Don't return password by default
    password?: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.GUEST })
    role: UserRole;

    @Prop({ unique: true, sparse: true })
    phoneNumber?: string;

    @Prop()
    avatarUrl?: string;

    // For Agents
    @Prop({ default: false })
    isVerifiedAgent: boolean;

    @Prop({ type: Object })
    agentProfile?: {
        type?: string;
        operatingArea?: {
            city: string;
            neighborhood?: string;
        };
        bankDetails?: {
            bankName: string;
            accountNumber: string;
            accountName: string;
        };
        verificationStatus?: 'pending' | 'verified' | 'rejected' | 'none';
        identityDocumentUrl?: string;
        identityDocumentType?: string; // NIN, Driver's License, Passport
        selfieUrl?: string;
    };
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

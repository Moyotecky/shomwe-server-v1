import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../shared/enums/user-role.enum';
import { EmailService } from '../../shared/email/email.service';
import { UploadsService } from '../../shared/uploads/uploads.service';
import { OnboardingStep1Dto } from './dto/onboarding/step1-personal.dto';
import { OnboardingStep2Dto } from './dto/onboarding/step2-type.dto';
import { OnboardingStep3Dto } from './dto/onboarding/step3-location.dto';
import { OnboardingStep4Dto } from './dto/onboarding/step4-payouts.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly emailService: EmailService,
        private readonly uploadsService: UploadsService // Inject UploadsService
    ) { }

    // --- Basic CRUD ---

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // --- Authentication Helpers ---

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+password +otp +otpExpires').exec();
    }

    async findByPhone(phoneNumber: string): Promise<User | null> {
        return this.userModel.findOne({ phoneNumber }).select('+otp +otpExpires').exec();
    }

    async findWithOtp(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+password +otp +otpExpires').exec();
    }

    async updateOtp(id: string, otp: string | null, otpExpires: Date | null): Promise<void> {
        await this.userModel.findByIdAndUpdate(id, { otp, otpExpires }).exec();
    }

    // --- Profile Management ---

    async updateProfile(id: string, data: { firstName: string; lastName: string; dob: Date }): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(
            id,
            { ...data, isProfileComplete: true },
            { new: true }
        ).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // --- Agent Onboarding (6 Steps) ---

    // Step 1: Personal Info
    async updateOnboardingStep1(userId: string, data: OnboardingStep1Dto): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber
            },
            { new: true }
        ).exec();

        if (!user) throw new NotFoundException(`User ${userId} not found`);
        return user;
    }

    // Step 2: Agent Type
    async updateOnboardingStep2(userId: string, data: OnboardingStep2Dto): Promise<User> {
        return this.updateAgentField(userId, 'type', data.type);
    }

    // Step 3: Location
    async updateOnboardingStep3(userId: string, data: OnboardingStep3Dto): Promise<User> {
        return this.updateAgentField(userId, 'operatingArea', data);
    }

    // Step 4: Payouts
    async updateOnboardingStep4(userId: string, data: OnboardingStep4Dto): Promise<User> {
        return this.updateAgentField(userId, 'bankDetails', data);
    }

    // Step 5: Identity Document (File Upload)
    async updateOnboardingStep5(userId: string, file: Express.Multer.File, docType: string): Promise<User> {
        if (!file) throw new BadRequestException('Identity document file is required');

        const { url } = await this.uploadsService.uploadFile(file, 'shomwe/identity-docs');

        const update = {
            'agentProfile.identityDocumentUrl': url,
            'agentProfile.identityDocumentType': docType,
            'agentProfile.verificationStatus': 'pending'
        };

        const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true });
        if (!user) throw new NotFoundException(`User ${userId} not found`);
        return user;
    }

    // Step 6: Selfie & Finalize (File Upload + Role Upgrade)
    async updateOnboardingStep6(userId: string, file: Express.Multer.File): Promise<User> {
        if (!file) throw new BadRequestException('Selfie file is required');

        const { url } = await this.uploadsService.uploadFile(file, 'shomwe/selfies');

        // Finalize: Set Selfie, Status Pending, Role = AGENT
        const update = {
            'agentProfile.selfieUrl': url,
            'role': UserRole.AGENT
        };

        const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true });
        if (!user) throw new NotFoundException(`User ${userId} not found`);

        // Send Welcome Email
        if (user.email && user.firstName) {
            this.emailService.sendAgentWelcomeEmail(user.email, user.firstName)
                .catch(err => this.logger.error(`Failed to send agent welcome email: ${err.message}`));
        }

        return user;
    }

    // Helper for updating agentProfile sub-document fields
    private async updateAgentField(userId: string, field: string, value: any): Promise<User> {
        const update = { [`agentProfile.${field}`]: value };
        const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true });
        if (!user) throw new NotFoundException(`User ${userId} not found`);
        return user;
    }
}

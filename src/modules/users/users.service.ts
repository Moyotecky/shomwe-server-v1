import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../shared/enums/user-role.enum';
import { EmailService } from '../../shared/email/email.service';
import { UpdateAgentProfileDto } from './dto/update-agent-profile.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly emailService: EmailService,
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

    // --- Agent Onboarding ---

    async updateAgentProfile(userId: string, data: UpdateAgentProfileDto): Promise<User> {
        // Construct dot-notation update object for partial updates of nested fields
        const update: Record<string, any> = {};

        if (data.type) update['agentProfile.type'] = data.type;
        if (data.operatingArea) update['agentProfile.operatingArea'] = data.operatingArea;
        if (data.bankDetails) update['agentProfile.bankDetails'] = data.bankDetails;

        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true }
        ).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    async upgradeToAgent(userId: string): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { role: UserRole.AGENT },
            { new: true }
        ).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Send Welcome Agent Email (Fire and Forget)
        if (user.email && user.firstName) {
            this.emailService.sendAgentWelcomeEmail(user.email, user.firstName)
                .catch(err => this.logger.error(`Failed to send agent welcome email: ${err.message}`));
        }

        return user;
    }
}

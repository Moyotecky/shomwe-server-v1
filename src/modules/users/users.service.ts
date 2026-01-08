import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+password +otp +otpExpires').exec();
    }

    async findByPhone(phoneNumber: string): Promise<User | null> {
        return this.userModel.findOne({ phoneNumber }).select('+otp +otpExpires').exec();
    }

    async findWithOtp(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+otp +otpExpires').exec();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async updateOtp(id: string, otp: string | null, otpExpires: Date | null): Promise<void> {
        await this.userModel.findByIdAndUpdate(id, { otp, otpExpires }).exec();
    }

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
}

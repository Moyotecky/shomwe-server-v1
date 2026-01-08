
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema } from '../../../core/database/base.schema';
import { User } from '../../users/schemas/user.schema';

export enum ListingType {
    RENT = 'rent',
    SALE = 'sale',
    SHORTLET = 'shortlet',
    LAND = 'land',
}

export enum ListingStatus {
    AVAILABLE = 'available',
    SOLD = 'sold',
    RENTED = 'rented',
    UNAVAILABLE = 'unavailable',
}

@Schema({ timestamps: true })
export class Listing extends BaseSchema {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: 'NGN' })
    currency: string;

    @Prop({ type: Object, required: true })
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };

    @Prop({ type: Object })
    features: {
        bedrooms?: number;
        bathrooms?: number;
        sqft?: number;
        amenities?: string[];
    };

    @Prop({ required: true, enum: ListingType })
    type: ListingType;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    agentId: User;

    @Prop({ required: true, enum: ListingStatus, default: ListingStatus.AVAILABLE })
    status: ListingStatus;
}

export type ListingDocument = Listing & Document;
export const ListingSchema = SchemaFactory.createForClass(Listing);

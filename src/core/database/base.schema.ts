
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BaseSchema {
    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt?: Date;
}

export type BaseDocument = BaseSchema & Document;

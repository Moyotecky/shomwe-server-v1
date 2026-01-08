import { Module, Global } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { UploadsService } from './uploads/uploads.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [EmailService, UploadsService],
    exports: [EmailService, UploadsService],
})
export class SharedModule { }

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);

    constructor(private configService: ConfigService) {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.error('Cloudinary configuration is missing!');
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'shomwe/agent-docs'): Promise<{ url: string; publicId: string }> {
        if (!file?.buffer) {
            this.logger.error('File buffer is missing! Check Multer configuration.');
            throw new Error('File buffer is missing');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        this.logger.error(`Cloudinary upload failed: ${error.message}`, error);
                        return reject(error);
                    }
                    if (result) {
                        this.logger.log(`File uploaded successfully: ${result.secure_url}`);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                        });
                    } else {
                        this.logger.error('Cloudinary upload returned no result');
                        reject(new Error('Cloudinary upload returned no result.'));
                    }
                },
            );

            // Convert buffer to stream
            try {
                const stream = Readable.from(file.buffer);
                stream.pipe(uploadStream);
            } catch (err) {
                this.logger.error(`Failed to pipe stream for file: ${file.originalname}`, err);
                reject(err);
            }
        });
    }

    async deleteFile(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            this.logger.error(`Failed to delete file ${publicId}: ${error.message}`);
            // Don't throw, just log. Deletion failure shouldn't block main flows.
        }
    }
}

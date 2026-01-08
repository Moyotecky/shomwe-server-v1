
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('database.uri'),
                connectionFactory: (connection) => {
                    if (connection.readyState === 1) {
                        console.log('db connected successfully');
                    }
                    connection.on('connected', () => {
                        console.log('db connected successfully');
                    });
                    return connection;
                },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }

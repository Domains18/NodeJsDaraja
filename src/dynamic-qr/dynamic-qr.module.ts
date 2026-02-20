import { Module } from '@nestjs/common';
import { DynamicQRController } from './dynamic-qr.controller';
import { DynamicQRService } from './dynamic-qr.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [DynamicQRController],
    providers: [DynamicQRService, AuthService, PrismaService],
})
export class DynamicQRModule {}

import { Module } from '@nestjs/common';
import { BillManagerController } from './bill-manager.controller';
import { BillManagerService } from './bill-manager.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [BillManagerController],
    providers: [BillManagerService, AuthService, PrismaService],
})
export class BillManagerModule {}

import { Module } from '@nestjs/common';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatusService } from './transaction-status.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [TransactionStatusController],
    providers: [TransactionStatusService, AuthService, PrismaService],
})
export class TransactionStatusModule {}

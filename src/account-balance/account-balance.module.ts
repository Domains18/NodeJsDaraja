import { Module } from '@nestjs/common';
import { AccountBalanceController } from './account-balance.controller';
import { AccountBalanceService } from './account-balance.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [AccountBalanceController],
    providers: [AccountBalanceService, AuthService, PrismaService],
})
export class AccountBalanceModule {}

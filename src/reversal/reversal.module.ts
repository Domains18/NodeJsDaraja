import { Module } from '@nestjs/common';
import { ReversalController } from './reversal.controller';
import { ReversalService } from './reversal.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [ReversalController],
    providers: [ReversalService, AuthService, PrismaService],
})
export class ReversalModule {}

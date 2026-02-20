import { Module } from '@nestjs/common';
import { B2BController } from './b2b.controller';
import { B2BService } from './b2b.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [B2BController],
    providers: [B2BService, AuthService, PrismaService],
})
export class B2BModule {}

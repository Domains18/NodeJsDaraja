import { Module } from '@nestjs/common';
import { B2CController } from './b2c.controller';
import { B2CService } from './b2c.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [B2CController],
    providers: [B2CService, AuthService, PrismaService],
})
export class B2CModule {}

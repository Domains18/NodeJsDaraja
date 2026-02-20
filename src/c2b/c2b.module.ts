import { Module } from '@nestjs/common';
import { C2BController } from './c2b.controller';
import { C2BService } from './c2b.service';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
    controllers: [C2BController],
    providers: [C2BService, AuthService, PrismaService],
})
export class C2BModule {}

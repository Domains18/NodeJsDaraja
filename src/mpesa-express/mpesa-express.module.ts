import { Module } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { MpesaExpressController } from './mpesa-express.controller';
import { AuthService } from 'src/services/auth.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [],
    controllers: [MpesaExpressController],
    providers: [MpesaExpressService, AuthService, ConfigService],
})
export class MpesaExpressModule {}

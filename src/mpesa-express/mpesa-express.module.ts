import { Module } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { MpesaExpressController } from './mpesa-express.controller';
import { AuthService } from 'src/services/auth.service';

@Module({
    imports: [],
    controllers: [MpesaExpressController],
    providers: [MpesaExpressService, AuthService],
})
export class MpesaExpressModule {}

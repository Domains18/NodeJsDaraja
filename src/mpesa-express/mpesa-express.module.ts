import { Module } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { MpesaExpressController } from './mpesa-express.controller';

@Module({
  controllers: [MpesaExpressController],
  providers: [MpesaExpressService],
})
export class MpesaExpressModule {}

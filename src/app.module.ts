import { Module } from '@nestjs/common';
import { MpesaExpressModule } from './mpesa-express/mpesa-express.module';
import { CallbackModule } from './callback/callback.module';

@Module({
  imports: [MpesaExpressModule, CallbackModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

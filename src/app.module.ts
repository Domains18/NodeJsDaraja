import { Module } from '@nestjs/common';
import { MpesaExpressModule } from './mpesa-express/mpesa-express.module';

@Module({
  imports: [MpesaExpressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

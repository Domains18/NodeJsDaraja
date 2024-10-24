import { Module } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { CallbackController } from './callback.controller';

@Module({
  controllers: [CallbackController],
  providers: [CallbackService],
})
export class CallbackModule {}

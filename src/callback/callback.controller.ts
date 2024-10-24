import { Controller } from '@nestjs/common';
import { CallbackService } from './callback.service';

@Controller('callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}
}

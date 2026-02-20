import { Global, Module } from '@nestjs/common';
import { SecurityCredentialService } from './services/security-credential.service';
import { TimestampService } from './services/timestamp.service';
import { CallbackHandlerService } from './services/callback-handler.service';

@Global()
@Module({
    providers: [SecurityCredentialService, TimestampService, CallbackHandlerService],
    exports: [SecurityCredentialService, TimestampService, CallbackHandlerService],
})
export class CoreModule {}

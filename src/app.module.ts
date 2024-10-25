import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger/logger.middleware';
import { MpesaExpressModule } from './mpesa-express/mpesa-express.module';
import { CallbackModule } from './callback/callback.module';
import { ConfigModule } from '@nestjs/config';
@Module({
    imports: [MpesaExpressModule, CallbackModule, ConfigModule.forRoot({isGlobal: true})],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}

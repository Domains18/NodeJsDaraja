import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger/logger.middleware';
import { MpesaExpressModule } from './mpesa-express/mpesa-express.module';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { RedisModule } from '@liaoliaots/nestjs-redis';


@Module({
    imports: [MpesaExpressModule,
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService) => configService.get('REDIS_URL'),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger/logger.middleware';
import { MpesaExpressModule } from './mpesa-express/mpesa-express.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CoreModule } from './core/core.module';
import { C2BModule } from './c2b/c2b.module';
import { B2CModule } from './b2c/b2c.module';
import { B2BModule } from './b2b/b2b.module';
import { AccountBalanceModule } from './account-balance/account-balance.module';
import { TransactionStatusModule } from './transaction-status/transaction-status.module';
import { ReversalModule } from './reversal/reversal.module';
import { DynamicQRModule } from './dynamic-qr/dynamic-qr.module';
import { BillManagerModule } from './bill-manager/bill-manager.module';


@Module({
    imports: [
        CoreModule,
        MpesaExpressModule,
        C2BModule,
        B2CModule,
        B2BModule,
        AccountBalanceModule,
        TransactionStatusModule,
        ReversalModule,
        DynamicQRModule,
        BillManagerModule,
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                config: {
                    url: configService.get<string>('REDIS_URL'),
                    onClientCreated: (client) => {
                        client.on('error', (err) => {
                            console.error('Redis Client Error:', err);
                        });
                        client.on('connect', () => {
                            console.log('Redis Client Connected');
                        });
                    },
                },
            }),
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

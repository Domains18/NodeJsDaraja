import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Controller('mpesa')
export class MpesaExpressController {
    private readonly redis: Redis | null;
    private logger = new Logger('MpesaExpressController');
    constructor(
        private mpesaExpressService: MpesaExpressService,
        private readonly redisService: RedisService
    ) {}

    @Post('/stkpush')
    create(@Body() createMpesaExpressDto: CreateMpesaExpressDto) {
        return this.mpesaExpressService.stkPush(createMpesaExpressDto);
    }

    @Post('/callback')
    async handleCallback(@Body() callBackData: any) {
        this.logger.debug(`Callback data: ${JSON.stringify(callBackData)}`);
        const redisClient = this.redisService.getOrThrow();
        
        const { Body: { stkCallback } } = callBackData;
        
        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

        const payment = await redisClient.get(MerchantRequestID);
        // if (!payment || payment === null || payment === undefined) {
        //     this.logger.error('Payment not found, was it cached?');
        // }

        if (payment) {
            this.logger.debug(`Payment found: ${payment}`);
            const parsedData = JSON.parse(payment);

            if(ResultCode === 0) {
                parsedData.status = 'COMPLETED';
            } else {
                parsedData.status = 'FAILED';
            }
            await redisClient.set(MerchantRequestID, JSON.stringify(parsedData));
        } else {
            this.logger.error('Payment not found, was it cached?');
        }
    }
}

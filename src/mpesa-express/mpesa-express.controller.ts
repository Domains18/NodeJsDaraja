import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

interface STKCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
        };
    };
}

interface PaymentStatus {
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    [key: string]: any;
}

@Controller('mpesa')
export class MpesaExpressController {
    private readonly logger = new Logger(MpesaExpressController.name);
    private readonly redis: Redis;

    constructor(
        private readonly mpesaExpressService: MpesaExpressService,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getOrThrow();
    }

    @Post('/stkpush')
    async initiateSTKPush(@Body() createMpesaExpressDto: CreateMpesaExpressDto) {
        try {
            const result = await this.mpesaExpressService.stkPush(createMpesaExpressDto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`STK Push failed: ${error.message}`);
            throw new HttpException('Failed to initiate payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback')
    async handleCallback(@Body() callbackData: STKCallback) {
        try {
            this.logger.debug('Processing callback data:', JSON.stringify(callbackData));

            const {
                Body: {
                    stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc },
                },
            } = callbackData;

            await this.updatePaymentStatus(CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc);

            return {
                success: true,
                message: 'Callback processed successfully',
            };
        } catch (error) {
            this.logger.error(`Callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process callback', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async updatePaymentStatus(
        checkoutRequestId: string,
        merchantRequestId: string,
        resultCode: number,
        resultDesc: string,
    ): Promise<void> {
        const paymentJson = await this.redis.get(checkoutRequestId);

        if (!paymentJson) {
            this.logger.error(`Payment not found for CheckoutRequestID: ${checkoutRequestId}`);
            throw new HttpException('Payment record not found', HttpStatus.NOT_FOUND);
        }

        try {
            const payment: PaymentStatus = JSON.parse(paymentJson);

            const updatedPayment: PaymentStatus = {
                ...payment,
                status: this.determinePaymentStatus(resultCode),
                resultDescription: resultDesc,
                lastUpdated: new Date().toISOString(),
            };

            await this.redis.set(
                merchantRequestId,
                JSON.stringify(updatedPayment),
                'EX',
                3600, // 1 hour expiry
            );

            this.logger.debug(`Payment status updated: ${JSON.stringify(updatedPayment)}`);
        } catch (error) {
            this.logger.error(`Failed to update payment status: ${error.message}`);
            throw new HttpException('Failed to update payment status', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private determinePaymentStatus(resultCode: number): PaymentStatus['status'] {
        return resultCode === 0 ? 'COMPLETED' : 'FAILED';
    }
}

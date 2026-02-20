import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { B2BService } from './b2b.service';
import { B2BPaymentRequestDto } from './dto/payment-request.dto';

@Controller('b2b')
export class B2BController {
    private readonly logger = new Logger(B2BController.name);

    constructor(private readonly b2bService: B2BService) {}

    @Post('/payment')
    async initiatePayment(@Body() dto: B2BPaymentRequestDto) {
        try {
            const result = await this.b2bService.sendPayment(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`B2B payment failed: ${error.message}`);
            throw new HttpException('Failed to initiate B2B payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback/result')
    async handleResultCallback(@Body() callback: any) {
        return this.b2bService.processResultCallback(callback);
    }

    @Post('/callback/timeout')
    async handleTimeoutCallback(@Body() callback: any) {
        return this.b2bService.processTimeoutCallback(callback);
    }
}

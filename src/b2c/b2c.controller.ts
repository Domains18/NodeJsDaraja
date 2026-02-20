import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { B2CService } from './b2c.service';
import { PaymentRequestDto } from './dto/payment-request.dto';

@Controller('b2c')
export class B2CController {
    private readonly logger = new Logger(B2CController.name);

    constructor(private readonly b2cService: B2CService) {}

    @Post('/payment')
    async initiatePayment(@Body() dto: PaymentRequestDto) {
        try {
            const result = await this.b2cService.sendPayment(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`B2C payment failed: ${error.message}`);
            throw new HttpException('Failed to initiate B2C payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback/result')
    async handleResultCallback(@Body() callback: any) {
        return this.b2cService.processResultCallback(callback);
    }

    @Post('/callback/timeout')
    async handleTimeoutCallback(@Body() callback: any) {
        return this.b2cService.processTimeoutCallback(callback);
    }
}

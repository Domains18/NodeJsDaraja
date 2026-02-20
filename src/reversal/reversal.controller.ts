import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ReversalService } from './reversal.service';
import { ReversalRequestDto } from './dto/reversal-request.dto';

@Controller('reversal')
export class ReversalController {
    private readonly logger = new Logger(ReversalController.name);

    constructor(private readonly reversalService: ReversalService) {}

    @Post('/request')
    async reverseTransaction(@Body() dto: ReversalRequestDto) {
        try {
            const result = await this.reversalService.reverseTransaction(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`Reversal failed: ${error.message}`);
            throw new HttpException('Failed to reverse transaction', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback')
    async handleResultCallback(@Body() callback: any) {
        return this.reversalService.processResultCallback(callback);
    }

    @Post('/timeout')
    async handleTimeoutCallback(@Body() callback: any) {
        return this.reversalService.processTimeoutCallback(callback);
    }
}

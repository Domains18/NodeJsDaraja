import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';
import { StatusQueryDto } from './dto/status-query.dto';

@Controller('transaction-status')
export class TransactionStatusController {
    private readonly logger = new Logger(TransactionStatusController.name);

    constructor(private readonly statusService: TransactionStatusService) {}

    @Post('/query')
    async queryStatus(@Body() dto: StatusQueryDto) {
        try {
            const result = await this.statusService.queryStatus(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`Status query failed: ${error.message}`);
            throw new HttpException('Failed to query transaction status', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback')
    async handleResultCallback(@Body() callback: any) {
        return this.statusService.processResultCallback(callback);
    }

    @Post('/timeout')
    async handleTimeoutCallback(@Body() callback: any) {
        return this.statusService.processTimeoutCallback(callback);
    }
}

import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AccountBalanceService } from './account-balance.service';
import { BalanceQueryDto } from './dto/balance-query.dto';

@Controller('account-balance')
export class AccountBalanceController {
    private readonly logger = new Logger(AccountBalanceController.name);

    constructor(private readonly balanceService: AccountBalanceService) {}

    @Post('/query')
    async queryBalance(@Body() dto: BalanceQueryDto) {
        try {
            const result = await this.balanceService.queryBalance(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`Balance query failed: ${error.message}`);
            throw new HttpException('Failed to query account balance', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/callback')
    async handleResultCallback(@Body() callback: any) {
        return this.balanceService.processResultCallback(callback);
    }

    @Post('/timeout')
    async handleTimeoutCallback(@Body() callback: any) {
        return this.balanceService.processTimeoutCallback(callback);
    }
}

import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { C2BService } from './c2b.service';
import { RegisterUrlDto } from './dto/register-url.dto';
import { SimulateC2BDto } from './dto/simulate-c2b.dto';

@Controller('c2b')
export class C2BController {
    private readonly logger = new Logger(C2BController.name);

    constructor(private readonly c2bService: C2BService) {}

    @Post('/register')
    async registerUrls(@Body() dto: RegisterUrlDto) {
        try {
            const result = await this.c2bService.registerUrls(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`C2B URL registration failed: ${error.message}`);
            throw new HttpException('Failed to register C2B URLs', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/simulate')
    async simulateTransaction(@Body() dto: SimulateC2BDto) {
        try {
            const result = await this.c2bService.simulateTransaction(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`C2B simulation failed: ${error.message}`);
            throw new HttpException('Failed to simulate C2B transaction', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/validation')
    async handleValidation(@Body() callback: any) {
        return this.c2bService.processValidation(callback);
    }

    @Post('/confirmation')
    async handleConfirmation(@Body() callback: any) {
        return this.c2bService.processConfirmation(callback);
    }
}

import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DynamicQRService } from './dynamic-qr.service';
import { QRGenerateDto } from './dto/qr-generate.dto';

@Controller('dynamic-qr')
export class DynamicQRController {
    private readonly logger = new Logger(DynamicQRController.name);

    constructor(private readonly qrService: DynamicQRService) {}

    @Post('/generate')
    async generateQR(@Body() dto: QRGenerateDto) {
        try {
            const result = await this.qrService.generateQR(dto);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`QR generation failed: ${error.message}`);
            throw new HttpException('Failed to generate QR code', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { MPESA_URLS } from 'src/core/utils/constants';
import { QRGenerateDto } from './dto/qr-generate.dto';

@Injectable()
export class DynamicQRService {
    private readonly logger = new Logger(DynamicQRService.name);
    private readonly baseUrl: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const environment = this.configService.get<string>('MPESA_ENV') || 'SANDBOX';
        this.baseUrl = MPESA_URLS[environment].DYNAMIC_QR;
    }

    async generateQR(dto: QRGenerateDto): Promise<any> {
        try {
            // Get auth token
            const token = await this.authService.generateToken();
            if (!token) {
                throw new HttpException('Failed to get auth token', 401);
            }

            // Build request
            const requestBody = {
                MerchantName: dto.merchantName,
                RefNo: dto.refNo,
                Amount: dto.amount,
                TrxCode: dto.trxCode,
                CPI: dto.cpi || this.configService.get<string>('QR_MERCHANT_NAME'),
                Size: dto.size || '300',
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save to database
            await this.prisma.dynamicQR.create({
                data: {
                    MerchantName: dto.merchantName,
                    RefNo: dto.refNo,
                    Amount: dto.amount,
                    TrxCode: dto.trxCode,
                    CPI: dto.cpi,
                    Size: dto.size || '300',
                    QRCode: response.data.QRCode,
                    ResponseCode: response.data.ResponseCode,
                    ResponseDescription: response.data.ResponseDescription,
                },
            });

            this.logger.log(`QR code generated for: ${dto.merchantName} - ${dto.refNo}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpException) {
            throw error;
        }

        if (error instanceof AxiosError) {
            this.logger.error(`API Error: ${error.message}`, error.response?.data);
            throw new HttpException(`Failed to generate QR code: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

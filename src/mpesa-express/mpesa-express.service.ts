import { Injectable, HttpException, Logger } from '@nestjs/common';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { AuthService } from 'src/services/auth.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import axios, { AxiosError } from 'axios';

interface MpesaConfig {
    shortcode: string;
    passkey: string;
    callbackUrl: string;
    transactionType: string;
}

interface STKPushRequest {
    BusinessShortCode: string;
    Password: string;
    Timestamp: string;
    TransactionType: string;
    Amount: number;
    PartyA: string;
    PartyB: string;
    PhoneNumber: string;
    CallBackURL: string;
    AccountReference: string;
    TransactionDesc: string;
}

@Injectable()
export class MpesaExpressService {
    private readonly logger = new Logger(MpesaExpressService.name);
    private readonly mpesaConfig: MpesaConfig;
    private readonly redis: Redis;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
        this.mpesaConfig = {
            shortcode: '174379',
            passkey: this.configService.get<string>('PASS_KEY'),
            callbackUrl: 'https://goose-merry-mollusk.ngrok-free.app/api/mpesa/callback',
            transactionType: 'CustomerPayBillOnline',
        };
        this.redis = this.redisService.getOrThrow();
    }

    async stkPush(dto: CreateMpesaExpressDto): Promise<any> {
        try {
            await this.validateDto(dto);

            const token = await this.getAuthToken();
            const timestamp = this.generateTimestamp();
            const password = this.generatePassword(timestamp);

            const requestBody = this.createSTKPushRequest(dto, timestamp, password);
            const response = await this.sendSTKPushRequest(requestBody, token);

            await this.cachePaymentDetails(response.data);

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private validateDto(dto: CreateMpesaExpressDto): void {
        const validations = [
            {
                condition: !dto.phoneNum.match(/^2547\d{8}$/),
                message: 'Phone number must be in the format 2547XXXXXXXX',
            },
            {
                condition: !dto.accountRef.match(/^[a-zA-Z0-9]{1,12}$/),
                message: 'Account reference must be alphanumeric and not more than 12 characters',
            },
            {
                condition: dto.amount <= 0,
                message: 'Amount must be greater than 0',
            },
        ];

        const failure = validations.find((validation) => validation.condition);
        if (failure) {
            this.logger.warn(`Validation failed: ${failure.message}`);
            throw new HttpException(failure.message, 400);
        }
    }

    private generateTimestamp(): string {
        const date = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');

        return (
            `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
        );
    }

    private generatePassword(timestamp: string): string {
        const { shortcode, passkey } = this.mpesaConfig;
        return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    }

    private async getAuthToken(): Promise<string> {
        const token = await this.authService.generateToken();
        if (!token) {
            throw new HttpException('Failed to generate token, please check your environment variables', 401);
        }
        return token;
    }

    private createSTKPushRequest(dto: CreateMpesaExpressDto, timestamp: string, password: string): STKPushRequest {
        const { shortcode, transactionType, callbackUrl } = this.mpesaConfig;

        return {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: transactionType,
            Amount: dto.amount,
            PartyA: dto.phoneNum,
            PartyB: shortcode,
            PhoneNumber: dto.phoneNum,
            CallBackURL: callbackUrl,
            AccountReference: dto.accountRef,
            TransactionDesc: 'szken',
        };
    }

    private async sendSTKPushRequest(requestBody: STKPushRequest, token: string) {
        return axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }

    private async cachePaymentDetails(paymentData: any): Promise<void> {
        try {
            await this.redis.setex(
                paymentData.CheckoutRequestID,
                3600,
                JSON.stringify({ ...paymentData, status: 'PENDING' }),
            );
        } catch (error) {
            this.logger.error(`Error during caching: ${error}`);
            throw new HttpException('Failed to cache payment', 500);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpException) {
            throw error;
        }

        if (error instanceof AxiosError) {
            this.logger.error(`API Error: ${error.message}`, error.response?.data);
            throw new HttpException(`Failed to process payment: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

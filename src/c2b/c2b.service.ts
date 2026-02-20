import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { MPESA_URLS, TRANSACTION_TYPES } from 'src/core/utils/constants';
import { RegisterUrlDto } from './dto/register-url.dto';
import { SimulateC2BDto } from './dto/simulate-c2b.dto';
import { Status } from '@prisma/client';

@Injectable()
export class C2BService {
    private readonly logger = new Logger(C2BService.name);
    private readonly baseUrl: string;
    private readonly simulateUrl: string;
    private readonly shortcode: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const environment = this.configService.get<string>('MPESA_ENV') || 'SANDBOX';
        this.baseUrl = MPESA_URLS[environment].C2B_REGISTER;
        this.simulateUrl = MPESA_URLS[environment].C2B_SIMULATE;
        this.shortcode = this.configService.get<string>('C2B_SHORTCODE');
    }

    async registerUrls(dto: RegisterUrlDto): Promise<any> {
        try {
            // Get auth token
            const token = await this.authService.generateToken();
            if (!token) {
                throw new HttpException('Failed to get auth token', 401);
            }

            // Build request
            const requestBody = {
                ShortCode: dto.shortCode || this.shortcode,
                ResponseType: dto.responseType,
                ConfirmationURL: dto.confirmationURL,
                ValidationURL: dto.validationURL,
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            this.logger.log(`C2B URLs registered successfully for shortcode: ${dto.shortCode}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async simulateTransaction(dto: SimulateC2BDto): Promise<any> {
        try {
            // Validate phone number
            this.validateDto(dto);

            // Get auth token
            const token = await this.authService.generateToken();
            if (!token) {
                throw new HttpException('Failed to get auth token', 401);
            }

            // Build request
            const requestBody = {
                ShortCode: dto.shortCode || this.shortcode,
                CommandID: dto.commandID || TRANSACTION_TYPES.C2B.CUSTOMER_PAY_BILL_ONLINE,
                Amount: dto.amount,
                Msisdn: dto.msisdn,
                BillRefNumber: dto.billRefNumber,
            };

            // Send request
            const response = await axios.post(this.simulateUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            this.logger.log(`C2B transaction simulated: ${dto.msisdn} - ${dto.amount}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processValidation(callbackData: any): Promise<any> {
        try {
            this.logger.log(`C2B Validation callback received: ${JSON.stringify(callbackData)}`);

            // Validation logic can be implemented here
            // For now, accept all transactions
            return {
                ResultCode: 0,
                ResultDesc: 'Accepted',
            };
        } catch (error) {
            this.logger.error(`Validation processing failed: ${error.message}`);
            return {
                ResultCode: 1,
                ResultDesc: 'Rejected',
            };
        }
    }

    async processConfirmation(callbackData: any): Promise<void> {
        try {
            this.logger.log(`C2B Confirmation callback received: ${JSON.stringify(callbackData)}`);

            // Extract transaction data
            const {
                TransactionType,
                TransID,
                TransTime,
                TransAmount,
                BusinessShortCode,
                BillRefNumber,
                InvoiceNumber,
                OrgAccountBalance,
                ThirdPartyTransID,
                MSISDN,
                FirstName,
                MiddleName,
                LastName,
            } = callbackData;

            // Save to database
            await this.prisma.c2BTransaction.create({
                data: {
                    TransactionType,
                    TransID,
                    TransTime,
                    TransAmount: parseFloat(TransAmount),
                    BusinessShortCode,
                    BillRefNumber,
                    InvoiceNumber,
                    OrgAccountBalance: OrgAccountBalance ? parseFloat(OrgAccountBalance) : null,
                    ThirdPartyTransID,
                    MSISDN,
                    FirstName,
                    MiddleName,
                    LastName,
                    status: Status.COMPLETED,
                },
            });

            this.logger.log(`C2B transaction saved: ${TransID}`);
        } catch (error) {
            this.logger.error(`Confirmation processing failed: ${error.message}`);
            throw new HttpException('Failed to process confirmation', 500);
        }
    }

    private validateDto(dto: SimulateC2BDto): void {
        const validations = [
            {
                condition: !dto.msisdn.match(/^254\d{9}$/),
                message: 'Phone number must be in the format 254XXXXXXXXX',
            },
            {
                condition: dto.amount <= 0,
                message: 'Amount must be greater than 0',
            },
        ];

        const failure = validations.find((validation) => validation.condition);
        if (failure) {
            this.logger.error(`Validation failed: ${failure.message}`);
            throw new HttpException(failure.message, 400);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpException) {
            throw error;
        }

        if (error instanceof AxiosError) {
            this.logger.error(`API Error: ${error.message}`, error.response?.data);
            throw new HttpException(`Failed to process C2B request: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

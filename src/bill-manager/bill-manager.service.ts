import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { MPESA_URLS } from 'src/core/utils/constants';
import { OnboardDto } from './dto/onboard.dto';
import { Status } from '@prisma/client';

@Injectable()
export class BillManagerService {
    private readonly logger = new Logger(BillManagerService.name);
    private readonly onboardUrl: string;
    private readonly modifyUrl: string;
    private readonly bulkUrl: string;
    private readonly reconcileUrl: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const environment = this.configService.get<string>('MPESA_ENV') || 'SANDBOX';
        this.onboardUrl = MPESA_URLS[environment].BILL_ONBOARD;
        this.modifyUrl = MPESA_URLS[environment].BILL_MODIFY;
        this.bulkUrl = MPESA_URLS[environment].BILL_BULK;
        this.reconcileUrl = MPESA_URLS[environment].BILL_RECONCILE;
    }

    async onboardAccount(dto: OnboardDto): Promise<any> {
        try {
            // Get auth token
            const token = await this.authService.generateToken();
            if (!token) {
                throw new HttpException('Failed to get auth token', 401);
            }

            // Build request
            const requestBody = {
                ShortCode: dto.shortCode,
                Email: dto.email,
                OfficialContact: dto.officialContact,
                SendReminders: dto.sendReminders !== false,
                Logo: dto.logo || '',
                CallBackUrl: dto.callBackUrl,
            };

            // Send request
            const response = await axios.post(this.onboardUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save to database
            await this.prisma.billAccount.create({
                data: {
                    ShortCode: dto.shortCode,
                    Email: dto.email,
                    OfficialContact: dto.officialContact,
                    SendReminders: dto.sendReminders !== false,
                    Logo: dto.logo,
                    CallBackUrl: dto.callBackUrl,
                    OnboardingStatus: 'Pending',
                    ResponseCode: response.data.ResponseCode,
                    ResponseDescription: response.data.ResponseDescription,
                },
            });

            this.logger.log(`Bill account onboarded: ${dto.shortCode}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processPaymentCallback(callbackData: any): Promise<void> {
        try {
            this.logger.log(`Bill payment callback received: ${JSON.stringify(callbackData)}`);

            // Extract payment data
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

            // Find the bill account
            const account = await this.prisma.billAccount.findUnique({
                where: { ShortCode: BusinessShortCode },
            });

            if (!account) {
                this.logger.error(`Bill account not found: ${BusinessShortCode}`);
                return;
            }

            // Save payment
            await this.prisma.billPayment.create({
                data: {
                    accountId: account.id,
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

            this.logger.log(`Bill payment saved: ${TransID}`);
        } catch (error) {
            this.logger.error(`Payment callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process payment callback', 500);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpException) {
            throw error;
        }

        if (error instanceof AxiosError) {
            this.logger.error(`API Error: ${error.message}`, error.response?.data);
            throw new HttpException(`Failed to process bill manager request: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

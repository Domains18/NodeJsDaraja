import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { SecurityCredentialService } from 'src/core/services/security-credential.service';
import { CallbackHandlerService } from 'src/core/services/callback-handler.service';
import { MPESA_URLS, IDENTIFIER_TYPES } from 'src/core/utils/constants';
import { B2BPaymentRequestDto } from './dto/payment-request.dto';
import { Status } from '@prisma/client';

@Injectable()
export class B2BService {
    private readonly logger = new Logger(B2BService.name);
    private readonly baseUrl: string;
    private readonly initiatorName: string;
    private readonly shortcode: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly securityService: SecurityCredentialService,
        private readonly callbackHandler: CallbackHandlerService,
    ) {
        const environment = this.configService.get<string>('MPESA_ENV') || 'SANDBOX';
        this.baseUrl = MPESA_URLS[environment].B2B;
        this.initiatorName = this.configService.get<string>('INITIATOR_NAME');
        this.shortcode = this.configService.get<string>('B2B_SHORTCODE');
    }

    async sendPayment(dto: B2BPaymentRequestDto): Promise<any> {
        try {
            // Validate DTO
            this.validatePaymentRequest(dto);

            // Get auth token
            const token = await this.authService.generateToken();
            if (!token) {
                throw new HttpException('Failed to get auth token', 401);
            }

            // Get security credential
            const securityCredential = this.securityService.getSecurityCredential();

            // Build request
            const requestBody = {
                Initiator: this.initiatorName,
                SecurityCredential: securityCredential,
                CommandID: dto.commandId,
                SenderIdentifierType: dto.senderIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                ReceiverIdentifierType: dto.receiverIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                Amount: dto.amount,
                PartyA: this.shortcode,
                PartyB: dto.partyB,
                AccountReference: dto.accountReference,
                Remarks: dto.remarks || 'B2B Payment',
                QueueTimeOutURL: this.configService.get<string>('B2B_TIMEOUT_URL'),
                ResultURL: this.configService.get<string>('B2B_RESULT_URL'),
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save initial transaction to database
            await this.prisma.b2BTransaction.create({
                data: {
                    ConversationID: response.data.ConversationID,
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    InitiatorName: this.initiatorName,
                    CommandID: dto.commandId,
                    Amount: dto.amount,
                    PartyA: this.shortcode,
                    PartyB: dto.partyB,
                    SenderIdentifierType: dto.senderIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                    ReceiverIdentifierType: dto.receiverIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                    AccountReference: dto.accountReference,
                    Remarks: dto.remarks,
                    QueueTimeoutURL: requestBody.QueueTimeOutURL,
                    ResultURL: requestBody.ResultURL,
                    status: Status.PENDING,
                },
            });

            // Cache transaction
            await this.callbackHandler.cacheTransaction(
                response.data.ConversationID,
                {
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    partyB: dto.partyB,
                    amount: dto.amount,
                },
                3600,
            );

            this.logger.log(`B2B payment initiated: ${this.shortcode} -> ${dto.partyB} - ${dto.amount}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processResultCallback(callbackData: any): Promise<void> {
        try {
            const { Result } = callbackData;
            const { ConversationID, ResultCode, ResultDesc } = Result;

            this.logger.log(`B2B Result callback received: ${ConversationID}`);

            // Extract result parameters
            const metadata = this.callbackHandler.extractMetadata(Result.ResultParameters?.ResultParameter || []);

            // Update database
            await this.prisma.b2BTransaction.update({
                where: { ConversationID },
                data: {
                    ResultType: Result.ResultType,
                    ResultCode,
                    ResultDesc,
                    TransactionID: metadata.TransactionID,
                    DebitAccountBalance: metadata.DebitAccountBalance ? parseFloat(metadata.DebitAccountBalance) : null,
                    CreditAccountBalance: metadata.CreditAccountBalance
                        ? parseFloat(metadata.CreditAccountBalance)
                        : null,
                    DebitPartyCharges: metadata.DebitPartyCharges ? parseFloat(metadata.DebitPartyCharges) : null,
                    RecipientIsRegistered: metadata.RecipientIsRegisteredCustomer === 'Y',
                    status: ResultCode === 0 ? Status.COMPLETED : Status.FAILED,
                },
            });

            // Clean up cache
            await this.callbackHandler.deleteCachedTransaction(ConversationID);

            this.logger.log(`B2B callback processed: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process callback', 500);
        }
    }

    async processTimeoutCallback(callbackData: any): Promise<void> {
        try {
            const { ConversationID } = callbackData;

            await this.prisma.b2BTransaction.update({
                where: { ConversationID },
                data: {
                    status: Status.TIMEOUT,
                    ResultDesc: 'Transaction timeout',
                },
            });

            this.logger.warn(`B2B timeout: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Timeout processing failed: ${error.message}`);
        }
    }

    private validatePaymentRequest(dto: B2BPaymentRequestDto): void {
        const validations = [
            {
                condition: dto.amount <= 0,
                message: 'Amount must be greater than 0',
            },
            {
                condition: !dto.accountReference || dto.accountReference.length > 12,
                message: 'Account reference must be provided and not exceed 12 characters',
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
            throw new HttpException(`Failed to process B2B payment: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { SecurityCredentialService } from 'src/core/services/security-credential.service';
import { CallbackHandlerService } from 'src/core/services/callback-handler.service';
import { MPESA_URLS, TRANSACTION_TYPES, IDENTIFIER_TYPES } from 'src/core/utils/constants';
import { ReversalRequestDto } from './dto/reversal-request.dto';
import { Status } from '@prisma/client';

@Injectable()
export class ReversalService {
    private readonly logger = new Logger(ReversalService.name);
    private readonly baseUrl: string;
    private readonly initiatorName: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly securityService: SecurityCredentialService,
        private readonly callbackHandler: CallbackHandlerService,
    ) {
        const environment = this.configService.get<string>('MPESA_ENV') || 'SANDBOX';
        this.baseUrl = MPESA_URLS[environment].REVERSAL;
        this.initiatorName = this.configService.get<string>('INITIATOR_NAME');
    }

    async reverseTransaction(dto: ReversalRequestDto): Promise<any> {
        try {
            // Validate DTO
            this.validateReversalRequest(dto);

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
                CommandID: TRANSACTION_TYPES.REVERSAL.TRANSACTION_REVERSAL,
                TransactionID: dto.transactionID,
                Amount: dto.amount,
                ReceiverParty: dto.receiverParty,
                ReceiverIdentifierType: dto.receiverIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                QueueTimeOutURL: this.configService.get<string>('REVERSAL_TIMEOUT_URL'),
                ResultURL: this.configService.get<string>('REVERSAL_RESULT_URL'),
                Remarks: dto.remarks || 'Transaction Reversal',
                Occasion: dto.occasion || '',
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save initial reversal to database
            await this.prisma.reversalTransaction.create({
                data: {
                    ConversationID: response.data.ConversationID,
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    InitiatorName: this.initiatorName,
                    TransactionID: dto.transactionID,
                    Amount: dto.amount,
                    ReceiverParty: dto.receiverParty,
                    ReceiverIdentifierType: dto.receiverIdentifierType || IDENTIFIER_TYPES.SHORTCODE,
                    Remarks: dto.remarks,
                    QueueTimeoutURL: requestBody.QueueTimeOutURL,
                    ResultURL: requestBody.ResultURL,
                    Occassion: dto.occasion,
                    status: Status.PENDING,
                },
            });

            // Cache reversal
            await this.callbackHandler.cacheTransaction(
                response.data.ConversationID,
                {
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    transactionID: dto.transactionID,
                    amount: dto.amount,
                },
                3600,
            );

            this.logger.log(`Reversal initiated for transaction: ${dto.transactionID}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processResultCallback(callbackData: any): Promise<void> {
        try {
            const { Result } = callbackData;
            const { ConversationID, ResultCode, ResultDesc } = Result;

            this.logger.log(`Reversal Result callback received: ${ConversationID}`);

            // Extract result parameters
            const metadata = this.callbackHandler.extractMetadata(Result.ResultParameters?.ResultParameter || []);

            // Update database
            await this.prisma.reversalTransaction.update({
                where: { ConversationID },
                data: {
                    ResultType: Result.ResultType,
                    ResultCode,
                    ResultDesc,
                    TransactionAmount: metadata.TransactionAmount ? parseFloat(metadata.TransactionAmount) : null,
                    DebitAccountBalance: metadata.DebitAccountBalance
                        ? parseFloat(metadata.DebitAccountBalance)
                        : null,
                    status: ResultCode === 0 ? Status.COMPLETED : Status.FAILED,
                },
            });

            // Clean up cache
            await this.callbackHandler.deleteCachedTransaction(ConversationID);

            this.logger.log(`Reversal callback processed: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process callback', 500);
        }
    }

    async processTimeoutCallback(callbackData: any): Promise<void> {
        try {
            const { ConversationID } = callbackData;

            await this.prisma.reversalTransaction.update({
                where: { ConversationID },
                data: {
                    status: Status.TIMEOUT,
                    ResultDesc: 'Reversal timeout',
                },
            });

            this.logger.warn(`Reversal timeout: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Timeout processing failed: ${error.message}`);
        }
    }

    private validateReversalRequest(dto: ReversalRequestDto): void {
        const validations = [
            {
                condition: dto.amount <= 0,
                message: 'Amount must be greater than 0',
            },
            {
                condition: !dto.transactionID,
                message: 'Transaction ID is required',
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
            throw new HttpException(`Failed to reverse transaction: ${error.message}`, error.response?.status || 500);
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

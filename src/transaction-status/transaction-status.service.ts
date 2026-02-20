import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { SecurityCredentialService } from 'src/core/services/security-credential.service';
import { CallbackHandlerService } from 'src/core/services/callback-handler.service';
import { MPESA_URLS, TRANSACTION_TYPES, IDENTIFIER_TYPES } from 'src/core/utils/constants';
import { StatusQueryDto } from './dto/status-query.dto';
import { Status } from '@prisma/client';

@Injectable()
export class TransactionStatusService {
    private readonly logger = new Logger(TransactionStatusService.name);
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
        this.baseUrl = MPESA_URLS[environment].TRANSACTION_STATUS;
        this.initiatorName = this.configService.get<string>('INITIATOR_NAME');
        this.shortcode = this.configService.get<string>('STATUS_SHORTCODE');
    }

    async queryStatus(dto: StatusQueryDto): Promise<any> {
        try {
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
                CommandID: TRANSACTION_TYPES.TRANSACTION_STATUS.TRANSACTION_STATUS_QUERY,
                TransactionID: dto.transactionID,
                PartyA: dto.partyA || this.shortcode,
                IdentifierType: dto.identifierType || IDENTIFIER_TYPES.SHORTCODE,
                ResultURL: this.configService.get<string>('STATUS_RESULT_URL'),
                QueueTimeOutURL: this.configService.get<string>('STATUS_TIMEOUT_URL'),
                Remarks: dto.remarks || 'Transaction Status Query',
                Occasion: dto.occasion || '',
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save initial query to database
            await this.prisma.transactionStatusQuery.create({
                data: {
                    ConversationID: response.data.ConversationID,
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    InitiatorName: this.initiatorName,
                    TransactionID: dto.transactionID,
                    PartyA: dto.partyA || this.shortcode,
                    IdentifierType: dto.identifierType || IDENTIFIER_TYPES.SHORTCODE,
                    Remarks: dto.remarks,
                    QueueTimeoutURL: requestBody.QueueTimeOutURL,
                    ResultURL: requestBody.ResultURL,
                    Occassion: dto.occasion,
                    status: Status.PENDING,
                },
            });

            // Cache query
            await this.callbackHandler.cacheTransaction(
                response.data.ConversationID,
                {
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    transactionID: dto.transactionID,
                },
                3600,
            );

            this.logger.log(`Status query initiated for transaction: ${dto.transactionID}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processResultCallback(callbackData: any): Promise<void> {
        try {
            const { Result } = callbackData;
            const { ConversationID, ResultCode, ResultDesc } = Result;

            this.logger.log(`Status Result callback received: ${ConversationID}`);

            // Extract result parameters
            const metadata = this.callbackHandler.extractMetadata(Result.ResultParameters?.ResultParameter || []);

            // Update database
            await this.prisma.transactionStatusQuery.update({
                where: { ConversationID },
                data: {
                    ResultType: Result.ResultType,
                    ResultCode,
                    ResultDesc,
                    OriginalTransactionID: metadata.OriginalTransactionID || metadata.TransactionID,
                    ReferenceData: Result.ReferenceData || null,
                    status: ResultCode === 0 ? Status.COMPLETED : Status.FAILED,
                },
            });

            // Clean up cache
            await this.callbackHandler.deleteCachedTransaction(ConversationID);

            this.logger.log(`Status callback processed: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process callback', 500);
        }
    }

    async processTimeoutCallback(callbackData: any): Promise<void> {
        try {
            const { ConversationID } = callbackData;

            await this.prisma.transactionStatusQuery.update({
                where: { ConversationID },
                data: {
                    status: Status.TIMEOUT,
                    ResultDesc: 'Query timeout',
                },
            });

            this.logger.warn(`Status query timeout: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Timeout processing failed: ${error.message}`);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpException) {
            throw error;
        }

        if (error instanceof AxiosError) {
            this.logger.error(`API Error: ${error.message}`, error.response?.data);
            throw new HttpException(
                `Failed to query transaction status: ${error.message}`,
                error.response?.status || 500,
            );
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

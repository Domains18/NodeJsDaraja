import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { SecurityCredentialService } from 'src/core/services/security-credential.service';
import { CallbackHandlerService } from 'src/core/services/callback-handler.service';
import { MPESA_URLS, TRANSACTION_TYPES, IDENTIFIER_TYPES } from 'src/core/utils/constants';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { Status } from '@prisma/client';

@Injectable()
export class AccountBalanceService {
    private readonly logger = new Logger(AccountBalanceService.name);
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
        this.baseUrl = MPESA_URLS[environment].ACCOUNT_BALANCE;
        this.initiatorName = this.configService.get<string>('INITIATOR_NAME');
        this.shortcode = this.configService.get<string>('BALANCE_SHORTCODE');
    }

    async queryBalance(dto: BalanceQueryDto = {}): Promise<any> {
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
                CommandID: TRANSACTION_TYPES.ACCOUNT_BALANCE.ACCOUNT_BALANCE,
                PartyA: dto.partyA || this.shortcode,
                IdentifierType: dto.identifierType || IDENTIFIER_TYPES.SHORTCODE,
                Remarks: dto.remarks || 'Account Balance Query',
                QueueTimeOutURL: this.configService.get<string>('BALANCE_TIMEOUT_URL'),
                ResultURL: this.configService.get<string>('BALANCE_RESULT_URL'),
            };

            // Send request
            const response = await axios.post(this.baseUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Save initial query to database
            await this.prisma.accountBalanceQuery.create({
                data: {
                    ConversationID: response.data.ConversationID,
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    InitiatorName: this.initiatorName,
                    PartyA: dto.partyA || this.shortcode,
                    IdentifierType: dto.identifierType || IDENTIFIER_TYPES.SHORTCODE,
                    Remarks: dto.remarks,
                    QueueTimeoutURL: requestBody.QueueTimeOutURL,
                    ResultURL: requestBody.ResultURL,
                    status: Status.PENDING,
                },
            });

            // Cache query
            await this.callbackHandler.cacheTransaction(
                response.data.ConversationID,
                {
                    OriginatorConversationID: response.data.OriginatorConversationID,
                    partyA: dto.partyA || this.shortcode,
                },
                3600,
            );

            this.logger.log(`Balance query initiated for: ${dto.partyA || this.shortcode}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async processResultCallback(callbackData: any): Promise<void> {
        try {
            const { Result } = callbackData;
            const { ConversationID, ResultCode, ResultDesc } = Result;

            this.logger.log(`Balance Result callback received: ${ConversationID}`);

            // Extract result parameters
            const metadata = this.callbackHandler.extractMetadata(Result.ResultParameters?.ResultParameter || []);

            // Update database
            await this.prisma.accountBalanceQuery.update({
                where: { ConversationID },
                data: {
                    ResultType: Result.ResultType,
                    ResultCode,
                    ResultDesc,
                    AccountBalance: metadata.AccountBalance || null,
                    BOCompletedTime: metadata.BOCompletedTime || null,
                    status: ResultCode === 0 ? Status.COMPLETED : Status.FAILED,
                },
            });

            // Clean up cache
            await this.callbackHandler.deleteCachedTransaction(ConversationID);

            this.logger.log(`Balance callback processed: ${ConversationID}`);
        } catch (error) {
            this.logger.error(`Callback processing failed: ${error.message}`);
            throw new HttpException('Failed to process callback', 500);
        }
    }

    async processTimeoutCallback(callbackData: any): Promise<void> {
        try {
            const { ConversationID } = callbackData;

            await this.prisma.accountBalanceQuery.update({
                where: { ConversationID },
                data: {
                    status: Status.TIMEOUT,
                    ResultDesc: 'Query timeout',
                },
            });

            this.logger.warn(`Balance query timeout: ${ConversationID}`);
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
                `Failed to query account balance: ${error.message}`,
                error.response?.status || 500,
            );
        }

        this.logger.error(`Unexpected error: ${error}`);
        throw new HttpException('Internal server error', 500);
    }
}

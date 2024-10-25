import { Injectable, HttpException, Logger } from '@nestjs/common';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { AuthService } from 'src/services/auth.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RedisService, DEFAULT_REDIS } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class MpesaExpressService {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
        private readonly redisService: RedisService
    ) {}

    private readonly redis: Redis | null;
    private logger = new Logger('MpesaExpressService');
    

    private async generateTimestamp(): Promise<string> {
        const date = new Date();
         return date.getFullYear() +
             ('0' + (date.getMonth() + 1)).slice(-2) +
             ('0' + date.getDate()).slice(-2) +
             ('0' + date.getHours()).slice(-2) +
             ('0' + date.getMinutes()).slice(-2) +
             ('0' + date.getSeconds()).slice(-2);
    }


    async validateDto(createMpesaExpressDto: CreateMpesaExpressDto): Promise<void> {
        const obeysPhoneNum = createMpesaExpressDto.phoneNum.match(/^2547\d{8}$/);
        if (!obeysPhoneNum) {
            this.logger.warn("The phone number does not obey the format");
            throw new HttpException('Phone number must be in the format 2547XXXXXXXX"', 400);
        }

        const obeysAccountRef = createMpesaExpressDto.accountRef.match(/^[a-zA-Z0-9]{1,12}$/);
        if (!obeysAccountRef) {
            this.logger.warn("The account reference does not obey the format");
            throw new HttpException('Account reference must be alphanumeric and not more than 12 characters', 400);
        }

        const obeysAmount = createMpesaExpressDto.amount > 0;
        if (!obeysAmount) {
            this.logger.warn("The amount does not obey the format");
            throw new HttpException('Amount must be greater than 0', 400);
        }

        return;
    }
    
    async stkPush(createMpesaExpressDto: CreateMpesaExpressDto): Promise<void> {

        await this.validateDto(createMpesaExpressDto);
        
        const shortcode = "174379";
        const passkey = this.configService.get('PASS_KEY');

        const timestamp = await this.generateTimestamp();
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const token = await this.authService.generateToken();
        this.logger.debug(`Token: ${token}`);
        if (!token) {
            throw new HttpException('Failed to generate token, please check your environment variables', 401);
        }

        this.logger.debug(password)

        const bodyRequest = {
            BusinessShortCode: '174379',
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: createMpesaExpressDto.amount,
            PartyA: createMpesaExpressDto.phoneNum,
            PartyB: '174379',
            PhoneNumber: createMpesaExpressDto.phoneNum,
            CallBackURL: 'https://mydomain.com/ytr',
            AccountReference: createMpesaExpressDto.accountRef,
            TransactionDesc: 'szken',
        };

        try {
            const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', bodyRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const checkoutRequestID = response.data.CheckoutRequestID;
            const redisClient = this.redisService.getOrThrow();

            await redisClient.setex(checkoutRequestID, 3600, JSON.stringify({ ...response.data, status: 'PENDING' }));

            return response.data;

        } catch (error) {
            this.logger.error(`Error during STK Push: ${error}`);
            throw new HttpException('Failed to initiate STK Push', 500);
        }
    }
}

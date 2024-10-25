import { Injectable, HttpException, Logger } from '@nestjs/common';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { AuthService } from 'src/services/auth.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MpesaExpressService {
    constructor(private authService: AuthService,
        private configService: ConfigService
    ) {}

    private logger = new Logger('MpesaExpressService');

    private async generateTimestamp() {
        const date = new Date();
         return date.getFullYear() +
             ('0' + (date.getMonth() + 1)).slice(-2) +
             ('0' + date.getDate()).slice(-2) +
             ('0' + date.getHours()).slice(-2) +
             ('0' + date.getMinutes()).slice(-2) +
             ('0' + date.getSeconds()).slice(-2);
    }

    
    async stkPush(createMpesaExpressDto: CreateMpesaExpressDto): Promise<void> {
        // this.logger.debug(await this.generateTimestamp());
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
            const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyRequest),
            });
            const data = await response.json();
            this.logger.debug(`STK Push Response: ${JSON.stringify(data)}`);
        } catch (error) {
            this.logger.error(`Error during STK Push: ${error}`);
            throw new HttpException('Failed to initiate STK Push', 500);
        }
    }
}

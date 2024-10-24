import { Injectable, HttpException, Logger } from '@nestjs/common';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { AuthService } from 'src/services/auth.service';
import { PrismaService } from 'src/services/prisma.service';
import axios from 'axios';

@Injectable()
export class MpesaExpressService {
    constructor(private authService: AuthService) {}

    private logger = new Logger('MpesaExpressService');

    private async generateTimestamp() {
        const date = new Date();
        return `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
    }

    async stkPush(createMpesaExpressDto: CreateMpesaExpressDto) {
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;

        const timestamp = await this.generateTimestamp();

        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const token = await this.authService.generateToken();

        this.logger.log(`Token: ${token}`);

        if (!token || token === '' || token === null) {
            throw new HttpException('Failed to generate token, Please check your environment variables', 401);
        }

        const bodyRequest = {
            BusinessShortCode: '174379',
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: createMpesaExpressDto.amount,
            PartyA: createMpesaExpressDto.phoneNum,
            PartyB: '174379',
            PhoneNumber: createMpesaExpressDto.phoneNum,
            CallBackURL: 'https://mydomain.com/pat',
            AccountReference: createMpesaExpressDto.accountRef,
            TransactionDesc: 'Payment for goods and services',
        };

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            bodyRequest,
            {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            },
        );

        this.logger.warn(`Response: ${response.data}`);
    }
}

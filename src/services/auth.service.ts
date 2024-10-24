import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private configService: ConfigService) {}

    private logger = new Logger('AuthServices');

    async generateToken() {
        try {
            const secret = this.configService.get('AUTH_SECRET');
            const consumer = this.configService.get('AUTH_CONSUMER');

            const auth = Buffer.from(`${consumer}:${secret}`).toString('base64');

            const response = await axios.get(
                'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                {
                    headers: {
                        authorization: `Basic ${auth}`,
                    },
                },
            );

            return response.data.acess_token;
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            return null;
        }
    }
}

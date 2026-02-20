import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SecurityCredentialService {
    private readonly logger = new Logger(SecurityCredentialService.name);
    private publicKey: string;

    constructor(private readonly configService: ConfigService) {
        // Load M-Pesa public certificate
        const certPath =
            this.configService.get<string>('MPESA_CERT_PATH') ||
            path.join(process.cwd(), 'certificates', 'ProductionCertificate.cer');

        try {
            if (fs.existsSync(certPath)) {
                this.publicKey = fs.readFileSync(certPath, 'utf8');
                this.logger.log('M-Pesa certificate loaded successfully');
            } else {
                this.logger.warn(
                    `M-Pesa certificate not found at ${certPath}. Security credential encryption will fail.`,
                );
            }
        } catch (error) {
            this.logger.error(`Failed to load M-Pesa certificate: ${error.message}`);
        }
    }

    /**
     * Encrypts the initiator password using M-Pesa public certificate
     * @param password - Initiator password from environment
     * @returns Base64 encoded encrypted credential
     */
    encryptPassword(password: string): string {
        try {
            if (!this.publicKey) {
                throw new Error('M-Pesa certificate not loaded');
            }

            const buffer = Buffer.from(password);
            const encrypted = crypto.publicEncrypt(
                {
                    key: this.publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                buffer,
            );
            return encrypted.toString('base64');
        } catch (error) {
            this.logger.error(`Encryption failed: ${error.message}`);
            throw new Error('Failed to encrypt security credential');
        }
    }

    /**
     * Gets encrypted security credential from environment
     */
    getSecurityCredential(): string {
        const initiatorPassword = this.configService.get<string>('INITIATOR_PASSWORD');
        if (!initiatorPassword) {
            throw new Error('INITIATOR_PASSWORD not configured');
        }
        return this.encryptPassword(initiatorPassword);
    }
}

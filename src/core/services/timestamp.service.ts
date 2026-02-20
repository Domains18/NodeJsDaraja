import { Injectable } from '@nestjs/common';

@Injectable()
export class TimestampService {
    /**
     * Generates timestamp in format: YYYYMMDDHHmmss
     * @returns Timestamp string
     */
    generate(): string {
        const date = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');

        return (
            `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
        );
    }

    /**
     * Generates password for STK Push (shortcode + passkey + timestamp)
     * @param shortcode - Business shortcode
     * @param passkey - M-Pesa passkey
     * @param timestamp - Optional custom timestamp
     */
    generateSTKPassword(shortcode: string, passkey: string, timestamp?: string): string {
        const ts = timestamp || this.generate();
        return Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
    }
}

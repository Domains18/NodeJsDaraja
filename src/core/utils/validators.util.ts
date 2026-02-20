export class MpesaValidators {
    /**
     * Validates Kenyan phone number format (2547XXXXXXXX)
     */
    static isValidPhoneNumber(phone: string): boolean {
        return /^2547\d{8}$/.test(phone);
    }

    /**
     * Validates shortcode (6 digits)
     */
    static isValidShortcode(shortcode: string): boolean {
        return /^\d{6}$/.test(shortcode);
    }

    /**
     * Validates till number (6-7 digits)
     */
    static isValidTillNumber(till: string): boolean {
        return /^\d{6,7}$/.test(till);
    }

    /**
     * Validates amount (positive number)
     */
    static isValidAmount(amount: number): boolean {
        return amount > 0 && Number.isFinite(amount);
    }

    /**
     * Validates account reference (alphanumeric, max 12 chars)
     */
    static isValidAccountReference(ref: string): boolean {
        return /^[a-zA-Z0-9]{1,12}$/.test(ref);
    }

    /**
     * Formats phone number from various inputs to 2547XXXXXXXX
     */
    static formatPhoneNumber(phone: string): string {
        // Remove spaces, dashes, plus signs
        const cleaned = phone.replace(/[\s\-+]/g, '');

        // Convert 07XXXXXXXX to 2547XXXXXXXX
        if (cleaned.startsWith('07') && cleaned.length === 10) {
            return '254' + cleaned.substring(1);
        }

        // Convert 7XXXXXXXX to 2547XXXXXXXX
        if (cleaned.startsWith('7') && cleaned.length === 9) {
            return '254' + cleaned;
        }

        // Convert 2547XXXXXXXX (remove leading zeros if any)
        if (cleaned.startsWith('254')) {
            return cleaned;
        }

        return cleaned;
    }
}

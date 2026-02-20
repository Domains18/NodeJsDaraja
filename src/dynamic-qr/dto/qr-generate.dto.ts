import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { QR_TRANSACTION_CODES } from 'src/core/utils/constants';

export class QRGenerateDto {
    @IsNotEmpty()
    @IsString()
    merchantName: string;

    @IsNotEmpty()
    @IsString()
    refNo: string; // Reference number (unique identifier)

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsString()
    @IsEnum(Object.values(QR_TRANSACTION_CODES))
    trxCode: string; // Transaction code: BG, PB, WA, SM

    @IsOptional()
    @IsString()
    cpi?: string; // Credit Party Identifier

    @IsOptional()
    @IsString()
    size?: string; // QR code size (default: 300)
}

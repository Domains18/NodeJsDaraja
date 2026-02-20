import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TRANSACTION_TYPES, IDENTIFIER_TYPES } from 'src/core/utils/constants';

export class B2BPaymentRequestDto {
    @IsNotEmpty()
    @IsString()
    @IsEnum(Object.values(TRANSACTION_TYPES.B2B))
    commandId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsString()
    partyB: string; // Receiver shortcode

    @IsOptional()
    @IsInt()
    senderIdentifierType?: number; // Default: 4 (shortcode)

    @IsOptional()
    @IsInt()
    receiverIdentifierType?: number; // Default: 4 (shortcode)

    @IsNotEmpty()
    @IsString()
    accountReference: string;

    @IsOptional()
    @IsString()
    remarks?: string;
}

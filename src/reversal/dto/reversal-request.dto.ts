import { IsNotEmpty, IsNumber, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class ReversalRequestDto {
    @IsNotEmpty()
    @IsString()
    transactionID: string; // Original transaction ID to reverse

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsString()
    receiverParty: string; // Shortcode or phone number

    @IsOptional()
    @IsInt()
    receiverIdentifierType?: number; // Default: 4 (shortcode)

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    occasion?: string;
}

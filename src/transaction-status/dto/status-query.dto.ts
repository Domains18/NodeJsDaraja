import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class StatusQueryDto {
    @IsNotEmpty()
    @IsString()
    transactionID: string; // Original transaction ID to query

    @IsOptional()
    @IsString()
    partyA?: string; // Shortcode (defaults to config)

    @IsOptional()
    @IsInt()
    identifierType?: number; // Default: 4 (shortcode)

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    occasion?: string;
}

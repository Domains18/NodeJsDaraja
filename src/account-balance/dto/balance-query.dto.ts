import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { IDENTIFIER_TYPES } from 'src/core/utils/constants';

export class BalanceQueryDto {
    @IsOptional()
    @IsString()
    partyA?: string; // Shortcode (defaults to config)

    @IsOptional()
    @IsInt()
    identifierType?: number; // Default: 4 (shortcode)

    @IsOptional()
    @IsString()
    remarks?: string;
}

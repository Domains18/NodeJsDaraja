import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { TRANSACTION_TYPES } from 'src/core/utils/constants';

export class PaymentRequestDto {
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(10)
    amount: number;

    @IsOptional()
    @IsString()
    @IsEnum(Object.values(TRANSACTION_TYPES.B2C))
    commandId?: string;

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    occasion?: string;
}

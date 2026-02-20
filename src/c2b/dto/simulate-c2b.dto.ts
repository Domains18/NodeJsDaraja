import { IsNotEmpty, IsNumber, IsString, IsEnum, Min } from 'class-validator';

export class SimulateC2BDto {
    @IsNotEmpty()
    @IsString()
    shortCode: string;

    @IsNotEmpty()
    @IsEnum(['CustomerPayBillOnline', 'CustomerBuyGoodsOnline'])
    commandID: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsString()
    msisdn: string; // Phone number (254XXXXXXXXX format)

    @IsNotEmpty()
    @IsString()
    billRefNumber: string; // Account reference
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMpesaExpressDto {
    @IsNotEmpty()
    @IsString()
    phoneNum: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    accountRef: string;
}

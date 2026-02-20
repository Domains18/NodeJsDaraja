import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { RESPONSE_TYPES } from 'src/core/utils/constants';

export class RegisterUrlDto {
    @IsNotEmpty()
    @IsString()
    shortCode: string;

    @IsNotEmpty()
    @IsEnum(Object.values(RESPONSE_TYPES))
    responseType: string; // 'Completed' or 'Cancelled'

    @IsNotEmpty()
    @IsString()
    confirmationURL: string;

    @IsNotEmpty()
    @IsString()
    validationURL: string;
}

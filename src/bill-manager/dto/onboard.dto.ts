import { IsNotEmpty, IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class OnboardDto {
    @IsNotEmpty()
    @IsString()
    shortCode: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    officialContact: string;

    @IsOptional()
    @IsBoolean()
    sendReminders?: boolean;

    @IsOptional()
    @IsString()
    logo?: string; // Base64 encoded logo

    @IsNotEmpty()
    @IsString()
    callBackUrl: string;
}
